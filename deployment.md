# Deployment Guide

## Deploying Microservices

This project uses GitHub Actions for continuous deployment of its microservices. Each microservice has its own deployment workflow defined in the `.github/workflows` directory.

### Steps to Deploy

#### 1. Go to Google Cloud Console

- Go to GCP ([Google Cloud Console](https://console.cloud.google.com/)) and create a new Project named `College Ecosystem <YOUR_COLLEGE_NAME>`.
- In Left Menu, go to `IAM & Admin` -> `Service Accounts`.
- Click on `+ CREATE SERVICE ACCOUNT` at the top.
- Enter `github-actions` as the Service account name and click `CREATE AND CONTINUE`.
- In the next step, assign the role in `Basic` -> `Editor` to the service account and click `CONTINUE`.
- Click `DONE` to finish creating the service account.
- Click on the created service account to open its details.
- Go to the `KEYS` tab and click on `ADD KEY` -> `Create new key`.
- Select `JSON` as the key type and click `CREATE`. A JSON file will be downloaded to your computer as `CREDENTIALS_JSON.json`. Keep it safe as it contains sensitive information.
<!-- get project details - GCP_PROJECT_ID,GCP_PROJECT_NUMBER -->
- In the Google Cloud Console, go to the `Dashboard` of your project to find the `Project ID` and `Project Number`. Note these down as they will be needed later.

<!-- Add note for enabling required APIs -->
### Enable required APIs

Before deploying, enable the Google Cloud APIs used by the workflows.

Via Cloud Console:

- Open APIs & Services → Library in your project.
- Search for and enable:
    - Cloud Run API (run.googleapis.com)
    - Cloud Build API (cloudbuild.googleapis.com)
    - Artifact Registry API (artifactregistry.googleapis.com) — or Container Registry (containerregistry.googleapis.com) if you use it
    - IAM Service Account Credentials API (iamcredentials.googleapis.com)
    - Secret Manager API (secretmanager.googleapis.com) — if you store secrets in Secret Manager
    - Cloud Resource Manager API (cloudresourcemanager.googleapis.com)

Or enable them with gcloud (replace YOUR_PROJECT_ID):

```
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com containerregistry.googleapis.com iamcredentials.googleapis.com secretmanager.googleapis.com cloudresourcemanager.googleapis.com
```

Note: API activation can take a minute. Ensure the project selected matches your GCP_PROJECT_ID.

#### 2. Set up GitHub Secrets

- Go to your GitHub repository and navigate to `Settings` -> `Secrets and variables` -> `Actions`.
- Click on `New repository secret` and add the following secrets:

  - `GCP_CREDENTIALS`: Copy the entire content of the downloaded `CREDENTIALS_JSON.json` file and paste it as the value.
  - `GCP_PROJECT_ID`: The Project ID of your GCP project.
  - `GCP_PROJECT_NUMBER`: The Project Number of your GCP project.
  <!-- - `GITHUB_TOKEN`: A GitHub Personal Access Token with `read:packages` scope to access GitHub Container Registry. -->
- Now click on `Variables` tab and add a new variable:
  - `REMOTE_REPO_NAME`: Set its value to `ghcr-remote`.
  <!-- - `REGISTRY`: Set its value to `ghcr-io`. -->
  - `SERVICE_NAME_SERVER`: Set its value to `college-ecosystem-server` (or your desired service name with convention `<YOUR_REPO>-server`).
  - `GCP_REPO_REGION`: Set its value to your desired GCP region (close to your user location), e.g., `us-central1`.
  - `GCP_SERVING_REGION` : Set its value to your desired GCP region (close to your user location), e.g., `asia-southeast1`.

#### 3. Create Cloud Run Services

- Go to the Cloud Run section in the Google Cloud Console.
- Click on `Create Service`.
- Select `Deploy one revision from an existing container image`.
- For the container image, you can use a placeholder image like `gcr.io/cloudrun/hello`.
- Set the service name to `college-ecosystem-server` (as set in the `SERVICE_NAME_SERVER` variable).
- Choose the region you set in the `GCP_SERVING_REGION` variable.
- Click on `Create` to create the service.

## Vercel Git Integration — selective deploys

Each Vercel project watches the whole monorepo, so every push to `main` would
rebuild all of them. `scripts/vercel/` gates that: Vercel runs the **Ignored
Build Step** command and treats **exit 1 as "build"** and **exit 0 as "skip"**.

### Per-project settings

In Vercel → Project → *Settings* → *Git*, set **Root Directory** and
**Ignored Build Step** (choose "Run my Bash script"):

| Project     | Root Directory     | Ignored Build Step                                |
| ----------- | ------------------ | ------------------------------------------------- |
| platform    | `apps/platform`    | `bash ../../scripts/vercel/ignore-platform.sh`    |
| server      | `apps/server`      | `bash ../../scripts/vercel/ignore-server.sh`      |
| mail-server | `apps/mail-server` | `bash ../../scripts/vercel/ignore-mail-server.sh` |

Also enable *Include source files outside of the Root Directory* so the scripts
and the root lockfile are present in the build container.

### What triggers a build

A project builds when the pushed commit touches its own `apps/<name>/**`, or any
shared root file (`package.json`, `bun.lock`, `turbo.json`, `scripts/vercel/**`).
Otherwise the build is skipped and the previous deployment stays live.

### Commit-message overrides

- `[force deploy]` / `[vercel deploy]` — build every project regardless of paths.
- `[skip deploy]` / `[vercel skip]` — skip every project.

The scripts **fail open**: if git metadata is missing (manual redeploy, shallow
clone with no parent commit), they build rather than silently skip.

> The `cd-*-vercel.yml` GitHub Actions workflows also deploy via the Vercel CLI.
> Disable them once Git Integration is live, or the same commit deploys twice.

### The Express server (`apps/server`) on Git Integration

The old `apps/server/vercel.json` used a legacy `builds` array pointing at
`dist/src/index.js`. That only worked from GitHub Actions, which ran
`bun run build` *before* `vercel build --prebuilt`. Under Git Integration it
breaks twice over: `dist/` is gitignored so it isn't in the clone, and a
`builds` array makes Vercel **ignore the Build Command** that would recreate it.

It now uses `apps/server/api/index.ts`, a one-line re-export of the Express app.
`@vercel/node` compiles that from TypeScript source, and `rewrites` sends every
path to it. `bun run build` still runs as a typecheck gate.

`outputDirectory` points at an intentionally empty `public/`. Vercel demands the
directory exist once a Build Command is set, and it must **not** be `dist/`:
static files are matched before `rewrites`, so the compiled server and its
sourcemaps would be downloadable at `/src/app.js`.

Required Vercel project settings for `ce-server`:

- Root Directory: `apps/server`
- Framework Preset: **Other** (leave Build/Install Command blank — `vercel.json` sets them)
- Every var the server reads must exist in Vercel, `SERVER_IDENTITY` especially:
  `apps/server/src/app.ts` throws at import time without it, which surfaces as a
  function crash rather than a build failure.

> `src/index.ts` (`createServer` + `listen`) is the container/Cloud Run entrypoint
> and is unused on Vercel. Serverless functions can't hold WebSocket connections —
> keep the Docker/Cloud Run deploy for anything that needs them.

### The platform app (`apps/platform`) on Git Integration

`apps/platform/.env.production` is **not** tracked by git, so a Vercel clone has
none of it. This used to fail the build outright:

```
Error: Failed to collect page data for /results/[rollNo]
```

That route reads straight from Mongo and never calls `apps/server` on its read
path — it only imports `~/actions/common.result`, whose *other* functions use
`serverFetch`. Because `fetch-server.ts` validated env at module scope, merely
importing the chain threw, and Next reported it against the first page that
pulled it in.

`fetch-server.ts` and `dbConnect.ts` now validate on **call**, not on import, so
a page pays only for the services it actually uses. Env is still required at
runtime by whatever touches it:

| Variable               | Needed by                                       |
| ---------------------- | ----------------------------------------------- |
| `MONGODB_URI`          | anything hitting the database                   |
| `SERVER_IDENTITY`      | any `serverFetch` / `mailFetch` call            |
| `BASE_SERVER_URL`      | `serverFetch` — result refresh, rank assignment |
| `BASE_MAIL_SERVER_URL` | `mailFetch` — outbound mail                     |

`BASE_SERVER_URL` and `BASE_MAIL_SERVER_URL` are easy to miss: `.env.example`
only lists their `NEXT_PUBLIC_`-prefixed siblings, which are *different vars* and
do not satisfy these checks.

`REDIS_URL` only warns, and `ioredis` is constructed with `lazyConnect`, so it
never blocked the build — but set it or caching silently points at localhost.

---

# Azure Container Apps

Both apps run as containers in **one Container Apps environment**. One
environment means one shared ingress and one certificate store; the apps still
scale and deploy independently.

| App             | Container app | Port | Domain                 |
| --------------- | ------------- | ---- | ---------------------- |
| `apps/platform` | `ce-platform` | 3000 | `app.nith.eu.org`      |
| `apps/server`   | `ce-server`   | 8080 | `server.nith.eu.org`   |

Images are built by GitHub Actions and pushed to GHCR. The workflows only ever
run `az containerapp update --image` — env vars and secrets live on the
container app, so a deploy can never blank them.

## Staying inside the free grant

The monthly grant is 180k vCPU-seconds, 360k GiB-seconds and 2M requests, and it
renews every month. One always-on replica at 0.25 vCPU burns ~657k vCPU-s, which
is **3.6x over the grant** — always-on is not free.

`--min-replicas 0` is what keeps the bill at zero. The cost is a 5-15s cold
start on the first request after idle. Keep Cloudflare proxied and caching, so
static and cacheable responses never wake the container at all.

## One-time bootstrap

```bash
RG=college-ecosystem
LOC=centralindia

az group create -n $RG -l $LOC
az containerapp env create -n ce-env -g $RG -l $LOC

# Platform
az containerapp create -n ce-platform -g $RG --environment ce-env \
  --image ghcr.io/kanakkholwal/college-ecosystem/platform:latest \
  --target-port 3000 --ingress external \
  --min-replicas 0 --max-replicas 3 --cpu 0.5 --memory 1Gi

# Server — needs a warm replica, see the SSE note below
az containerapp create -n ce-server -g $RG --environment ce-env \
  --image ghcr.io/kanakkholwal/college-ecosystem/server:latest \
  --target-port 8080 --ingress external \
  --min-replicas 0 --max-replicas 2 --cpu 0.25 --memory 0.5Gi
```

Secrets are set once, then referenced by env vars:

```bash
az containerapp secret set -n ce-platform -g $RG --secrets \
  better-auth-secret=... mongodb-uri=... database-url=... \
  server-identity=... google-secret=... redis-url=...

az containerapp update -n ce-platform -g $RG --set-env-vars \
  BETTER_AUTH_SECRET=secretref:better-auth-secret \
  MONGODB_URI=secretref:mongodb-uri \
  DATABASE_URL=secretref:database-url \
  SERVER_IDENTITY=secretref:server-identity \
  GOOGLE_SECRET=secretref:google-secret \
  REDIS_URL=secretref:redis-url \
  BETTER_AUTH_URL=https://app.nith.eu.org \
  BASE_SERVER_URL=https://server.nith.eu.org \
  NODE_ENV=production
```

`BETTER_AUTH_URL` matters here: off Vercel, `getBaseURL()` falls through to it,
and without it auth silently targets `http://localhost:3000`.

## GitHub Actions authentication

Login uses OIDC, so there is no long-lived Azure credential in the repo. Create
an app registration with a federated credential scoped to this repo, grant it
Contributor on the resource group, then set these repo **secrets**:

| Secret                  | Value                          |
| ----------------------- | ------------------------------ |
| `AZURE_CLIENT_ID`       | app registration client id     |
| `AZURE_TENANT_ID`       | directory (tenant) id          |
| `AZURE_SUBSCRIPTION_ID` | subscription id                |
| `AZURE_RESOURCE_GROUP`  | `college-ecosystem`            |

And these repo **variables** (they are inlined into the client bundle at build
time, so they are public by definition):

`NEXT_PUBLIC_BASE_SERVER_URL`, `NEXT_PUBLIC_BASE_MAIL_SERVER_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Domains, with Cloudflare in front

Azure verifies ownership with a TXT record and routes by `Host` header, so each
hostname must be bound explicitly. The verification id is per-subscription —
the same value works for both apps.

```bash
az containerapp show -n ce-platform -g $RG \
  --query properties.customDomainVerificationId -o tsv

az containerapp show -n ce-platform -g $RG \
  --query properties.configuration.ingress.fqdn -o tsv
```

In Cloudflare DNS, per hostname:

| Type  | Name          | Value                        | Proxy |
| ----- | ------------- | ---------------------------- | ----- |
| TXT   | `asuid.app`   | the verification id          | n/a   |
| CNAME | `app`         | the container app FQDN       | see below |

**Set the CNAME to DNS-only (grey cloud) while binding.** Azure resolves the
hostname back to itself to validate, and a proxied record answers with
Cloudflare's IPs instead, so the bind fails.

Then bind the certificate. Use a **Cloudflare Origin CA certificate**, not an
Azure managed one:

1. Cloudflare → SSL/TLS → Origin Server → Create Certificate, for `nith.eu.org`
   and `*.nith.eu.org`, 15 year validity.
2. `openssl pkcs12 -export -out origin.pfx -inkey origin.key -in origin.pem`
3. `az containerapp env certificate upload -n ce-env -g $RG \
      --certificate-file origin.pfx --password <pfx-password>`
4. `az containerapp hostname bind -n ce-platform -g $RG \
      --hostname app.nith.eu.org --certificate <cert-name>`
5. Re-enable the Cloudflare proxy (orange cloud) and set SSL/TLS mode to
   **Full (strict)** — Cloudflare trusts its own Origin CA.

An Azure managed certificate would work too, but it revalidates over DNS on
every renewal, which means grey-clouding the record twice a year forever. The
Origin CA certificate lasts 15 years and only has to survive the initial bind,
which is why the one-time grey-cloud dance is worth it.

Repeat for `server.nith.eu.org` against `ce-server`.

## Open issue: wildcard subdomains

`proxy.ts` treats *any* unrecognised subdomain as a club:

```ts
if (pathname === "/") return NextResponse.rewrite(new URL(`/clubs/${subdomain}`, request.url));
```

Azure routes by `Host` header and only serves hostnames that are explicitly
bound, so a club subdomain that was never bound returns a 404 at the ingress
before the app is ever reached. The fixed subdomains (`clubs`, `guard`, `admin`,
`auth`, `resources`, `community`, `os`, `platform`, `dev`, `staging`) can each be
bound once, but dynamically created club subdomains cannot.

**This needs resolving before platform traffic is cut over.** Either confirm
Container Apps supports a bound wildcard host, or put a small Cloudflare Worker
in front that forwards every `*.nith.eu.org` request to the bound
`app.nith.eu.org` origin and passes the original host in a header for
`extractSubdomain` to read. `apps/server` has no wildcard requirement, which is
another reason to migrate it first.

## Behind a proxy

`apps/server` never calls `app.set("trust proxy", ...)`. Behind Cloudflare and
the Container Apps ingress, `req.ip` is the proxy's address, so anything
per-client — `express-rate-limit` in particular — buckets every visitor
together. Set it before adding rate limiting.

Sockets also matter here: `apps/server` runs `socket.io` and SSE, which is
exactly what serverless could not host. Long-lived connections die when a
scale-to-zero replica is reclaimed, so if either is load-bearing this app needs
`--min-replicas 1` and the always-on cost that comes with it.
