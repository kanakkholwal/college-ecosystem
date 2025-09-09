"use client";

import AdUnit from "@/components/common/adsense";
import ShareButton from "@/components/common/share-button";
import { Icon } from "@/components/icons";
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
                                                        <ButtonLink
                                                            href={marketwiseLink(res.href, "benefits")}
                                                            target="_blank"
                                                            size="sm"
                                                            variant="dark"
                                                        >
                                                            Apply Now
                                                            <Icon name="arrow-up-right" />
                                                        </ButtonLink>
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
                <ButtonLink href={"https://forms.gle/aA8NzH31ByUommCg7"} target="_blank" variant="rainbow" size="lg">
                    <Sparkles />
                    Submit a Resource
                    <Icon name="arrow-up-right" />
                </ButtonLink>
            </div>

        </div>
    );
}
