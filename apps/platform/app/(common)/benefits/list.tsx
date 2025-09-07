"use client";

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
import { benefitsCategories, benefitsList } from "root/resources/benefits";
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
                <TabsList className="mb-6">
                    {benefitsCategories.map((cat) => (
                        <TabsTrigger key={cat} value={cat}>
                            {changeCase(cat, "title")}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {benefitsCategories.map((cat) => (
                    <TabsContent key={cat} value={cat}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-background"
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
                                                            <button className="font-medium hover:underline text-left">
                                                                {res.resource}
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{res.value || "-"}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2 flex-wrap">
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
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-md">
                                                        {res.description}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ButtonLink
                                                        href={marketwiseLink(res.href, "benefits")}
                                                        target="_blank"
                                                            size="sm"
                                                            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                                        >
                                                            Apply Now
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
