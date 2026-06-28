# Product Foundation Plan

## Product Defaults

FounderFile is a guided compliance and document-preparation web app. It should feel like a practical setup console, not a generic legal blog or marketing site.

The product should serve:

- Edward's exact Whale Tales Labs setup path first.
- Other California solo founders with the same basic path.
- Future users who need a staged business setup: sole proprietor validation first, LLC later.

The app should not give legal advice. It should provide structured guidance, official-source links, document prep, form walkthroughs, progress tracking, and "review before filing" reminders.

## Core Product Promise

The user can answer guided questions once, then the app turns those answers into:

- A personalized business setup roadmap.
- A Phase 0 sole proprietor checklist.
- A Phase 1 California LLC checklist.
- Generated document drafts.
- Government online-form walkthroughs.
- Compliance reminders.
- A dashboard showing what is done, blocked, ready, or not yet needed.

## Primary User Types

- Solo founder: the main user; owns one or more products and wants to get business-compliant.
- Returning founder: comes back to continue a setup checklist or update answers.
- Admin/content editor: internal role for maintaining walkthrough content, source links, document templates, and compliance rules.

Future roles:

- Advisor/reviewer: a CPA, lawyer, or trusted collaborator invited to review a user's packet.

## Main Domain Objects

- User
- Founder profile
- Business profile
- Product/business line
- Formation path
- Phase
- Task/checklist item
- Government form walkthrough
- Document template
- Generated document
- Compliance requirement
- Official source
- Filing record
- Reminder
- Support/contact request

## Public Site Defaults

The app should include the standard public site pages from the foundation playbook:

- Home / landing
- About
- Contact
- Pricing
- FAQ
- Privacy
- Terms

Public positioning:

- "A guided setup workspace for California solo founders."
- "Start as a sole proprietor, know when to form an LLC, and keep your documents organized."
- Keep visible disclaimers that this is not legal/tax/accounting advice.

Public footer/legal-operator policy:

- Product/brand name: FounderFile.
- Phase 0 legal operator: Edward Lee.
- Phase 0 footer example: `© 2026 Edward Lee. FounderFile.`
- Phase 0 terms/privacy should identify Edward Lee as the operator.
- Future Phase 1 legal operator after formation: Whale Tales Labs LLC.
- Future Phase 1 footer example: `FounderFile is a product of Whale Tales Labs LLC.`
- Do not use Whale Tales Labs publicly as the seller/operator/company during Phase 0 unless a DBA/FBN is filed first.

## Logged-In App Defaults

Logged-in app sections:

- Dashboard
- Setup Roadmap
- Phase 0: Sole Proprietor
- Phase 1: LLC Formation
- Documents
- Online Form Walkthroughs
- Compliance Center
- Business Profile
- Products / Business Lines
- Filing Records
- Reminders
- Settings
- Support

Dashboard should answer:

- What phase am I in?
- What should I do next?
- What documents are ready?
- What forms need to be filled out online?
- What compliance tasks are recurring?
- What should I avoid doing until I file a DBA/FBN or form an LLC?

## Navigation Defaults

Desktop:

- Left sidebar for logged-in app navigation.
- Top bar with current business profile, phase, and account menu.
- Dashboard cards for progress and next actions.

Mobile:

- Bottom or drawer navigation.
- Prioritize "Next Step", "Roadmap", "Documents", and "Profile".

Account menu:

- Account settings
- Business profile
- Privacy
- Terms
- Contact/support
- Logout

## Account/Auth Defaults

Required:

- Sign up
- Sign in
- Forgot password
- Reset password
- Email verification
- Session persistence

Recommended auth model:

- Email/password first.
- Magic link or OAuth later if useful.

User data is sensitive because it may include legal name, home/business address, tax setup choices, product details, and compliance decisions. Security and privacy should be treated as core app requirements.

## Role And Multi-Tenancy Defaults

Initial model:

- Single-user business workspace.
- One user can have one or more business profiles later, but V1 can assume one active business profile.

Roles:

- Owner: owns the business setup workspace.
- Admin: internal platform admin/content editor.

Later:

- Reviewer: invited read/comment access for a CPA, lawyer, brother/cofounder, or advisor.

Tenant isolation:

- Every business profile belongs to a user/workspace.
- Generated documents, answers, reminders, and filing records must be scoped to that owner.

## Data/Backend Defaults

Use a backend that supports:

- Auth.
- Structured relational-ish data.
- Server-side document generation.
- Scheduled reminders.
- Audit/activity history.
- Admin-managed content.

Likely stack options:

- Next.js app on Vercel.
- Convex for fast product iteration, auth integration, server functions, and reactive dashboard state.
- Alternatively Supabase/Postgres if SQL/reporting and relational constraints become more important.

Recommendation for first implementation:

- Next.js + TypeScript frontend.
- Convex backend for auth/data/functions.
- Turborepo monorepo.
- Vercel deployment.
- Convex Auth as the first auth choice, with Clerk as fallback only if Convex Auth blocks required flows.
- Resend for transactional email.
- Document drafts generated from Markdown/HTML templates first.
- PDF/DOCX export later if needed.

## Messaging/Email/Notifications Defaults

Required:

- Email verification.
- Password reset.
- Contact/support routing.

Later:

- Reminder emails for recurring compliance tasks.
- "Your document packet is ready" emails.
- "Your next filing deadline is coming up" emails.

## Analytics/Reporting Defaults

Founder dashboard metrics:

- Setup completion percent.
- Phase 0 progress.
- Phase 1 readiness.
- Documents ready.
- Forms remaining.
- Compliance tasks due soon.

Admin metrics:

- Signup count.
- Activation rate.
- Completion rate by phase.
- Most common blocked steps.
- Document-generation usage.

## Deployment/Infrastructure Defaults

Preferred deployment:

- Vercel for the web app.
- Convex for backend, data, scheduled jobs, and auth integration.
- Resend for transactional email.
- Turborepo for the monorepo.

Environment rules:

- No SSNs, tax IDs, or sensitive government IDs should be stored in V1 unless absolutely necessary.
- Stripe sole proprietor guidance can explain what the user needs to enter into Stripe, but the app should not collect or store the user's SSN.

## Per-Project Overrides

Use these parts of the foundation playbook:

- Public site pages.
- Auth.
- Dashboard.
- Sidebar/topbar/account menu.
- Settings.
- Admin/content role.
- Privacy/terms/contact.

Do not overbuild at first:

- No full team/workspace invite system in V1.
- No complex staff roles.
- No marketplace.
- No payment subscription until the guided workflow proves useful.
- No C-Corp flow in V1 beyond "later if needed" educational notes.

## Open Questions

- Should the first app be free/internal first, or paid from the start?
- Should document exports be Markdown first, then PDF/DOCX later?
- Should official-source updates be manually maintained by admin, or later monitored automatically?
- Should the user be allowed to choose non-California states in V1, or should V1 be California-only?
- Should Bloom Studios be included as a separate advanced scenario, or stay out of V1?
