import { BrandPanel } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { benefitsList, submitBenefitsLink } from "root/resources/benefits";
import { appConfig } from "~/project.config";
import { changeCase } from "~/utils/string";
import HeroSection from "./hero";
import BenefitsExplorer, { type Option, type Perk } from "./list";

const description =
  "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.";

export const metadata: Metadata = {
  title: "Student Benefits - Free Stuff for College Students",
  description,
  openGraph: { title: "Free Stuff for College Students", description },
  twitter: { title: "Free Stuff for College Students", description },
  keywords: [
    "free stuff for college students",
    "student discounts",
    "college benefits",
    "student resources",
    "free software for students",
    "educational discounts",
    "college scholarships",
    "student deals",
    "college grants",
    "financial aid for students",
    "student offers",
    "college freebies",
    "student savings",
    "academic discounts",
    "college student programs",
  ],
  alternates: {
    canonical: `${appConfig.url}/benefits`,
  },
};

const regionLabels: Record<string, string> = {
  worldwide: "Worldwide",
  india: "India",
  usa: "USA",
  uk: "United Kingdom",
};

const regionId = (country?: string) => {
  const c = (country ?? "worldwide").trim().toLowerCase();
  return c === "united kingdom" ? "uk" : c;
};

const perks: Perk[] = benefitsList.map((b, i) => {
  const region = regionId(b.country);
  // Imported UK entries use "Available in <country>" as the description and put the offer in `value`.
  const placeholder = /^available in /i.test(b.description.trim());
  return {
    key: `${b.id ?? "perk"}-${i}`,
    name: b.resource.trim(),
    logo: b.logo,
    value: placeholder ? undefined : b.value,
    description: placeholder ? (b.value ?? "") : b.description,
    href: b.href,
    category: b.category,
    region,
    regionLabel: regionLabels[region] ?? changeCase(region, "title"),
    tags: b.tags,
    isNew: b.isNew ?? false,
  };
});

const categories: Option[] = [
  { id: "all", label: "All perks" },
  ...[...new Set(perks.map((p) => p.category))].map((id) => ({
    id,
    label: changeCase(id, "title"),
  })),
];

const regions: Option[] = [
  { id: "all", label: "All regions" },
  ...[...new Set(perks.map((p) => p.region))].map((id) => ({
    id,
    label: regionLabels[id] ?? changeCase(id, "title"),
  })),
];

export default function BenefitsPage() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col gap-10 px-4 pb-12 md:px-6">
      <HeroSection total={perks.length} />
      <BenefitsExplorer
        perks={perks}
        categories={categories}
        regions={regions}
      />
      <BrandPanel
        title="Know a perk we missed?"
        body="Send it through the form and it can be added to this list for every student."
        actions={
          <ButtonLink
            variant="light"
            href={submitBenefitsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Submit a perk
            <ArrowUpRight aria-hidden="true" />
          </ButtonLink>
        }
      />
    </div>
  );
}
