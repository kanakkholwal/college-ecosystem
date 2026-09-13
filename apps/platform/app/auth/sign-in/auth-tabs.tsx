"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthHeader } from "../auth-header";
import SignInForm from "./sign-in";
import SignUpForm from "./sign-up";

export type AuthTab = "sign-in" | "sign-up";

const COPY: Record<AuthTab, { title: string; description: string }> = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to open your results, timetable and campus updates.",
  },
  "sign-up": {
    title: "Create your account",
    description:
      "Signing in with your college Google account creates it for you.",
  },
};

export function AuthTabs({ initialTab }: { initialTab: AuthTab }) {
  const [tab, setTab] = useState<AuthTab>(initialTab);

  function handleChange(value: string) {
    const next = value === "sign-up" ? "sign-up" : "sign-in";
    setTab(next);
    // Keeps ?tab shareable and preserves ?next without a server round trip.
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader title={COPY[tab].title} description={COPY[tab].description} />

      <Tabs value={tab} onValueChange={handleChange} className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg border border-border bg-muted p-1">
          <TabsTrigger
            value="sign-in"
            className="h-8 rounded-md text-body data-[state=active]:bg-card data-[state=active]:shadow-xs dark:data-[state=active]:bg-background"
          >
            Sign in
          </TabsTrigger>
          <TabsTrigger
            value="sign-up"
            className="h-8 rounded-md text-body data-[state=active]:bg-card data-[state=active]:shadow-xs dark:data-[state=active]:bg-background"
          >
            Create account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sign-in" className="mt-6">
          <SignInForm />
        </TabsContent>
        <TabsContent value="sign-up" className="mt-6">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
