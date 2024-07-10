import { getSession } from "src/lib/auth";
import { sessionType } from "src/types/session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Profile | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Check your profile here",
};

export default async function Dashboard() {
  const session = (await getSession()) as sessionType;

  return (
    <div className="bg-white/20 backdrop-blur-lg mt-5 rounded-lg p-4 @container/profile">
      <section className="container mx-auto p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 p-4">
          <div className="grid gap-2">
            <p className="font-bold text-gray-900 dark:text-gray-100">Name</p>
            <p className="text-sm text-gray-700 font-semibold">
              {session.user.firstName} {session.user.lastName}
            </p>
          </div>
          <div className="grid gap-2">
            <p className="font-bold text-gray-900 dark:text-gray-100">Email</p>
            <p className="text-sm text-gray-700 font-semibold">
              {session.user.email}
            </p>
          </div>
          <div className="grid gap-2">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              Username / Roll No.
            </p>
            <p className="text-sm text-gray-700 font-semibold">
              {session.user.rollNo}
            </p>
          </div>
          <div className="grid gap-2">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              Department
            </p>
            <p className="text-sm text-gray-700 font-semibold">
              {session.user.department}
            </p>
          </div>
          <div className="grid gap-2">
            <p className="font-bold text-gray-900 dark:text-gray-100">Roles</p>
            <p className="text-sm text-gray-700 font-semibold">
              {session.user.roles.join(", ")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
