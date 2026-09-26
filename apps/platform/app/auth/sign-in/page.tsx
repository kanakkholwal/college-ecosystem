import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "~/auth";
import SignInForm from "./sign-in";
import SignUpForm from "./sign-up";

export const metadata: Metadata = {
  title: "Sign In | Campus 360",
  description: "Sign in to your Campus 360 account.",
  alternates: { canonical: "/auth/sign-in" },
};

const TABS = [
  { id: "sign-in", label: "Sign In", Component: <SignInForm /> },
  { id: "sign-up", label: "Create Account", Component: <SignUpForm /> },
];

interface Props {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const headersList = await headers();
  await auth.api.getSession({ headers: headersList });

  const { tab } = await searchParams;

  const defaultTab =
    tab && TABS.some((item) => item.id === tab) ? tab : "sign-in";

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mb-3 text-sm font-medium text-primary">
          Campus 360
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {defaultTab === "sign-up"
            ? "Create your account"
            : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {defaultTab === "sign-up"
            ? "Create your account using your SGGS institutional email."
            : "Sign in to continue to your Campus 360 dashboard."}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-7 grid h-11 w-full grid-cols-2 rounded-lg bg-muted p-1">
          {TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="rounded-md text-sm font-medium"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="mt-0 focus-visible:outline-none"
          >
            {item.Component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

