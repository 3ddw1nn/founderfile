"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

type AuthMode = "sign-in" | "sign-up" | "reset";

function normalizeAuthError(error: unknown, mode: AuthMode) {
  const rawMessage = error instanceof Error ? error.message : "Something went wrong.";
  const message = rawMessage.toLowerCase();

  if (
    message.includes("unexpected token") ||
    message.includes("not valid json") ||
    message.includes("the page could not be found") ||
    message.includes("404")
  ) {
    return "Sign-in is temporarily unavailable because the auth service route is not responding correctly.";
  }

  if (message.includes("invalid password") || message.includes("credentialssignin")) {
    return mode === "sign-in"
      ? "Invalid email or password."
      : "That password does not meet the current requirements.";
  }

  if (message.includes("invalidaccountid")) {
    return "No account was found for that email. Create an account first.";
  }

  if (mode === "sign-in" && message.includes("server error")) {
    return "We could not sign you in with those credentials. If this is your first time here, create an account first.";
  }

  if (message.includes("user already exists")) {
    return "An account with that email already exists. Try signing in instead.";
  }

  if (message.includes("not found") || message.includes("no user")) {
    return mode === "sign-in"
      ? "Invalid email or password."
      : "We couldn't find an account for that email.";
  }

  return rawMessage;
}

export function AuthShell({ mode }: { mode: AuthMode }) {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const copy = useMemo(() => {
    if (mode === "sign-up") {
      return {
        eyebrow: "Sign Up",
        title: "Start the founder workspace with a real account.",
        subtitle:
          "Create the account first, then StartupFiles will seed your workspace and take you into onboarding.",
        cta: "Create account",
        altHref: "/sign-in",
        altLabel: "Already have an account?"
      };
    }
    if (mode === "reset") {
      return {
        eyebrow: "Reset Password",
        title: "Request a password reset link when email delivery is configured.",
        subtitle:
          "Password reset flows are wired to Convex Auth, but they require your email provider to be configured before they can send a reset message.",
        cta: "Request reset",
        altHref: "/sign-in",
        altLabel: "Back to sign in"
      };
    }
    return {
      eyebrow: "Sign In",
      title: "Sign back into the real workspace.",
      subtitle:
        "Use the email and password you created through Convex Auth. After sign-in, the dashboard and onboarding data load from your backend workspace.",
      cta: "Sign in",
      altHref: "/sign-up",
      altLabel: "Need an account?"
    };
  }, [mode]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const code = String(form.get("code") ?? "").trim();
    const newPassword = String(form.get("newPassword") ?? "");

    setError(null);
    setNotice(null);

    startTransition(async () => {
      try {
        if (mode === "sign-up") {
          await signIn("password", {
            flow: "signUp",
            email,
            password,
            name
          });
          router.push("/dashboard");
          return;
        }

        if (mode === "reset") {
          if (code && newPassword) {
            await signIn("password", {
              flow: "reset-verification",
              email,
              code,
              newPassword
            });
            setNotice("Password updated. You can sign in now.");
            router.push("/sign-in");
            return;
          }
          await signIn("password", {
            flow: "reset",
            email
          });
          setNotice(
            "If password reset email is configured in Convex, the reset message has been requested."
          );
          return;
        }

        await signIn("password", {
          flow: "signIn",
          email,
          password
        });
        router.push("/dashboard");
      } catch (err) {
        setError(normalizeAuthError(err, mode));
      }
    });
  };

  return (
    <div className="shell">
      <section className="surface pageSection" style={{ maxWidth: 720, margin: "0 auto" }}>
        {isAuthenticated ? (
          <div className="stack">
            <div className="eyebrow">Authenticated</div>
            <h1 className="headline" style={{ margin: 0, fontSize: "clamp(2.1rem, 7vw, 4rem)" }}>
              You are already signed in.
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Your Convex session is active, so you can go straight into the founder workspace.
            </p>
            <div className="buttonRow">
              <Link href="/dashboard" className="buttonPrimary">
                Open dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <div className="eyebrow">{copy.eyebrow}</div>
            <h1 className="headline" style={{ margin: 0, fontSize: "clamp(2.2rem, 7vw, 4.2rem)" }}>
              {copy.title}
            </h1>
            <p className="muted" style={{ margin: 0 }}>{copy.subtitle}</p>

            {isLoading ? (
              <div
                className="card"
                style={{ borderColor: "rgba(196, 101, 53, 0.18)", color: "#7f5632" }}
              >
                Checking your session with Convex Auth. The sign-in form stays available while
                this loads.
              </div>
            ) : null}

            {mode === "sign-up" ? (
              <label className="stack">
                <span>Name</span>
                <input
                  name="name"
                  required
                  className="card"
                  style={{ padding: "14px 16px" }}
                  placeholder="Edward Lee"
                />
              </label>
            ) : null}

            <label className="stack">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                className="card"
                style={{ padding: "14px 16px" }}
                placeholder="founder@example.com"
              />
            </label>

            {mode !== "reset" ? (
              <label className="stack">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="card"
                  style={{ padding: "14px 16px" }}
                  placeholder="At least 8 characters"
                />
              </label>
            ) : null}

            {mode === "reset" ? (
              <div className="gridTwo">
                <label className="stack">
                  <span>Verification code</span>
                  <input
                    name="code"
                    className="card"
                    style={{ padding: "14px 16px" }}
                    placeholder="Only after you receive one"
                  />
                </label>
                <label className="stack">
                  <span>New password</span>
                  <input
                    name="newPassword"
                    type="password"
                    minLength={8}
                    className="card"
                    style={{ padding: "14px 16px" }}
                    placeholder="Use with the code"
                  />
                </label>
              </div>
            ) : null}

            {error ? (
              <div className="card" style={{ borderColor: "rgba(143, 54, 23, 0.3)", color: "#8f3617" }}>
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="card" style={{ borderColor: "rgba(47, 107, 79, 0.25)", color: "#2f6b4f" }}>
                {notice}
              </div>
            ) : null}

            <div className="buttonRow">
              <button type="submit" className="buttonPrimary" disabled={isPending}>
                {isPending ? "Working..." : copy.cta}
              </button>
              <Link href={copy.altHref as Route} className="buttonSecondary">
                {copy.altLabel}
              </Link>
            </div>

            {mode === "sign-in" ? (
              <Link href={"/forgot-password" as Route} className="muted">
                Forgot password?
              </Link>
            ) : null}
          </form>
        )}
      </section>
    </div>
  );
}
