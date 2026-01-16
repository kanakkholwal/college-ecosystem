import AdUnit from "@/components/common/adsense";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service & Disclaimer",
  description:
    "Read the Terms of Service and Disclaimer for nith.eu.org. Learn about usage, disclaimers, limitations of liability, and user responsibilities.",
  robots: { index: true, follow: true },
};

// --- Sticky Navigation ---
const TableOfContents = () => {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "unofficial", title: "2. Unofficial Platform" },
    { id: "usage", title: "3. Use of Services" },
    { id: "academic", title: "4. Academic Data" },
    { id: "accuracy", title: "5. No Accuracy Guarantee" },
    { id: "ads", title: "6. Ads & Affiliates" },
    { id: "liability", title: "7. Limitation of Liability" },
    { id: "indemnification", title: "8. Indemnification" },
    { id: "ip", title: "9. Intellectual Property" },
    { id: "termination", title: "10. Termination" },
    { id: "law", title: "11. Governing Law" },
    { id: "changes", title: "12. Changes to Terms" },
    { id: "contact", title: "13. Contact" },
  ];

  return (
    <nav className="hidden lg:block sticky top-24 h-fit w-64 pr-8">
      <h4 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
        Clauses
      </h4>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ul className="space-y-2 border-l border-border/40 ml-1">
          {sections.map((item) => (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className="block border-l-2 border-transparent pl-4 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-all line-clamp-1"
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

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="container relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-20">
        
        {/* --- Header --- */}
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="rounded-full py-1 border-primary/20 bg-primary/5 text-primary">
              <Scale className="mr-1.5 size-3" />
              Legal Agreements
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last updated: <LastUpdated />
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By accessing <strong>nith.eu.org</strong> or <strong>app.nith.eu.org</strong>, 
            you agree to the following terms. Please read them carefully to understand 
            your rights and responsibilities.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="shrink-0">
             <TableOfContents />
          </div>

          {/* Content */}
          <article className="flex-1 prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            
            {/* Critical Disclaimer Block */}
            <div className="not-prose bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-12">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                     <AlertTriangle className="size-5" />
                  </div>
                  <div>
                     <h3 className="text-base font-semibold text-foreground mb-1">Unofficial Platform Disclaimer</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        This is a <strong>student-run project</strong>. We are NOT affiliated with, endorsed by, or representing the <strong>National Institute of Technology, Hamirpur</strong>. All academic data is for informational purposes only.
                     </p>
                  </div>
               </div>
            </div>

            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Site or App, you agree to be bound by these
                Terms, our Privacy Policy, and any other guidelines we may post. 
                If you do not agree, you must discontinue use immediately.
              </p>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="unofficial">
              <h2>2. Unofficial Platform</h2>
              <p>
                We expressly disclaim any official representation of NIT Hamirpur. 
                All trademarks, logos, and institute names mentioned belong to their 
                respective owners and are used solely for descriptive purposes.
              </p>
            </section>

            <section id="usage">
              <h2>3. Use of Services</h2>
              <p>You agree to use our services lawfully. You must not:</p>
              <ul>
                <li>Misuse, hack, interfere with, or disrupt our infrastructure.</li>
                <li>Upload illegal, abusive, defamatory, or infringing content.</li>
                <li>Scrape data without express permission.</li>
              </ul>
              <p>You maintain responsibility for any content you submit to community sections.</p>
            </section>

            <section id="academic">
               <h2>4. Academic Data & Privacy</h2>
               <p>
                 Tools providing academic resources (syllabus, results) are for convenience only.
                 <strong> We do not guarantee real-time accuracy.</strong> You are responsible 
                 for verifying critical academic data with official institute sources.
               </p>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="accuracy">
               <h2>5. No Guarantee of Accuracy</h2>
               <p>
                 The service is provided &ldquo;as is.&rdquo; We disclaim all warranties regarding 
                 the completeness, reliability, or availability of the content. We are not liable 
                 for errors or omissions.
               </p>
            </section>

            <section id="ads">
               <h2>6. Advertising & Affiliate Links</h2>
               <p>
                 Our Site includes third-party advertising (e.g., Google AdSense) and affiliate links. 
                 We may earn commissions on clicks or purchases. We do not endorse products advertised 
                 by third parties.
               </p>
               <div className="not-prose my-6">
                 <AdUnit adSlot="multiplex" />
               </div>
            </section>

            <section id="liability">
               <h2>7. Limitation of Liability</h2>
               <p>
                 To the fullest extent permitted by law, the operators of nith.eu.org shall not be 
                 liable for any direct, indirect, incidental, or consequential damages arising 
                 from your use of the platform.
               </p>
            </section>

            <section id="indemnification">
               <h2>8. Indemnification</h2>
               <p>
                 You agree to indemnify and hold harmless the platform operators and contributors 
                 from any claims arising out of your violation of these Terms.
               </p>
            </section>

            <Separator className="my-8 opacity-50" />

            <section id="ip">
               <h2>9. Intellectual Property</h2>
               <p>
                 Original content created by us (code, designs, guides) is protected. 
                 You may not reproduce or distribute our proprietary content without permission.
               </p>
            </section>

            <section id="termination">
               <h2>10. Service Changes & Termination</h2>
               <p>
                 We reserve the right to modify, suspend, or discontinue the platform at any time 
                 without notice.
               </p>
            </section>

            <section id="law">
               <h2>11. Governing Law</h2>
               <p>
                 These Terms are governed by the laws of India. Any disputes are subject to the 
                 jurisdiction of courts located in <strong>Himachal Pradesh, India</strong>.
               </p>
            </section>

            <section id="changes">
               <h2>12. Changes to These Terms</h2>
               <p>
                 Continued use of the Site after we post changes to these Terms constitutes 
                 acceptance of the revised Terms.
               </p>
            </section>

            <section id="contact">
               <h2>13. Contact</h2>
               <p>
                 For legal inquiries: <a href="mailto:contact@nith.eu.org">contact@nith.eu.org</a>
               </p>
            </section>

            <div className="mt-12 not-prose border-t border-border pt-8">
               <p className="text-sm text-muted-foreground italic">
                 <strong>Final Disclaimer:</strong> Use of the Site is at your own risk. 
                 Always confirm official academic information with the institute.
               </p>
            </div>

          </article>
        </div>
      </main>
    </div>
  );
}