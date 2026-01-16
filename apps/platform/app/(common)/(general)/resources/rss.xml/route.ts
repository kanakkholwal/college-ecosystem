import { getAllResources } from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";

export async function GET() {
  const rssXml = await generateRssXml();
  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}

async function generateRssXml() {
  const baseUrl = appConfig.url.replace(/\/$/, ""); // Ensure no trailing slash
  const posts = (await getAllResources()).filter((post) => Boolean(post.date));
  const items = posts
    .map((post) => {
      return `<item>
      <title>${post.title}</title>
      <link>${baseUrl}${`/resources/${post.type}/${post.slug}`}</link>
      <guid>${baseUrl}${`/resources/${post.type}/${post.slug}`}</guid>
      <description>${post.summary}</description>
      <pubDate>${new Date(post.date!).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${appConfig.name}</title>
    <link>${baseUrl}/resources</link>
    <description>Explore our comprehensive collection of articles, experiences, and case studies.</description>
    <atom:link href="${baseUrl}/resources/rss.xml" rel="self" type="application/rss+xml" />
  ${items}
  </channel>
</rss>
`;
}
