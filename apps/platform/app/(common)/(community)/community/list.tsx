import { PostCard } from "@/components/application/community/post-card";
import type { CommunityPostTypeWithId } from "src/models/community";
import type { Session } from "~/auth";

const TIME_ZONE = "Asia/Kolkata";
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

function dayNumber(date: Date) {
  return Math.floor(Date.parse(dayKey.format(date)) / 86_400_000);
}

function bucketLabel(createdAt: Date | string, today: number) {
  const diff = today - dayNumber(new Date(createdAt));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return "This week";
  if (diff < 31) return "This month";
  return "Earlier";
}

export default function CommunityPostList({
  posts,
  user,
  commentCounts = {},
  groupByDate = false,
}: {
  posts: CommunityPostTypeWithId[];
  user?: Session["user"];
  commentCounts?: Record<string, number>;
  groupByDate?: boolean;
}) {
  const card = (post: CommunityPostTypeWithId) => (
    <li key={post._id}>
      <PostCard
        post={post}
        viewer={user}
        commentCount={commentCounts[post._id]}
      />
    </li>
  );

  if (!groupByDate) {
    return <ul className="flex flex-col gap-3">{posts.map(card)}</ul>;
  }

  const today = dayNumber(new Date());
  const groups: { label: string; posts: CommunityPostTypeWithId[] }[] = [];
  for (const post of posts) {
    const label = bucketLabel(post.createdAt, today);
    const last = groups.at(-1);
    if (last?.label === label) last.posts.push(post);
    else groups.push({ label, posts: [post] });
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section
          key={group.label}
          aria-label={`Posted ${group.label.toLowerCase()}`}
        >
          <p className="mb-2 flex items-center gap-3 text-caption font-medium text-muted-foreground">
            {group.label}
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </p>
          <ul className="flex flex-col gap-3">{group.posts.map(card)}</ul>
        </section>
      ))}
    </div>
  );
}
