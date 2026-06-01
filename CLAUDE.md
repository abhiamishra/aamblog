# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**aamblog** — Abhi Mishra's personal blog, built on AstroPaper v6 (Astro 6, TypeScript, TailwindCSS 4). Content covers technical writing, MVP showcases, and research notes. Deployed to GitHub Pages at `https://abhiamishra.github.io/aamblog/`. Content is written in Markdown/MDX and managed via Astro Content Collections.

## Commands

```bash
pnpm dev              # Start dev server at localhost:4321
pnpm build            # Type-check + build + Pagefind index
pnpm preview          # Preview the production build
pnpm lint             # Run ESLint
pnpm format           # Auto-format with Prettier
pnpm format:check     # Check formatting without writing
pnpm sync             # Regenerate Astro TypeScript types
```

> Node >=22.12.0 and pnpm 11.3.0 required (declared in `package.json` `packageManager` field).

## Architecture

### Configuration

Site behavior is customized in two places:
- **`astro-paper.config.ts`** — the primary user config: site URL, title, author, social links, features (light/dark mode, dynamic OG images, archives, search type, edit-post links), and pagination counts.
- **`astro.config.ts`** — framework-level config: markdown plugins (remark TOC, remark-collapse), Shiki code highlighting themes, font loading, sitemap/RSS.
- **`src/config.ts`** — merges user config with defaults; import from here, not `astro-paper.config.ts`.

### Content

Posts live in `src/content/posts/` (nested dirs supported). Static pages are in `src/content/pages/`. Frontmatter schema is defined in `src/content.config.ts` using Zod.

Key post frontmatter fields:
- `pubDatetime` / `modDatetime` — control publish date and "updated" badge
- `draft: true` — hides post in production (visible in dev)
- `featured: true` — surfaces post on homepage
- `tags` — array of strings, used for tag pages
- `ogImage` — path or URL; if omitted, a dynamic OG image is generated via Satori

### Routing

`src/pages/` maps to routes:
- `index.astro` → `/` (home, shows featured + recent posts)
- `posts/[...page].astro` → `/posts` (paginated)
- `posts/[...slug]/index.astro` → individual post
- `tags/`, `archives/`, `search.astro`, `about.astro` — supporting pages
- `rss.xml.ts`, `robots.txt.ts`, `og.png.ts` — generated files

### Utilities

Core helpers in `src/utils/`:
- `getSortedPosts.ts` — filters drafts, respects scheduled posts, sorts by date
- `postFilter.ts` — eligibility logic (draft flag, future datetime)
- `getUniqueTags.ts`, `getPostsByGroupCondition.ts` — used by tag/archive pages
- `slugify.ts` — used everywhere URLs are derived from text

### Styling

TailwindCSS 4 with three style files in `src/styles/`:
- `global.css` — base styles and CSS variables
- `theme.css` — light/dark theme color tokens
- `typography.css` — prose and text configuration

### Internationalization

English-only by default. Translations in `src/i18n/lang/en.ts`; date/number formatting in `src/i18n/format.ts`. The schema supports adding new locale files.

### Dynamic OG Images

Generated at build time using Satori + Sharp. Entry point: `src/pages/posts/[...slug]/index.png.ts` (per-post) and `src/pages/og.png.ts` (default).

## CI / Deploy

- **`.github/workflows/ci.yml`** — runs on PRs: `pnpm install --frozen-lockfile` → lint → format:check → build. Node 24, pnpm 11.3.0. Timeout: 3 minutes.
- **`.github/workflows/deploy.yml`** — triggers on push to `main` via `withastro/action@v3` (auto-detects pnpm from lockfile, Node 22). Uploads `dist/` as a Pages artifact and deploys via `actions/deploy-pages@v4`.
- **`pnpm-workspace.yaml`** — declares `packages: ['.']` (required by pnpm) plus `allowBuilds` for `esbuild` and `sharp`.
