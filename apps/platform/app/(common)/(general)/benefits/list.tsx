"use client";

import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import ShareButton from "@/components/common/share-button";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    VercelTabsList
} from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { sendGAEvent } from "@next/third-parties/google";
import { motion } from "framer-motion";
import { ExternalLink, Globe, LayoutGrid, Search, SearchX, Sparkles } from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { LuShare2 } from "react-icons/lu";
import { benefitsCategories, benefitsItem, benefitsList, submitBenefitsLink } from "root/resources/benefits";
import { appConfig } from "~/project.config";
import { changeCase } from "~/utils/string";


export default function FreeStuffTable() {
    const [query, setQuery] = useQueryState("q", { defaultValue: "" });
    const [region, setRegion] = useQueryState("region", { defaultValue: "" });
    const [viewMode, setViewMode] = useQueryState("view", { defaultValue: "grid" });
    const filteredBenefits = useMemo(() => {
        return benefitsList.filter((benefit) => {
            const matchesQuery = query
                ? benefit.resource.toLowerCase().includes(query.toLowerCase()) ||
                benefit.description.toLowerCase().includes(query.toLowerCase()) ||
                benefit.tags.some((tag) =>
                    tag.toLowerCase().includes(query.toLowerCase())
                )
                : true;
            const matchesRegion =
                (region.toLowerCase() === "worldwide" || region.toLowerCase() === "global" || region.trim() === "" || typeof region === "undefined") ?
                    true : benefit.country
                        ? benefit.country.toLowerCase() === region.toLowerCase()
                        : true;
            return matchesQuery && matchesRegion;
        });
    }, [query, region]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background via-muted/20 to-background py-10 px-4 lg:px-10" id="benefits">

            {/* Search & Filters */}

            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-6xl mx-auto mb-10"
                >
                    <div className="bg-card border rounded-xl p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Search - Takes more space */}
                            <div className="md:col-span-7 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                <Input
                                    type="search"
                                    placeholder="Search benefits, tools, credits..."
                                    className="pl-10 h-11  border-0 bg-background"
                                />
                            </div>

                            {/* Region Select */}
                            <div className="md:col-span-2">
                                <Select defaultValue="all">
                                    <SelectTrigger className="md:h-11">
                                        <Globe className="size-4 mr-2" />
                                        <SelectValue placeholder="Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Regions</SelectItem>
                                        <SelectItem value="worldwide">Worldwide</SelectItem>
                                        <SelectItem value="usa">USA</SelectItem>
                                        <SelectItem value="india">India</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* View Mode */}
                            <div className="md:col-span-2">
                                <Select defaultValue="grid">
                                    <SelectTrigger className="md:h-11">
                                        <LayoutGrid className="size-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grid">Grid</SelectItem>
                                        <SelectItem value="horizontal">List</SelectItem>
                                        <SelectItem value="minimal">Compact</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Share Button */}
                            <div className="md:col-span-1">
                                <ShareButton className="md:h-11 w-full rounded-xl shadow-sm"
                                    variant="dark"
                                    // size="sm" 
                                    data={{
                                        title: "Free Stuff for College Students",
                                        text: "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
                                        url: appConfig.url + "/benefits",
                                    }}
                                    shareCurrentUrl={true}>
                                    <LuShare2 className="size-4" />
                                </ShareButton>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <Tabs defaultValue="all" className="w-full">
                    <VercelTabsList
                        className="flex-1 mb-6"
                        onTabChangeQuery="category"
                        tabs={benefitsCategories.map((cat) => ({
                            label: changeCase(cat, "title"),
                            value: cat,
                            id: cat,
                        }))}
                    />

                    {benefitsCategories.map((cat, catIndex) => {
                        const tabBenefits = filteredBenefits.filter((r) => {
                            if (cat === "all") return true;
                            return r.category === cat;
                        });
                        return <TabsContent key={cat} value={cat} className="space-y-10">
                            {tabBenefits.length === 0 ? (
                                <EmptyArea
                                    icons={[SearchX]}
                                    title="No benefits found"
                                    description="Try adjusting your search or filter to find what you're looking for."

                                />
                            ) : <>
                                {(viewMode === "grid" || !viewMode) && <BenefitsGrid tabBenefits={tabBenefits} />}
                                {viewMode === "horizontal" && <BenefitsGridHorizontal tabBenefits={tabBenefits} />}
                                {viewMode === "minimal" && <BenefitsGridMinimal tabBenefits={tabBenefits} />}

                                {/* Insert AdSense in between each category */}
                                {catIndex % 2 === 0 && (
                                    <>
                                        <AdUnit adSlot="display-square" key={`benefits-ad-${catIndex}`} />
                                    </>
                                )}
                            </>}
                        </TabsContent>
                    })}
                </Tabs>

                <div className="mt-16 text-center">
                    <p className="text-muted-foreground mb-4">Have a resource to share?</p>
                    <ButtonLink
                        href={submitBenefitsLink}
                        target="_blank"
                        variant="rainbow"
                        size="lg"
                        onClick={() => {
                            sendGAEvent("event", "benefit_submit_click", {
                                location: "benefits_page",
                            });
                        }}
                    >
                        <Icon name="sparkles" />
                        Submit a Resource
                        <Icon name="arrow-up-right" />
                    </ButtonLink>
                </div>
            </div>
        </div>
    );
}

