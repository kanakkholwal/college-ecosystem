# College Ecosystem

[![🧹 Lint project](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/lint.yml/badge.svg)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/lint.yml)
[![🚀 Deployments](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/deploy.yml/badge.svg)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/github-code-scanning/codeql)

**College Ecosystem** is a monorepo for various projects aimed at creating a comprehensive platform for managing and interacting with different aspects of a college environment. It includes frontend applications built with Next.js and a backend server using Express and TypeScript.

[![ScreenShot](screenshot.png)](https://app.nith.eu.org)

Learn more

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kanakkholwal/college-ecosystem)
<!-- Welcome to the College Ecosystem monorepo, housing various projects related to college management and services. This repository utilizes Yarn Workspaces and Turbo Repo for efficient project management. -->

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Contributing](#contributing)
<!-- - [License](#license) -->

## Features

- [**Platform**](https://app.nith.eu.org): A Next.js application for the main platform.
- [**Website**](https://nith.eu.org): A Next.js application for the college website.
- **Server**: An Express server with TypeScript for backend operations.
- **Modular Architecture**: Scalable and maintainable project structure.

## Project Structure

```bash
/college-ecosystem
  /apps
    /platform      # College Platform (app.nith.eu.org)
    /website       # Website          (nith.eu.org)
  /turbo.json      # Turbo Repo configuration
  /package.json    # Root package.json with Yarn workspaces configuration
  /.gitignore      # Git ignore file
  /README.md       # This readme file
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Express, TypeScript, Node.js
- **Database**: MongoDB with mongoose,Upstash Redis, Postgres SQL with Drizzle ORM
- **Build Tools**: Turbo
- **Other**: Docker, ESLint, Prettier (Biome on local), Jest

## Deployment

### GitHub Actions

We use GitHub Actions to automate the deployment process for both Vercel and Docker, [deploy](.github/workflows/deploy.yml).

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
