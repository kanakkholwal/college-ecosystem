import { notFound } from "next/navigation";
import { getEventById } from "~/actions/common.events";
import EditEventEvent from "./client";

export default async function EditEventPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;
  const event = await getEventById(params.id);
  if (!event) {
    return notFound();
  }
  return (
    <>
      <EditEventEvent eventId={event.id} event={event} />
    </>
  );
}
