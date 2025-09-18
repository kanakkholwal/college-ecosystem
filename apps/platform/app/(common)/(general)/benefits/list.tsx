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
import { SearchX } from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { LuShare2 } from "react-icons/lu";
import { benefitsCategories, benefitsList, benefitsRegions, submitBenefitsLink } from "root/resources/benefits";
import { appConfig } from "~/project.config";
import { changeCase, marketwiseLink } from "~/utils/string";
export default function FreeStuffTable() {
    const [query, setQuery] = useQueryState("q", { defaultValue: "" });
    const [region, setRegion] = useQueryState("region", { defaultValue: "" });

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
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    Free Stuff for College Builders
                </h1>
                <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                    Discover curated resources, exclusive credits, and perks to supercharge your student journey.
                </p>
            </motion.div>

            <div className="max-w-7xl mx-auto">
                <div className="w-full flex flex-wrap sm:flex-row sm:flex-nowrap items-center gap-4 mb-8">
                    <div className="relative flex-auto w-full">
                        <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search benefits..."
                            className="pl-10"
                        />
                    </div>
                    <Select value={region} onValueChange={(value) => setRegion(value)}>
                        <SelectTrigger className="max-w-[15rem] capitalize">
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            {benefitsRegions.map((region) => (
                                <SelectItem key={region} value={region} className="capitalize">
                                    {region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ShareButton
                        variant="dark"
                        // size="sm" 
                        data={{
                            title: "Free Stuff for College Students",
                            text: "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
                            url: appConfig.url + "/benefits",
                        }}
                        className="rounded-xl shadow-sm"
                        shareCurrentUrl={true}
                    >
                        <LuShare2 />
                        Share
                    </ShareButton>

                </div>
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

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                >
                                    {tabBenefits.map((res, i) => (
                                        <motion.div
                                            key={res.resource + i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * i }}
                                            className="rounded-xl border bg-card shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col"
                                        >
                                            <div className="flex items-center gap-3 p-4 border-b">
                                                {res.logo.trim() !== "" && (<Image
                                                    src={res.logo}
                                                    alt={`${res.resource} logo`}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-md object-contain h-10 w-auto max-w-16"
                                                    unoptimized
                                                />)}
                                                <div>
                                                    <h3 className="font-semibold">{res.resource}</h3>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {res?.country
                                                            ? `Available in ${res.country}`
                                                            : "Available Worldwide"}
                                                    </p>

                                                </div>
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between mb-3">

                                                    <div className="flex gap-1 flex-wrap">
                                                        {res.tags.map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                className={
                                                                    tag === "NEW"
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "bg-muted text-muted-foreground"
                                                                }
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground flex-1">{res.description}</p>
                                                <div className="mt-5 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground tracking-wide uppercase">
                                                        Category
                                                    </span>
                                                    <Badge variant="default_light" className="capitalize">
                                                        {res.category.replace("-", " ")}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="p-4 border-t mt-auto flex items-center justify-between gap-4 flex-wrap">
                                                <Badge variant="default_light">{res.value || "Not described"}</Badge>
                                                <ButtonLink href={marketwiseLink(res.href, {
                                                    utm_medium: "app",
                                                    utm_campaign: "benefits_page",
                                                })} target="_blank" size="sm"
                                                    variant="dark"
                                                    prefetch={false}
                                                    onClickCapture={() => { sendGAEvent("event", "benefit_click_claimed", { resource: res.resource, category: res.category, tags: res.tags, }); }} >
                                                    <Icon name="command" />
                                                    Claim Now
                                                    <Icon name="arrow-up-right" />
                                                </ButtonLink>

                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

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
