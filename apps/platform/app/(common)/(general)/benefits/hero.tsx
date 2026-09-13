import ShareButton from "@/components/common/share-button";
import { PerksBox } from "@/components/illustrations/perks-box";
import { PageHero } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowDown, Share2 } from "lucide-react";
import { appConfig } from "~/project.config";

export default function HeroSection({ total }: { total: number }) {
  return (
    <PageHero
      className="pt-10 sm:pt-16"
      badge={
        <>
          <span className="text-primary">{total} perks</span> in one list
        </>
      }
      title="Free stuff and discounts"
      accent="for college students"
      lede="Tools, software credits, student discounts and fellowships in one place. Each provider sets its own eligibility, often a student ID or a college email."
      actions={
        <>
          <ButtonLink variant="primary" href="#benefits">
            Browse perks
            <ArrowDown aria-hidden="true" />
          </ButtonLink>
          <ShareButton
            variant="outline"
            data={{
              title: "Student Perks Directory",
              text: "Check out this list of free stuff for students!",
              url: `${appConfig.url}/benefits`,
            }}
          >
            <Share2 aria-hidden="true" />
            Share
          </ShareButton>
        </>
      }
      aside={
        <div className="flex items-center justify-center">
          <PerksBox className="max-h-80 max-w-72" />
        </div>
      }
    />
  );
}
