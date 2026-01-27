import {
  adminClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getBaseURL } from "~/utils/env";
import type { auth } from ".";

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    usernameClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, useSession, signOut } = authClient;

export type Session = typeof authClient.$Infer.Session;
