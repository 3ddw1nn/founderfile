# StartupFiles
Guided business formation SaaS for solo founders — document prep, compliance checklists, and a structured path from sole proprietor to LLC.

> Ponytail rules are global — `~/.claude/CLAUDE.md`. Shortest working diff wins.

## Agent Routing
When a question belongs to a specialist domain (marketing, legal, finance, design, sales, ops, etc.), automatically spawn the best matching agent from `~/.claude/agents/` instead of answering directly.

## Context
- Phase 0: operator is Edward Lee (sole proprietor). Do NOT use "Whale Tales Labs" in public-facing copy until the LLC is formed.
- Phase 1: form `Whale Tales Labs LLC` when revenue, contracts, or user data justify it.
- California-first, then generalize.

## Stack
Next.js · Convex backend · TypeScript — monorepo (pnpm + Turborepo).

---

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
