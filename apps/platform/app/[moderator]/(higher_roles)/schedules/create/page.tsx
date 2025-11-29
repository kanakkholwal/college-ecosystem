import { TimeTableEditor } from "@/components/custom/time-table";
import { PreviousPageLink } from "@/components/utils/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Time Table",
  description: "Create or edit a time table for a department.",
};

export default function CreateTimeTablePage() {
  return (
    <>
      <PreviousPageLink variant="ghost" size="sm" />

      <TimeTableEditor mode="create" />
    </>
  );
}
