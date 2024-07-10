# College Ecosystem

[![Trigger Deployments](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/kanakkholwal/college-ecosystem/actions/workflows/deploy.yml)

Welcome to the College Ecosystem monorepo, housing various projects related to college management and services. This repository utilizes Yarn Workspaces and Turbo Repo for efficient project management.

## Directory Structure

The repository is structured to accommodate multiple projects:

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

## Setup

To get started with the College Ecosystem on your local machine, follow these steps:

### Clone the Repository

```bash
git clone https://github.com/kanakkholwal/college-ecosystem.git
cd college-ecosystem

```

### Install Dependencies

```bash
yarn install
# or
npm install
```

This command installs dependencies for all projects defined in the apps directory.

#### For individual projects

```bash
npm install --workspace=platform
```

#### Specific package

```bash
npm install some-package --workspace=platform
```

## Projects

The College Ecosystem includes the following projects:

- [College Platform](https://app.nith.eu.org/) : centralized platform that is multifunctional, user-friendly platform for all.
- [College Website](https://nith.eu.org) : landing page website
- [Go Server (No ready yet)](https://go-apis.nith.eu.org) : For concurrent queues and heavy scraping jobs

```bash
cd college-ecosystem
yarn run build
```

## Usage

### Running Projects

To run individual projects locally:

#### College Platform

```bash
yarn workspace platform run dev
# or
npm run --workspace=platform dev
# or
npx turbo run dev --filter=platform
```

#### Website

```bash
yarn workspace website run dev
# or
npm run --workspace=website dev
# or
npx turbo run dev --filter=website
```

### Building Projects

To build individual projects for production:

#### Platform

```bash
yarn workspace platform run build
# or
npm run --workspace=platform build

```

#### Website (landing)

```bash
yarn workspace website run build
# or
npm run --workspace=website build

```

### Running Turbo Commands

To utilize Turbo Repo for optimized workflows:

```bash
yarn turbo run [command]
```

Replace [command] with `build`, `dev`, `lint`, or `test` as needed.

## Scripts

The root `package.json` file defines scripts for common tasks:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```
