import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import OthersPng from "./assets/others.png";

import { GoBackButton } from "@/components/common/go-back";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Image from "next/image";
import Link from "next/link";
import { getCourseByCode, updateBooksAndRefPublic } from "~/actions/course";
import dbConnect from "~/lib/dbConnect";

import { AddPrevsModal, AddRefsModal } from "./modal";
import { IconMap } from "./render-link";

import type { Metadata, ResolvingMetadata } from "next";
import { getSession } from "~/lib/auth-server";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { code } = await params;
  const data = await getCourseByCode(code);
  if (!data) return notFound();

  return {
    title: `${data.course.name} | ${data.course.code} | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: `Syllabus of ${data.course.name} (${data.course.code})`,
  };
}

export default async function CoursePage(props: Props) {
  const params = await props.params;

  const session = await getSession();

  const data = await getCourseByCode(params.code);
  if (!data) {
    return notFound();
  }
  console.log(data);
  const { course, booksAndReferences, previousPapers, chapters } = data;

  return (
    <>
      <div>
        <GoBackButton />
      </div>
      <section
        id="hero"
        className="z-10 w-full max-w-6xl relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
          <span className="relative bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent  md:px-2">
            {course.name}
          </span>
        </h1>
        <h5 className="mt-8 text-xl font-semibold text-gray-700 dark:text-gray-300 text-center mx-auto uppercase">
          {course.code}
        </h5>
        <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6" />
      </section>
      <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6">
        <Tabs defaultValue="chapters">
          <TabsList className="mx-auto w-full bg-transparent font-bold flex-wrap gap-4">
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="books_and_references">
              Books and References
            </TabsTrigger>
            <TabsTrigger value="prev_papers">Previous Year Papers</TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <div className="max-w-7xl w-full xl:px-6 grid gap-4 grid-cols-1">
              {chapters.map((chapter, index) => {
                return (
                  <Card variant="glass" key={chapter.title}>
                    <CardHeader className="flex-row gap-2 items-center px-5 py-4">
                      <div className="flex-auto">
                        <CardTitle>{chapter.title}</CardTitle>
                        <CardDescription className="font-semibold text-gray-700">
                          {chapter.topics.length} Topics
                        </CardDescription>
                      </div>
                      <div className="w-10 h-10 rounded-full flex justify-center items-center  bg-white/50 font-bold text-lg shrink-0 text-gray-700">
                        {chapter.lectures} L
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium text-gray-800">
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
                    <Card key={ref.link}>
                      <CardHeader className="md:flex-row md:justify-between gap-2">
                        <div className="w-16 h-16 p-3 aspect-square rounded-full flex justify-center items-center  bg-slate-100 dark:bg-gray-800 font-bold text-lg">
                          {iconsSrc ? (
                            <Image
                              src={iconsSrc}
                              className="w-10 h-10"
                              width={40}
                              height={40}
                              alt={ref.link}
                            />
                          ) : (
                            <Image
                              src={OthersPng}
                              className="w-10 h-10"
                              width={40}
                              height={40}
                              alt={ref.link}
                            />
                          )}
                        </div>
                        <div className="flex-auto grow">
                          <CardTitle className="break-words">
                            {ref.name}
                          </CardTitle>
                          <a
                            href={ref.link}
                            target="_blank"
                            className="text-primary mt-2 text-sm font-semibold"
                            rel="noreferrer"
                          >
                            Go to Link
                          </a>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 text-md font-semibold pt-5">
                Any Books and References will be shown here.
              </p>
            )}
            <div className="flex w-full items-center justify-center p-4">
              {session?.user ? (
                <AddRefsModal code={course.code} courseId={course.id} />
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 text-md font-semibold pt-5">
                  <Link
                    href="/sign-in"
                    className="text-primary font-semibold hover:underline"
                  >
                    Login
                  </Link>{" "}
                  to add Books and References
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="prev_papers">
            {previousPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previousPapers.map((paper, index) => {
                  return (
                    <div
                      className="flex items-center p-4 gap-3 border border-border hover:border-primary rounded-md"
                      key={paper.link}
                    >
                      <h6 className="uppercase font-semibold text-lg">
                        {paper.exam}
                      </h6>
                      <Badge className="bg-primary ml-2">{paper.year}</Badge>
                      <div className="ml-auto">
                        <Button size="icon" asChild>
                          <a href={paper.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 text-md font-semibold pt-5">
                Any Previous Year Papers will be shown here.
              </p>
            )}

            <div className="flex w-full items-center justify-center p-4">
              {session?.user ? (
                <AddPrevsModal code={course.code} courseId={course.id} />
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 text-md font-semibold pt-5">
                  <Link
                    href="/sign-in"
                    className="text-primary font-semibold hover:underline"
                  >
                    Login
                  </Link>{" "}
                  to add Previous Year Papers
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
