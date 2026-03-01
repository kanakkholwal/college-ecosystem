# College Ecosystem

> An open-source, full-stack college management platform — built as a monorepo with Next.js, Express, Go, and Docker.
<!-- 
[![Deploy to Vercel - Platform](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/cd-platform-vercel.yml/badge.svg)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/cd-platform-vercel.yml)
[![Deploy to Vercel - Server](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/cd-server-vercel.yml/badge.svg)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/cd-server-vercel.yml) -->
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-F9F1E1?logo=bun&logoColor=black)](https://bun.sh/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[![Screenshot](screenshot.png)](https://app.nith.eu.org)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kanakkholwal/college-ecosystem)

---

## Table of Contents

- [Overview](#overview)
- [Monorepo Apps](#monorepo-apps)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [CI/CD & GitHub Workflows](#cicd--github-workflows)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**College Ecosystem** is a production-grade, monorepo-based college management and student engagement platform. It consolidates academic tools, campus resources, community interaction, and administrative dashboards into a single, cohesive system.

The project powers [**app.nith.eu.org**](https://app.nith.eu.org) (Platform) and [**nith.eu.org**](https://nith.eu.org) (Website) with a multi-service backend spanning Node.js, Go, and a dedicated mail microservice — all orchestrated via Turborepo and Docker Compose.

---

## Monorepo Apps

The repository is organized into five independent applications under the `apps/` directory:

| App | Description | Tech | Port |
|---|---|---|---|
| **[Platform](https://app.nith.eu.org)** | Primary student and admin-facing application. Handles academic results, schedules, community features, AI chatbot, attendance tracking, hostel management, and role-based dashboards. | Next.js 16, React 19, Tailwind CSS 4, Drizzle ORM, Mongoose, Better Auth, Vercel AI SDK | `3000` |
| **[Website](https://nith.eu.org)** | Public-facing college website with landing pages, announcements, and informational content. | Next.js 15, React 19, Tailwind CSS 4, Framer Motion, AOS | `3002` |
| **Server** | REST API and WebSocket server for data-intensive operations — result scraping, Excel processing, real-time updates, and background jobs. | Express 4, TypeScript, Mongoose, Socket.IO, Redis, Multer | `8080` |
| **Go Server** | High-performance microservice for compute-heavy tasks like web scraping and result parsing. | Go 1.24, Fiber v2, GoQuery | `8080` |
| **Mail Server** | Transactional email microservice with templated emails (welcome, password reset, result notifications). Deployable to Cloudflare Workers via OpenNext. | Next.js, React Email, Nodemailer, Wrangler | `3001` |

---

## Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Browser / PWA"]
    end

    subgraph Frontend["Frontend Apps"]
        Platform["Platform<br/>(Next.js 16)"]
        Website["Website<br/>(Next.js 15)"]
    end

    subgraph Backend["Backend Services"]
        Server["Node Server<br/>(Express + Socket.IO)"]
        GoServer["Go Server<br/>(Fiber v2)"]
        MailServer["Mail Server<br/>(React Email + Nodemailer)"]
    end

    subgraph Data["Data Layer"]
        MongoDB[(MongoDB)]
        Postgres[(PostgreSQL)]
        Redis[(Redis)]
        Supabase[(Supabase)]
    end

    subgraph Infra["Infrastructure"]
        Docker["Docker Compose"]
        Turbo["Turborepo"]
        GHA["GitHub Actions"]
    end

    Browser --> Platform
    Browser --> Website
    Platform --> Server
    Platform --> GoServer
    Platform --> MailServer
    Platform --> MongoDB
    Platform --> Postgres
    Platform --> Redis
    Platform --> Supabase
    Server --> MongoDB
    Server --> Redis
    GoServer --> Browser

    Docker -.-> Platform
    Docker -.-> Website
    Docker -.-> Server
    Docker -.-> MailServer
    Docker -.-> MongoDB
    Docker -.-> Postgres
    Docker -.-> Redis
    Turbo -.-> Platform
    Turbo -.-> Website
    Turbo -.-> Server
    Turbo -.-> MailServer
    GHA -.-> Docker
    GHA -.-> Turbo
```

### Project Structure

```
college-ecosystem/
├── apps/
│   ├── platform/          # Main college platform (Next.js 16)
│   │   ├── app/           # App Router (pages, layouts, API routes)
│   │   ├── src/           # Shared source (hooks, lib, utils)
│   │   ├── @/             # Path alias modules
│   │   ├── migrations/    # Drizzle ORM migrations
│   │   └── Dockerfile
│   ├── website/           # Public college website (Next.js 15)
│   │   ├── app/           # App Router
│   │   ├── @/             # Shared components
│   │   └── Dockerfile
│   ├── server/            # REST API + WebSocket server (Express)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── scripts/
│   │   └── Dockerfile
│   ├── go-server/         # High-perf microservice (Go + Fiber)
│   │   ├── cmd/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── pkg/
│   │   └── Dockerfile
│   └── mail-server/       # Email microservice (React Email)
│       ├── emails/        # Email templates
│       ├── app/           # API routes
│       └── Dockerfile
├── content/               # Chatbot reference data
├── local-setup/           # Local development helpers
├── docker-compose.yml     # Full-stack orchestration
├── turbo.json             # Turborepo task config
├── package.json           # Root workspace config
├── .env.example           # Environment variable template
├── CONTRIBUTING.md        # Contribution guidelines
├── deployment.md          # GCP Cloud Run deployment guide
└── LICENSE                # Mozilla Public License 2.0
```

---

## Tech Stack

### Frontend

| Technology | Usage |
|---|---|
| [Next.js](https://nextjs.org/) 15 / 16 | React framework with App Router, SSR, ISR, and API routes |
| [React](https://react.dev/) 19 | UI library with Server Components and concurrent features |
| [TypeScript](https://www.typescriptlang.org/) 5.x | Type-safe development across all apps |
| [Tailwind CSS](https://tailwindcss.com/) 4 | Utility-first styling with PostCSS |
| [Radix UI](https://www.radix-ui.com/) | Accessible, unstyled component primitives (Shadcn UI) |
| [Framer Motion](https://www.framer.com/motion/) | Declarative animations and gestures |
| [Recharts](https://recharts.org/) | Data visualization and charting |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Zustand](https://zustand.docs.pmnd.rs/) | Lightweight client state management |
| [TanStack Query](https://tanstack.com/query/) | Server state management and caching |
| [TanStack Table](https://tanstack.com/table/) | Headless table UI |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form handling and schema validation |
| [nuqs](https://nuqs.47ng.com/) | Type-safe URL search params state |
| [Serwist](https://serwist.pages.dev/) | PWA service worker tooling |

### Backend

| Technology | Usage |
|---|---|
| [Express](https://expressjs.com/) 4 | Node.js REST API framework |
| [Socket.IO](https://socket.io/) | Real-time bidirectional communication |
| [Go](https://go.dev/) 1.24 | High-performance backend microservice |
| [Fiber](https://gofiber.io/) v2 | Express-inspired Go web framework |
| [GoQuery](https://github.com/PuerkitoBio/goquery) | HTML parsing and web scraping (Go) |
| [Multer](https://github.com/expressjs/multer) | File upload handling |
| [Nodemailer](https://nodemailer.com/) | Email delivery via SMTP |
| [React Email](https://react.email/) | Build email templates with React components |
| [Vercel AI SDK](https://sdk.vercel.ai/) | LLM integration (Google Gemini, Mistral, DeepSeek) |
| [Better Auth](https://www.better-auth.com/) | Authentication and session management |

### Database & Caching

| Technology | Usage |
|---|---|
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Primary document database for unstructured data |
| [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) | Relational database with type-safe ORM and migrations |
| [Redis](https://redis.io/) + [ioredis](https://github.com/redis/ioredis) | In-memory caching and rate limiting |
| [Supabase](https://supabase.com/) | Managed Postgres with real-time subscriptions |
| [Neon](https://neon.tech/) | Serverless Postgres (via `@neondatabase/serverless`) |

### DevOps & Tooling

| Technology | Usage |
|---|---|
| [Turborepo](https://turbo.build/) | Monorepo build system with caching and task orchestration |
| [Bun](https://bun.sh/) 1.3 | JavaScript runtime and package manager |
| [Docker](https://www.docker.com/) + Compose | Containerized development and production environments |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipelines for automated deployments |
| [Vercel](https://vercel.com/) | Hosting for Platform and Server apps |
| [Cloudflare Workers](https://workers.cloudflare.com/) | Edge deployment for Mail Server (via OpenNext) |
| [Google Cloud Run](https://cloud.google.com/run) | Container hosting for server microservices |
| [ESLint](https://eslint.org/) 9 | Code linting |
| [Prettier](https://prettier.io/) | Code formatting |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Database migration tooling |

---

## Features

### Academic Management

- **Results Portal** — Search and view semester results with batch, branch, and programme filtering; aggregate rankings across college, batch, and section
- **Syllabus Browser** — Browse and search course syllabi by department, type, and semester
- **Academic Calendar** — View events, important dates, and semester schedules in calendar and list views
- **Class Schedules & Timetables** — Access and manage class timetables per section and department
- **Classroom Availability** — Check real-time room availability in lecture halls for booking

### Community & Communication

- **Community Posts** — Reddit-style discussion board with upvotes, comments, and topic threads
- **Whisper Room** — Anonymous messaging feature for students
- **Polls & Voting** — Create and participate in campus-wide polls
- **Announcements** — College-wide announcements broadcast to all users
- **AI Chatbot** — College-specific question-answering assistant powered by Google Gemini and Mistral LLMs

### Student Tools

- **Attendance Tracker** — Personal attendance logging and summary views
- **Out Pass System** — Digital out-pass applications and approvals for hostellers
- **Hostel Room Allotment** — Room allocation management for students
- **Career & Benefits** — Career resources and student benefit information
- **User Profiles** — Public student profiles with academic information

### Administrative Dashboards

- **Admin Dashboard** — User management, result imports, bulk operations, and system settings
- **Faculty Dashboard** — Faculty-specific tools and class management
- **CR Dashboard** — Class representative tools for attendance and schedules
- **Warden & Chief Warden Dashboards** — Hostel management, out-pass approvals, and room allotment
- **Guard Dashboard** — Gate pass verification tools
- **Role-Based Access Control** — Granular permissions for Admin, Faculty, Student, CR, HOD, Warden, Chief Warden, and Guard roles

### Technical Capabilities

- **Progressive Web App (PWA)** — Installable on mobile and desktop with offline capabilities via Serwist service worker
- **Real-time Updates** — Live data sync via Socket.IO WebSockets
- **Multi-Database Architecture** — MongoDB for documents, PostgreSQL for relational data, Redis for caching
- **AI-Powered Features** — LLM-based chatbot and content generation via Vercel AI SDK
- **Email Notifications** — Templated transactional emails (welcome, password reset, result updates)
- **Excel Import/Export** — Bulk data operations via ExcelJS and read-excel-file
- **Sitemap & SEO** — Dynamic sitemap generation and OpenGraph image support
- **Dark Mode** — System-aware theme switching via next-themes

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Bun](https://bun.sh/) >= 1.3 (package manager)
- [Docker](https://www.docker.com/) and Docker Compose (for local infrastructure)
- [Go](https://go.dev/) >= 1.24 (for the Go server)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/kanakkholwal/college-ecosystem.git
cd college-ecosystem

# Copy environment template and configure
cp .env.example .env

# Start all services
docker compose up --build
```

This starts the full stack:

| Service | URL |
|---|---|
| Platform | http://localhost:3000 |
| Mail Server | http://localhost:3001 |
| Website | http://localhost:3002 |
| Server | http://localhost:8080 |

### Local Development (without Docker)

```bash
# Install all workspace dependencies
bun install

# Run all apps concurrently
bun run dev

# Or run individual apps
bun run dev:platform    # Platform on :3000
bun run dev:server      # Server on :8080
bun run dev:mail        # Mail Server on :3001
bun run dev:website     # Website on :3002
```

### Database Setup

```bash
# Push Drizzle schema to PostgreSQL
cd apps/platform
bun run db:push

# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate
```

---

## CI/CD & GitHub Workflows

The project uses GitHub Actions for continuous deployment with path-based triggers — only deploying services that have changed.

| Workflow | Trigger | Target | File |
|---|---|---|---|
| **Deploy Platform** | Push to `main` in `apps/platform/**` | Vercel (Production) | [`cd-platform-vercel.yml`](.github/workflows/cd-platform-vercel.yml) |
| **Deploy Server** | Push to `main` in `apps/server/**` | Vercel (Production) | [`cd-server-vercel.yml`](.github/workflows/cd-server-vercel.yml) |

Both workflows:
1. Check out code and set up Bun
2. Install dependencies
3. Run linting and tests
4. Build and deploy to Vercel (production on `main`, preview on PRs)

> See [`deployment.md`](deployment.md) for Google Cloud Run deployment instructions (Docker-based).

---

## Deployment

The project supports multiple deployment targets:

| App | Production Host | Method |
|---|---|---|
| Platform | [Vercel](https://vercel.com/) | GitHub Actions → Vercel CLI |
| Website | [Vercel](https://vercel.com/) | GitHub Actions → Vercel CLI |
| Server | [Vercel](https://vercel.com/) / [GCP Cloud Run](https://cloud.google.com/run) | GitHub Actions → Vercel CLI / Docker |
| Go Server | [GCP Cloud Run](https://cloud.google.com/run) | Docker container |
| Mail Server | [Cloudflare Workers](https://workers.cloudflare.com/) | OpenNext + Wrangler |

For self-hosting with Docker Compose, see the [Quick Start](#quick-start-with-docker) section. For GCP Cloud Run, see [`deployment.md`](deployment.md).

---

## Contributing

We welcome contributions of all kinds — code, design, documentation, and bug reports.

Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) for:
- Development setup instructions
- Coding guidelines and commit conventions
- How to submit pull requests
- Design contribution opportunities

---

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE).
