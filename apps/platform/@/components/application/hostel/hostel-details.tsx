import { Button } from "@/components/ui/button";
import { Heading, Paragraph } from "@/components/ui/typography";
// import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass"
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";
import type { HostelType } from "~/models/hostel_n_outpass";

export async function HostelDetail({ hostel }: { hostel: HostelType }) {
  const session = (await getSession()) as Session;

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
          <Paragraph className="capitalize mt-0!">
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
        <Heading level={5} className="text-gray-800">
          Hosteler Students ({hostel.students.length})
          {isWarden && (
            <Button variant="link" size="sm">
              Update Students
            </Button>
          )}
        </Heading>
      </div>
    </div>
  );
}

export function HostelDetailsForHosteler({ hostel }: { hostel: HostelType }) {
  return (
    <div className="space-y-5 my-2">
      <div className="w-full">
        <div className="@2xl:w-1/2">
          <Heading level={3} className="font-bold text-gray-800">
            {hostel.name}
          </Heading>
          <Paragraph className="capitalize mt-0!">
            Warden: {hostel.warden.name}{" "}
            <span className="lowercase">({hostel.warden.email})</span>
          </Paragraph>
        </div>
      </div>
      <div className="w-full">
        <Heading level={6} className="text-gray-800">
          InCharges
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
