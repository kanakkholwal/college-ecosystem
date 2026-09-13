import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Community",
    template: "%s | Community",
  },
  description: "Questions, notes and discussions from students on campus.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-(--max-app-width) px-4 pb-16 md:px-6">
      {children}
    </div>
  );
}
