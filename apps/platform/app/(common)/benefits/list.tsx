"use client";

import AdUnit from "@/components/common/adsense";
import ShareButton from "@/components/common/share-button";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { sendGAEvent } from "@next/third-parties/google";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { LuShare2 } from "react-icons/lu";
import { benefitsCategories, benefitsList } from "root/resources/benefits";
import { appConfig } from "~/project.config";
import { changeCase, marketwiseLink } from "~/utils/string";





export default function FreeStuffTable() {
    return (
        <div className="p-8 max-w-6xl mx-auto" id="benefits">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-semibold mb-8"
            >
                Free Stuff for College Builders
            </motion.h1>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <TabsList>
                        {benefitsCategories.map((cat) => (
                            <TabsTrigger key={cat} value={cat}>
                                {changeCase(cat, "title")}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ShareButton
                        variant="dark"
                        size="sm"
                        data={{
                            title: "Free Stuff for College Students",
                            text: "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
                            url: appConfig.url + "/benefits",
                        }}
                    >
                        <LuShare2 />
                        Share with Friends
                    </ShareButton>
                </div>

                {benefitsCategories.map((cat) => (
                    <TabsContent key={cat} value={cat}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-background"
                            id={`benefits-${cat}`}
                        >
                            <div className="relative w-full overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Resource</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Tags</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {benefitsList
                                            .filter((r) => {
                                                if (cat === "all") return true;
                                                return r.category === cat;
                                            })
                                            .map((res, i) => (
                                                <motion.tr
                                                    key={res.resource}
                                                    id={res.resource}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * i }}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Image
                                                                src={res.logo}
                                                                alt={`${res.resource} logo`}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-md object-contain size-10"
                                                            />
                                                            <span className="font-medium hover:underline text-left whitespace-nowrap">
                                                                {res.resource}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{res.value || "-"}</TableCell>
                                                    <TableCell className="whitespace-nowrap flex gap-2 flex-wrap">
                                                        {res.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className={`px-2 py-1 rounded-md text-xs ${tag === "NEW"
                                                                    ? "bg-yellow-200 text-yellow-800"
                                                                    : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell className="max-w-md whitespace-pre-wrap">
                                                        {res.description}
                                                    </TableCell>
                                                    <TableCell>

                                                        <ResponsiveDialog
                                                        showCloseButton={false}
                                                            btnProps={{
                                                                variant: "dark",
                                                                size: "sm",
                                                                onClick: () => {
                                                                    sendGAEvent("event", "benefit_click_claim", {
                                                                        resource: res.resource,
                                                                        category: res.category,
                                                                        tags: res.tags,
                                                                    });
                                                                },
                                                                children: <>
                                                                    <Icon name="command" />
                                                                    {res.category === "fellowships" ? "Apply" : "Claim"} Now
                                                                </>
                                                            }}
                                                            title={`Apply for ${res.resource}`}
                                                            description={`You are about to apply for ${res.resource}. Click the button below to proceed.`}
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="w-14 h-14 rounded-lg">
                                                                        <AvatarImage src={res.logo} alt={res.resource} />
                                                                        <AvatarFallback>{res.resource[0]}</AvatarFallback>
                                                                    </Avatar>

                                                                    <div>
                                                                        <h4 className="flex items-center gap-3 text-lg font-semibold">
                                                                            {res.resource}
                                                                            <span className="ml-2 inline-flex items-center gap-2">
                                                                                <Badge variant="default_light">{res.value}</Badge>
                                                                                {res.isNew && (
                                                                                    <Badge variant="ghost" className="ml-1 text-xs font-medium uppercase text-emerald-600">
                                                                                        New
                                                                                    </Badge>
                                                                                )}
                                                                            </span>
                                                                        </h4>


                                                                        <p className="text-sm text-muted-foreground">
                                                                            {res.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 my-2">
                                                                {res.tags.map((t) => (
                                                                    <Badge
                                                                        size="sm"
                                                                        key={t}
                                                                        className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium"
                                                                    >
                                                                        {t}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="rounded-lg border p-4 bg-gradient-to-b from-white/60 to-transparent">
                                                                <p className="text-sm leading-relaxed">This free credit is delivered {res.description}. Use the link above to claim. Terms apply.</p>


                                                                <div className="mt-4 flex items-center justify-between">
                                                                    <div className="text-xs text-muted-foreground">Category</div>
                                                                    <div className="text-sm font-medium capitalize">{res.category.replace("-", " ")}</div>
                                                                </div>
                                                            </div>
                                                            <ButtonLink
                                                                href={marketwiseLink(res.href, "benefits")}
                                                                target="_blank"
                                                                size="sm"
                                                                width="full"
                                                                onClickCapture={() => {
                                                                    sendGAEvent("event", "benefit_click_claimed", {
                                                                        resource: res.resource,
                                                                        category: res.category,
                                                                        tags: res.tags,
                                                                    });
                                                                }}
                                                            >
                                                                Claim Now
                                                                <Icon name="arrow-up-right" />
                                                            </ButtonLink>
                                                        </ResponsiveDialog>

                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </motion.div>
                    </TabsContent>
                ))}
            </Tabs>
            <AdUnit adSlot="display-horizontal" key="benefits-page-ad" />
            <div className=" p-4 flex items-center justify-center flex-col gap-3 mt-10">
                <p className="text-muted-foreground mr-4 text-sm">
                    Have a resource to share?
                </p>
                <ButtonLink href={"https://forms.gle/aA8NzH31ByUommCg7"} target="_blank" variant="rainbow" size="lg" onClick={() => {
                    sendGAEvent("event",
                        "benefit_submit_click", {
                        location: "benefits_page",
                    }
                    );
                }}>
                    <Sparkles />
                    Submit a Resource
                    <Icon name="arrow-up-right" />
                </ButtonLink>
            </div>

        </div>
    );
}
