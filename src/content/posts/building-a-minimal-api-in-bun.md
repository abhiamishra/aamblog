---
title: "Building a Minimal REST API with Bun from Scratch"
author: Abhi Mishra
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
