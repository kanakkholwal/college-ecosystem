"use client";

import { useQueryState } from "nuqs";

interface TagFilterProps {
    tags: string[];
    tagCounts?: Record<string, number>;
    tagIdParamName?: string; // Optional prop to specify the query parameter name for the tag
}

export function TagFilter({ tags, tagCounts, tagIdParamName = "tab" }: TagFilterProps) {
    const [selectedTag, setTag] = useQueryState(tagIdParamName, {
        defaultValue: "All",
    });
    console.log('selectedTag:', selectedTag);
    console.log('tagCounts:', tagCounts);
    console.log('allTagsByCount:', tags);

    const handleTagClick = (tag: string) => {
        if (tag === "All") {
            setTag(null); // Remove the tag parameter for "All"
        } else {
            setTag(tag);
        }
    };




    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`h-8 flex items-center px-1 pl-3 rounded-lg cursor-pointer border text-sm transition-colors ${selectedTag === tag
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                        }`}
                >
                    <span>{tag}</span>
                    {tagCounts?.[tag] && (
                        <span
                            className={`ml-2 text-xs border rounded-md h-6 min-w-6 font-medium flex items-center justify-center ${selectedTag === tag
                                ? "border-border/40 dark:border-primary-foreground bg-background text-primary"
                                : "border-border dark:border-border"
                                }`}
                        >
                            {tagCounts[tag]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}