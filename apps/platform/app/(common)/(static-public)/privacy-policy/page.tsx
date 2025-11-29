import AdUnit from "@/components/common/adsense";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How nith.eu.org and app.nith.eu.org collect, use, and protect your data, including cookies, analytics, ads, and user-submitted information.",
  robots: { index: true, follow: true },
};

// --- Helper for the sticky sidebar ---
const TableOfContents = () => {
  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "collection", title: "Information We Collect" },
    { id: "usage", title: "How We Use Information" },
    { id: "cookies", title: "Cookies & Ads" },
    { id: "analytics", title: "Analytics & Affiliates" },
    { id: "rights", title: "Your Rights" },
    { id: "security", title: "Security & Retention" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <nav className="hidden lg:block sticky top-24 h-fit w-64 pr-8">
      <h4 className="mb-4 text-sm font-semibold tracking-tight">On this page</h4>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ul className="space-y-2 border-l border-border/40 ml-1">
          {sections.map((item) => (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className="block border-l-2 border-transparent pl-4 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-all"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
};

const LastUpdated = () => {
  const d = new Date();
  const dateString = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return <span className="font-mono text-xs">{dateString}</span>;
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="container relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-20">
        
        {/* --- Header --- */}
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="rounded-full py-1 border-primary/20 bg-primary/5 text-primary">
              <ShieldCheck className="mr-1.5 size-3" />
              Legal Documentation
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last updated: <LastUpdated />
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transparency is core to our ecosystem. This document explains how 
            <strong> nith.eu.org</strong> and <strong>app.nith.eu.org</strong> collect, use, 
            and safeguard your data when you use our platform.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar (Desktop) */}
          <div className="shrink-0">
             <TableOfContents />
          </div>

          {/* Main Content */}
          <article className="flex-1 prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            
            <section id="intro">
              <h2>Who We Are</h2>
              <p>
                We are a student-run platform providing resources and tools for the
                NIT Hamirpur community. We are not officially affiliated with NIT
                Hamirpur. Contact us at{" "}
                <a href="mailto:contact@nith.eu.org">contact@nith.eu.org</a>.
              </p>

              <h3>Scope</h3>
              <p>
                This Policy covers all properties we operate, including{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">nith.eu.org</code> and{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">app.nith.eu.org</code>, and any related
                pages, tools, or APIs that link to this Policy.
              </p>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="collection">
              <h2>Information We Collect</h2>
              <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <InfoCard title="Usage & Device Data">
                  IP address, location (city/region), device type, pages viewed, and timestamps.
                </InfoCard>
                <InfoCard title="Cookies">
                   Identifiers to remember preferences, session state, measure traffic, and serve ads.
                </InfoCard>
                <InfoCard title="Account Data">
                   Name, email, roll number (if provided), community posts, and uploaded files.
                </InfoCard>
                <InfoCard title="Security Signals">
                   Logs and events used to detect fraud, abuse, or system outages.
                </InfoCard>
              </div>
            </section>

            <section id="usage" className="mt-8">
              <h2>How We Use Information</h2>
              <ul>
                <li>Operate, maintain, and improve the Site and App.</li>
                <li>Provide features (e.g., results lookup, resources, communities).</li>
                <li>Personalize content and remember settings.</li>
                <li>Measure performance and analyze product usage.</li>
                <li>Detect, prevent, and respond to security incidents or abuse.</li>
                <li>Comply with legal obligations.</li>
                <li>Monetize via advertising and/or affiliate links (where enabled).</li>
              </ul>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="cookies">
              <h2>Cookies & Online Advertising</h2>
              <p>
                We use first-party and third-party cookies, pixels, and local storage
                for functionality, analytics, and advertising.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-xl border border-border/50 not-prose my-6">
                  <h3 className="text-lg font-semibold mb-2">Google AdSense</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>
                        Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.
                    </li>
                    <li>
                        Google’s advertising cookies enable it and its partners to serve ads to you based on your visits to our sites and/or other sites on the Internet.
                    </li>
                    <li>
                        You can opt out of personalized advertising from Google via{" "}
                        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Ads Settings
                        </a>.
                    </li>
                    <li>
                         For broader industry opt-out choices, visit{" "}
                        <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        aboutads.info/choices
                        </a>.
                    </li>
                  </ul>
              </div>

              <div className="my-8 not-prose">
                 <AdUnit adSlot="multiplex" key={"privacy-policy-page-ad"} />
              </div>
            </section>

            <section id="analytics">
              <h2>Analytics & Affiliates</h2>
              <h3>Analytics</h3>
              <p>
                We may use privacy-respecting analytics and/or mainstream tools to
                understand traffic and usage. These may set cookies or collect
                pseudonymous identifiers and event data. Where feasible, we minimize
                or aggregate metrics.
              </p>

              <h3>Affiliate Links</h3>
              <p>
                Some outbound links may be affiliate links. If you click an affiliate
                link and make a purchase, we may earn a commission at no extra cost to
                you.
              </p>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="rights">
               <h2>Legal Bases & Rights</h2>
               <p>
                 If you are in the EEA/UK, we process data based on <strong>Contract</strong> (to provide services), <strong>Legitimate Interests</strong> (security/improvement), <strong>Consent</strong> (ads/cookies), and <strong>Legal Obligation</strong>.
               </p>
               <h3>Your Choices</h3>
               <ul>
                 <li><strong>Cookie controls:</strong> Manage via browser settings or opt-out links.</li>
                 <li><strong>Access/Delete:</strong> Request a copy or deletion of your data (subject to legal exceptions).</li>
                 <li><strong>Withdraw Consent:</strong> You can withdraw previously given consent at any time.</li>
               </ul>
            </section>

            <section id="security">
               <h2>Data Handling</h2>
               <p>
                 We share data with service providers (hosting, analytics), ad partners, and for legal compliance. 
                 We retain data only as long as necessary. While we use reasonable security measures, no online transmission is 100% secure.
               </p>
               <h3>International Transfers</h3>
               <p>
                 We may process and store information in countries other than yours. We use lawful transfer mechanisms as required.
               </p>
            </section>
            
            <Separator className="my-8 opacity-50" />

            <section id="contact">
               <h2>Contact & Updates</h2>
               <p>
                 We may update this Policy periodically. Material changes will be communicated.
               </p>
               <div className="not-prose mt-6 flex flex-col gap-2">
                 <p className="text-sm font-medium">Questions?</p>
                 <a 
                   href="mailto:contact@nith.eu.org" 
                   className="inline-flex items-center justify-center w-fit px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-transform hover:scale-105"
                 >
                   Email contact@nith.eu.org
                 </a>
               </div>
            </section>

            <div className="mt-12 p-4 bg-muted/50 border-l-4 border-amber-500 rounded-r-md not-prose">
               <p className="text-sm text-muted-foreground italic">
                 <strong>Disclaimer:</strong> This platform is unofficial and not affiliated with the
                 National Institute of Technology, Hamirpur. Names or marks remain
                 the property of their respective owners.
               </p>
            </div>

            <div className="mt-8 not-prose">
               <AdUnit adSlot="multiplex" key={"privacy-policy-page-ad-footer"} />
            </div>

          </article>
        </div>
      </main>
    </div>
  );
}

// --- Component for Grid Items ---
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-border/50 bg-card p-4">
            <h4 className="font-semibold text-sm mb-2 text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {children}
            </p>
        </div>
    )
}