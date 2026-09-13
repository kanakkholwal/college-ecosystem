import {
  DashboardHeader,
  DashboardRoot,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import OutPassHandler from "@/components/application/hostel/outpass-handler";

export default async function GuardDashboard() {
  const viewer = await getViewer();
  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context="Scan an outpass barcode or search by ID to log a student's exit or return."
      />
      <OutPassHandler />
    </DashboardRoot>
  );
}
