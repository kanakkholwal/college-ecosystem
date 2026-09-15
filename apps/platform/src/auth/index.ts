// biome-ignore assist/source/organizeImports: too much sort
import { betterAuth, type BetterAuthOptions, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { defineRequestState, hasRequestState } from "@better-auth/core/context";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";
import { getHostelStudent } from "~/lib/hostel-student";
import { getResultByRollNo } from "~/api/result";
import { APP_AUTH_ERROR_CODES } from "~/auth/errors";
import { emailSchema, ROLES_ENUMS } from "~/constants";
import { toHostelId } from "~/constants/hostel_n_outpass";
import {
  getDepartmentByRollNo,
  isValidRollNumber,
} from "~/constants/core.departments";
import { db } from "~/db/connect";
import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "~/db/schema";
import { appConfig, AUTH_COOKIE_PREFIX, orgConfig } from "~/project.config";
import { getBaseURL } from "~/utils/env";
import {
  type EmailTemplateId,
  type EmailTemplateProps,
  sendEmail,
} from "~/lib/email";
import { serverFetch } from "../lib/fetch-server";

const VERIFY_EMAIL_PATH_PREFIX = "/auth/verify-mail";
const RESET_PASSWORD_PATH_PREFIX = "/auth/reset-password";
const VERIFY_EMAIL_EXPIRES_IN_S = 60 * 60;
const RESET_PASSWORD_EXPIRES_IN_S = 60 * 60;

const baseUrl = new URL(getBaseURL());

const isProd = process.env.NODE_ENV === "production";
// `next build` evaluates this module while collecting page data, and the image
// is built without secrets on purpose — so only enforce this when serving.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

if (isProd && !isBuildPhase && !BETTER_AUTH_SECRET) {
  // Better Auth silently falls back to a dev secret, which invalidates every
  // session on the next deploy. Fail the boot instead.
  throw new Error("BETTER_AUTH_SECRET is required in production");
}

const PROFILE_LOCKED_FIELDS = [
  "other_roles",
  "username",
  "department",
  "gender",
  "hostelId",
  "role",
] as const;

export const ORG_EMAIL_REQUIRED = `Use your ${orgConfig.mailSuffix} account to sign in`;

/** Case-insensitive: Google may return the address with different casing than we store. */
export function isOrgEmail(email: string): boolean {
  return emailSchema.safeParse(email.trim().toLowerCase()).success;
}

// Better Auth swallows errors from email senders (runInBackgroundOrAwait), so failures are
// recorded per request and turned into an error response by the after hook below.
const emailSendFailed = defineRequestState(() => false);

async function sendAuthEmail<T extends EmailTemplateId>(
  template: T,
  to: string,
  props: EmailTemplateProps<T>
) {
  try {
    await sendEmail({ template, to, props });
  } catch (err) {
    console.error(`[auth] ${template} email to ${to} failed`, err);
    if (await hasRequestState()) await emailSendFailed.set(true);
  }
}

function assertOrgEmail(email: string): void {
  if (!isOrgEmail(email)) {
    throw new APIError("NOT_ACCEPTABLE", {
      code: APP_AUTH_ERROR_CODES.ORG_EMAIL_REQUIRED,
      message: ORG_EMAIL_REQUIRED,
    });
  }
}

export const trustedOrigins = new Set<string>([
  // Apex + every subdomain of nith.eu.org, so the platform can run on any
  // *.nith.eu.org host (app, platform, auth, os, dev, …) without edits here.
  // Scheme-qualified on purpose: bare hostnames are not a documented form, and
  // the https:// prefix stops the pattern from matching plaintext origins.
  "https://nith.eu.org",
  "https://*.nith.eu.org",
  appConfig.url,
  `https://${appConfig.appDomain}`,
  ...(isProd ? [] : ["http://localhost:3000", "http://localhost:3001"]),
]);

export const betterAuthOptions = {
  appName: appConfig.name,
  baseURL: baseUrl.toString(),
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
      rateLimits,
    },
    //if all of them are just using plural form, you can just pass the option below
    usePlural: true,
  }),
  databaseHooks: {
    session: {
      create: {
        // create.before on users only guards new accounts; this closes the door
        // on anything already in the table with a non-org email. Reads the user
        // rather than ctx.context.session, which is still null while signing in.
        before: async (session, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(
            session.userId
          );
          if (user && !isOrgEmail(user.email)) {
            throw new APIError("FORBIDDEN", {
              code: APP_AUTH_ERROR_CODES.ORG_EMAIL_REQUIRED,
              message: ORG_EMAIL_REQUIRED,
            });
          }
        },
      },
    },
    user: {
      create: {
        before: async (user, ctx) => {
          assertOrgEmail(user.email);
          // Checked here, not in mapProfileToUser: a throw there skips the OAuth error redirect.
          if (ctx?.path?.startsWith("/callback") && !user.emailVerified) {
            throw new APIError("NOT_ACCEPTABLE", {
              code: APP_AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED,
              message: "Your Google account email is not verified",
            });
          }
          const info = await getUserInfo(user);
          console.log("[CREATING_USER]:", info);
          return {
            data: {
              ...user,
              ...info,
            },
          };
        },
      },
      update: {
        // These fields are `input: true` so sign-up accepts them, which also exposes them on
        // /update-user. Only the admin tools (direct DB writes) may change them.
        before: async (user, ctx) => {
          if (ctx?.path !== "/update-user") return;
          const locked = PROFILE_LOCKED_FIELDS.filter((field) => field in user);
          if (locked.length > 0) {
            throw new APIError("FORBIDDEN", {
              message: `${locked.join(", ")} can only be changed by an admin`,
            });
          }
        },
      },
      // delete:{
      //   before: async (user) => {
      //     console.log("[DELETING_USER]:", user.email);
      //     return {
      //       data: {
      //         ...user,
      //       },
      //     };
      //   },
      // }
    },
  },
  hooks: {
    after: createAuthMiddleware(async () => {
      if (!(await hasRequestState()) || !(await emailSendFailed.get())) return;
      throw new APIError("INTERNAL_SERVER_ERROR", {
        code: APP_AUTH_ERROR_CODES.EMAIL_SEND_FAILED,
        message: "Error sending email",
      });
    }),
  },
  // throw:false lets OAuth callback failures land on errorURL instead of
  // surfacing as a raw 500 — the create-user hook below throws for students
  // with no result record, and that has to be a readable page.
  onAPIError: {
    throw: false,
    errorURL: "/auth/error",
    onError: (error) => {
      console.error("[AUTH_ERROR]:", error);
    },
  },
  // Memory storage is per-instance, so it does nothing on serverless; the
  // database store is shared across every lambda.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRES_IN_S,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = new URL(RESET_PASSWORD_PATH_PREFIX, getBaseURL());
      resetUrl.searchParams.set("token", token);
      await sendAuthEmail("reset-password", user.email, {
        name: user.name,
        email: user.email,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: RESET_PASSWORD_EXPIRES_IN_S / 60,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // requireEmailVerification blocks sign-in until verified, so a user who lost
    // the first mail needs sign-in to reissue one, and the link itself to log
    // them in — otherwise verifying just dumps them back on the login form.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: VERIFY_EMAIL_EXPIRES_IN_S,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = new URL(VERIFY_EMAIL_PATH_PREFIX, getBaseURL());
      verifyUrl.searchParams.set("token", token);
      await sendAuthEmail("verify-email", user.email, {
        name: user.name,
        email: user.email,
        verifyUrl: verifyUrl.toString(),
        expiresInMinutes: VERIFY_EMAIL_EXPIRES_IN_S / 60,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      // Rejects Google accounts outside the college domain; the user create hook still checks the email.
      hd: orgConfig.domain,
      mapProfileToUser: (profile) => ({ image: profile.picture }),
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: appConfig.appDomain,
    },
    cookiePrefix: AUTH_COOKIE_PREFIX,
  },
  trustedOrigins: Array.from(trustedOrigins),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "user",
      },
      other_roles: {
        type: "string[]",
        required: true,
        input: true,
      },
      other_emails: {
        type: "string[]",
        required: false,
        input: false,
      },
      hostelId: {
        type: "string",
        required: false,
        input: false,
        defaultValue: null,
      },
      gender: {
        type: "string",
        input: true,
        defaultValue: "not_specified",
      },
      username: {
        type: "string",
        required: true,
        unique: true,
        input: true,
      },
      department: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 604800, // 7 days
    // Lets the edge proxy read the session from a signed cookie; without it the
    // proxy has to self-fetch this app's own origin, which fails behind the CDN.
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  account: {
    encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database

    accountLinking: {
      enabled: true,
      // Trusted providers link without confirming email ownership, so only
      // Google is listed — it is the sole configured provider, and adding
      // email-password here would make it an account-takeover path.
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },

  plugins: [
    username(),
    admin({
      defaultRole: "user",
      adminRole: ["admin"],
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 1 week
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Please choose a more secure password.",
    }),
    nextCookies(),
  ], // make sure this is the last plugin (nextCookies) in the array
  telemetry: {
    enabled: false,
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(betterAuthOptions);

type getUserInfoReturnType = {
  email: string;
  username: string;
  other_roles: string[];
  department: string;
  name?: string;
  emailVerified: boolean;
  gender: string;
  other_emails?: string[];
  hostelId: string | null;
};

type FacultyType = {
  name: string;
  email: string;
  department: string;
};

// Only a definite "not found" may fall through to Staff; any other failure would create faculty as Staff for good.
async function findFacultyByEmail(email: string): Promise<FacultyType | null> {
  const lookupFailed = (cause: unknown) =>
    new APIError("SERVICE_UNAVAILABLE", {
      code: APP_AUTH_ERROR_CODES.FACULTY_LOOKUP_FAILED,
      message: "Couldn't check the faculty directory, try again shortly",
      cause: { email, error: cause },
    });

  // better-fetch returns HTTP errors but rejects on network failures.
  const { data: response, error } = await serverFetch<{
    message: string;
    data: FacultyType | null;
  }>("/api/faculties/search/:email", {
    method: "GET",
    params: { email },
  }).catch((err: unknown) => {
    throw lookupFailed(err);
  });
  if (error) {
    if (error.status === 404 && error.message === "Faculty not found") {
      return null;
    }
    throw lookupFailed(error);
  }
  return response?.data ?? null;
}

async function getUserInfo(
  user: User & Record<string, unknown>
): Promise<getUserInfoReturnType> {
  const username = user.email.split("@")[0];
  const isStudent = isValidRollNumber(username);

  if (isStudent) {
    console.log("[getUserInfo]: Student detected:", username);

    const { data, error, failed } = await getResultByRollNo(username);
    if (failed) {
      throw new APIError("SERVICE_UNAVAILABLE", {
        code: APP_AUTH_ERROR_CODES.RESULT_LOOKUP_FAILED,
        message: "Couldn't check the results database, try again shortly",
        cause: { rollNo: username, error },
      });
    }
    // TODO: 2025 batch results aren't imported yet, so a missing record must not block sign-up.
    const isResultPending = username.startsWith("25");
    if (!data && !isResultPending) {
      throw new APIError("NOT_ACCEPTABLE", {
        code: APP_AUTH_ERROR_CODES.RESULT_NOT_FOUND,
        message: "Result not found for the given roll number | Contact admin",
        cause: { rollNo: username, error: error },
      });
    }
    console.log(
      "[getUserInfo]:",
      data ? "Result found" : "Result not found",
      username
    );

    const hostelStudent = await getHostelStudent({
      rollNo: username,
      email: user.email,
      gender: data?.gender ?? "not_specified",
      name: data?.name ?? user.name,
      cgpi: data?.semesters.at(-1)?.cgpi || 0,
    });

    return {
      other_roles: [ROLES_ENUMS.STUDENT],
      department: getDepartmentByRollNo(username) as string,
      name: data ? data.name.toUpperCase() : user.name,
      emailVerified: true,
      email: user.email,
      username,
      gender: hostelStudent?.gender || "not_specified",
      hostelId: toHostelId(hostelStudent?.hostelId),
    };
  }
  const faculty = await findFacultyByEmail(user.email);
  console.log(faculty ? "is faculty" : "Not faculty");

  if (faculty) {
    console.log("Faculty");
    console.log(faculty.email);
    return {
      other_roles: [ROLES_ENUMS.FACULTY],
      department: faculty.department,
      name: faculty.name.toUpperCase(),
      emailVerified: true,
      email: user.email,
      username,
      gender: "not_specified",
      hostelId: null,
    };
  }
  console.log("Other:Staff");
  console.log(user);
  return {
    other_roles: [ROLES_ENUMS.STAFF],
    department: "Staff",
    email: user.email,
    emailVerified: true,
    username,
    gender: "not_specified",
    hostelId: null,
  };
}

export type Session = typeof auth.$Infer.Session;
export type SessionUser = typeof auth.$Infer.Session.user;
