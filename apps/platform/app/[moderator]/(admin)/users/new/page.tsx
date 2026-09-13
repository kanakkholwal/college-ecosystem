import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { NewUserForm } from "./new-user-form";

export const metadata: Metadata = { title: "Add user" };

export default async function NewUserPage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;
  const basePath = `/${moderator}/users`;

  return (
    <div className="@container mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ButtonLink
          href={basePath}
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-muted-foreground"
        >
          <ChevronLeft aria-hidden="true" />
          All users
        </ButtonLink>
        <HeaderBar
          titleNode="Add user"
          descriptionNode="Create an account with a starting password. New accounts get the User role; change it on their page afterwards."
        />
      </div>
      <NewUserForm basePath={basePath} />
    </div>
  );
}
