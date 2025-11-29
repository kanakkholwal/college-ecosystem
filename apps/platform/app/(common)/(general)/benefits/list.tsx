"use client";

import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import ShareButton from "@/components/common/share-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { motion } from "framer-motion";
import {
    ExternalLink,
    Globe,
    LayoutGrid,
    List,
    Maximize2,
    Search,
    SearchX,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { LuShare2 } from "react-icons/lu";
import {
    benefitsCategories,
    benefitsItem,
    benefitsList,
    submitBenefitsLink,
} from "root/resources/benefits";
import { appConfig } from "~/project.config";
import { changeCase } from "~/utils/string";

export default function FreeStuffTable() {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [region, setRegion] = useQueryState("region", { defaultValue: "all" });
  const [viewMode, setViewMode] = useQueryState("view", { defaultValue: "grid" });

  const filteredBenefits = useMemo(() => {
    return benefitsList.filter((benefit) => {
      const q = query.toLowerCase();
      const matchesQuery = query
        ? benefit.resource.toLowerCase().includes(q) ||
          benefit.description.toLowerCase().includes(q) ||
          benefit.tags.some((tag) => tag.toLowerCase().includes(q))
        : true;

      const r = region.toLowerCase();
      const matchesRegion =
        r === "all" ||
        r === "worldwide" ||
        r === "global" ||
        r.trim() === "" ||
        !benefit.country
          ? true
          : benefit.country.toLowerCase() === r;

      return matchesQuery && matchesRegion;
    });
  }, [query, region]);

  return (
    <div className="min-h-screen pb-20" id="benefits">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        
        {/* --- 1. HERO & SEARCH --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Student <span className="text-primary">Perks</span> Directory
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated collection of free software, tools, and discounts available for university students.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card border rounded-2xl p-2 shadow-lg shadow-black/5">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="search"
                  placeholder="Search tools (e.g. GitHub, Notion)..."
                  className="pl-10 h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Dividers & Filters (Desktop) */}
              <div className="hidden md:block w-px bg-border my-2" />

              <div className="flex gap-2 p-1 md:p-0">
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-10 md:h-12 border-0 shadow-none w-full md:w-[140px] focus:ring-0">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="size-4" />
                        <span className="truncate">{region === 'all' ? 'Region' : region}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="worldwide">Worldwide</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="h-10 md:h-12 border-0 shadow-none w-[100px] focus:ring-0">
                     <div className="flex items-center gap-2 text-muted-foreground">
                        {viewMode === 'grid' && <LayoutGrid className="size-4" />}
                        {viewMode === 'horizontal' && <List className="size-4" />}
                        {viewMode === 'minimal' && <Maximize2 className="size-4" />}
                        <span className="capitalize">{viewMode}</span>
                     </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="horizontal">List</SelectItem>
                    <SelectItem value="minimal">Compact</SelectItem>
                  </SelectContent>
                </Select>
                
                <ShareButton 
                    className="h-10 md:h-12 w-10 md:w-12 rounded-lg shrink-0"
                    variant="dark"
                    data={{
                        title: "Student Perks Directory",
                        text: "Check out this list of free stuff for students!",
                        url: appConfig.url + "/benefits",
                    }}
                >
                    <LuShare2 className="size-4" />
                </ShareButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- 2. CATEGORY TABS --- */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8 overflow-x-auto pb-2 no-scrollbar">
             <TabsList className="p-1 h-auto flex-wrap bg-transparent md:bg-muted">
                {benefitsCategories.map((cat) => (
                    <TabsTrigger 
                        key={cat} 
                        value={cat}
                        className="px-4 py-2 rounded-full text-sm transition-all"
                    >
                        {changeCase(cat, "title")}
                    </TabsTrigger>
                ))}
             </TabsList>
          </div>

          {benefitsCategories.map((cat, index) => {
             const tabBenefits = filteredBenefits.filter((b) => cat === 'all' || b.category === cat);
             
             return (
                <TabsContent key={cat} value={cat} className="mt-0">
                    {tabBenefits.length === 0 ? (
                        <div className="py-20 text-center">
                            <EmptyArea
                                icons={[SearchX]}
                                title="No benefits found"
                                description="Try adjusting your search filters."
                            />
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Render Correct View */}
                            {viewMode === 'grid' && <BenefitsGrid tabBenefits={tabBenefits} />}
                            {viewMode === 'horizontal' && <BenefitsGridHorizontal tabBenefits={tabBenefits} />}
                            {viewMode === 'minimal' && <BenefitsGridMinimal tabBenefits={tabBenefits} />}
                            
                            {/* In-feed Ad (only for 'all' tab or specific indices) */}
                            {(cat === 'all' && index % 2 === 0) && (
                                <AdUnit adSlot="display-horizontal" />
                            )}
                        </div>
                    )}
                </TabsContent>
             )
          })}
        </Tabs>

        {/* --- 3. CTA FOOTER --- */}
        <div className="mt-20 text-center bg-muted/30 border border-border/50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-3">Know a resource we missed?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Help the community grow by submitting new student benefits. We review all submissions within 24 hours.
            </p>
            <ButtonLink
                href={submitBenefitsLink}
                target="_blank"
                variant="default"
                size="lg"
                className="rounded-full px-8 shadow-lg shadow-primary/20"
            >
                <Sparkles className="mr-2 size-4" /> Submit Resource
            </ButtonLink>
        </div>

      </div>
    </div>
  );
}

