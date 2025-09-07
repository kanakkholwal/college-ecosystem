export type benefitsItem = {
  id?: string
  resource: string;
  logo: string;
  value?: string;
  tags: string[];
  description: string;
  href: string;
  category: string
  isNew?: boolean
};

export const benefitsList: benefitsItem[] = [
  {
    id: "1",
    resource: "ElevenLabs",
    logo: "https://www.buildincollege.com/logos/elevenlabs.png",
    value: "$55",
    description: "via ElevenLabs AI Student Pack",
    href: "https://aistudentpack.com/",
    tags: ["AI", "Voice Generation"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "2",
    resource: "v0",
    logo: "https://www.buildincollege.com/logos/vercel.png",
    value: "$60",
    description: "via ElevenLabs AI Student Pack",
    href: "https://aistudentpack.com/",
    tags: ["AI", "Code Generation", "Web Development"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "3",
    resource: "Lovable",
    logo: "https://www.buildincollege.com/logos/lovable.png",
    value: "$150",
    description: "50% off Pro plan for a year - via ElevenLabs AI Student Pack",
    href: "https://aistudentpack.com/",
    tags: ["AI", "Code Generation", "Web Development"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "4",
    resource: "ChatGPT Plus (2 Months Free)",
    logo: "https://www.buildincollege.com/logos/openai.webp",
    value: "$40",
    description: "2 months free ChatGPT Plus for US/Canada students with GPT-4o, image generation, and advanced research tools",
    href: "https://chatgpt.com/students",
    tags: ["AI", "Free for Students", "Research"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "5",
    resource: "Firecrawl",
    logo: "https://www.buildincollege.com/logos/firecrawl.jpg",
    value: "$100+",
    description: "20k free credits and full API access with educational email",
    href: "https://www.firecrawl.dev/student-program",
    tags: ["API Credits", "AI", "Web Scraping"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "6",
    resource: "Free Framer Pro",
    logo: "https://www.buildincollege.com/logos/framer.svg",
    value: "$180",
    description: "Framer is free for students! Just use your school email",
    href: "https://www.framer.com/students/?dub_id=mXpTb4ulA4qL1oH1#signup",
    tags: ["Design", "Web Development", "Productivity"],
    category: "free-stuff",
    isNew: !0
  }, {
    id: "7",
    resource: "Claude Credits",
    logo: "https://www.buildincollege.com/logos/anthropic-small.png",
    value: "$50",
    description: "",
    href: "https://www.anthropic.com/contact-sales/for-student-builders",
    tags: ["API Credits", "AI"],
    category: "free-stuff"
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
];

export const benefitsCategories = ["all",...new Set(benefitsList.map((elem) => elem.category))]