import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import OthersPng from "./assets/others.png";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, VercelTabsList } from "@/components/ui/tabs";
import { AuthActionButton, PreviousPageLink } from "@/components/utils/link";
import Image from "next/image";
import { getCourseByCode } from "~/actions/common.course";

import { AddPrevModal, AddRefsModal } from "./modal";
import { IconMap } from "./render-link";

import { Icon } from "@/components/icons";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { orgConfig } from "~/project.config";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { code } = await params;
  const { course } = await getCourseByCode(code);
  if (!course) return notFound();

  return {
    title: `${course.name} | ${course.code}`,
    description: `Syllabus of ${course.name} (${course.code})`,
  };
}

export default async function CoursePage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "chapters";

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const data = await getCourseByCode(params.code);
  if (!data.course) {
    return notFound();
  }
  // console.log(data);
  const { course, booksAndReferences, previousPapers, chapters } = data;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-6 xl:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.name,
            description: `Syllabus of ${course.name} (${course.code})`,
            courseMode: course.type,
            provider: {
              "@type": "EducationalOrganization",
              name: orgConfig.name,
              url: orgConfig.website,
              logo: orgConfig.logoSquare,
            },
            courseCode: course.code,
            department: course.department,
            credits: course.credits,
          }),
        }}
        id="json-ld-course"
      />
      <section
        id="hero"
        className="z-10 w-full relative flex flex-col gap-5 py-10 px-4 text-center"
      >
        <PreviousPageLink size="sm" className="mr-auto" />

        <h1 className="font-bold text-3xl lg:text-5xl">
          <span className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent  md:px-2">
            {course.name}
          </span>
        </h1>
        <h5 className="text-lg ml-4 font-semibold text-muted-foreground uppercase">
          {course.code}
        </h5>
        <div className="w-full flex flex-wrap justify-center gap-3 mx-auto">
          <Badge>{course.department}</Badge>
          <Badge>{course.type} </Badge>
          <Badge>{course.credits} Credits</Badge>
        </div>
      </section>
      <Tabs
        defaultValue={tab}
        className="w-full max-w-6xl mx-auto grid grid-cols-1 justify-center gap-4 p-3 md:px-6 xl:px-12"
      >
        <VercelTabsList
          tabs={[
            {
              id: "chapters",
              label: "Chapters",
            },
            {
              id: "books_and_references",
              label: "Books and References",
            },
            {
              id: "prev_papers",
              label: "Previous Year Papers",
            },
          ]}
          onTabChangeQuery="tab"
        />
        <TabsContent value="chapters">
          <div className="w-full xl:px-6 grid gap-4 grid-cols-1">
            {chapters.map((chapter) => {
              return (
                <Card key={chapter.id}>
                  <CardHeader className="flex-row gap-2 items-center px-5 py-4">
                    <div className="flex-auto">
                      <CardTitle className="font-medium text-lg">
                        {chapter.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {chapter.topics.length} Topics
                      </CardDescription>
                    </div>
                    <div className="size-10 rounded-full flex justify-center items-center font-bold text-lg shrink-0 text-muted-foreground bg-muted">
                      {chapter.lectures} L
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {chapter.topics.join(", ")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="books_and_references">
          {booksAndReferences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {booksAndReferences.map((ref) => {
                const iconsSrc = IconMap.has(
                  ref.type as
                  | "book"
                  | "reference"
                  | "drive"
                  | "youtube"
                  | "others"
                )
                  ? IconMap.get(
                    ref.type as
                    | "book"
                    | "reference"
                    | "drive"
                    | "youtube"
                    | "others"
                  )
                  : OthersPng;
                return (
                  <div className="bg-card p-3 rounded-lg" key={ref.link}>
                    <div className="flex items-center gap-2">
                      <div className="size-12 aspect-square rounded-full flex justify-center items-center bg-muted shrink-0">
                        {iconsSrc ? (
                          <Image
                            src={iconsSrc}
                            className="size-8"
                            width={40}
                            height={40}
                            alt={ref.link}
                          />
                        ) : (
                          <Image
                            src={OthersPng}
                            className="size-8"
                            width={40}
                            height={40}
                            alt={ref.link}
                          />
                        )}
                      </div>
                      <div className="flex-auto grow">
                        <h4 className="text-sm font-medium break-words">
                          {ref.name}
                        </h4>

                        <a
                          href={ref.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-xs font-medium hover:underline space-x-1"
                        >
                          Go to Link
                          <ArrowUpRight className="size-3 inline-block" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm font-medium pt-3">
              Any Books and References will be shown here.
            </p>
          )}
          <div className="flex w-full items-center justify-center p-4" id="add-resources">

            {session?.user ? (
              <AddRefsModal code={course.code} courseId={course.id} />
            ) : (
              <AuthActionButton
                authorized={!!session?.user}
                variant="dark"
                nextUrl={`/syllabus/${course.code}#add-resources`}
              >
                <Icon name="plus"/>
                Submit Books and References
              </AuthActionButton>
            )}
          </div>
        </TabsContent>
        <TabsContent value="prev_papers">
          {previousPapers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {previousPapers.map((paper, index) => {
                return (
                  <div
                    className="flex items-center p-3 gap-2 border bg-card rounded-lg hover:shadow hover:border-primary/75 transition-all"
                    key={paper.link}
                    id={`paper-${index}`}
                  >
                    <h5 className="uppercase font-medium text-sm">
                      {paper.exam}
                    </h5>
                    <Badge>{paper.year}</Badge>
                    <div className="ml-auto">
                      <Button size="icon_sm" variant="ghost" asChild>
                        <a href={paper.link} target="_blank" rel="noreferrer">
                          <ExternalLink />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm font-semibold pt-3">
              Any Previous Year Papers will be shown here.
            </p>
          )}

          <div className="flex w-full items-center justify-center p-4" id="add-prev_papers">
            {session?.user ? (
              <AddPrevModal code={course.code} courseId={course.id} />
            ) : (
              <AuthActionButton
              authorized={!!session?.user}
              variant="dark"
              nextUrl={`/syllabus/${course.code}#add-resources`}
            >
               <Icon name="plus"/>
              Submit Previous Year Papers
            </AuthActionButton>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