// --- VIEW COMPONENT 1: GRID (Standard) ---
export function BenefitsGrid({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tabBenefits.map((res, i) => (
        <motion.div
          key={res.resource + i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group flex flex-col rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          {/* Header */}
          <div className="p-5 flex items-start justify-between border-b border-border/40 bg-muted/20">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-background border flex items-center justify-center shrink-0 p-1.5">
                    {res.logo ? (
                        <Image src={res.logo} alt={res.resource} width={40} height={40} className="object-contain" unoptimized />
                    ) : (
                        <Sparkles className="size-5 text-muted-foreground/50" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-foreground leading-tight">{res.resource}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{res.category}</p>
                </div>
             </div>
             {res.isNew && (
                 <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                    NEW
                 </Badge>
             )}
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col">
             <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                {res.description}
             </p>
             
             <div className="mt-auto flex flex-wrap gap-2">
                {res.value && (
                    <Badge variant="secondary" className="font-medium bg-primary/5 text-primary border-primary/10">
                        {res.value} Value
                    </Badge>
                )}
                {res.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground font-normal">
                        {tag}
                    </Badge>
                ))}
             </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 pt-0">
             <ButtonLink 
                href={res.href} 
                target="_blank" 
                variant="outline" 
                className="w-full justify-between group-hover:border-primary/50 group-hover:text-primary transition-colors"
             >
                Get Offer <ExternalLink className="size-3.5 opacity-50 group-hover:opacity-100" />
             </ButtonLink>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- VIEW COMPONENT 2: HORIZONTAL (List) ---
export function BenefitsGridHorizontal({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
  return (
    <div className="flex flex-col gap-3">
        {tabBenefits.map((res, i) => (
            <motion.div 
                key={res.resource + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
            >
                {/* Logo */}
                <div className="size-12 rounded-lg bg-muted/30 border flex items-center justify-center shrink-0 p-2">
                    {res.logo && <Image src={res.logo} alt={res.resource} width={40} height={40} className="object-contain" unoptimized />}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h3 className="font-semibold">{res.resource}</h3>
                        {res.value && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{res.value}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{res.description}</p>
                </div>

                {/* Tags (Desktop) */}
                <div className="hidden md:flex gap-2">
                    {res.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground">{tag}</Badge>
                    ))}
                </div>

                {/* Action */}
                <ButtonLink href={res.href} target="_blank" size="sm" variant="ghost" className="shrink-0">
                    Visit <ExternalLink className="ml-2 size-3" />
                </ButtonLink>
            </motion.div>
        ))}
    </div>
  )
}

// --- VIEW COMPONENT 3: MINIMAL (Compact) ---
export function BenefitsGridMinimal({ tabBenefits }: { tabBenefits: benefitsItem[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabBenefits.map((res, i) => (
                <a 
                    key={res.resource + i}
                    href={res.href}
                    target="_blank"
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all"
                >
                    <div className="size-8 rounded bg-background border flex items-center justify-center shrink-0 p-1">
                        {res.logo && <Image src={res.logo} alt={res.resource} width={32} height={32} className="object-contain" unoptimized />}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{res.resource}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{res.category}</p>
                    </div>
                </a>
            ))}
        </div>
    )
}