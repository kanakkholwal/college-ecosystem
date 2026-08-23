import { z } from "zod";

const envVariables = z.object({
  MONGODB_URI: z.string().nonempty(),
  REDIS_URL: z.string().nonempty(),
  SERVER_IDENTITY: z.string().nonempty(),
});

envVariables.parse(process.env);

declare global {
  // biome-ignore lint/style/noNamespace: augmenting NodeJS.ProcessEnv requires a namespace
  namespace NodeJS {
    // biome-ignore lint/complexity/noBannedTypes: interface merging target is intentionally empty
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
