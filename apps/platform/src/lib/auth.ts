import { betterFetch } from "@better-fetch/fetch";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { ROLES } from "src/constants";
import { getDepartmentByRollNo, isValidRollNumber } from "src/constants/departments";
import { FACULTY_LIST } from "src/constants/faculty";
import { db } from "src/db/connect"; // your drizzle instance
import { accounts, sessions, users, verifications } from "src/db/schema";
import type { ResultType } from "src/types/result";

type getUserInfoReturnType = {
  email: string;
  username: string;
  other_roles: string[];
  department: string;
  name?: string;
  emailVerified: boolean;
}
async function getUserInfo(email: string): Promise<getUserInfoReturnType> {
  const username = email.split("@")[0];
  const isStudent = isValidRollNumber(username);

  if (isStudent) {
    console.log("Student");
    const { data: response } = await betterFetch<{
      message: string;
      data: ResultType | null;
      error?: string | null;
    }>(`${process.env.BASE_SERVER_URL}/api/result/${username}`, {
      method: "POST",
    });
    console.log(response?.data ? "has result" : "No result");

    if (!response?.data) {
      throw new APIError("BAD_REQUEST", {
        message: "Result not found for the given roll number | Contact admin",
      });
    }

    return {
      other_roles: [ROLES.STUDENT],
      department: getDepartmentByRollNo(username) as string,
      // name: response.data.name,
      emailVerified: true,
      email,
      username,
    };
  }
  const faculty = FACULTY_LIST.find((f) => f.email === email);
  if (faculty) {
    console.log("Faculty");
    console.log(faculty.email);
    return {
      other_roles: [ROLES.FACULTY],
      department: faculty.department,
      name: faculty.name,
      emailVerified: true,
      email,
      username
    };
  }
  console.log("Staff");
  console.log(email);
  return {
    other_roles: [ROLES.STAFF],
    department: "Staff",
    email,
    emailVerified: true,
    username,
  };

}



export const auth = betterAuth({
  appName: "College Platform",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications
    },
    //if all of them are just using plural form, you can just pass the option below
    usePlural: true,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const info = await getUserInfo(user.email);
          
          return {
            data: {
              ...user,
              ...info,
              gender: "not_specified",
            }
          }
        },
      },

    }
  },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    autoSignIn: true,
  },
  // emailVerification: {
  //     sendOnSignUp: true
  // },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      mapProfileToUser: async (profile) => {
        const info = await getUserInfo(profile.email);

        return {
          ...info,
          name: info?.name ? info.name : `${profile.given_name} ${profile.family_name}`,
          emailVerified: true,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
      },
      other_roles: {
        type: "string[]",
        required: true,
        input: false,
      },
      gender: {
        type: "string",
        input: true,
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
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ? "nith.eu.org" : undefined,
    },
  },
  plugins: [
    username(),
    admin(),
    nextCookies()
  ], // make sure this is the last plugin (nextCookies) in the array
});

export type Session = typeof auth.$Infer.Session;