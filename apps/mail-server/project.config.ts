

export const appConfig = {
  name: "College Platform",
  appDomain: "nith.eu.org",
  url: "https://app.nith.eu.org",
  logo: "https://app.nith.eu.org/logo.png",
  logoSquare: "https://app.nith.eu.org/favicon.ico",
  tagline: "Connecting Students, Faculty, and Staff",
  description:
    "A platform for students, faculty, and staff to interact and collaborate.",
  authors: [
    { name: "Kanak Kholwal", url: "https://kanakkholwal.eu.org" },
    { name: "NITH", url: "https://nith.ac.in" },
  ],
  githubRepo: "https://github.com/kanakkholwal/college-ecosystem",
  socials: {
    twitter: "https://twitter.com/kanakkholwal",
    linkedin: "https://linkedin.com/in/kanakkholwal",
    instagram: "https://instagram.com/kanakkholwal",
    github: "https://github.com/kanakkholwal"
  },
  // sender email
  senderEmail: `platform@nith.eu.org`,
  sender: `College Platform <platform@nith.eu.org>`,
  contact:"https://forms.gle/PXbaDm9waeJWYWUP8",
  
} as const;

export const SERVER_IDENTITY = process.env.SERVER_IDENTITY;

export const SMTP_HOST = process.env.SMTP_HOST;
export const MAIL_EMAIL = process.env.MAIL_EMAIL;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;



export const SMTP_SETTINGS = {
  host: SMTP_HOST || "smtp-relay.brevo.com", // "smtp.gmail.com", //replace with your email provider
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_EMAIL,
    pass: MAIL_PASSWORD,
  },
}
