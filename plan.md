# AstroPaper Blog — Claude Code Plan
> Hand this entire document to Claude Code. It contains every instruction needed to scaffold, configure, write a sample post, and deploy to GitHub Pages.

---

## Overview

Set up a personal blog using [AstroPaper](https://github.com/satnaing/astro-paper) — a minimal, accessible, SEO-friendly Astro theme. Apply the **Paper Dark II** color scheme as the default dark theme. Write one sample blog post that demonstrates technical writing, code highlighting, callouts, and images. Deploy to GitHub Pages via GitHub Actions.

---

## Phase 1 — Scaffold the Project

### 1.1 Clone AstroPaper

### 1.2 Verify it runs locally

```bash
pnpm dev
```

Confirm the dev server starts at `http://localhost:4321` before continuing.

---

## Phase 2 — Configure the Site

### 2.1 Edit `astro-paper.config.ts`

Update the following fields:

```ts
import { defineAstroPaperConfig } from "./src/types";

export default defineAstroPaperConfig({
  site: {
    website: "https://<YOUR_GITHUB_USERNAME>.github.io/my-blog/",
    author: "<Your Name>",
    profile: "https://github.com/<YOUR_GITHUB_USERNAME>",
    desc: "Technical writing, MVP showcases, and research notes.",
    title: "My Blog",
    ogImage: "astropaper-og.jpg",
    timezone: "Europe/London", // adjust to your timezone
  },
  features: {
    lightAndDarkMode: true,
    showArchives: true,
    showBackButton: true,
    dynamicOgImage: true,
    editPost: {
      enabled: false,
    },
  },
});
```

> Replace `<YOUR_GITHUB_USERNAME>` and `<Your Name>` with real values.

### 2.2 Set `base` in `astro.config.ts`

AstroPaper needs a `base` path when hosted at a subpath on GitHub Pages (e.g. `github.io/my-blog`):

```ts
export default defineConfig({
  site: "https://<YOUR_GITHUB_USERNAME>.github.io",
  base: "/my-blog",
  // ... rest of existing config unchanged
});
```

---

## Phase 3 — Apply Paper Dark II Color Scheme

### 3.1 Edit `src/styles/theme.css`

Find the existing `[data-theme="dark"]` block and replace it with the Paper Dark II values:

```css
[data-theme="dark"] {
  --background: #212737;
  --foreground: #eaedf3;
  --accent: #ff6b01;
  --accent-foreground: #ffffff;
  --muted: #343f60;
  --muted-foreground: #afb9ca;
  --border: #ab4b08;
}
```

Leave the `:root, [data-theme="light"]` block untouched — Paper Light remains the light mode.

### 3.2 Set Paper Dark II as the default

In `public/toggle-theme.js`, find where `primaryColorScheme` is set and change it to `"dark"` so first-time visitors land on the dark theme:

```js
const primaryColorScheme = "dark";
```

---

## Phase 4 — Clean Up Sample Content

Delete all existing demo posts so the blog starts clean:

```bash
rm -rf src/content/posts/*
```

Keep the `src/assets/images/` directory but clear any demo images inside it.

---

## Phase 5 — Write the Sample Blog Post

### 5.1 Create the file

Create `src/content/posts/building-a-minimal-api-in-bun.md`

### 5.2 Paste this content exactly

```markdown
---
title: "Building a Minimal REST API with Bun from Scratch"
author: <Your Name>
pubDatetime: 2026-06-01T09:00:00Z
featured: true
draft: false
tags:
  - bun
  - typescript
  - api
  - mvp
description: "A walkthrough of scaffolding a lightweight REST API using Bun's native HTTP server — no frameworks, no bloat, just the runtime."
---

This post documents an MVP I built to test Bun's native HTTP capabilities as a replacement for a Node + Express stack. The goal was a single-file API server that could handle routing, JSON responses, and basic error handling without any dependencies.

## Table of contents

## Why Bun?

Bun is a JavaScript runtime that ships with a bundler, test runner, and package manager built in. Its native `Bun.serve()` API is fast enough that for small internal APIs, pulling in a framework like Hono or Elysia is genuinely optional.

The three properties that made it worth exploring for this MVP:

- **Cold start speed** — Bun starts measurably faster than Node for small scripts
- **Native TypeScript** — no `ts-node` or build step needed during development  
- **Built-in fetch** — the same `fetch` API works server-side without polyfills

## Project Structure

The entire API fits in two files:

```
my-api/
├── index.ts       # server entry point
└── routes.ts      # route handlers
```

No `package.json` dependencies beyond Bun itself.

## The Server

```typescript
// index.ts
import { router } from "./routes";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return router(req);
  },
});

