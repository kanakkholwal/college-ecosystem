import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import { DashboardRoot } from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { FreshersImporter } from "./importer";

export const metadata: Metadata = { title: "Import freshers" };

type PageProps = { params: Promise<{ moderator: string }> };

export default async function ImportFreshersPage({ params }: PageProps) {
  const { moderator } = await params;
  return (
    <DashboardRoot>
      <HeaderBar
        Icon={FileSpreadsheet}
        titleNode="Import freshers"
        descriptionNode="Create records for a new batch from an Excel sheet. Rows are checked before anything is saved."
        actionNode={
          <ButtonLink href={`/${moderator}/result`} variant="outline" size="sm">
            <ArrowLeft aria-hidden="true" />
            Result tools
          </ButtonLink>
        }
      />
      <FreshersImporter scrapeHref={`/${moderator}/result/scraping`} />
    </DashboardRoot>
  );
}
