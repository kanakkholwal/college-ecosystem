
export const submitBenefitsLink = "https://forms.gle/aA8NzH31ByUommCg7";

export type benefitsItem = {
  id?: string
  resource: string;
  logo: string;
  value?: string;
  tags: string[];
  description: string;
  href: string;
  category: string
  isNew?: boolean,
  country?: "worldwide" | "USA" | "India" | "United Kingdom" | string
};


const benefits: Record<string, benefitsItem[]> = {
  worldwide: [
    {
      id: "1",
      resource: "ElevenLabs",
      logo: "https://www.buildincollege.com/logos/elevenlabs.png",
      value: "$55",
      description: "via ElevenLabs AI Student Pack",
      href: "https://aistudentpack.com/",
      tags: ["AI", "Voice Generation"],
      category: "free-stuff",
      isNew: true,
      country: "worldwide"
    }, {
      id: "2",
      resource: "v0",
      logo: "https://www.buildincollege.com/logos/vercel.png",
      value: "$60",
      description: "via ElevenLabs AI Student Pack",
      href: "https://aistudentpack.com/",
      tags: ["AI", "Code Generation", "Web Development"],
      category: "free-stuff",
      isNew: true,
      country: "worldwide"
    }, {
      id: "3",
      resource: "Lovable",
      logo: "https://www.buildincollege.com/logos/lovable.png",
      value: "$150",
      description: "50% off Pro plan for a year - via ElevenLabs AI Student Pack",
      href: "https://aistudentpack.com/",
      tags: ["AI", "Code Generation", "Web Development"],
      category: "free-stuff",
      isNew: true,
      country: "worldwide"
    }, {
      id: "4",
      resource: "ChatGPT Plus (2 Months Free)",
      logo: "https://www.buildincollege.com/logos/openai.webp",
      value: "$40",
      description: "2 months free ChatGPT Plus for US/Canada students with GPT-4o, image generation, and advanced research tools",
      href: "https://chatgpt.com/students",
      tags: ["AI", "Free for Students", "Research"],
      category: "free-stuff",
      isNew: true,
      country: "USA"
    }, {
      id: "5",
      resource: "Firecrawl",
      logo: "https://www.buildincollege.com/logos/firecrawl.jpg",
      value: "$100+",
      description: "20k free credits and full API access with educational email",
      href: "https://www.firecrawl.dev/student-program",
      tags: ["API Credits", "AI", "Web Scraping"],
      category: "free-stuff",
      isNew: true,
      country: "worldwide"
    }, {
      id: "6",
      resource: "Free Framer Pro",
      logo: "https://www.buildincollege.com/logos/framer.svg",
      value: "$180",
      description: "Framer is free for students! Just use your school email",
      href: "https://www.framer.com/students/?dub_id=mXpTb4ulA4qL1oH1#signup",
      tags: ["Design", "Web Development", "Productivity"],
      category: "free-stuff",
      isNew: !0,
      country: "worldwide"
    }, {
      id: "7",
      resource: "Claude Credits",
      logo: "https://www.buildincollege.com/logos/anthropic-small.png",
      value: "$50",
      description: "Free $50 in API credits for students",
      href: "https://www.anthropic.com/contact-sales/for-student-builders",
      tags: ["API Credits", "AI"],
      category: "free-stuff",
      country: "worldwide"
    }, {
      id: "8",
      resource: "Free Landing Page Builder",
      logo: "https://www.buildincollege.com/logos/rocketship-icon.png",
      value: "",
      description: "Free landing page builder :)",
      href: "https://www.landingbuilder.live/",
      tags: ["Web Infrastructure", "Startups"],
      category: "free-stuff",
      isNew: !0
    }, {
      id: "9",
      resource: "OpenAI Credits",
      logo: "https://www.buildincollege.com/logos/openai.webp",
      value: "$1000",
      description: "Via Microsoft for Startups (Azure)",
      href: "https://www.microsoft.com/en-us/startups/ai",
      tags: ["API Credits", "AI"],
      category: "free-stuff"
    }, {
      id: "10",
      resource: "Free Cursor Pro (1 Year)",
      logo: "https://www.buildincollege.com/logos/cursor.jpeg",
      value: "$240",
      description: "Sign up with .edu email",
      href: "https://www.cursor.com/students",
      tags: ["AI"],
      category: "free-stuff"
    }, {
      id: "11",
      resource: "Google Colab (free compute)",
      logo: "https://www.buildincollege.com/logos/google.jpeg",
      value: "$120",
      description: "free with student email",
      href: "https://colab.research.google.com/signup",
      tags: ["AI", "Compute", "Development"],
      category: "free-stuff"
    }, {
      id: "12",
      resource: "Screen Studio",
      logo: "https://www.buildincollege.com/logos/screenstudio.jpeg",
      value: "$100+",
      description: "40% off with student email",
      href: "https://screen.studio/license/request-educational-discount?aff=9mm0pn",
      tags: ["Productivity", "Video Creation"],
      category: "free-stuff"
    }, {
      id: "13",
      resource: "Free Notion Plus w/ AI",
      logo: "https://www.buildincollege.com/logos/notion.png",
      value: "",
      description: "Via Github Student Dev Pack",
      href: "https://education.github.com/pack",
      tags: ["Productivity", "AI"],
      category: "free-stuff"
    }, {
      id: "14",
      resource: "Free Figma Pro",
      logo: "https://www.buildincollege.com/logos/figma.avif",
      value: "$144/year",
      description: "Sign up with .edu email",
      href: "https://www.figma.com/education/",
      tags: ["Design", "AI"],
      category: "free-stuff"
    }, {
      id: "15",
      resource: "Free Domains (Name.com)",
      logo: "https://www.buildincollege.com/logos/name.webp",
      value: "",
      description: ".live, .software, .studio, etc.",
      href: "https://education.github.com/pack",
      tags: ["Startups", "Web Infrastructure"],
      category: "free-stuff"
    }, {
      id: "16",
      resource: "Free Domain (Namecheap)",
      logo: "https://www.buildincollege.com/logos/namecheap.svg",
      value: "",
      description: ".me only, free with Github Student Dev Pack",
      href: "https://nc.me/landing/github",
      tags: ["Web Infrastructure", "Startups"],
      category: "free-stuff",
      isNew: !0
    }, {
      id: "17",
      resource: "Free Heroku Hosting (2 Years)",
      logo: "https://www.buildincollege.com/logos/heroku.webp",
      value: "$312",
      description: "2 years of hosting via Github Student Dev Pack",
      href: "https://education.github.com/pack",
      tags: ["Web Infrastructure", "Startups"],
      category: "free-stuff"
    }, {
      id: "18",
      resource: "Free Perplexity Pro (1 Month)",
      logo: "https://www.buildincollege.com/logos/perplexity.png",
      value: "$20",
      description: "Sign up with .edu email",
      href: "https://plex.it/referrals/BNJ8UCZW",
      tags: ["AI", "Productivity"],
      category: "free-stuff"
    }, {
      id: "19",
      resource: "Microsoft for Startups",
      logo: "https://www.buildincollege.com/logos/microsoft.webp",
      value: "",
      description: "",
      href: "https://www.microsoft.com/en-us/startups",
      tags: ["API Credits", "AI", "Startups", "Web Infrastructure"],
      category: "free-stuff"
    }, {
      id: "20",
      resource: "Github Student Developer Pack",
      logo: "https://www.buildincollege.com/logos/github.png",
      value: "",
      description: "",
      href: "https://education.github.com/pack",
      tags: ["API Credits", "AI", "Startups", "Web Infrastructure"],
      category: "free-stuff"
    }, {
      id: "21",
      resource: "Free GPU Credits",
      logo: "https://www.buildincollege.com/logos/digitalocean.png",
      value: "$10,000",
      description: "Sign up via Hatch program",
      href: "https://sammydigitalocean.typeform.com/to/tZXAmt?typeform-source=www.digitalocean.com",
      tags: ["GPU", "Web Infrastructure", "AI", "Startups"],
      category: "free-stuff"
    }, {
      id: "22",
      resource: "Amazon AWS Credits",
      logo: "https://www.buildincollege.com/logos/amazon-aws.png",
      value: "$10k+",
      description: "$300 without a website, up to $100k if you have a website. Say you're 'self-funded'",
      href: "https://aws.amazon.com/free/offers/",
      tags: ["API Credits", "Web Infrastructure", "Startups"],
      category: "free-stuff",
      isNew: !0
    }, {
      id: "23",
      resource: "Adobe Creative Cloud (Student)",
      logo: "https://www.buildincollege.com/logos/adobe-creative-cloud.png",
      value: "60% off",
      description: "Get 20+ Adobe apps including Photoshop, Illustrator, Premiere Pro with 60% student discount",
      href: "https://www.adobe.com/creativecloud/buy/students.html",
      tags: ["Design", "Student Discount", "Professional"],
      category: "free-stuff",
      isNew: !0
    },

    // fellowship
    {
      id: "f1",
      resource: "Z Fellows",
      logo: "https://www.buildincollege.com/logos/zfellows.jpeg",
      value: "$10,000",
      description: "$10k grant & fellowship for young entrepreneurs",
      href: "https://www.zfellows.com/",
      tags: ["Fellowship", "Grant", "Mentorship"],
      category: "fellowships"
    }, {
      id: "f2",
      resource: "Neo Scholars",
      logo: "https://www.buildincollege.com/logos/neo.svg",
      value: "$25,000",
      description: "Fellowship & grant for CS students",
      href: "https://neo.com/scholars",
      tags: ["Fellowship", "Grant", "Mentorship"],
      category: "fellowships"
    }, {
      id: "f3",
      resource: "Afore Capital Grants",
      logo: "https://www.buildincollege.com/logos/afore.jpeg",
      value: "$1,000",
      description: "$1,000 non-dilutive grant",
      href: "https://grants.afore.vc/",
      tags: ["Fellowship", "Grant", "Mentorship"],
      category: "fellowships"
    }, {
      id: "f4",
      resource: "Superteam Crypto Grants",
      logo: "https://www.buildincollege.com/logos/superteam.jpg",
      value: "up to $10k",
      description: "grants for building crypto apps (dApps)",
      href: "https://earn.superteam.fun/grants",
      tags: ["Fellowship", "Grant", "Crypto", "Web3"],
      category: "fellowships",
      isNew: !0
    }
  ],
  in: [
    {
      id: "apple-edu-in",
      resource: "Apple",
      logo: "https://api.freeforstudents.org/assets/155fb282-7d59-4f5a-9f38-899f8b5364e3?format=auto&width=256",
      value: "Student Pricing",
      tags: ["Popular", "Paid"],
      description: "Student Pricing on a new Mac or iPad",
      href: "https://www.apple.com/in-edu/store",
      category: "Technology",
      country: "India"
    },
    {
      id: "unidays-in",
      resource: "Unidays",
      logo: "https://images.unidays.world/i/creative/raw/3717fb3a-8f0f-4210-844c-8f53171a6788",
      value: "best student discounts",
      tags: ["Popular"],
      description: "Exclusive student deals and benefits",
      href: "https://www.myunidays.com/IN/en-IN",
      category: "free-stuff",
      country: "India"
    },
    {
      id: "student-developer-pack",
      resource: "GitHub",
      logo: "https://api.freeforstudents.org/assets/c611bd9f-46f4-443d-9635-f0f42b0fecf8?format=auto&width=256",
      value: "Free",
      tags: ["Popular"],
      description: "Student Developer Pack",
      href: "https://education.github.com/pack",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "apple-music-student",
      resource: "Apple Music",
      logo: "https://api.freeforstudents.org/assets/775c5a96-21d6-4416-83d0-3f9db06d9b6e?format=auto&width=256",
      value: "50% Off",
      tags: ["Popular"],
      description: "50% Off Apple Music plus Free Apple TV+",
      href: "https://support.apple.com/en-us/106008",
      category: "Entertainment",
      country: "India"
    },
    {
      id: "nordvpn-69pc",
      resource: "NordVPN",
      logo: "https://api.freeforstudents.org/assets/b1f76d7d-e52c-4a71-a359-8150ab57e118?format=auto&width=256",
      value: "69% Off",
      tags: ["Limited Time Only", "Paid"],
      description: "69% Off Secure VPN + 3 Months Free",
      href: "https://freeforstudents.org/go/nordvpn-69pc",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "jetbrains-edu",
      resource: "JetBrains",
      logo: "https://api.freeforstudents.org/assets/b0a7a385-ce61-4eda-a9b2-e8dc519724a2?format=auto&width=256",
      value: "Free",
      tags: ["Popular"],
      description: "Free Access to Professional Developer Software",
      href: "https://freeforstudents.org/go/jetbrains-edu",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "aws-educate",
      resource: "Amazon Web Services",
      logo: "https://api.freeforstudents.org/assets/b2541cf7-f8f1-44d0-96a4-372aadc05573?format=auto&width=256",
      value: "Free",
      tags: [],
      description: "Learn Cloud Skills with AWS Educate",
      href: "https://freeforstudents.org/go/aws-educate",
      category: "Education",
      country: "India"
    },
    {
      id: "surfshark-80pc",
      resource: "Surfshark",
      logo: "https://api.freeforstudents.org/assets/5fc6c724-307d-46fe-b3b6-f8043ac589ed?format=auto&width=256",
      value: "80% Off",
      tags: ["Paid"],
      description: "80% Off Award-Winning Secure VPN",
      href: "https://freeforstudents.org/go/surfshark-80pc",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "ynab-college",
      resource: "YNAB",
      logo: "https://api.freeforstudents.org/assets/a6372999-2898-4759-a651-8586f41da209?format=auto&width=256",
      value: "Free",
      tags: [],
      description: "Free Wealth-Building Budgeting App",
      href: "https://freeforstudents.org/go/ynab-college",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "creative-cloud-60pc",
      resource: "Adobe",
      logo: "https://api.freeforstudents.org/assets/9d274709-09b3-4ceb-95e0-96de5762fffc?format=auto&width=256",
      value: "60% Off",
      tags: ["Popular", "Paid"],
      description: "Get 60% Off Adobe Creative Cloud",
      href: "https://freeforstudents.org/go/creative-cloud-60pc",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "datacamp-student-50pc",
      resource: "Datacamp",
      logo: "https://api.freeforstudents.org/assets/cbda741b-003e-4ee5-b80b-0ac4bf7bd84c?format=auto&width=256",
      value: "50% Off",
      tags: ["Recently Added", "Paid"],
      description: "50% Off Data Science & AI Courses",
      href: "https://freeforstudents.org/go/datacamp-student-50pc",
      category: "Education",
      country: "India"
    },
    {
      id: "dashlane-premium",
      resource: "Dashlane",
      logo: "https://api.freeforstudents.org/assets/7e812c92-ca52-4c3f-a26a-b8cfb8573440?format=auto&width=256",
      value: "Free",
      tags: ["Recently Added"],
      description: "Free Password Manager for 1 Year",
      href: "https://freeforstudents.org/go/dashlane-premium",
      category: "Software and Tools",
      country: "India"
    },
    {
      id: "oneplus-education-program-in",
      resource: "OnePlus",
      logo: "https://api.freeforstudents.org/assets/deb99ba6-9ca8-4c63-ae6c-41679489c0d4?format=auto&width=256",
      value: "Student Pricing",
      tags: ["Popular", "Paid"],
      description: "Exclusive Student Pricing on OnePlus Products",
      href: "https://freeforstudents.org/go/oneplus-education-program-in",
      category: "Technology",
      country: "India"
    },
    {
      id: "samsung-stu-in",
      resource: "Samsung",
      logo: "https://api.freeforstudents.org/assets/4d01154d-08ac-4018-b1ca-30fffcf5c42f?format=auto&width=256",
      value: "Student Pricing",
      tags: ["Popular", "Paid"],
      description: "Samsung Student Advantage Program",
      href: "https://freeforstudents.org/go/samsung-stu-in",
      category: "Technology",
      country: "India"
    }
  ],
  USA: [
    {
      id: "prime-student-us",
      resource: "Amazon",
      logo: "https://api.freeforstudents.org/assets/cdf6c305-3538-40f5-be73-31b7642f65d2?format=auto&width=256",
      value: "Free Amazon Prime (plus 5% cashback)",
      tags: ["Limited Time Only"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/prime-student-us",
      category: "Shopping",
      isNew: true,
      country: "USA"
    },
    {
      id: "grubhub-prime",
      resource: "Grubhub (Prime Perk)",
      logo: "https://api.freeforstudents.org/assets/5b4af1e1-a1c3-4d16-9035-9fc1ec33b5c8?format=auto&width=256",
      value: "$0 Delivery with Free Grubhub+ for 6 Months",
      tags: ["Recently Added"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/grubhub-prime",
      category: "Shopping",
      isNew: true,
      country: "USA"
    },
    {
      id: "prime-video-us",
      resource: "Prime Video",
      logo: "https://api.freeforstudents.org/assets/e34310ad-7d42-4dee-9a45-78d7741c4ce0?format=auto&width=256",
      value: "Stream Prime Video Free for 6 Months",
      tags: ["Popular"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/prime-video-us",
      category: "Entertainment",
      country: "USA"
    },
    {
      id: "apple-edu-us",
      resource: "Apple",
      logo: "https://api.freeforstudents.org/assets/155fb282-7d59-4f5a-9f38-899f8b5364e3?format=auto&width=256",
      value: "Student Pricing on a new Mac or iPad",
      tags: ["Popular", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/apple-edu-us",
      category: "Technology",
      country: "USA"
    },
    {
      id: "student-developer-pack",
      resource: "GitHub",
      logo: "https://api.freeforstudents.org/assets/c611bd9f-46f4-443d-9635-f0f42b0fecf8?format=auto&width=256",
      value: "Student Developer Pack",
      tags: ["Popular"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/student-developer-pack",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "apple-music-student",
      resource: "Apple Music",
      logo: "https://api.freeforstudents.org/assets/775c5a96-21d6-4416-83d0-3f9db06d9b6e?format=auto&width=256",
      value: "50% Off Apple Music plus Free Apple TV+",
      tags: ["Popular"],
      description: "Available in United States",
      href: "https://support.apple.com/en-us/106008",
      category: "Entertainment",
      country: "USA"
    },
    {
      id: "nordvpn-69pc",
      resource: "NordVPN",
      logo: "https://api.freeforstudents.org/assets/b1f76d7d-e52c-4a71-a359-8150ab57e118?format=auto&width=256",
      value: "69% Off Secure VPN + 3 Months Free",
      tags: ["Limited Time Only", "Paid"],
      description: "Available in United States",
      href: "https://nordvpn.com/special/",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "fizz-app",
      resource: "Fizz",
      logo: "https://api.freeforstudents.org/assets/a94a046b-cee9-4602-b2c3-5f7c3619b928?format=auto&width=256",
      value: "Save and Build Credit with Student Money App",
      tags: ["Recently Added"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/fizz-app",
      category: "Software and Tools",
      isNew: true,
      country: "USA"
    },
    {
      id: "calm-prime-student",
      resource: "Calm",
      logo: "https://api.freeforstudents.org/assets/60623b6f-f986-438e-9dfa-39f0a87ad09c?format=auto&width=256",
      value: "Free Calm for 30 Days, then $3.50 a month",
      tags: [],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/calm-prime-student",
      category: "Health and Wellbeing",
      country: "USA"
    },
    {
      id: "jetbrains-edu",
      resource: "JetBrains",
      logo: "https://api.freeforstudents.org/assets/b0a7a385-ce61-4eda-a9b2-e8dc519724a2?format=auto&width=256",
      value: "Free Access to Professional Developer Software",
      tags: ["Popular"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/jetbrains-edu",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "aws-educate",
      resource: "Amazon Web Services",
      logo: "https://api.freeforstudents.org/assets/b2541cf7-f8f1-44d0-96a4-372aadc05573?format=auto&width=256",
      value: "Learn Cloud Skills with AWS Educate",
      tags: [],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/aws-educate",
      category: "Education",
      country: "USA"
    },
    {
      id: "surfshark-80pc",
      resource: "Surfshark",
      logo: "https://api.freeforstudents.org/assets/5fc6c724-307d-46fe-b3b6-f8043ac589ed?format=auto&width=256",
      value: "80% Off Award-Winning Secure VPN",
      tags: ["Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/surfshark-80pc",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "ynab-college",
      resource: "YNAB",
      logo: "https://api.freeforstudents.org/assets/a6372999-2898-4759-a651-8586f41da209?format=auto&width=256",
      value: "Free Wealth-Building Budgeting App",
      tags: [],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/ynab-college",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "creative-cloud-60pc",
      resource: "Adobe",
      logo: "https://api.freeforstudents.org/assets/9d274709-09b3-4ceb-95e0-96de5762fffc?format=auto&width=256",
      value: "Get 60% Off Adobe Creative Cloud",
      tags: ["Popular", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/creative-cloud-60pc",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "datacamp-student-50pc",
      resource: "Datacamp",
      logo: "https://api.freeforstudents.org/assets/cbda741b-003e-4ee5-b80b-0ac4bf7bd84c?format=auto&width=256",
      value: "50% Off Data Science & AI Courses",
      tags: ["Recently Added", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/datacamp-student-50pc",
      category: "Education",
      isNew: true,
      country: "USA"
    },
    {
      id: "namecheap",
      resource: "Namecheap",
      logo: "https://api.freeforstudents.org/assets/f5f5e07f-494a-4c50-ad5c-b462b4ff852e?format=auto&width=256",
      value: "Free .me and Discounted Domains",
      tags: [],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/namecheap",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "dashlane-premium",
      resource: "Dashlane",
      logo: "https://api.freeforstudents.org/assets/7e812c92-ca52-4c3f-a26a-b8cfb8573440?format=auto&width=256",
      value: "Free Password Manager for 1 Year",
      tags: ["Recently Added"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/dashlane-premium",
      category: "Software and Tools",
      isNew: true,
      country: "USA"
    },
    {
      id: "skillshare-30pc-annual",
      resource: "Skillshare",
      logo: "https://api.freeforstudents.org/assets/89cc051a-b6a5-4897-9f98-1a33366c0025?format=auto&width=256",
      value: "Get 30% Off Annual Skillshare Membership",
      tags: ["Recently Added", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/skillshare-30pc-annual",
      category: "Education",
      isNew: true,
      country: "USA"
    },
    {
      id: "squarespace-50pc",
      resource: "Squarespace",
      logo: "https://api.freeforstudents.org/assets/57cacfe7-70b1-4055-88ad-963a69870325?format=auto&width=256",
      value: "50% Off First Year of Website Builder",
      tags: ["Recently Added", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/squarespace-50pc",
      category: "Software and Tools",
      isNew: true,
      country: "USA"
    },
    {
      id: "airalo-15pc",
      resource: "Airalo",
      logo: "https://api.freeforstudents.org/assets/87e8b8fa-fc71-44f6-8fd4-787c91cd8a39?format=auto&width=256",
      value: "Stay Connected with 15% Off International eSIMs",
      tags: ["Recently Added", "Paid"],
      description: "Available in United States",
      href: "https://freeforstudents.org/go/airalo-15pc",
      category: "Technology",
      isNew: true,
      country: "USA"
    },
    {
      id: "kayak-student",
      resource: "KAYAK",
      logo: "https://www.kayak.com/c/wp-content/plugins/r9-components/assets/logos/kayak-logo-orange.svg",
      value: "Up to 40% Off Flights for Students",
      tags: ["Recently Added", "Paid"],
      description: "Available in United States",
      href: "https://www.kayak.com/c/students/",
      category: "Shopping",
      isNew: true,
      country: "USA"
    },
    {
      id: "autodesk-edu-access",
      resource: "Autodesk",
      logo: "https://brand.autodesk.com/wp-content/uploads/2025/02/adsk-brand-hub-logo-Logo-1-lockup.svg",
      value: "Free Access to Design & Modelling Software",
      tags: [],
      description: "Available in United States",
      href: "https://www.autodesk.com/education/edu-software/overview",
      category: "Software and Tools",
      country: "USA"
    },
    {
      id: "hulu-199",
      resource: "Hulu",
      logo: "https://www.logo.wine/a/logo/Hulu/Hulu-Logo.wine.svg",
      value: "80% off",
      tags: ["Recently Added", "Paid"],
      description: "Get Hulu For Just $1.99/Month",
      href: "https://www.hulu.com/student",
      category: "Entertainment",
      isNew: true,
      country: "USA"
    }
  ],
  uk: [
    {
      id: "prime-student-uk",
      resource: "Amazon",
      logo: "https://api.freeforstudents.org/assets/cdf6c305-3538-40f5-be73-31b7642f65d2?format=auto&width=256",
      value: "Free Amazon Prime for 6 Months",
      tags: ["Popular"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/prime-student-uk",
      category: "Shopping",
      country: "United Kingdom"
    },
    {
      id: "prime-video-uk",
      resource: "Prime Video",
      logo: "https://api.freeforstudents.org/assets/e34310ad-7d42-4dee-9a45-78d7741c4ce0?format=auto&width=256",
      value: "Stream Prime Video Free for 6 Months",
      tags: ["Popular"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/prime-video-uk",
      category: "Entertainment",
      country: "United Kingdom"
    },
    {
      id: "apple-edu-uk",
      resource: "Apple",
      logo: "https://api.freeforstudents.org/assets/155fb282-7d59-4f5a-9f38-899f8b5364e3?format=auto&width=256",
      value: "Student Pricing on a new Mac or iPad",
      tags: ["Popular", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/apple-edu-uk",
      category: "Technology",
      country: "United Kingdom"
    },
    {
      id: "student-developer-pack",
      resource: "GitHub",
      logo: "https://api.freeforstudents.org/assets/c611bd9f-46f4-443d-9635-f0f42b0fecf8?format=auto&width=256",
      value: "Student Developer Pack",
      tags: ["Popular"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/student-developer-pack",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "apple-music-student",
      resource: "Apple Music",
      logo: "https://api.freeforstudents.org/assets/775c5a96-21d6-4416-83d0-3f9db06d9b6e?format=auto&width=256",
      value: "50% Off Apple Music plus Free Apple TV+",
      tags: ["Popular"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/apple-music-student",
      category: "Entertainment",
      country: "United Kingdom"
    },
    {
      id: "nordvpn-69pc",
      resource: "NordVPN",
      logo: "https://api.freeforstudents.org/assets/b1f76d7d-e52c-4a71-a359-8150ab57e118?format=auto&width=256",
      value: "69% Off Secure VPN + 3 Months Free",
      tags: ["Limited Time Only", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/nordvpn-69pc",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "jetbrains-edu",
      resource: "JetBrains",
      logo: "https://api.freeforstudents.org/assets/b0a7a385-ce61-4eda-a9b2-e8dc519724a2?format=auto&width=256",
      value: "Free Access to Professional Developer Software",
      tags: ["Popular"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/jetbrains-edu",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "aws-educate",
      resource: "Amazon Web Services",
      logo: "https://api.freeforstudents.org/assets/b2541cf7-f8f1-44d0-96a4-372aadc05573?format=auto&width=256",
      value: "Learn Cloud Skills with AWS Educate",
      tags: [],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/aws-educate",
      category: "Education",
      country: "United Kingdom"
    },
    {
      id: "surfshark-80pc",
      resource: "Surfshark",
      logo: "https://api.freeforstudents.org/assets/5fc6c724-307d-46fe-b3b6-f8043ac589ed?format=auto&width=256",
      value: "80% Off Award-Winning Secure VPN",
      tags: ["Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/surfshark-80pc",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "ynab-college",
      resource: "YNAB",
      logo: "https://api.freeforstudents.org/assets/a6372999-2898-4759-a651-8586f41da209?format=auto&width=256",
      value: "Free Wealth-Building Budgeting App",
      tags: [],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/ynab-college",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "creative-cloud-60pc",
      resource: "Adobe",
      logo: "https://api.freeforstudents.org/assets/9d274709-09b3-4ceb-95e0-96de5762fffc?format=auto&width=256",
      value: "Get 60% Off Adobe Creative Cloud",
      tags: ["Popular", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/creative-cloud-60pc",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "datacamp-student-50pc",
      resource: "Datacamp",
      logo: "https://api.freeforstudents.org/assets/cbda741b-003e-4ee5-b80b-0ac4bf7bd84c?format=auto&width=256",
      value: "50% Off Data Science & AI Courses",
      tags: ["Recently Added", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/datacamp-student-50pc",
      category: "Education",
      country: "United Kingdom"
    },
    {
      id: "namecheap",
      resource: "Namecheap",
      logo: "https://api.freeforstudents.org/assets/f5f5e07f-494a-4c50-ad5c-b462b4ff852e?format=auto&width=256",
      value: "Free .me and Discounted Domains",
      tags: [],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/namecheap",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "dashlane-premium",
      resource: "Dashlane",
      logo: "https://api.freeforstudents.org/assets/7e812c92-ca52-4c3f-a26a-b8cfb8573440?format=auto&width=256",
      value: "Free Password Manager for 1 Year",
      tags: ["Recently Added"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/dashlane-premium",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "skillshare-30pc-annual",
      resource: "Skillshare",
      logo: "https://api.freeforstudents.org/assets/89cc051a-b6a5-4897-9f98-1a33366c0025?format=auto&width=256",
      value: "Get 30% Off Annual Skillshare Membership",
      tags: ["Recently Added", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/skillshare-30pc-annual",
      category: "Education",
      country: "United Kingdom"
    },
    {
      id: "squarespace-50pc",
      resource: "Squarespace",
      logo: "https://api.freeforstudents.org/assets/57cacfe7-70b1-4055-88ad-963a69870325?format=auto&width=256",
      value: "50% Off First Year of Website Builder",
      tags: ["Recently Added", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/squarespace-50pc",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "airalo-15pc",
      resource: "Airalo",
      logo: "https://api.freeforstudents.org/assets/87e8b8fa-fc71-44f6-8fd4-787c91cd8a39?format=auto&width=256",
      value: "Stay Connected with 15% Off International eSIMs",
      tags: ["Recently Added", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/airalo-15pc",
      category: "Technology",
      country: "United Kingdom"
    },
    {
      id: "kayak-student",
      resource: "KAYAK",
      logo: "https://api.freeforstudents.org/assets/7bc6f0db-e547-4b42-bf81-13b923f7bcb7?format=auto&width=256",
      value: "Up to 40% Off Flights for Students",
      tags: ["Recently Added", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/kayak-student",
      category: "Shopping",
      country: "United Kingdom"
    },
    {
      id: "autodesk-edu-access",
      resource: "Autodesk",
      logo: "https://api.freeforstudents.org/assets/5370e886-72ef-49c1-92f3-340ad0bae2e8?format=auto&width=256",
      value: "Free Access to Design & Modelling Software",
      tags: [],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/autodesk-edu-access",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "intel-software-tools",
      resource: "Intel",
      logo: "https://api.freeforstudents.org/assets/6a77a1e6-7d97-42ef-b3ac-57a7621cb8df?format=auto&width=256",
      value: "Free Software Development Tools",
      tags: [],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/intel-software-tools",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "figma-education-plan",
      resource: "Figma",
      logo: "https://api.freeforstudents.org/assets/e0fd6971-2223-41ef-8c1a-ba2514c78849?format=auto&width=256",
      value: "Design Tool with Free Education Plan",
      tags: ["Recently Added"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/figma-education-plan",
      category: "Software and Tools",
      country: "United Kingdom"
    },
    {
      id: "samsung-stu-youth-uk",
      resource: "Samsung",
      logo: "https://api.freeforstudents.org/assets/4d01154d-08ac-4018-b1ca-30fffcf5c42f?format=auto&width=256",
      value: "Samsung Student & Youth Discounts",
      tags: ["Popular", "Paid"],
      description: "Available in United Kingdom",
      href: "https://freeforstudents.org/go/samsung-stu-youth-uk",
      category: "Technology",
      country: "United Kingdom"
    },
    {
      id: "youtube-student-plan",
      resource: "YouTube",
      logo: "https://api.freeforstudents.org/assets/4bfc13a9-3934-4b36-b86b-9d761c17a0c6?format=auto&width=256",
      value: "YouTube Premium Student Plan",
      tags: ["Recently Added"],
      description: "Available in United Kingdom",
      href: "https://www.youtube.com/premium/student",
      category: "Entertainment",
      country: "worldwide"
    }
  ],

}
// map benefits into array
export const benefitsList: benefitsItem[] = [...new Set(Object.values(benefits).flat())]
export const benefitsCategories = ["all", ...new Set(benefitsList.map((elem) => elem.category))]
export const benefitsRegions = [...new Set(benefitsList.map((elem) => elem.country ? elem.country : "worldwide"))]