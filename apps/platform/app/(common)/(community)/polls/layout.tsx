import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Polls",
    template: "%s | Polls",
  },
  description: "Quick polls from students on campus.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-(--max-app-width) px-4 pb-16 md:px-6">
      {children}
    </div>
  );
}
