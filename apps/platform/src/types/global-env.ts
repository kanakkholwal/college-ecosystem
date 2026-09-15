import { z } from "zod";

const envVariables = z.object({
  // Server Side
  GOOGLE_ID: z.string(),
  GOOGLE_SECRET: z.string(),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),

  MONGODB_URI: z.string(),
  DATABASE_URL: z.string(),

  NODE_ENV: z.string().default("testing"),

  // ai
  DEEPSEEK_API_KEY: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),

  SERVER_IDENTITY: z.string().url(),
  BASE_SERVER_URL: z.string().url(),
  NEXT_PUBLIC_BASE_SERVER_URL: z.string().url(),
  NEXT_PUBLIC_SERVER_IDENTITY: z.string(),

  REDIS_URL: z.string(),

  // email: see src/lib/email/providers.ts for what each provider needs
  EMAIL_PROVIDER: z.enum(["smtp", "resend", "brevo", "console"]).optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  EMAIL_ASSET_BASE_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  BREVO_SMTP_LOGIN: z.string().optional(),
  BREVO_SMTP_KEY: z.string().optional(),

  // Client Side
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
