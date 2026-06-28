# Implementation Roadmap

## Phase 0: Planning And Content Model

Status: current.

Deliverables:

- Product foundation plan.
- Business formation domain plan.
- Tech stack and architecture plan.
- Convex data model plan.
- Auth/email/deployment plan.
- Initial information architecture.
- Data model draft.
- Source-link inventory.
- Decide first technical stack.

## Phase 1: App Scaffold

Goal:

- Build the public site, auth shell, and dashboard shell.

Pages:

- Home
- About
- Pricing
- FAQ
- Contact
- Privacy
- Terms
- Sign up
- Sign in
- Forgot/reset password
- Dashboard

Dashboard shell:

- Sidebar navigation.
- Top bar.
- Account menu.
- Business profile prompt.
- Empty-state roadmap.

Recommended stack:

- Next.js + TypeScript.
- Tailwind.
- shadcn/Base UI style components if used.
- Vercel for hosting.
- Convex for backend/data/server functions/scheduled jobs.
- Convex Auth first, with Clerk as fallback only if needed.
- Resend for transactional email.
- Turborepo + pnpm workspace.

## Phase 2: Founder Intake And Personalized Roadmap

Goal:

- Convert user answers into a setup roadmap.

Features:

- Founder profile intake.
- Business profile intake.
- Product/business line intake.
- Phase recommendation engine.
- Personalized dashboard.
- Task statuses: not started, in progress, blocked, ready, complete, not needed.

First rules:

- If no LLC exists, recommend Phase 0.
- If user operates under personal legal name, do not recommend DBA/FBN.
- If user uses a separate business name before LLC, flag DBA/FBN.
- If user accepts payments, unlock Stripe setup checklist.
- If user sells tangible goods, unlock seller's permit decision.
- If user has meaningful risk/revenue/contracts/contractors/user data, suggest Phase 1 LLC readiness.

## Phase 3: Phase 0 Sole Proprietor Workflow

Goal:

- Give Edward and similar users a complete sole proprietor setup guide.

Features:

- Irvine business license walkthrough.
- Stripe sole proprietor setup worksheet.
- DBA/FBN decision guide.
- Product-line bookkeeping setup.
- Domain ownership record.
- Terms/privacy readiness checklist.
- Filing records upload/notes.

Documents:

- Sole proprietor startup checklist.
- Irvine business license prep worksheet.
- Stripe setup worksheet.
- DBA/FBN decision memo.
- Product-line accounting worksheet.
- Domain ownership memo.

## Phase 4: Phase 1 Whale Tales Labs LLC Workflow

Goal:

- Prepare the user to form a California LLC when the trigger is reached.

Features:

- LLC readiness assessment.
- Whale Tales Labs LLC formation packet.
- SOS/BizFile Articles walkthrough.
- Statement of Information walkthrough.
- EIN walkthrough.
- Bank account checklist.
- Stripe/vendor migration checklist.
- IP/domain assignment checklist.
- Compliance calendar.

Documents:

- LLC formation intake.
- Articles of Organization prep worksheet.
- Statement of Information prep worksheet.
- EIN prep worksheet.
- Operating agreement outline.
- Founder IP assignment outline.
- Domain transfer/assignment memo.
- Compliance calendar.

## Phase 5: Document Center

Goal:

- Central place for all generated and manually uploaded documents.

Features:

- Document library.
- Template preview.
- Generate from answers.
- Regenerate after profile changes.
- Mark reviewed.
- Export Markdown.
- PDF/DOCX export later.
- Upload receipts/confirmations.

Document categories:

- Setup worksheets.
- Government form prep.
- Internal records.
- Legal/policy drafts.
- Filing receipts.
- Compliance calendar.

## Phase 6: Compliance Center

Goal:

- Make ongoing compliance visible and manageable.

Features:

- One-time task tracking.
- Recurring task tracking.
- Deadline reminders.
- Risk trigger alerts.
- Official-source links.
- "Verify before filing" reminders.

Initial recurring items:

- LLC Statement of Information every two years after formation.
- LLC annual tax reminder.
- Business license renewal if applicable.
- Terms/privacy review.
- Domain renewal reminder.

## Phase 7: Admin Content Tools

Goal:

- Let internal admins update official-source links, walkthroughs, templates, and compliance rules without code edits.

Admin areas:

- Sources.
- Walkthroughs.
- Document templates.
- Compliance rules.
- Disclaimers.
- FAQ.
- Contact/support messages.

## Phase 8: Monetization

Not required for V1, but plan for:

- Free checklist tier.
- Paid document packet.
- Paid guided setup workspace.
- Subscription for reminders/compliance.
- Optional expert-review marketplace later.

## MVP Definition

MVP is successful when a user can:

- Create an account.
- Complete the founder/business intake.
- See that Phase 0 is recommended.
- Follow the Irvine sole proprietor setup path.
- Generate the Phase 0 prep packet.
- Understand exactly when Phase 1 LLC formation should happen.
- Generate the Whale Tales Labs LLC prep packet when ready.
- Track completed filings and next steps.

## Non-Goals For V1

- No automated government filing.
- No legal advice.
- No CPA/tax advice.
- No SSN collection.
- No Delaware C-Corp workflow beyond educational notes.
- No multi-state support.
- No complex team/workspace system.
- No full e-signature workflow.
