import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { revalidatePath } from "next/cache";
import { ORG_DOMAIN } from "root/project.config";
import { ScrapeResult } from "src/controllers/scraper";
import dbConnect from "src/lib/dbConnect";
import ResultModel from "src/models/result";
import UserModel from "src/models/user";

interface AuthEnv {
  GOOGLE_ID: string;
  GOOGLE_SECRET: string;
  NEXT_AUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

// Read environment variables
const env: AuthEnv = {
  GOOGLE_ID: process.env.GOOGLE_ID || "",
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || "",
  NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
};

// TODO: MIGRATE TO BETTER-AUTH
// Check if all required environment variables are defined
for (const key of Object.keys(env)) {
  if (!env[key as keyof AuthEnv]) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
}
// Object.values(env).forEach((value) => {
//   if (!value) {
//     throw new Error(`Environment variable ${value} is not defined`);
//   }
// });
const useSecureCookies = env.NEXTAUTH_URL.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(env.NEXTAUTH_URL).hostname;

function isValidRollNumber(rollNo: string): boolean {
  const rollNoPattern = /^\d{2}[a-z]{3}\d{3}$/i;

  if (!rollNoPattern.test(rollNo)) {
    return false;
  }

  const numericPart = Number.parseInt(rollNo.slice(-3));
  return numericPart >= 1 && numericPart <= 999;
}

export const authOptions: NextAuthOptions = {
  // Enable JSON Web Tokens since we will not store sessions in our DB
  session: {
    strategy: "jwt",
  },
  secret: env.NEXT_AUTH_SECRET,
  // Here we add our login providers - this is where you could add Google or Github SSO as well
  providers: [
    CredentialsProvider({
      name: "credentials",
      // The credentials object is what's used to generate Next Auth default login page - We will not use it however.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize callback is ran upon calling the sign-in function
      authorize: async (credentials) => {
        
          if (!credentials || !credentials.email || !credentials.password) {
            return Promise.reject({
              status: 401,
              message: "Credentials not provided",
              success: false,
            });
          }
          try {
            await dbConnect();
            const userInDb = await UserModel.findOne({
              email: credentials.email,
            }).select("+password");

            if (!userInDb)
              return Promise.reject({
                status: 401,
                message: "User not found",
                success: false,
              });
            const pwValid = await userInDb.comparePassword(
              credentials.password
            );

            if (!pwValid)
              return Promise.reject({
                status: 401,
                message: "Wrong Password",
                success: false,
              });
            const user = {
              _id: userInDb._id.toString(),
              firstName: userInDb.firstName,
              lastName: userInDb.lastName,
              rollNo: userInDb.rollNo,
              email: userInDb.email,
              roles: userInDb.roles,
              profilePicture: userInDb.profilePicture,
              department: userInDb.department,
            };

            console.log("user found", user);
            revalidatePath("/", "layout");
            return Promise.resolve(JSON.parse(JSON.stringify(user)));
          } catch (err) {
            console.log(err);
            return Promise.reject(err);
          }
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_ID || "",
      clientSecret: env.GOOGLE_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile, tokens) {
        try {
          // console.log(profile);
          // console.log(tokens);

          await dbConnect();
          const userInDb = await UserModel.findOne({ email: profile.email });
          if (!userInDb) {
            console.log("user not found, creating new user", profile);
            const username = profile.email.split("@")[0].toLowerCase();
            if (isValidRollNumber(username)) {
              //  find roll no from result
              const result = await ResultModel.findOne({
                rollNo: username,
              });
              if (!result) {
                const scraped_result = await ScrapeResult(username);
                if (!scraped_result) {
                  return Promise.reject({
                    status: 401,
                    message:
                      "No result found for this roll no, Please contact admin",
                    success: false,
                  });
                }
                const user = new UserModel({
                  email: scraped_result.rollNo
                    .toLowerCase()
                    .concat("@".concat(ORG_DOMAIN)),
                  firstName: scraped_result.name.split(" ")[0],
                  lastName: scraped_result.name.split(" ")[1],
                  rollNo: scraped_result.rollNo,
                  profilePicture: profile.picture,
                  password: `google_${profile.sub}`,
                  roles: ["student"],
                  department: scraped_result.branch,
                });
                await user.save();
                return Promise.resolve({
                  id: user._id.toString(),
                  _id: user._id.toString(),
                  firstName: user.firstName,
                  lastName: user.lastName,
                  rollNo: user.rollNo,
                  email: user.email,
                  roles: user.roles,
                  profilePicture: user.profilePicture,
                  department: user.department,
                });
              }
              const user = new UserModel({
                email: result.rollNo
                  .toLowerCase()
                  .concat("@".concat(ORG_DOMAIN)),
                firstName: result.name.split(" ")[0],
                lastName: result.name.split(" ")[1],
                rollNo: result.rollNo,
                profilePicture: profile.picture,
                password: `google_${profile.sub}`,
                roles: ["student"],
                department: result.branch,
              });
              await user.save();

              return Promise.resolve({
                id: user._id.toString(),
                _id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                rollNo: user.rollNo,
                email: user.email,
                roles: user.roles,
                profilePicture: user.profilePicture,
                department: user.department,
              });
            }
              console.log("not a valid roll no", username);
              return Promise.reject({
                status: 401,
                message: `not a valid roll no : ${username}, Please contact admin.`,
                success: false,
              });
          }
          console.log("user found", userInDb);

          return Promise.resolve({
            id: userInDb._id.toString(),
            _id: userInDb._id.toString(),
            firstName: userInDb.firstName,
            lastName: userInDb.lastName,
            rollNo: userInDb.rollNo,
            email: userInDb.email,
            roles: userInDb.roles,
            profilePicture: userInDb.profilePicture,
            department: userInDb.department,
          });
        } catch (err) {
          console.log(err);
          return Promise.reject({
            status: 401,
            message: "Error in google login",
            success: false,
          });
        }
      },
    }),
  ],
  // All of this is just to add user information to be accessible for our app in the token/session
  callbacks: {
    // We can pass in additional information from the user document MongoDB returns
    // This could be avatars, role, display name, etc...
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            async jwt({ token, user }: { token: any; user: any }): Promise<any> {
      if (user) {
        token.user = {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          rollNo: user.rollNo,
          gender: user.gender,
          email: user.email,
          roles: user.roles,
          profilePicture: user.profilePicture,
          phone: user.phone,
          department: user.department,
        };
      }
      return token;
    },
    // If we want to access our extra user info from sessions we have to pass it the token here to get them in sync:
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        session: async ({ session, token }: { session: any; token: any }) => {
      if (token) {
        session.user = token.user;
      }
      return session;
    },
  },

  pages: {
    // Here you can define your own custom pages for login, recover password, etc.
    signIn: "/login", // Displays sign in buttons
    // newUser: '/signup'
    // signOut: '/auth/sign out',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
  },
};
