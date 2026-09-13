import { notFound } from "next/navigation";

// Unknown dashboard paths 404 inside the shell via ../not-found.tsx.
export default function NotFoundFallbackPage() {
  notFound();
}
