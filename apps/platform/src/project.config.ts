// Project configuration for the College Ecosystem platform
export const orgConfig = {
  name: "National Institute of Technology, Hamirpur",
  shortName: "NITH",
  domain: "nith.ac.in",
  website: "https://nith.ac.in",
  logo: "https://nith.ac.in/uploads/settings/15795036012617.png",
  logoSquare: "https://nith.ac.in/uploads/topics/nit-logo15954991401255.jpg",
  mailSuffix: "@nith.ac.in",

  // Enhanced social profiles
  socials: {
    twitter: {
      url: "https://twitter.com/nithamirpur",
      handle: "@nithamirpur",
      publisher: "@nithamirpur",
    },
    linkedin: "https://linkedin.com/company/nithamirpur",
    instagram: "https://instagram.com/nithamirpur",
    facebook: "https://facebook.com/NITHamirpur",
    youtube: "https://youtube.com/@NITHamirpur",
  },
  // Enhanced organization details
  foundingDate: "1986-01-01",
  location: {
    address: {
      "@type": "PostalAddress",
      streetAddress: "NIT Hamirpur Campus, Anu",
      addressLocality: "Hamirpur",
      addressRegion: "Himachal Pradesh",
      postalCode: "177005",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "31.7087",
      longitude: "76.5270",
    },
  },

  contact: {
    email: "registrar@nith.ac.in",
    phone: "+91-1972-254001",
    fax: "+91-1972-223834",
  },

  socialProfiles: [
    "https://www.facebook.com/NITHamirpur",
    "https://twitter.com/NITHamirpurHP",
    "https://www.instagram.com/nithamirpur/",
    "https://www.linkedin.com/school/nithamirpur/",
    "https://www.youtube.com/@NITHamirpur",
  ],

  // Enhanced structured data
  jsonLds: {
    EducationalOrganization: {
      "@context": "https://schema.org",
      "@type": ["CollegeOrUniversity", "GovernmentOrganization"],
      name: "National Institute of Technology, Hamirpur",
      url: "https://nith.ac.in",
      logo: "https://nith.ac.in/uploads/settings/15795036012617.png",
      foundingDate: "1986",
      address: {
        "@type": "PostalAddress",
        streetAddress: "NIT Hamirpur Campus, Anu",
        addressLocality: "Hamirpur",
        addressRegion: "Himachal Pradesh",
        postalCode: "177005",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Admissions",
        telephone: "+91-1972-254001",
        email: "registrar@nith.ac.in",
      },
      sameAs: [
        "https://www.facebook.com/NITHamirpur",
        "https://twitter.com/NITHamirpurHP",
        "https://www.instagram.com/nithamirpur/",
        "https://www.linkedin.com/school/nithamirpur/",
        "https://www.youtube.com/@NITHamirpur",
      ],
      department: [
        {
          "@type": "CollegeDepartment",
          name: "Computer Science and Engineering",
        },
        {
          "@type": "CollegeDepartment",
          name: "Electronics and Communication Engineering",
        },
        // Add all departments
      ],
    },
  },
} as const;

// This file contains the configuration for the app and college
export const appConfig = {
  name: "College Platform",
  appDomain: "nith.eu.org",
  otherAppDomains: [
    "app.nith.eu.org",
    "platform.nith.eu.org",
    "nith-app.vercel.app",
    "os.nith.eu.org",
    "nith-app.pages.dev",
  ],
  url: "https://app.nith.eu.org",
  logoSquare: "/logo-square.svg",
  logo: "/logo.svg",
  logoDark: "/logo-dark.svg",
  // appDomain: "college-ecosystem.vercel.app",
  // url: "https://college-ecosystem.vercel.app",
  description:
    "NIT Hamirpur student portal for academic results, campus resources, and community collaboration. Manage your college ecosystem in one platform.",
  keywords: [
    // Primary terms
    "NITH portal",
    "NIT Hamirpur",
    "campus management",
    "student portal",
    "college ecosystem",
    "academic platform",
    "college os",

    // Feature-specific
    "NITH results",
    "semester results",
    "exam grades",
    "course materials",
    "faculty collaboration",
    "campus resources",

    // Program-specific
    "BTech portal",
    "MTech portal",
    "MCA portal",
    "BArch portal",
    "PhD portal",

    // Location-based
    "Hamirpur colleges",
    "Himachal Pradesh colleges",
    "NIT Hamirpur portal",

    // Action-oriented
    "check results online",
    "download marksheet",
    "academic records",
    "connect with faculty",
    "campus announcements",
  ].join(", "),
  creator: "Kanak Kholwal",
  authors: [
    {
      name: "Kanak Kholwal",
      url: "https://kanak.eu.org",
      image: "https://github.com/kanakkholwal.png",
      email: "me@kanak.eu.org",
    },
    {
      name: "NITH Administration",
      url: "https://nith.ac.in",
      role: "EducationalInstitution",
    },
  ],
  githubRepo:
    "https://github.com/kanakkholwal/college-ecosystem",
  githubUri: "kanakkholwal/college-ecosystem",
  socials: {
    twitter: "https://twitter.com/kanakkholwal?utm_source=app.nith.eu.org&utm_medium=direct&utm_campaign=personal_brand",
    linkedin: "https://linkedin.com/in/kanak-kholwal?utm_source=app.nith.eu.org&utm_medium=direct&utm_campaign=personal_brand",
    instagram: "https://instagram.com/kanakkholwal?utm_source=app.nith.eu.org&utm_medium=direct&utm_campaign=personal_brand",
    github: "https://github.com/kanakkholwal?utm_source=app.nith.eu.org&utm_medium=direct&utm_campaign=personal_brand",
    website: "https://kanak.eu.org/?utm_source=app.nith.eu.org&utm_medium=direct&utm_campaign=personal_brand",
  },

  verifications: {
    google_adsense: "ca-pub-6988693445063744",
    google_analytics: "G-SC4TQQ5PCW",
  },
  // SEO-specific enhancements
  seo: {
    locale: "en_IN",
    timezone: "Asia/Kolkata",
    geo: {
      placename: "Hamirpur",
      region: "Himachal Pradesh",
      position: "31.7087° N, 76.5270° E",
    },
    category: "Education",
    publisher: orgConfig.name,
    schemaType: "WebApplication",
  },
  contact: "https://forms.gle/PXbaDm9waeJWYWUP8",
  // Structured data templates
  jsonLds: {
    WebApplication: {
      "@type": "WebApplication",
      name: "NITH Campus Portal",
      url: "https://app.nith.eu.org",
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
    enableOgImage: false, // Enable Open Graph image generation
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

  {
    href: "https://forms.gle/u2ptK12iRVdn5oXF7",
    title: "Give a feedback",
  },
  {
    href: "https://forms.gle/v8Angn9VCbt9oVko7",
    title: "Suggest a feature",
  },
] as const;

export default {
  appConfig,
  orgConfig,
  supportLinks,
} as const;
