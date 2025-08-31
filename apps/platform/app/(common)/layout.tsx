import Footer from "@/components/common/footer";
import GithubBanner from "@/components/common/github-banner";
import Navbar from "@/components/common/navbar";
import { getSession } from "~/auth/server";
import { LayoutClient } from "./layout.client";



export const dynamic = "force-dynamic";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function Layout({ children }: LayoutProps) {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col justify-center min-h-svh min-w-full z-0">

      <Navbar user={session?.user} />
      <div className="relative flex-1 mx-auto max-w-(--max-app-width) w-full h-full min-h-screen @container flex-col items-center justify-start space-y-4 pb-8">
        {children}
        <GithubBanner />
      </div>
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-tertiary/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      <LayoutClient user={session?.user} />
      {/* <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 "
      >
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-secondary" />
        <div className="blur-[106px] h-32 bg-gradient-to-r from-secondary to-primary" />
      </div> */}
      <Footer />
    </div>
  );
}
