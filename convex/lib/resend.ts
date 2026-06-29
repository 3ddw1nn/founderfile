"use node";

import { Resend } from "resend";

const DEFAULT_TEST_FROM = "StartupFiles <onboarding@resend.dev>";
const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

function requireEnv(name: string) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing environment variable \`${name}\`.`);
  }
  return value;
}

export async function sendResendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const from = env.RESEND_FROM_EMAIL?.trim() || DEFAULT_TEST_FROM;

  const result = await resend.emails.send({
    from,
    to: Array.isArray(args.to) ? args.to : [args.to],
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function getDefaultFromEmail() {
  return env.RESEND_FROM_EMAIL?.trim() || DEFAULT_TEST_FROM;
}
