import { RailRow } from "@/components/site/rail";
import { PageHero } from "@/components/site/sections";
import type React from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type LegalPageProps = {
  /** Replaces the default "Last updated" chip. */
  badge?: React.ReactNode;
  title: string;
  accent?: string;
  lede?: string;
  updated: string;
  /** Callout rendered above the first section. */
  notice?: React.ReactNode;
  sections: LegalSection[];
  /** Rendered after the last section (closing disclaimer, ads). */
  children?: React.ReactNode;
};

const prose =
  "flex flex-col gap-4 text-body text-muted-foreground leading-relaxed md:text-body-lg [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-medium [&_strong]:text-foreground [&_h3]:pt-2 [&_h3]:text-body-lg [&_h3]:font-medium [&_h3]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_li]:marker:text-primary";

export function LegalPage({
  badge,
  title,
  accent,
  lede,
  updated,
  notice,
  sections,
  children,
}: LegalPageProps) {
  return (
    <>
      <RailRow divider={false} label="Introduction">
        <PageHero
          badge={
            badge ?? (
              <>
                <span className="text-primary">Last updated</span> {updated}
              </>
            )
          }
          title={title}
          accent={accent}
          lede={lede}
        />
      </RailRow>

      <RailRow label={title}>
        <div className="flex flex-col gap-10 px-1 py-6 sm:px-4 sm:py-8 lg:flex-row lg:gap-20 lg:px-16 lg:py-10">
          <aside className="shrink-0 lg:w-64">
            <nav aria-label="On this page" className="lg:sticky lg:top-24">
              <p className="mb-3 text-caption font-semibold text-foreground">
                On this page
              </p>
              <ul className="flex flex-col gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-body text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl flex-1">
            {notice && (
              <div className="panel-card mb-10 p-6">
                <div className={prose}>{notice}</div>
              </div>
            )}
            <div className="flex flex-col divide-y divide-border">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-24 py-10 first:pt-0"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="mb-4 text-balance text-subheading font-medium text-foreground"
                  >
                    {section.title}
                  </h2>
                  <div className={prose}>{section.content}</div>
                </section>
              ))}
            </div>
            {children && (
              <div className="flex flex-col gap-8 border-t border-border pt-10">
                {children}
              </div>
            )}
          </article>
        </div>
      </RailRow>
    </>
  );
}
