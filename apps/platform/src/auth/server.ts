"use server";
import { headers } from "next/headers";
import { auth } from "~/auth";

/** Returns null both when signed out and when the lookup fails; see {@link getSessionOrThrow}. */
export const getSession = async () => {
  try {
    return await getSessionOrThrow();
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

/** Null only when signed out; a DB or cache failure throws so the error boundary can offer a retry. */
export const getSessionOrThrow = async () => {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
};
