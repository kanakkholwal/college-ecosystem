import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CoursePageLoader() {
  return (
    <>
      <div className="relative mb-24" id="home">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
        >
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
          <div className="relative pt-24 ml-auto">
            <div className="p-4 flex flex-col  items-center">
              <Skeleton className="w-32 h-8 mb-4" />
              <Skeleton className="w-64 h-16 mb-8" />
              <Skeleton className="w-48 h-6 mb-8" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6">
        <Tabs defaultValue="chapters">
          <TabsList className="mx-auto w-full bg-transparent font-bold">
            <TabsTrigger value="chapters">
              <Skeleton className="w-24 h-8" />
            </TabsTrigger>
            <TabsTrigger value="books_and_references">
              <Skeleton className="w-36 h-8" />
            </TabsTrigger>
            <TabsTrigger value="prev_papers">
              <Skeleton className="w-28 h-8" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((index) => (
                <Card key={index}>
                  <CardHeader className="gap-2 md:flex-row flex-wrap md:items-center md:justify-between w-full">
                    <Skeleton className="w-36 h-6 mb-2" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-full h-4 mb-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="books_and_references">
            <Skeleton className="w-full h-16" />
          </TabsContent>
          <TabsContent value="prev_papers">
            <Skeleton className="w-full h-16" />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
