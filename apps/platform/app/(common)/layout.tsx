import Footer from "@/components/common/footer";
import GithubBanner from "@/components/common/github-banner";
import Navbar from "@/components/common/navbar";
import { getSession } from "~/auth/server";

export const dynamic = "force-dynamic";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function Layout({ children }: LayoutProps) {
  const session = await getSession();
  return (
    <div className="flex min-h-svh w-full flex-1 flex-col bg-canvas">
      <Navbar user={session?.user} />
      <div className="@container relative mx-auto h-full min-h-screen w-full max-w-(--max-app-width) flex-1 flex-col items-center justify-start space-y-4 pb-8">
        {children}
        <GithubBanner />
      </div>
      <Footer />
    </div>
  );
}
