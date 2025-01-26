import { UpdateStudentsForm } from "@/components/application/hostel/hostel-actions";
import EmptyArea from "@/components/common/empty-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heading, Paragraph } from "@/components/ui/typography";
import { ErrorBoundary } from "@/components/utils/error-boundary";
import { LuBuilding } from "react-icons/lu";
import { getHostel } from "~/actions/hostel";

export default async function HostelPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug;
  const response = await getHostel(slug);
  console.log(response);
  const { success, hostel } = response;
  if (!success || !hostel) {
    return (
      <EmptyArea
        icons={[LuBuilding]}
        title="No Hostel Found"
        description={`Hostel with slug ${slug} not found`}
      />
    );
  }

  return (
    <div className="space-y-5 my-2">
      <div className="flex justify-between w-full">
        <div className="w-1/2">
          <Heading level={4}>{hostel.name}</Heading>
          <Paragraph className="capitalize mt-0!">
            {hostel.gender} Hostel
          </Paragraph>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Heading level={5}>Warden</Heading>
          <Paragraph className="mt-0!">
            {hostel.warden.name} ({hostel.warden.email})
          </Paragraph>
        </div>
        <div>
          <Heading level={5}>
            Administrators ({hostel.administrators.length})
          </Heading>
          <ul className="list-disc list-inside">
            {hostel.administrators.map((admin) => (
              <li key={admin.email}>
                {admin.name} - {admin.email}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="update-hostel">
              <AccordionTrigger>
                <Heading level={5}>Update Hostel</Heading>
              </AccordionTrigger>
              <AccordionContent>
                <ErrorBoundary
                  fallback={
                    <p className="text-red-500">Failed to load students</p>
                  }
                >
                  <UpdateStudentsForm
                    slug={slug}
                    student_emails={hostel.students.map(
                      (student) => student.email
                    )}
                  />
                </ErrorBoundary>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="existing-students">
              <AccordionTrigger>
                <Heading level={5}>
                  Hosteler Students ({hostel.students.length})
                </Heading>
              </AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
