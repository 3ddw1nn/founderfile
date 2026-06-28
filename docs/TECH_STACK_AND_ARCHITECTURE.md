# Tech Stack And Architecture

## Stack Decision

Use:

- Next.js for the web app.
- Vercel for hosting and previews.
- Convex for backend, database, server functions, realtime dashboard state, scheduled jobs, and auth integration.
- Turborepo for the monorepo.
- TypeScript across the app.
- Resend for transactional email.

Auth decision:

- Use Convex Auth as the default first choice because it is designed to work directly with Convex data and server functions.
- Start with email/password plus email verification if supported cleanly by the selected auth setup.
- Add magic links or OAuth later only if they materially improve conversion.

If Convex Auth creates friction during implementation, fallback option:

- Clerk with Convex integration.

Do not use a separate auth/database system unless there is a strong product reason.

## Monorepo Layout

Target structure:

```text
founderfile/
├── apps/
│   └── web/                 # Next.js app deployed to Vercel
├── convex/                  # Convex schema, queries, mutations, actions, crons
├── packages/
│   ├── shared/              # Shared TypeScript types, constants, validation schemas
│   ├── documents/           # Document template helpers and rendering utilities
│   └── config/              # Shared eslint/tsconfig/tailwind config if needed
├── docs/                    # Planning and product documentation
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

V1 can start with only `apps/web`, `convex`, and `packages/shared`. Add `packages/documents` when document rendering becomes large enough to deserve its own package.

## App Architecture

### Public Site

Next.js app routes:

- `/`
- `/about`
- `/pricing`
- `/faq`
- `/contact`
- `/privacy`
- `/terms`
- `/sign-in`
- `/sign-up`

Purpose:

- Explain the product.
- Show the staged setup path.
- Capture signups.
- Provide required legal/policy pages.

Footer/legal-operator implementation:

- Phase 0 footer text should identify `Edward Lee` as the operator.
- Default Phase 0 footer copy: `© 2026 Edward Lee. FounderFile.`
- Terms and privacy pages should use the same Phase 0 operator.
- After `Whale Tales Labs LLC` is formed, this can be changed to `FounderFile is a product of Whale Tales Labs LLC.`
- Do not ship a public footer that names Whale Tales Labs as the seller/operator during Phase 0 unless a DBA/FBN has been filed first.

### Logged-In App

App routes:

- `/dashboard`
- `/dashboard/roadmap`
- `/dashboard/phase-0`
- `/dashboard/phase-1`
- `/dashboard/documents`
- `/dashboard/walkthroughs`
- `/dashboard/compliance`
- `/dashboard/business`
- `/dashboard/products`
- `/dashboard/filings`
- `/dashboard/reminders`
- `/dashboard/settings`
- `/dashboard/support`

Admin routes:

- `/admin`
- `/admin/sources`
- `/admin/walkthroughs`
- `/admin/templates`
- `/admin/rules`
- `/admin/support`

## Backend Architecture

Convex owns:

- Auth-linked users.
- Founder profiles.
- Business profiles.
- Product lines.
- Setup answers.
- Roadmap tasks.
- Walkthrough content.
- Document templates.
- Generated document records.
- Filing records.
- Compliance requirements.
- Reminders.
- Support requests.
- Admin content.

Convex functions:

- Queries for dashboard views.
- Mutations for intake answers and task progress.
- Actions for email sending through Resend.
- Scheduled jobs for reminder generation.
- Internal functions for roadmap/rule evaluation.

## Data Flow

1. User signs up.
2. App creates or loads user profile from Convex.
3. User completes founder/business intake.
4. Convex mutation saves answers.
5. Rule engine derives recommended phase, tasks, warnings, and document readiness.
6. Dashboard queries render progress.
7. User opens a walkthrough or generates a document.
8. Generated document is saved as a versioned record.
9. User marks tasks complete and uploads/records filing confirmations.
10. Reminder system schedules or displays future compliance items.

## Document Generation Architecture

V1 approach:

- Store document templates as Markdown or structured template blocks.
- Merge user/business answers into templates server-side.
- Save generated output as Markdown.
- Let users copy, download Markdown, or print from the browser.

Later:

- PDF export.
- DOCX export.
- Version comparisons.
- Review comments.
- E-signature integrations if needed.

Template rules:

- Every generated document must show generation date.
- Every generated document must include "not legal/tax/accounting advice" where appropriate.
- Every generated document must show the source profile used.
- Never include SSNs in generated documents.

## Security And Privacy Architecture

V1 restrictions:

- Do not collect SSNs.
- Do not store tax IDs.
- Do not store payment card data.
- Do not store government login credentials.
- Do not auto-file government forms.

Sensitive user data:

- Legal name.
- Business address or home-office address.
- Product details.
- Filing status.
- Compliance decisions.
- Uploaded receipts/confirmations.

Security requirements:

- All user-owned records must be scoped by `userId` or `workspaceId`.
- Admin views must be role-gated.
- Use server-side checks in Convex functions, not only UI hiding.
- Keep audit/activity records for important actions.
- Keep environment variables out of the client unless explicitly public.

## UI Architecture

Use a practical app-shell pattern:

- Public marketing layout.
- Auth layout.
- Dashboard layout.
- Admin layout.

Core components:

- Sidebar.
- Top bar.
- Account menu.
- Stepper/progress indicator.
- Task list.
- Checklist item.
- Document card.
- Walkthrough step.
- Compliance status badge.
- Source citation block.
- Warning callout.
- Empty state.

Design direction:

- Calm, structured, high-trust.
- More like a compliance workspace than a flashy startup landing page.
- Dense enough to be useful, but friendly enough for non-lawyers.

## Development Standards

- TypeScript strict mode.
- Shared Zod validators or Convex validators for input boundaries.
- Keep business rules in shared/rules modules or Convex internal functions, not scattered through React components.
- Keep document templates versioned.
- Use stable enums for phase/task/status values.
- Add tests around rule evaluation and document generation before expanding state coverage.
