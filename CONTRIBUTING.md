# Contributing to College Ecosystem

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to the College Ecosystem project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
  - [Design Icons Or Layouts](#design-icons-and-layouts)
  - [Help Needed](#help-needed)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [License](#license)

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for College Ecosystem. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

Before creating a bug report, please check if an issue already exists.

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/kanakkholwal/college-ecosystem/issues).
- **If you're unable to find an open issue addressing the problem,** open a new one.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for College Ecosystem, including completely new features and minor improvements to existing functionality.

Before creating an enhancement suggestion, please check if an issue already exists.

- **Ensure the enhancement was not already suggested** by searching on GitHub under [Issues](https://github.com/kanakkholwal/college-ecosystem/issues).
- **If you're unable to find an open issue addressing the suggestion,** open a new one.

### Design Icons and Layouts

Designers can contribute to the frontend applications by creating and improving the visual elements of the project. Here are some ways designers can help:

- **Create Icons**: Design custom icons that align with the project's theme and improve the user interface.
- **Design Layouts**: Propose new layouts or improve existing ones to enhance user experience and accessibility.
- **Style Guides**: Develop and maintain a style guide to ensure consistency across the application.
- **Review UI/UX**: Provide feedback on the user interface and user experience, suggesting improvements where necessary.
- **Collaborate with Developers**: Work closely with developers to implement designs and ensure they are feasible and functional.

To contribute, designers can:

1. Fork the repository and create a branch for their design changes.
2. Add or update design files in the appropriate directory.
3. Submit a pull request with a description of the changes and any relevant design files or mockups.

### Help Needed

- **AI Chatbot**: Create a chatbot with open source LLM or free LLM api (that don't use ou data to train) to help question-answer about platform and anything abou the college.
- **Create Icons**:Create or design a set of Svg icons for the platform with consistent stroke and style

### Pull Requests

The process described here has several goals:

- Maintain the quality of the codebase
- Fix bugs or introduce new features
- Discuss code changes

Please follow these steps:

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Yarn](https://yarnpkg.com/) or [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Next.js](https://nextjs.org/docs)

### Initial Setup

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
# or
pnpm install --no-frozen-lockfile --prod=false

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

## Usage

### Running Projects/Apps (app/\*)

To run individual projects locally:

```bash
yarn workspace [app-name] run dev
# or
npm run --workspace=[app-name] dev
# or
turbo dev --filter=[app-name]
# e.g.
turbo dev --filter=platform

```

### Building Projects/Apps (app/\*)

To build individual projects for production:

#### Platform

```bash
yarn workspace [app-name] run build
# or
npm run --workspace=[app-name] build
# or
turbo build --filter=[app-name]
# e.g.
turbo build --filter=platform


```

### Running Turbo Commands

To utilize Turbo Repo for optimized workflows:

```bash
yarn turbo run [command]
# or
npx turbo run [command]
# or
turbo [command]
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
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,md}\""
  }
}
```
