import { betterAuth, BetterAuthOptions, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";
import { getHostelStudent } from "~/actions/hostel.core";
import { emailSchema, ROLES_ENUMS } from "~/constants";
import {
  getDepartmentByRollNo,
  isValidRollNumber,
} from "~/constants/core.departments";
import { db } from "~/db/connect";
import { accounts, sessions, users, verifications } from "~/db/schema";
import { appConfig } from "~/project.config";
import type { ResultType } from "~/types/result";
import { getBaseURL } from "~/utils/env";
import { mailFetch, serverFetch } from "../lib/fetch-server";

const VERIFY_EMAIL_PATH_PREFIX = "/auth/verify-mail";
const RESET_PASSWORD_PATH_PREFIX = "/auth/reset-password";

const baseUrl = new URL(getBaseURL());

export const trustedOrigins = new Set<string>([
  "nith.eu.org", // Trust all subdomains of nith.eu.org
  "auth.nith.eu.org", // Trust all subdomains of nith.eu.org
  "app.nith.eu.org", // Trust all subdomains of nith.eu.org
  "platform.nith.eu.org", // Trust all subdomains of nith.eu.org
  "https://nith.eu.org", // Trust only HTTPS subdomains
  "https://auth.nith.eu.org", // Trust only HTTPS subdomains
  "https://app.nith.eu.org", // Trust only HTTPS subdomains
  "https://platform.nith.eu.org", // Trust only HTTPS subdomains
  "*.nith.eu.org", // Trust all subdomains of nith.eu.org
  "https://*.nith.eu.org", // Trust only HTTPS subdomains
  "https://*.dev.nith.eu.org", // Trust HTTPS subdomains of dev.nith.eu.org
  appConfig.url,
  `https://${appConfig.appDomain}`,
  `https://*.nith.eu.org`,

]);

export const betterAuthOptions = {
  appName: appConfig.name,
  baseURL: baseUrl.toString(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    //if all of them are just using plural form, you can just pass the option below
    usePlural: true,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!emailSchema.safeParse(user.email).success) {
            throw new APIError("NOT_ACCEPTABLE", {
              message: "Invalid email format",
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
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      console.log("[AUTH_ERROR]:", error);
      console.log("[AUTH_ERROR_CONTEXT]:", ctx);
    },
    // errorURL: "/auth/error",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const reset_link = new URL(getBaseURL());
      reset_link.pathname = RESET_PASSWORD_PATH_PREFIX;
      reset_link.searchParams.set("token", token);

      try {
        const response = await mailFetch<{ data: string[] | null; error?: string | null | object }>("/api/send", {
          method: "POST",
          body: JSON.stringify({
            template_key: "reset-password",
            targets: [user.email],
            subject: "Reset Password",
            payload: {
              name: user.name,
              email: user.email,
              reset_link: reset_link.toString(),
            },
          }),
        });
        if (response.error) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Error sending email from mail server",
          });
        }
        console.log(response.data);
      } catch (err) {
        console.error(err);
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: "Error sending email",
        });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verification_url = new URL(getBaseURL());
      verification_url.pathname = VERIFY_EMAIL_PATH_PREFIX;
      verification_url.searchParams.set("token", token);
      try {
        const response = await mailFetch<{
          data: string[] | null;
          error?: string | null | object;
        }>("/api/send", {
          method: "POST",
          body: JSON.stringify({
            template_key: "welcome_verify",
            targets: [user.email],
            subject: `Welcome to ${appConfig.name}`,
            payload: {
              platform_name: appConfig.name,
              name: user.name,
              email: user.email,
              verification_url: baseUrl.toString(),
            },
          }),
        });
        if (response.error) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Error sending email",
          });
        }
        console.log(response);
      } catch (err) {
        console.error(err);
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: "Error sending email",
        });
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      mapProfileToUser: async (profile) => {
        return {
          image: profile.picture,
        };
      },
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: appConfig.appDomain,
    },
    cookiePrefix: "nith",
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
        defaultValue: "not_specified",
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
  },
  account: {
    encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database

    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
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

async function getUserInfo(user: User & Record<string, unknown>): Promise<getUserInfoReturnType> {
  const username = user.email.split("@")[0];
  const isStudent = isValidRollNumber(username);

  if (isStudent) {
    console.log("Student");

    const res = await serverFetch<{
      message: string;
      data: ResultType | null;
      error?: string | null;
    }>("/api/results/:rollNo", {
      method: "GET",
      params: {
        rollNo: username,
      },
    });
    const response = res.data;
    console.log(res);
    console.log(response?.data ? "has result" : "No result");

    if (!response?.data) {
      console.log("Result not found for roll number:", username);
      throw new APIError("UPGRADE_REQUIRED", {
        message: "Result not found for the given roll number | Contact admin",
      });
    }
    // TODO: temporarily disable result check for 2025 batch
    if (username.startsWith("25")) {
      return {
        other_roles: [ROLES_ENUMS.STUDENT],
        department: getDepartmentByRollNo(username) as string,
        name: user.name,
        emailVerified: true,
        email: user.email,
        username,
        gender: response?.data?.gender || "not_specified",
        hostelId: "not_specified",
      };
    }
    const hostelStudent = await getHostelStudent({
      rollNo: username,
      email: user.email,
      gender: response.data?.gender,
      name: response.data.name,
      cgpi: response.data.semesters.at(-1)?.cgpi || 0,
    });

    return {
      other_roles: [ROLES_ENUMS.STUDENT],
      department: getDepartmentByRollNo(username) as string,
      name: response.data.name.toUpperCase(),
      emailVerified: true,
      email: user.email,
      username,
      gender: hostelStudent?.gender || "not_specified",
      hostelId: hostelStudent?.hostelId || "not_specified",
    };
  }
  const { data: response } = await serverFetch<{
    message: string;
    data: FacultyType | null;
    error?: string | null;
  }>("/api/faculties/search/:email", {
    method: "POST",
    params: {
      email: user.email,
    },
  });
  const faculty = response?.data;
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
