"use server";
import { headers } from "next/headers";
import { auth } from "~/auth";

export const getSession = async () => {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });
    
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};
