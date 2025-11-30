import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "~/auth";
import SignInForm from "./sign-in";
import SignUpForm from "./sign-up";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account to access the ecosystem.",
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
  const data = await auth.api.getSession({ headers: headersList });
  
  const { tab } = await searchParams;

  // Filter tabs based on session state (optional logic from your code)
  const availableTabs = TABS.filter((t) => {
    if (data?.session?.expiresAt && new Date(data.session.expiresAt) < new Date()) {
       // If session expired, maybe allow re-login? 
       // Keeping your logic: essentially hides tabs if session is technically "valid" but maybe expired?
       // Adjust this logic as needed for your specific auth flow.
       return true; 
    }
    return true;
  });

  const defaultTab = tab && availableTabs.some((t) => t.id === tab) ? tab : "sign-in";

  return (
    <div className="space-y-6">
      
      {/* Header Context */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {defaultTab === "sign-up" ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {defaultTab === "sign-up" 
            ? "Enter your details to get started with the ecosystem." 
            : "Enter your credentials to access your dashboard."}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          {availableTabs.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {availableTabs.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-0">
             {/* Wrapper to add consistent spacing to forms if needed */}
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {item.Component}
             </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}