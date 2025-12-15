"use client";
import { Badge } from "@/components/ui/badge";
import { Button, intents } from "@/components/ui/button";
import { Sun } from "lucide-react";

// Helper to get all variant combinations
const variantsConfig = {
    variant: Object.keys(intents),
    size: ['xs','sm', 'default', 'lg',  'icon_xs','icon_sm','icon', 'icon_lg','icon_xl'],
} as const;

export default function DesignPage() {
    return <div className="p-8 space-y-12 min-h-screen">
        <section className="max-w-6xl mx-auto" id="button">
            <header className="mb-12 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 p-4 rounded-b-lg border-b border-border">
                <h1 className="text-lg font-semibold">Button Variants Showcase</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    A comprehensive overview of all button variants available in the design system.
                </p>
            </header>

            {Object.entries(variantsConfig).map(([variantType, options]) => (
                <div key={variantType} className="mb-12 p-6 rounded-lg shadow bg-card/40">
                    <h2 className="text-xl font-semibold mb-6   capitalize border-b pb-2">
                        {variantType} Variants
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        {options.map((option) => (
                            <div key={option} className="flex flex-col items-center gap-2">
                                <Button
                                    {...{
                                        [variantType]: option
                                    }}
                                >
                                    {variantType === 'size' ? option.includes('icon') ? <Sun /> : 'Button' : 'Button'}
                                </Button>
                                <span className="text-xs text-muted-foreground0">{option}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
        <section className="max-w-6xl mx-auto" id="badge">
            <header className="mb-12 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 p-4 rounded-b-lg border-b border-border">
                <h1 className="text-lg font-semibold">Badge Variants Showcase</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    A comprehensive overview of all badge variants available in the design system.
                </p>
            </header>
            <div className="flex flex-wrap gap-4 items-center">
                {Object.entries(variantsConfig).map(([variantType, options]) => (
                    <div key={variantType} className="mb-12 p-6 rounded-lg shadow bg-card/40">
                        <h2 className="text-xl font-semibold mb-6   capitalize border-b pb-2">
                            {variantType} Variants
                        </h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            {options.map((option) => (
                                <div key={option} className="flex flex-col items-center gap-2">
                                    <Badge
                                        {...{
                                            [variantType]: option
                                        }}
                                    >
                                        {variantType === 'size' ? option.includes('icon') ? <Sun /> : 'Badge' : 'Badge'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground0">{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
}