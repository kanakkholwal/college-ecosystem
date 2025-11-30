import { HostelCookieSetter } from "app/[moderator]/dashboards/dashboard.client";


interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        moderator: string
        slug: string;
    }>;
}

export default async function DashboardLayout({
    children,
    params,
}: DashboardLayoutProps) {
  
    const { moderator, slug } = await params;


    return <>
        {children}
        {moderator !==  "chief_warden"&& (<HostelCookieSetter hostelSlug={slug} />)}
    </>
}
