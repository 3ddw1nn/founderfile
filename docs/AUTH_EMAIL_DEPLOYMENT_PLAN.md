# Auth, Email, And Deployment Plan

## Auth Recommendation

Use Convex Auth first.

Why:

- It is built to work with Convex data and server functions.
- It keeps the app's core identity model close to the backend.
- It avoids adding a second major platform before the product needs it.

Initial auth features:

- Sign up.
- Sign in.
- Forgot password.
- Reset password.
- Email verification if supported cleanly.
- Session persistence.
- Logout.

Auth providers:

- Email/password first.
- Magic link later if it improves user experience.
- Google OAuth later if conversion needs it.

Fallback:

- Clerk with Convex integration if Convex Auth blocks required flows or slows implementation too much.

## User And Role Model

V1 roles:

- `owner`: normal user who owns a business setup workspace.
- `admin`: internal user who can manage content, sources, templates, walkthroughs, and support requests.

V1 workspace:

- One workspace per user.
- One active business profile per workspace.
- Add multiple business profiles or reviewer invites later.

## Email With Resend

Use Resend for transactional email.

Initial email types:

- Email verification.
- Password reset.
- Contact/support notification.

Later email types:

- Setup reminder.
- Filing deadline reminder.
- Document packet ready.
- Compliance source updated.
- Trial/subscription email if monetized.

Implementation approach:

- Keep email sending server-side in Convex actions.
- Store email event records for audit/debugging.
- Use templates with stable keys.
- Keep marketing emails separate from transactional emails.

Suggested email template keys:

- `auth_email_verification`
- `auth_password_reset`
- `support_request_received`
- `support_request_admin_notice`
- `reminder_due_soon`
- `document_packet_ready`

Environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPPORT_INBOX_EMAIL`
- Auth-related secrets required by Convex Auth.

## Vercel Deployment

Vercel owns:

- Next.js web app hosting.
- Preview deployments.
- Production deployment.
- Public environment variables for the frontend.

Convex owns:

- Backend functions.
- Database.
- Scheduled jobs.
- Server-side environment variables.

Deployment environments:

- Local development.
- Preview.
- Production.

Local development:

- `pnpm dev` should run the web app and Convex dev together.
- Use `.env.local` for web public/private variables.
- Use Convex environment settings for backend secrets.

Production:

- Vercel project connected to the repo.
- Convex production deployment configured.
- Resend production API key configured in Convex.
- Domain configured later.

## Environment Variable Plan

Web app:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_APP_URL`

Convex:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPPORT_INBOX_EMAIL`
- Auth provider secrets as needed.

Do not store:

- SSNs.
- Government login credentials.
- Payment card data.
- Stripe secret keys until monetization is intentionally added.

## CI And Quality Gates

Before production deployment:

- Typecheck.
- Lint.
- Build.
- Convex codegen.
- Rule-engine tests.
- Document-template rendering tests.

Suggested scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm convex:dev`
- `pnpm convex:deploy`

## Release Checklist

Before public beta:

- Privacy page.
- Terms page.
- Not legal/tax/accounting advice disclaimer.
- Contact/support flow.
- Auth flows tested.
- User data scoped correctly.
- No SSN collection.
- Official-source links visible.
- Phase 0 workflow complete.
- At least one generated document works end to end.

