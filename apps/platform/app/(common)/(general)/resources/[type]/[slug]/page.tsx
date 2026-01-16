import { FlickeringGrid } from "@/components/animation/flikering-grid";
import AdUnit from "@/components/common/adsense";
import ShareButton from "@/components/common/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Edit3,
  FileText,
  Share2
} from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllResourcesGroupedByType,
  getResourceBySlug,
  getResourceRelated,
  ResourceType,
} from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";
import { changeCase, marketwiseLink } from "~/utils/string";
import { ResourcesList } from "../../client";
import { ClientMdx, CommentSection, TableOfContents } from "./client";

type PageProps = {
  params: Promise<{ type: ResourceType; slug: string }>;
};

export async function generateStaticParams() {
  const meta = await getAllResourcesGroupedByType();
  return Object.entries(meta).flatMap(([type, resources]) => {
    return resources.map((resource) => ({
      type,
      slug: resource.slug,
    }));
  });
}

export default async function ResourcePage({ params }: PageProps) {
  const resolvedParams = await params;
  const response = await getResourceBySlug(
    resolvedParams.type,
    resolvedParams.slug
  );
  if (!response) notFound();

  const { mdxSource, frontmatter } = response;
  const resourceUrl = `${appConfig.url}/resources/${resolvedParams.type}/${resolvedParams.slug}`;
  const publishedDate = new Date(frontmatter.date).toISOString();
  const modifiedDate = new Date(frontmatter.updated || frontmatter.date).toISOString();
  const otherResources = await getResourceRelated(resolvedParams.slug);

  // --- Structured Data (JSON-LD) ---
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.summary || "Explore our resources",
    url: resourceUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": resourceUrl },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: frontmatter.author
      ? { "@type": "Person", name: frontmatter.author.name }
      : { "@type": "Organization", name: appConfig.name },
    publisher: {
      "@type": "Organization",
      name: appConfig.name,
      logo: { "@type": "ImageObject", url: `${appConfig.url}/logo.png` },
    },
    articleSection: frontmatter.category,
    keywords: frontmatter.tags?.join(", ") || "",
    image: appConfig.flags.enableOgImage
      ? {
          "@type": "ImageObject",
          url: `${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`,
          width: 1200,
          height: 630,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        id="structured-data-resource"
      />

      <div className="relative min-h-screen">
        
        <header className="relative w-full border-b border-border/40 overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute inset-0 z-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-20 pointer-events-none">
            <FlickeringGrid
              className="size-full"
              squareSize={4}
              gridGap={6}
              color="#6B7280"
              maxOpacity={0.2}
              flickerChance={0.05}
            />
          </div>

          <div className="container relative z-10 mx-auto max-w-5xl px-4 py-12 md:py-20 text-center">
            {/* Nav Back */}
            <div className="flex justify-center mb-8">
               <ButtonLink 
                  href="/resources" 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-muted-foreground hover:text-foreground"
               >
                  <ArrowLeft className="mr-2 size-4" /> Back to Resources
               </ButtonLink>
            </div>

            {/* Tags */}
            {frontmatter.tags && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {frontmatter.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground bg-muted/50 border-border/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance mb-6">
              {frontmatter.title}
            </h1>

            {/* Summary */}
            {frontmatter.summary && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance mb-8">
                {frontmatter.summary}
              </p>
            )}

            {/* Byline */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-y border-border/40 py-4 w-fit mx-auto px-8 bg-background/50 backdrop-blur-sm rounded-full">
               <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                     <AvatarImage src={frontmatter.author?.image} />
                     <AvatarFallback>{frontmatter.author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{frontmatter.author?.name}</span>
               </div>
               <Separator orientation="vertical" className="h-4" />
               <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  <time dateTime={publishedDate}>
                    {new Date(frontmatter.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </time>
               </div>
               <Separator orientation="vertical" className="h-4" />
               <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{frontmatter.readingTime}</span>
               </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <main className="lg:col-span-8 space-y-10" itemType="https://schema.org/BlogPosting" itemScope>
              
              {/* Featured Image */}
              {(frontmatter.coverImage || appConfig.flags.enableOgImage) && (
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-sm aspect-video bg-muted">
                   <Image
                      src={frontmatter.coverImage || `/og/resources/${resolvedParams.type}/${resolvedParams.slug}`}
                      alt={frontmatter.title}
                      fill
                      className="object-cover"
                      priority
                      itemProp="image"
                   />
                </div>
              )}

              {/* MDX Body */}
              <article className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                prose-headings:font-semibold prose-headings:tracking-tight 
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:border prose-img:border-border/50
                prose-code:text-sm prose-code:font-mono prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                itemProp="articleBody"
              >
                <ClientMdx mdxSource={mdxSource} />
              </article>

              <Separator className="my-8" />

              {/* Footer Metadata & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50">
                 <div>
                    <p>Last updated: <span className="text-foreground font-medium">{new Date(modifiedDate).toLocaleDateString()}</span></p>
                    <p className="text-xs mt-1 opacity-70">Found a typo? Help us fix it.</p>
                 </div>
                 
                 <div className="flex gap-2">
                    <ButtonLink
                       href={`https://github.com/${appConfig.githubUri}/edit/main/apps/platform/resources/${resolvedParams.type}/${resolvedParams.slug}.mdx`}
                       target="_blank"
                       variant="outline"
                       size="sm"
                       className="gap-2"
                    >
                       <Edit3 className="size-3.5" /> Edit on GitHub
                    </ButtonLink>
                    <ShareButton 
                       variant="default" 
                       size="sm" 
                       className="gap-2"
                       data={{ title: frontmatter.title, text: frontmatter.summary, url: resourceUrl }}
                    >
                       <Share2 className="size-3.5" /> Share
                    </ShareButton>
                 </div>
              </div>

              <CommentSection />
            </main>

            <aside className="lg:col-span-4 space-y-8">
               <div className="sticky top-36 space-y-8">
                  
                  {/* Table of Contents */}
                  {response.data.toc && response.data.toc.length > 0 && (
                     <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                        <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                           <FileText className="size-4 text-primary" /> Table of Contents
                        </h3>
                        <TableOfContents items={response.data.toc} />
                     </div>
                  )}

                  {/* Alternate Reads */}
                  {frontmatter.alternate_reads && frontmatter.alternate_reads.length > 0 && (
                     <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                        <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider text-muted-foreground">Also Read</h3>
                        <ul className="space-y-3">
                           {frontmatter.alternate_reads.map((url, i) => (
                              <li key={i}>
                                 <a 
                                    href={marketwiseLink(url, { utm_medium: "app", utm_campaign: "resource_sidebar" })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block text-sm text-muted-foreground hover:text-primary transition-colors"
                                 >
                                    <span className="block font-medium text-foreground group-hover:text-primary mb-0.5">
                                       {new URL(url).hostname.replace('www.', '')}
                                    </span>
                                    <span className="text-xs truncate block opacity-70">
                                       Read external article &rarr;
                                    </span>
                                 </a>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {/* Ad Unit */}
                  <div className="flex justify-center">
                     <AdUnit adSlot="display-vertical" />
                  </div>
               </div>
            </aside>

          </div>
        </div>

        {otherResources.length > 0 && (
          <div className="bg-muted/30 border-t border-border/40 py-20">
             <div className="container mx-auto max-w-7xl px-4">
                <h2 className="text-2xl font-bold mb-8 px-2">Related Resources</h2>
                <ResourcesList resources={otherResources} className="items-stretch" />
             </div>
          </div>
        )}

        {/* Bottom Ad */}
        <div className="container mx-auto max-w-4xl py-10">
           <AdUnit adSlot="multiplex" />
        </div>

      </div>
    </>
  );
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const resourceMeta = await getResourceBySlug(
    resolvedParams.type,
    resolvedParams.slug
  );
  if (!resourceMeta) notFound();

  const { frontmatter } = resourceMeta;
  const title = `${frontmatter.title} • ${changeCase(resolvedParams.type, "title")}`;
  const description = frontmatter.summary || "Explore our resources";
  const resourceUrl = `${appConfig.url}/resources/${resolvedParams.type}/${resolvedParams.slug}`;

  return {
    title,
    description,
    alternates: { canonical: resourceUrl },
    openGraph: {
      title,
      description,
      url: resourceUrl,
      type: "article",
      publishedTime: new Date(frontmatter.date).toISOString(),
      modifiedTime: new Date(frontmatter.updated || frontmatter.date).toISOString(),
      section: frontmatter.category,
      images: appConfig.flags.enableOgImage
        ? [{ url: `${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: appConfig.socials.twitter,
      images: appConfig.flags.enableOgImage
        ? [`${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`]
        : [],
    },
  };
}