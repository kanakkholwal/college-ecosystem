import { ArrowLeft, History, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { EmptyNote } from "@/components/application/dashboard/primitives";
import {
  OutpassStatusTag,
  REASON_LABEL,
  shortDateTime,
  TableFrame,
  Td,
  Th,
} from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { getOutPassByIdForHosteler } from "~/actions/hostel.outpass";

export default async function StudentOutpassHistoryPage({
  params,
}: {
  params: Promise<{ moderator: string; slug: string; studentId: string }>;
}) {
  const { moderator, slug, studentId } = await params;
  const res = await getOutPassByIdForHosteler(studentId, slug);
  if (!res.ok) notFound();

  const { student, outpasses } = res.data;
  const late = outpasses.filter(
    (p) =>
      p.actualInTime && new Date(p.actualInTime) > new Date(p.expectedInTime)
  ).length;
  const rejected = outpasses.filter((p) => p.status === "rejected").length;

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={UserRound}
        titleNode={student.name}
        descriptionNode={
          <span>
            <span className="font-mono">{student.rollNumber}</span>, room{" "}
            {student.roomNumber}. {outpasses.length} outpasses, {late} returned
            late, {rejected} rejected.
          </span>
        }
        actionNode={
          <ButtonLink
            href={`/${moderator}/h/${slug}/outpass-logs`}
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" />
            All logs
          </ButtonLink>
        }
      />

      {outpasses.length === 0 ? (
        <EmptyNote
          icon={<History />}
          title="No outpasses yet"
          description="This resident hasn't requested an outpass."
        />
      ) : (
        <TableFrame caption={`Outpass history for ${student.name}`}>
          <thead>
            <tr>
              <Th>Requested</Th>
              <Th>Status</Th>
              <Th className="hidden @2xl:table-cell">Reason and destination</Th>
              <Th>Exit</Th>
              <Th>Return</Th>
            </tr>
          </thead>
          <tbody>
            {outpasses.map((pass) => {
              const isLate =
                !!pass.actualInTime &&
                new Date(pass.actualInTime) > new Date(pass.expectedInTime);
              return (
                <tr key={pass._id} className="group/row">
                  <Td className="whitespace-nowrap tabular-nums">
                    {pass.createdAt ? shortDateTime(pass.createdAt) : "Unknown"}
                  </Td>
                  <Td>
                    <OutpassStatusTag status={pass.status} />
                    {pass.status === "rejected" && pass.rejectionReason && (
                      <span className="mt-1 block max-w-56 text-caption text-muted-foreground">
                        {pass.rejectionReason}
                      </span>
                    )}
                  </Td>
                  <Td className="hidden max-w-80 @2xl:table-cell">
                    <span className="block font-medium text-foreground">
                      {REASON_LABEL[pass.reason] ?? pass.reason}
                    </span>
                    <span
                      className="block truncate text-caption text-muted-foreground"
                      title={pass.address}
                    >
                      {pass.address}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap tabular-nums">
                    {shortDateTime(pass.actualOutTime ?? pass.expectedOutTime)}
                    <span className="block text-caption text-muted-foreground">
                      {pass.actualOutTime ? "Exited" : "Planned"}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap tabular-nums">
                    {shortDateTime(pass.actualInTime ?? pass.expectedInTime)}
                    <span
                      className={
                        isLate
                          ? "block text-caption font-medium text-destructive"
                          : "block text-caption text-muted-foreground"
                      }
                    >
                      {pass.actualInTime
                        ? isLate
                          ? "Returned late"
                          : "Returned on time"
                        : "Due"}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableFrame>
      )}
    </div>
  );
}
