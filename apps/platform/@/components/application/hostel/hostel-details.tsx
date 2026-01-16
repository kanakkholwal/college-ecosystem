import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading, Paragraph } from "@/components/ui/typography";
import { headers } from "next/headers";
import { auth, type Session } from "~/auth";
import type { HostelType } from "~/models/hostel_n_outpass";

export async function HostelDetail({ hostel }: { hostel: HostelType }) {
  const headersList = await headers();

  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session;

  const isWarden =
    hostel.warden.email === session.user.email ||
    session.user?.other_emails?.includes(hostel.warden.email);
  const isInCharge = hostel.administrators.some(
    (admin) =>
      session.user.email === admin.email ||
      session.user?.other_emails?.includes(admin.email)
  );
  const isAssistantWarden =
    isInCharge &&
    hostel.administrators.find((admin) => admin.email === session.user.email)
      ?.role === "assistant_warden";

  return (
    <div className="space-y-5 my-2">
      <div className="flex justify-between w-full">
        <div className="lg:w-1/2">
          <Heading level={3} className="font-bold text-gray-800">
            {hostel.name}
          </Heading>
          <Paragraph className="capitalize !mt-0">
            Warden: {hostel.warden.name}{" "}
            <span className="lowercase">({hostel.warden.email})</span>
          </Paragraph>
        </div>
      </div>
      <div className="w-full">
        <Heading level={5} className="text-gray-800">
          InCharges Details ({hostel.administrators.length})
          {isWarden && (
            <Button variant="link" size="sm">
              Update InCharges
            </Button>
          )}
        </Heading>
        <ul className="list-disc list-inside">
          {hostel.administrators.map((admin) => (
            <li key={admin.email}>
              {admin.name} - {admin.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HostelDetailsForNonAdmins({ hostel }: { hostel: HostelType }) {
  return (
    <div className="space-y-5 my-2 bg-card p-4 rounded-lg">
      <div className="flex justify-between w-full">
        <div className="w-1/2">
          <h4 className="text-lg font-semibold">{hostel.name}</h4>
          <Badge className="mt-1" size="sm">
            {hostel.gender === "female"
              ? "Girls"
              : hostel.gender === "male"
                ? "Boys"
                : hostel.gender}{" "}
            Hostel
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 mt-2">
        <div>
          <h5 className="text-sm font-medium">Warden</h5>
          <Paragraph className="!mt-0 text-sm text-muted-foreground">
            {hostel.warden.name} ({hostel.warden.email})
          </Paragraph>
        </div>
        <div>
          <h5 className="text-sm font-medium">
            Admin / MMCA ({hostel.administrators.length})
          </h5>
          <ul className="list-disc list-inside">
            {hostel.administrators.map((admin) => (
              <li
                key={admin.email}
                className="text-sm font-medium text-muted-foreground"
              >
                {admin.name} - {admin.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
