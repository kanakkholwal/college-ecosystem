import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";
import { getHostelStudent } from "~/actions/hostel.core";
import { ROLES_ENUMS } from "~/constants";
import {
  getDepartmentByRollNo,
  isValidRollNumber,
} from "~/constants/core.departments";
import { db } from "~/db/connect";
import { accounts, sessions, users, verifications } from "~/db/schema";
import { appConfig } from "~/project.config";
import type { ResultType } from "~/types/result";
import { mailFetch, serverFetch } from "../lib/fetch-server";

const VERIFY_EMAIL_PATH_PREFIX = "/auth/verify-mail?token=";
const RESET_PASSWORD_PATH_PREFIX = "/auth/reset-password?token=";

const baseUrl = process.env.BASE_URL;

export const betterAuthOptions:BetterAuthOptions = {
  appName: appConfig.name,
  baseURL: baseUrl,
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
          const info = await getUserInfo(user.email);
          console.log("Creating user for ", info);
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
      //     console.log("Deleting user", user.email);
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
      console.log("Auth error:", error);
      console.log("Auth error , context:", ctx);
    },
    // errorURL: "/auth/error",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const verification_url = `${baseUrl}${RESET_PASSWORD_PATH_PREFIX}${token}`;
      try {
        const response = await mailFetch<{
          data: string[] | null;
          error?: string | null | object;
        }>("/api/send", {
          method: "POST",
          body: JSON.stringify({
            template_key: "reset-password",
            targets: [user.email],
            subject: "Reset Password",
            payload: {
              name: user.name,
              email: user.email,
              reset_link: verification_url,
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
      const verification_url = `${baseUrl}${VERIFY_EMAIL_PATH_PREFIX}${token}`;
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
              verification_url: verification_url,
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
  trustedOrigins: [
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
  ],
  // trustedOrigins: [appConfig.url, `https://${appConfig.appDomain}`,`https://*.nith.eu.org`],
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
    updateAge: 86400, // 1 day
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
}

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

async function getUserInfo(email: string): Promise<getUserInfoReturnType> {
  const username = email.split("@")[0];
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

    const hostelStudent = await getHostelStudent({
      rollNo: username,
      email: email,
      gender: response.data?.gender,
      name: response.data.name,
      cgpi: response.data.semesters.at(-1)?.cgpi || 0,
    });

    return {
      other_roles: [ROLES_ENUMS.STUDENT],
      department: getDepartmentByRollNo(username) as string,
      name: response.data.name.toUpperCase(),
      emailVerified: true,
      email,
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
      email,
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
      email,
      username,
      gender: "not_specified",
      hostelId: null,
    };
  }
  console.log("Other:Staff");
  console.log(email);
  return {
    other_roles: [ROLES_ENUMS.STAFF],
    department: "Staff",
    email,
    emailVerified: true,
    username,
    gender: "not_specified",
    hostelId: null,
  };
}

export type Session = typeof auth.$Infer.Session;
