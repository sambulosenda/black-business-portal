# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.3 business portal application using:
- TypeScript with strict mode
- Tailwind CSS v4 (using new PostCSS plugin approach)
- React 19
- App Router architecture
- Turbopack for development

## Development Commands

```bash
# Install dependencies (using Bun)
bun install

# Run development server with Turbopack
bun dev

# Build for production
bun build

# Start production server
bun start

# Run linting
bun lint
```

## Architecture

### App Router Structure
- `/src/app/` - Main application directory using Next.js App Router
- `/src/app/layout.tsx` - Root layout with Geist font setup
- `/src/app/page.tsx` - Home page component
- `/src/app/globals.css` - Global styles with Tailwind CSS v4 imports and theme configuration

### Configuration
- **TypeScript**: Path alias `@/*` maps to `./src/*`
- **Tailwind CSS v4**: No separate config file; theme is configured inline in `globals.css`
- **ESLint**: Using new flat config format with Next.js core web vitals rules

### Key Technical Decisions
1. **Tailwind CSS v4**: Using the new PostCSS plugin approach without a separate `tailwind.config.js`
2. **Turbopack**: Enabled by default in dev mode for faster builds
3. **Font Optimization**: Geist Sans and Geist Mono fonts are loaded via `next/font`

### Instructions
1. First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the projectplan.md file with a summary of the changes you made and any other relevant information.

## Workflow Memories
- Everytime you finish a task create a commit 