export function BenefitsGrid({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
            {tabBenefits.map((res, i) => (
                <motion.div
                    key={res.resource + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="group rounded-xl border bg-card hover:border-primary/50 transition-all overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 p-4 border-b bg-muted/20">
                        {res.logo.trim() !== "" && (
                            <div className="size-12 rounded-lg bg-background border flex items-center justify-center shrink-0 overflow-hidden">
                                <Image
                                    src={res.logo}
                                    alt={`${res.resource} logo`}
                                    width={48}
                                    height={48}
                                    className="object-contain w-10 h-10"
                                    unoptimized
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 truncate">{res.resource}</h3>
                            <p className="text-xs text-muted-foreground">
                                {res?.country ? `Available in ${res.country}` : "Available Worldwide"}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                        {/* Tags */}
                        {res.tags.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mb-3">
                                {res.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={tag === "NEW" ? "default_light" : "default"}
                                        className="text-xs h-5"
                                    >
                                        {tag === "NEW" && <Sparkles className="w-3 h-3 mr-1" />}
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-muted-foreground flex-1 line-clamp-3 mb-4">
                            {res.description}
                        </p>

                        {/* Category & Value */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Category</span>
                                <Badge variant="outline" className="capitalize">
                                    {res.category.replace("-", " ")}
                                </Badge>
                            </div>
                            {res.value && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Value</span>
                                    <Badge variant="default_light" className="font-medium">
                                        {res.value}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-muted/10">
                        <ButtonLink
                            href={res.href}
                            target="_blank"
                            size="sm"
                            className="w-full"
                            prefetch={false}
                        >
                            Claim Now
                            <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </ButtonLink>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
export function BenefitsGridHorizontal({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
    return (
        <div className="grid gap-3">
            {tabBenefits.map((res, i) => (
                <div
                    key={res.resource + i}
                    className="group rounded-xl border bg-card hover:border-primary/50 transition-all overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row">
                        {/* Left: Logo & Info */}
                        <div className="flex items-center gap-3 p-4 sm:w-64 border-b sm:border-b-0 sm:border-r bg-muted/20">
                            {res.logo.trim() !== "" && (
                                <div className="size-12 rounded-lg bg-background border flex items-center justify-center shrink-0">
                                    <Image src={res.logo} alt={res.resource} width={48} height={48} className="object-contain w-10 h-10" unoptimized />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-0.5 truncate">{res.resource}</h3>
                                <p className="text-xs text-muted-foreground truncate">{res.category.replace("-", " ")}</p>
                            </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="flex-1 p-4">
                            <div className="flex gap-1.5 mb-2">
                                {res.tags.map((tag) => (
                                    <Badge key={tag} variant={tag === "NEW" ? "default_light" : "default"} className="text-xs h-5">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{res.description}</p>
                        </div>

                        {/* Right: CTA */}
                        <div className="flex items-center gap-3 p-4 sm:w-48 border-t sm:border-t-0 sm:border-l">
                            {res.value && <Badge variant="default_light" className="text-xs whitespace-nowrap">{res.value}</Badge>}
                            <ButtonLink href={res.href} target="_blank" size="sm" className="flex-1 sm:flex-auto" prefetch={false}>
                                Claim
                                <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Variant 3: Minimal Card
export function BenefitsGridMinimal({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tabBenefits.map((res, i) => (
                <div key={res.resource + i} className="group rounded-lg border bg-card hover:border-primary/50 transition-all p-4">
                    <div className="flex items-start gap-3 mb-3">
                        {res.logo.trim() !== "" && (
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Image src={res.logo} alt={res.resource} width={40} height={40} className="object-contain w-8 h-8" unoptimized />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1 truncate">{res.resource}</h3>
                            {res.tags.length > 0 && (
                                <div className="flex gap-1">
                                    {res.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="default" className="text-[10px] h-4 px-1.5">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{res.description}</p>

                    <div className="flex items-center justify-between gap-2">
                        {res.value && <span className="text-xs font-medium text-primary">{res.value}</span>}
                        <ButtonLink href={res.href} target="_blank" size="sm" variant="ghost" className="text-xs h-7 ml-auto" prefetch={false}>
                            Claim <ExternalLink className="w-3 h-3 ml-1" />
                        </ButtonLink>
                    </div>
                </div>
            ))}
        </div>
    );
}