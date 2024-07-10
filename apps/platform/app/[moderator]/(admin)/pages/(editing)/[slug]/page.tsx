import React from "react";
import { getStaticPageBySlug } from "src/lib/static-page/actions";
import EditStaticPageForm from "./edit-form";

export default async function EditStaticPage({
  params,
}: {
  params: { slug: string };
}) {
  const staticPage = await getStaticPageBySlug(params.slug);

  return (
    <>
      <EditStaticPageForm staticPage={staticPage} />
    </>
  );
}
