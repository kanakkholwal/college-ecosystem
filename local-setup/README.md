# How to setup this project in your device

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [PNPM](https://pnpm.io/) or [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Next.js](https://nextjs.org/docs)

## Pre-setup steps

- Install `turbo` package globally

```bash
npm install -g turbo@latest
```

- Download raw `data.json` file from this drive link and save in this folder. [Drive Link]("https://drive.google.com/file/d/1EA44xbZM4HdhGJ8xeP-rehsV3LYEyoIt/view?usp=sharing")

- Run the `setup.js` file using node to add raw data to your database for testing the environment.

```bash
node ./local-setup/setup.js
```

## _NOTE_ : Make sure to add proper Environment variables

- Get Your `DATABASE_URL` from [neon.tech]("https://neon.tech/")
- Get Your `MONGODB_URI` from [mongodb]("https://www.mongodb.com/")
- Get Your `BETTER_AUTH_SECRET` from [better-auth]("https://www.better-auth.com/docs/installation")
- Get Your `UPSTASH_REDIS_REST_URL` from [upstash]("https://upstash.com/")
- Get Your `GOOGLE_ID` from [gcp]("https://console.cloud.google.com/")
- Get Your `SUPABASE_DATABASE_URL` from [supabase]("https://supabase.com/")
- Get Your `MAIL_EMAIL` from [brevo]("https://www.brevo.com/")
