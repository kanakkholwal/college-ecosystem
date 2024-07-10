import { z } from "zod";

const envVariables = z.object({
  PORT: z.string().default("8080"),
  NODE_ENV: z.string().default("testing"),
});

envVariables.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
