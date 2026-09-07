# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BRMW is a database modeling web application built with React and JointJS (@joint/core, open source) for diagram creation. It runs entirely in the browser: there is no backend, and models persist in `localStorage` through `app/react/services/modelStore.ts` (one entry per model under the `brmw.model.<id>` key). Routes are `/` (models list), `/conceptual/:id`, `/logic/:id` and `/nosql/:id`. Editor widgets (shape palette, selection, element toolbar, element resizer, canvas, snaplines, clipboard, command manager, print) are custom implementations in `app/editor/`.

## Development Commands

### Building and Running
- `pnpm run:fe` - Start webpack dev server (port 9000)
- `pnpm build` - Production build (outputs to app/dist)

### Testing
- `pnpm test` - Run all tests (Jest with coverage)
- `pnpm test:watch` - Run tests in watch mode

## Architecture

### Frontend Structure (`app/react/`)
- TypeScript with styled-components
- Pages-based architecture: `pages/`, `components/`, `containers/`, `services/`, `router/`
- Routing via `react-router-dom` v7 with `createBrowserRouter` and lazy route loading (`app/react/router/index.tsx`)
- Entry point: `app/react/index.tsx` (mounts via `createRoot`)
- i18n via `react-i18next`
- Path aliases: `@components/*`, `@pages/*`, `@containers/*`, `@enums/*`, `@services/*`

### Persistence
- `app/react/services/modelStore.ts` wraps `localStorage`; no network calls anywhere in the app

### Build System
- Webpack 5 with TypeScript/Babel compilation
- Entry point: `app/react/index.tsx`
- TypeScript config: `app/react/tsconfig.json`
- Sass compilation with PostCSS processing
- Dev server on port 9000

## Page Structure Pattern

Each page follows a Wrapper + Page split to keep routing/service wiring separate from view logic:
- `<Page>Wrapper.tsx` - reads route params (`useParams`), composes providers, fetches services, and passes callbacks to the inner component
- `<Page>.tsx` - pure presentational/container component receiving data and callbacks via props

This pattern lets the wrapper own router/service coupling while the page stays easy to test in isolation.

## Modal Pattern

Modals are React components opened via context-based providers (e.g., `useConfirmationModal` in `app/react/components/ConfirmationModal/`). New modals should follow the same pattern: a provider mounted near the app root and a hook returning an `open`/`confirm`-style function that resolves a Promise.

Cancel UX convention: when a modal is `cancelable`, both Esc and click-outside should dismiss it (return cancel/reject).

## Model Versioning

- `modelStore.updateModel` increments `version` on each save; new models start at `0`

## Code Style

### General
- Follow `.editorconfig` definitions to write code

### React Components
- Use TypeScript with strict typing
- Functional components with hooks
- styled-components for styling
- Use existing theme structure in `app/react/theme/`
- Avoid obvious comments; code should be self-explanatory

### Testing
- Jest for unit tests (`app/**/*.test.*`)
- Component tests use `@testing-library/react`

### CSS & Sass
- Use native CSS variables
- Avoid Sass specific features
- Create "comment headers blocks" following existent pattern with "//" instead of CSS comments

## Environment Setup

Required:
- Node.js 24.x
- pnpm 10.x

Development workflow:
1. Run `pnpm run:fe`
2. Access application at http://localhost:9000

## Key Dependencies

- **Frontend**: React 19, react-router-dom 7, styled-components 6, react-i18next, @radix-ui/react-dialog
- **Build**: Webpack 5, TypeScript 5, Babel 7
- **Testing**: Jest 30, @testing-library/react 16
- **Diagramming**: JointJS open source (@joint/core) + custom editor widgets in `app/editor/`

## Git Conventions

### Branch Naming
- `feature/<name>` for new features
- `fix/<name>` for bug fixes
- `enhancement/<name>` for improvements

### Commit Prefixes
- `Feat:` new feature
- `Fix:` bug fix
- `Refactor:` code restructuring
- `Docs:` documentation changes
- `Chore:` maintenance tasks

### Workflow
- Unless specified otherwise, each issue should be worked on in a new branch created from `main`

## Database Modeling Features

The application provides:
- Visual database diagram creation using Joint.js
- Conceptual (EER), logical (relational), and NoSQL modeling paradigms with conversion between them
- Model persistence in the browser (`localStorage`)
- Multi-language support (i18n)
- SQL generation and printing
