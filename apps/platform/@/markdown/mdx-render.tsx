"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { useEffect, useState } from "react";
import { compileMdxSource } from "./utils";

interface MdxRendererProps {
  mdxContent: string;
}

export default function MdxRenderer({ mdxContent }: MdxRendererProps) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const mdxSource = await compileMdxSource(mdxContent);
        if (mounted) {
          setCompiled(mdxSource);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to render content.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mdxContent]);

  if (loading) return <p>Loading content...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!compiled) return null;

  return <MDXRemote {...compiled} />;
}
