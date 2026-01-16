import { notFound } from "next/navigation";
import { getUser } from "~/actions/dashboard.admin";
import { getHostels } from "~/actions/hostel.core";
import { UserContent, UserHeader, UserSidebar } from "./components";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateUserPage({ params }: PageProps) {
  const { id } = await params;
  
  // Parallel fetching for performance
  const [user, hostelRes] = await Promise.all([
    getUser(id),
    getHostels()
  ]);

  if (!user) return notFound();

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Global Header with Breadcrumbs/Title */}
      <UserHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* 2. Sidebar: Quick Actions, ID, Read-only meta */}
        <aside className="space-y-6 lg:sticky lg:top-8">
             <UserSidebar user={user} />
        </aside>

        {/* 3. Main Content: Forms & Sessions */}
        <main>
             <UserContent user={user} hostels={hostelRes.data || []} />
        </main>
      </div>
    </div>
  );
}