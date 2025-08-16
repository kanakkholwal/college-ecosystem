import { Icon } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/utils/link';
import { ArrowLeftIcon, Edit, Plus } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllResourcesGroupedByType, getResourceBySlug, getResourceRelated, ResourceType } from '~/lib/markdown/mdx';
import { appConfig } from '~/project.config';
import { changeCase, marketwiseLink } from '~/utils/string';
import { ResourcesList } from '../../client';
import { ClientMdx, CommentSection, TableOfContents } from './client';


type PageProps = {
    params: Promise<{ type: ResourceType; slug: string }>;
};

export async function generateStaticParams() {
    const meta = await getAllResourcesGroupedByType();
    return Object.entries(meta).flatMap(([type, resources]) => {
        return resources.map(resource => ({
            type,
            slug: resource.slug,
        }));
    });
}


export default async function ResourcePage({ params }: PageProps) {
    const resolvedParams = await params;
    const response = await getResourceBySlug(resolvedParams.type, resolvedParams.slug);
    if (!response) notFound();

    const { mdxSource, frontmatter } = response;
    const resourceUrl = `${appConfig.url}/resources/${resolvedParams.type}/${resolvedParams.slug}`;
    const publishedDate = new Date(frontmatter.date).toISOString();
    const modifiedDate = new Date(frontmatter.updated || frontmatter.date).toISOString();
    const otherResources = await getResourceRelated(resolvedParams.slug);

    // Structured data for BlogPosting
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": frontmatter.title,
        "description": frontmatter.summary || "Explore our resources",
        "url": resourceUrl,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": resourceUrl
        },
        "datePublished": publishedDate,
        "dateModified": modifiedDate,
        "author": frontmatter.author ? {
            "@type": "Person",
            "name": frontmatter.author
        } : {
            "@type": "Organization",
            "name": appConfig.name
        },
        "publisher": {
            "@type": "Organization",
            "name": appConfig.name,
            "logo": {
                "@type": "ImageObject",
                "url": `${appConfig.url}/logo.png`
            }
        },
        "articleSection": frontmatter.category,
        "keywords": frontmatter.tags?.join(', ') || '',
        "image": appConfig.flags.enableOgImage ? {
            "@type": "ImageObject",
            "url": `${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`,
            "width": 1200,
            "height": 630
        } : undefined,

    };

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                id='structured-data-resource'
            />
            <div className='grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 lg:mb-20 w-full mx-auto max-w-(--max-app-width)'>
                <main className="col-span-1 lg:col-span-9" itemType="https://schema.org/BlogPosting" itemScope>
                    <div className='flex justify-between items-center m-4 gap-2 pr-2'>
                        <ButtonLink
                            href={`/resources/${resolvedParams.type}`}
                            variant="ghost"
                            size="sm"
                            aria-label={`Back to ${changeCase(resolvedParams.type, "title")} resources`}
                        >
                            <ArrowLeftIcon />
                            Back to {changeCase(resolvedParams.type, "title")}
                        </ButtonLink>
                        <ButtonLink
                            href={`https://github.com/${appConfig.githubUri}/new/main/apps/platform/resources?filename=${resolvedParams.type}/example.mdx`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="rainbow_outline"
                            rounded="full"
                            size="sm"
                            aria-label={`Write ${changeCase(resolvedParams.type, "title")} resource`}
                        >
                            <Plus />
                            Write Your {changeCase(resolvedParams.type, "title")}
                        </ButtonLink>
                    </div>
                    <div className='py-12 md:px-8 space-y-5 px-3 lg:px-0'>
                        {appConfig.flags.enableOgImage && (<Image
                            width={1200}
                            height={630}
                            src={`/og/resources/${resolvedParams.type}/${resolvedParams.slug}`}
                            alt={frontmatter.title}
                            className="w-full h-auto rounded-lg"
                            itemProp="image"
                            itemType="https://schema.org/ImageObject"
                            loading="lazy"
                        />)}
                        {frontmatter.coverImage && (
                            <Image
                                src={frontmatter.coverImage}
                                alt={frontmatter.title}
                                width={1200}
                                height={630}
                                className="w-full h-auto rounded-lg"
                                itemProp="image"
                                itemType="https://schema.org/ImageObject"
                                loading="lazy"
                            />
                        )}
                        <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-5xl text-pretty" itemProp="headline">
                            {frontmatter.title}
                        </h1>

                        <p className="text-base text-muted-foreground text-pretty mb-3 line-clamp-3" itemProp="abstract">
                            {frontmatter.summary}
                        </p>
                        <div className="flex gap-4 px-4 text-sm items-center justify-between lg:px-8">
                            <a
                                href={frontmatter.author?.url || appConfig.authors[0].url}
                                className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-foreground/5 active:scale-95"
                                target='_blank'
                                rel="noopener noreferrer"
                                aria-label="Author"
                                title='Author Profile'
                                itemProp="author"
                                itemScope
                                itemType="https://schema.org/Person"
                            >
                                <Avatar>
                                    <AvatarImage
                                        alt={frontmatter.author?.name || 'Author Avatar'}
                                        className="size-9 rounded-full"
                                        role="presentation"
                                        loading="lazy"
                                        src={frontmatter.author?.image || appConfig.authors[0].image}
                                        itemProp="image"
                                        itemType="https://schema.org/ImageObject"

                                    />
                                    <AvatarFallback>
                                        {frontmatter.author?.name?.charAt(0) || 'A'}
                                        <span className="sr-only">{frontmatter.author?.name || 'Author'}</span>
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <p className="font-semibold text-foreground"
                                        itemProp="name"
                                        itemType="https://schema.org/Person"
                                    > {frontmatter.author?.name}</p>
                                    <p className="text-xs text-muted-foreground">{frontmatter.author?.handle || '@kanakkholwal'}</p>
                                </div>
                            </a>
                            <p className="text-sm font-medium text-muted-foreground">
                                {frontmatter.readingTime}
                            </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                                <meta itemProp="name" content={appConfig.name} />
                            </span>

                            Published under
                            <Badge size="sm" className='px-1 mx-1 capitalize' itemProp="articleSection">
                                {frontmatter.category}
                            </Badge>
                            on
                            <Badge size="sm" className='px-1 mx-1' itemProp="datePublished" content={publishedDate}>
                                {new Date(frontmatter.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Badge>

                        </div>
                        {frontmatter?.alternate_reads?.length  && (
                            <div>
                                <p className='text-sm font-medium mb-1'>
                                    Alternate reads:
                                </p>
                                {frontmatter.alternate_reads?.length ? (
                                    frontmatter.alternate_reads.map((url, index) => (
                                    <ButtonLink
                                        key={index}
                                        size="xs"
                                        variant="link"
                                        className="ml-2 group gap-1"
                                        href={marketwiseLink(url, `/resources/${frontmatter.type}/${frontmatter.slug}`)} target="_blank" rel="noopener noreferrer" itemProp="alternateName"
                                    >
                                        {new URL(url).hostname.replace('www.', '')}
                                        <Icon name='arrow-right' className='group-hover:-rotate-45 transition-all duration-200' />
                                    </ButtonLink>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No alternate reads available</span>
                            )}
                        </div>)}
                        <hr className="mt-4" />

                    </div>

                    <article
                        className="prose mx-auto p-6 prose-gray dark:prose-invert  container max-w-[900px] bg-card rounded-lg"
                        itemProp="articleBody"
                    >
                        <ClientMdx mdxSource={mdxSource} />
                        <p className='text-sm text-muted-foreground mt-4 pt-4 border-t' itemProp="keywords">
                            Tags:
                            {frontmatter.tags?.length ? (
                                frontmatter.tags.map((tag, index) => (
                                    <Badge size="sm" key={index} className="ml-2">
                                        #{tag}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No tags available</span>
                            )}
                        </p>
                    </article>

                    <div className="flex justify-between items-center flex-wrap text-xs text-muted-foreground bg-card p-3 rounded-lg mt-8 max-w-3xl mx-auto ">
                        <div>
                            Last updated on <br />
                            <p
                                className="inline-block px-1 mx-1 text-base font-semibold text-foreground"
                                itemProp="dateModified"
                                content={modifiedDate}
                            >
                                {new Date(frontmatter.updated || frontmatter.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>

                            <ButtonLink
                                href={`https://github.com/${appConfig.githubUri}/edit/main/apps/platform/resources/${resolvedParams.type}/${resolvedParams.slug}.mdx`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="ghost"
                                rounded="full"
                                size="xs"
                                title={`Edit on GitHub`}
                            >
                                <Edit />
                                Edit on GitHub
                                <span className="sr-only">Edit this resource on GitHub</span>
                            </ButtonLink>
                        </div>

                        <CommentSection />
                    </div>
                </main>
                <aside className="hidden lg:block lg:col-span-3 mt-8">
                    <TableOfContents items={response.data.toc} className='lg:sticky lg:top-2' />
                </aside>
                {otherResources.length > 0 && (
                    <section id='related-resources' className="col-span-1 lg:col-span-12 mt-12">
                        <h2 className="text-xl font-semibold mb-4 text-foreground pl-5">
                            Related Resources
                        </h2>
                        <ResourcesList resources={otherResources} className='items-stretch' />

                    </section>)}
            </div>
        </>
    );
}

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const resourceMeta = await getResourceBySlug(resolvedParams.type, resolvedParams.slug);
    if (!resourceMeta) notFound();

    const { frontmatter } = resourceMeta;

    const title = `${frontmatter.title} • ${changeCase(resolvedParams.type, "title")} • ${(await parent).title}`;
    const description = frontmatter.summary || "Explore our resources";
    const resourceUrl = `${appConfig.url}/resources/${resolvedParams.type}/${resolvedParams.slug}`;
    return {
        title,
        description,
        alternates: {
            canonical: resourceUrl,
        },
        openGraph: {
            title,
            description,
            url: resourceUrl,
            type: 'article',
            publishedTime: new Date(frontmatter.date).toISOString(),
            modifiedTime: new Date(frontmatter.updated || frontmatter.date).toISOString(),
            //   authors: frontmatter.author ? [frontmatter.author] : [],
            section: frontmatter.category,

            images: appConfig.flags.enableOgImage ? [{
                url: `${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`,
                alt: frontmatter.title,
                width: 1200,
                height: 630,
            }] : []
        },
        twitter: {
            card: 'summary',
            title,
            description,
            creator: appConfig.socials.twitter,
            images: appConfig.flags.enableOgImage ? [{
                url: `${appConfig.url}/og/resources/${resolvedParams.type}/${resolvedParams.slug}`,
                alt: frontmatter.title,
                width: 1200,
                height: 630,
            }] : []
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
            },
        },
    };
}
