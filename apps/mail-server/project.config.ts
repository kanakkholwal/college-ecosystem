
export const appConfig = {
  name: "Campus 360 Mail Service",
  appDomain: "localhost",
  url: "http://localhost:3000",
  logo: "",
  logoSquare: "",
  tagline: "Campus 360 email service",
  description:
    "Local email service for the SGGS Campus 360 development environment.",
  authors: [
    { name: "Campus 360" },
    { name: "Original project contributors", url: "https://github.com/kanakkholwal/college-ecosystem" },
  ],
  githubRepo: "https://github.com/Aadi-1319/campus360",
  socials: {
    github: "https://github.com/Aadi-1319/campus360",
  },
  // Configure a real sender later using an authorized email address.
  senderEmail: process.env.MAIL_FROM_EMAIL || "no-reply@localhost",
  sender: `Campus 360 <${process.env.MAIL_FROM_EMAIL || "no-reply@localhost"}>`,
  contact: "",
} as const;

export const SERVER_IDENTITY = process.env.SERVER_IDENTITY;

export const SMTP_HOST = process.env.SMTP_HOST;
export const MAIL_EMAIL = process.env.MAIL_EMAIL;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

export const SMTP_SETTINGS = {
  host: SMTP_HOST || "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: MAIL_EMAIL,
    pass: MAIL_PASSWORD,
  },
};
