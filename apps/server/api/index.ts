// Vercel serverless entrypoint. @vercel/node compiles this from source, so the
// tsc `dist/` output (gitignored) is never needed at deploy time.
export { default } from "../src/app";
