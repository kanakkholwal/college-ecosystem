"use client";

import { Button } from "@/components/ui/button";
import { Home, MoveLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ErrorActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
      <Button
        variant="outline"
        className="w-full sm:w-auto px-8 h-12 gap-2 border-border/60 hover:bg-muted/50"
        size="lg"
        onClick={() => router.back()}
      >
        <MoveLeft className="w-4 h-4" />
        Go Back
      </Button>

      <Button
        size="lg"
        className="w-full sm:w-auto px-8 h-12 gap-2 shadow-lg shadow-primary/20"
        asChild
      >
        <Link href="/">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}