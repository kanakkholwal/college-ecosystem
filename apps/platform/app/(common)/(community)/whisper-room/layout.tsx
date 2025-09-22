
import type { Metadata } from "next";
// import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Whisper Room",
    template: "%s - Whisper Room",
  },
  description: "Explore different communities",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // if (process.env.NODE_ENV === "production") {
  //   // Ensure the layout is only rendered on the client side
  //   return notFound();
  // }
  return (
    <div className="p-4 min-h-screen w-full max-w-(--max-app-width) mx-auto">
      {children}
    </div>
  );
}
