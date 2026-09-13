import AdUnit from "@/components/common/adsense";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Disclaimer",
  description:
    "Read the Terms of Service and Disclaimer for nith.eu.org. Learn about usage, disclaimers, limitations of liability, and user responsibilities.",
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By accessing or using the Site or App, you agree to be bound by these
        Terms, our <a href="/privacy-policy">Privacy Policy</a>, and any other
        guidelines we may post. If you do not agree, you must discontinue use
        immediately.
      </p>
    ),
  },
  {
    id: "unofficial",
    title: "2. Unofficial Platform",
    content: (
      <p>
        We expressly disclaim any official representation of NIT Hamirpur. All
        trademarks, logos, and institute names mentioned belong to their
        respective owners and are used solely for descriptive purposes.
      </p>
    ),
  },
  {
    id: "usage",
    title: "3. Use of Services",
    content: (
      <>
        <p>You agree to use our services lawfully. You must not:</p>
        <ul>
          <li>Misuse, hack, interfere with, or disrupt our infrastructure.</li>
          <li>Upload illegal, abusive, defamatory, or infringing content.</li>
          <li>Scrape data without express permission.</li>
        </ul>
        <p>
          You maintain responsibility for any content you submit to community
          sections.
        </p>
      </>
    ),
  },
  {
    id: "academic",
    title: "4. Academic Data & Privacy",
    content: (
      <p>
        Tools providing academic resources (syllabus, results) are for
        convenience only.{" "}
        <strong>We do not guarantee real-time accuracy.</strong> You are
        responsible for verifying critical academic data with official institute
        sources.
      </p>
    ),
  },
  {
    id: "accuracy",
    title: "5. No Guarantee of Accuracy",
    content: (
      <p>
        The service is provided &ldquo;as is.&rdquo; We disclaim all warranties
        regarding the completeness, reliability, or availability of the content.
        We are not liable for errors or omissions.
      </p>
    ),
  },
  {
    id: "ads",
    title: "6. Advertising & Affiliate Links",
    content: (
      <>
        <p>
          Our Site includes third-party advertising (e.g., Google AdSense) and
          affiliate links. We may earn commissions on clicks or purchases. We do
          not endorse products advertised by third parties.
        </p>
        <AdUnit adSlot="multiplex" key="terms-page-ad" />
      </>
    ),
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    content: (
      <p>
        To the fullest extent permitted by law, the operators of nith.eu.org
        shall not be liable for any direct, indirect, incidental, or
        consequential damages arising from your use of the platform.
      </p>
    ),
  },
  {
    id: "indemnification",
    title: "8. Indemnification",
    content: (
      <p>
        You agree to indemnify and hold harmless the platform operators and
        contributors from any claims arising out of your violation of these
        Terms.
      </p>
    ),
  },
  {
    id: "ip",
    title: "9. Intellectual Property",
    content: (
      <p>
        Original content created by us (code, designs, guides) is protected. You
        may not reproduce or distribute our proprietary content without
        permission.
      </p>
    ),
  },
  {
    id: "termination",
    title: "10. Service Changes & Termination",
    content: (
      <p>
        We reserve the right to modify, suspend, or discontinue the platform at
        any time without notice.
      </p>
    ),
  },
  {
    id: "law",
    title: "11. Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of India. Any disputes are subject
        to the jurisdiction of courts located in{" "}
        <strong>Himachal Pradesh, India</strong>.
      </p>
    ),
  },
  {
    id: "changes",
    title: "12. Changes to These Terms",
    content: (
      <p>
        Continued use of the Site after we post changes to these Terms
        constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "13. Contact",
    content: (
      <p>
        For legal inquiries:{" "}
        <a href="mailto:contact@nith.eu.org">contact@nith.eu.org</a>
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      accent="and disclaimer"
      lede="By accessing nith.eu.org or app.nith.eu.org, you agree to the following terms. Please read them carefully to understand your rights and responsibilities."
      updated="September 13, 2026"
      notice={
        <p>
          <strong>Unofficial Platform Disclaimer:</strong> This is a{" "}
          <strong>student-run project</strong>. We are NOT affiliated with,
          endorsed by, or representing the{" "}
          <strong>National Institute of Technology, Hamirpur</strong>. All
          academic data is for informational purposes only.
        </p>
      }
      sections={sections}
    >
      <p className="text-body text-muted-foreground leading-relaxed md:text-body-lg">
        <strong className="font-medium text-foreground">
          Final Disclaimer:
        </strong>{" "}
        Use of the Site is at your own risk. Always confirm official academic
        information with the institute.
      </p>
    </LegalPage>
  );
}
