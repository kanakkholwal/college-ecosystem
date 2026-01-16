import { z } from "zod";

const envVariables = z.object({
    SERVER_IDENTITY: z.string(),
    SMTP_HOST: z.string(),
    MAIL_EMAIL: z.string().email(),
    MAIL_PASSWORD: z.string(),
});

envVariables.parse(process.env);

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> { }
    }
}