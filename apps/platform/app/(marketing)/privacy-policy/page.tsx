import AdUnit from "@/components/common/adsense";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How nith.eu.org and app.nith.eu.org collect, use, and protect your data, including cookies, analytics, ads, and user-submitted information.",
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    id: "intro",
    title: "Who We Are",
    content: (
      <>
        <p>
          We are a student-run platform providing resources and tools for the
          NIT Hamirpur community. We are not officially affiliated with NIT
          Hamirpur. Contact us at{" "}
          <a href="mailto:contact@nith.eu.org">contact@nith.eu.org</a>.
        </p>
        <h3>Scope</h3>
        <p>
          This Policy covers all properties we operate, including{" "}
          <code className="font-mono text-foreground">nith.eu.org</code> and{" "}
          <code className="font-mono text-foreground">app.nith.eu.org</code>,
          and any related pages, tools, or APIs that link to this Policy.
        </p>
      </>
    ),
  },
  {
    id: "collection",
    title: "Information We Collect",
    content: (
      <ul>
        <li>
          <strong>Usage & Device Data:</strong> IP address, location
          (city/region), device type, pages viewed, and timestamps.
        </li>
        <li>
          <strong>Cookies:</strong> Identifiers to remember preferences, session
          state, measure traffic, and serve ads.
        </li>
        <li>
          <strong>Account Data:</strong> Name, email, roll number (if provided),
          community posts, and uploaded files.
        </li>
        <li>
          <strong>Security Signals:</strong> Logs and events used to detect
          fraud, abuse, or system outages.
        </li>
      </ul>
    ),
  },
  {
    id: "usage",
    title: "How We Use Information",
    content: (
      <ul>
        <li>Operate, maintain, and improve the Site and App.</li>
        <li>
          Provide features (e.g., results lookup, resources, communities).
        </li>
        <li>Personalize content and remember settings.</li>
        <li>Measure performance and analyze product usage.</li>
        <li>Detect, prevent, and respond to security incidents or abuse.</li>
        <li>Comply with legal obligations.</li>
        <li>
          Monetize via advertising and/or affiliate links (where enabled).
        </li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Online Advertising",
    content: (
      <>
        <p>
          We use first-party and third-party cookies, pixels, and local storage
          for functionality, analytics, and advertising.
        </p>
        <h3>Google AdSense</h3>
        <ul>
          <li>
            Third-party vendors, including Google, use cookies to serve ads
            based on your prior visits to this and other websites.
          </li>
          <li>
            Google’s advertising cookies enable it and its partners to serve ads
            to you based on your visits to our sites and/or other sites on the
            Internet.
          </li>
          <li>
            You can opt out of personalized advertising from Google via{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ads Settings
            </a>
            .
          </li>
          <li>
            For broader industry opt-out choices, visit{" "}
            <a
              href="https://www.aboutads.info/choices"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info/choices
            </a>
            .
          </li>
        </ul>
        <AdUnit adSlot="multiplex" key="privacy-policy-page-ad" />
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics & Affiliates",
    content: (
      <>
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
      </>
    ),
  },
  {
    id: "rights",
    title: "Legal Bases & Rights",
    content: (
      <>
        <p>If you are in the EEA/UK, we process data based on:</p>
        <ul>
          <li>
            <strong>Contract</strong> (to provide services)
          </li>
          <li>
            <strong>Legitimate Interests</strong> (security/improvement)
          </li>
          <li>
            <strong>Consent</strong> (ads/cookies)
          </li>
          <li>
            <strong>Legal Obligation</strong>
          </li>
        </ul>
        <h3>Your Choices</h3>
        <ul>
          <li>
            <strong>Cookie controls:</strong> Manage via browser settings or
            opt-out links.
          </li>
          <li>
            <strong>Access/Delete:</strong> Request a copy or deletion of your
            data (subject to legal exceptions).
          </li>
          <li>
            <strong>Withdraw Consent:</strong> You can withdraw previously given
            consent at any time.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "Data Handling",
    content: (
      <>
        <p>
          We share data with service providers (hosting, analytics), ad
          partners, and for legal compliance. We retain data only as long as
          necessary. While we use reasonable security measures, no online
          transmission is 100% secure.
        </p>
        <h3>International Transfers</h3>
        <p>
          We may process and store information in countries other than yours. We
          use lawful transfer mechanisms as required.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact & Updates",
    content: (
      <>
        <p>
          We may update this Policy periodically. Material changes will be
          communicated.
        </p>
        <p>
          Questions? Email{" "}
          <a href="mailto:contact@nith.eu.org">contact@nith.eu.org</a>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      accent="Your data, explained"
      lede="Transparency is core to our ecosystem. This document explains how nith.eu.org and app.nith.eu.org collect, use, and safeguard your data when you use our platform."
      updated="September 13, 2026"
      sections={sections}
    >
      <p className="text-body text-muted-foreground leading-relaxed md:text-body-lg">
        <strong className="font-medium text-foreground">Disclaimer:</strong>{" "}
        This platform is unofficial and not affiliated with the National
        Institute of Technology, Hamirpur. Names or marks remain the property of
        their respective owners.
      </p>
      <AdUnit adSlot="multiplex" key="privacy-policy-page-ad-footer" />
    </LegalPage>
  );
}
