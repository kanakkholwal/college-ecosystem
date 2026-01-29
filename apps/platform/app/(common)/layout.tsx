import { FlickeringGrid } from "@/components/animation/flikering-grid";
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
  ;

  return (
    <div className="flex flex-1 flex-col justify-center min-h-svh min-w-full z-0">

      <Navbar user={session?.user} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <FlickeringGrid
          className="absolute top-0 left-0 size-full opacity-40"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.3}
          flickerChance={0.5}
        />
      </div>
      <div className="relative flex-1 z-1 mx-auto max-w-(--max-app-width) w-full h-full min-h-screen @container flex-col items-center justify-start space-y-4 pb-8">
        {children}
        <GithubBanner />
      </div>
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-md h-112 bg-tertiary/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      <Footer className="z-1" />
    </div>
  );
}
