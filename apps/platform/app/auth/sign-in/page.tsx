import type { Metadata } from "next";
import { type AuthTab, AuthTabs } from "./auth-tabs";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account to access the ecosystem.",
  alternates: { canonical: "/auth/sign-in" },
};

interface Props {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialTab: AuthTab = tab === "sign-up" ? "sign-up" : "sign-in";

  return <AuthTabs initialTab={initialTab} />;
}
