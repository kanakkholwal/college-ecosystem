import { ErrorState } from "@/components/site/error-state";

export default function DashboardNotFound() {
  return (
    <div className="py-6 md:py-10">
      <ErrorState variant="404" />
    </div>
  );
}