console.log(`Listening on http://localhost:${server.port}`);
```

`Bun.serve()` accepts a `fetch` function that receives a standard `Request` object and must return a `Response`. This mirrors the browser's Fetch API exactly — no proprietary abstractions.

## Routing

Since there's no framework, routing is a plain switch on the URL pathname:

```typescript
// routes.ts
export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);

  switch (url.pathname) {
    case "/health":
      return Response.json({ status: "ok" });

    case "/items":
      if (req.method === "GET") {
        return Response.json({ items: await getItems() });
      }
      if (req.method === "POST") {
        const body = await req.json();
        return Response.json(await createItem(body), { status: 201 });
      }
      return new Response("Method Not Allowed", { status: 405 });

    default:
      return new Response("Not Found", { status: 404 });
  }
}
```

For a real service you'd reach for a proper router. But for an MVP with three endpoints, this is readable and fast to iterate on.

## Data Layer

For the MVP, data lives in memory. This made testing the API shape trivial before committing to a database schema:

```typescript
// still in routes.ts
type Item = { id: number; name: string; createdAt: string };

const items: Item[] = [];
let nextId = 1;

async function getItems(): Promise<Item[]> {
  return items;
}

async function createItem(body: { name: string }): Promise<Item> {
  const item: Item = {
    id: nextId++,
    name: body.name,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  return item;
}
```

Swapping this for a real persistence layer later (SQLite via `bun:sqlite`, Postgres via `postgres`) is a single module replacement.

## Testing It

```bash
# start the server
bun run index.ts

# health check
curl http://localhost:3000/health
# {"status":"ok"}

# create an item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "first item"}'
# {"id":1,"name":"first item","createdAt":"2026-06-01T09:00:00.000Z"}

# list items
curl http://localhost:3000/items
# {"items":[{"id":1,"name":"first item","createdAt":"2026-06-01T09:00:00.000Z"}]}
```

## Observations

After running this for a small internal tool for two weeks, a few things stood out:

**What worked well.** The zero-dependency approach kept the surface area small. There was nothing to update, no CVEs to triage, no transitive dependency surprises. Bun's TypeScript support meant the feedback loop during development was fast.

**What I'd change for production.** The manual routing switch doesn't scale past ~8 endpoints before becoming a maintenance burden. At that point, [Hono](https://hono.dev) is the natural next step — it's framework-thin, Bun-native, and the API surface is minimal enough that switching costs are low.

**Memory as a data layer.** Obvious in hindsight, but worth stating: the in-memory store made writing integration tests trivial. Each test run starts with a clean state. When the time came to migrate to SQLite, the tests caught two edge cases in the new persistence layer immediately.

## Next Steps

The next iteration of this project will:

1. Replace in-memory storage with `bun:sqlite` 
2. Add request validation using [Valibot](https://valibot.dev) (small bundle, fast parse)
3. Write a proper test suite using `bun:test`
4. Containerise with a minimal Dockerfile for deployment

The full source for this MVP is available on GitHub.
```

---

## Phase 6 — GitHub Actions Deployment

### 6.1 Create the workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Phase 7 — Push to GitHub

### 7.1 Create the GitHub repo

Go to [github.com/new](https://github.com/new) and create a **public** repo named `my-blog`. Do not initialise it with a README.

### 7.2 Push

```bash
git add .
git commit -m "initial: AstroPaper with Paper Dark II + sample post"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/my-blog.git
git push -u origin main
```

### 7.3 Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

The Actions workflow will trigger automatically on push. After ~60 seconds the site will be live at:

```
https://<YOUR_GITHUB_USERNAME>.github.io/my-blog/
```

---

## Phase 8 — Verify

Run through this checklist after deployment:

- [ ] Home page loads and shows the sample post
- [ ] Dark mode is on by default (Paper Dark II — dark navy background, orange accents)
- [ ] Light/dark toggle works
- [ ] Sample post renders with syntax highlighting, code blocks, and table of contents
- [ ] URL is `https://<YOUR_GITHUB_USERNAME>.github.io/my-blog/`
- [ ] No 404s on page reload (GitHub Pages handles this via Astro's static output)

---

## Reference — Paper Dark II Colors

| Variable              | Value     | Role                        |
|-----------------------|-----------|-----------------------------|
| `--background`        | `#212737` | Main background (dark navy) |
| `--foreground`        | `#eaedf3` | Body text (near white)      |
| `--accent`            | `#ff6b01` | Links, buttons (orange)     |
| `--accent-foreground` | `#ffffff` | Text on accent backgrounds  |
| `--muted`             | `#343f60` | Card / subtle backgrounds   |
| `--muted-foreground`  | `#afb9ca` | Secondary text              |
| `--border`            | `#ab4b08` | Borders and dividers        |

---

## File Change Summary for Claude Code

| File | Action | Why |
|------|--------|-----|
| `astro-paper.config.ts` | Edit | Site metadata, author, URL |
| `astro.config.ts` | Edit | Add `base: "/my-blog"` for GitHub Pages subpath |
| `src/styles/theme.css` | Edit | Apply Paper Dark II dark theme variables |
| `public/toggle-theme.js` | Edit | Default to dark mode on first visit |
| `src/content/posts/*` | Delete all | Remove demo content |
| `src/content/posts/building-a-minimal-api-in-bun.md` | Create | Sample blog post |
| `.github/workflows/deploy.yml` | Create | GitHub Actions deploy pipeline |
