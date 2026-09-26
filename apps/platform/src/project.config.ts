import { getBaseURL } from "./utils/env";

/** Lives here so the edge proxy can read auth cookies without importing the auth (and DB) module. */
export const AUTH_COOKIE_PREFIX = "campus360";

// Campus 360 application configuration
export const orgConfig = {
  name: "Campus 360",
  shortName: "Campus 360",
  domain: "campus360.local",
  website: "http://localhost:3000",
  logo: "/logo.svg",
  logoSquare: "/logo-square.svg",
  mailSuffix: "@sggs.ac.in",

  socials: {
    twitter: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
  },

  foundingDate: "",
  location: {
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "",
      longitude: "",
    },
  },

  contact: {
    email: "",
    phone: "",
    fax: "",
  },

  socialProfiles: [],

  jsonLds: {
    EducationalOrganization: {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: "Campus 360",
      url: "http://localhost:3000",
      logo: "/logo.svg",
      foundingDate: "",
      address: {
        "@type": "PostalAddress",
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "General",
        telephone: "",
        email: "",
      },
      sameAs: [],
      department: [],
    },
  },
} as const;

// Campus 360 application configuration
export const appConfig = {
  name: "Campus 360",
  shortName: "C360",
  appDomain: "localhost",
  otherAppDomains: [],
  url: getBaseURL() ?? "http://localhost:3000",

  logoSquare: "/logo-square.svg",
  logo: "/logo.svg",
  logoDark: "/logo-dark.svg",

  description:
    "Campus 360 is a unified college management and student platform for academics, communication, campus services, hostel management, and administration.",

  keywords: [
    "Campus 360",
    "campus management",
    "student portal",
    "college management system",
    "college ecosystem",
    "academic platform",
    "student management",
    "hostel management",
    "attendance management",
    "campus services",
  ].join(", "),

  creator: "Campus 360",
  authors: [
    {
      name: "Campus 360",
      url: "",
      image: "",
      email: "",
    },
  ],

  githubRepo: "https://github.com/Aadi-1319/campus360",
  githubUri: "Aadi-1319/campus360",

  socials: {
    twitter: "",
    linkedin: "",
    instagram: "",
    github: "https://github.com/Aadi-1319",
    website: "",
  },

  verifications: {
    google_adsense: "",
    google_analytics: "",
  },

  seo: {
    locale: "en_IN",
    timezone: "Asia/Kolkata",
    geo: {
      placename: "",
      region: "",
      position: "",
    },
    category: "Education",
    publisher: "Campus 360",
    schemaType: "WebApplication",
  },

  contact: "",

  jsonLds: {
    WebApplication: {
      "@type": "WebApplication",
      name: "Campus 360",
      url: "http://localhost:3000",
      applicationCategory: "Education",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
    },
  },

  flags: {
    enableOgImage: false,
  },
};

export const supportLinks = [
  {
    href: appConfig.githubRepo,
    title: "Contribute to this project",
  },
  {
    href: appConfig.githubRepo + "/issues",
    title: "Report an issue",
  },
] as const;

export default {
  appConfig,
  orgConfig,
  supportLinks,
} as const;