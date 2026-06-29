"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { businessTypeConfigs } from "@startupfiles/shared/dashboard";
import { dashboardBusinessSections, dashboardPrimaryNavItems } from "@startupfiles/shared/navigation";
import { convexApi } from "../lib/convex-api";
import { ThemeToggle } from "./theme-toggle";

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) {
    return null;
  }

  const payload = token.split(".")[1];
  if (!payload || typeof window === "undefined") {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readStringClaim(payload: Record<string, unknown> | null, keys: string[]) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function DashboardLayout({
  title,
  description,
  showHeader = true,
  progress,
  initialUser = null,
  children
}: {
  title: string;
  description: string;
  showHeader?: boolean;
  progress?: {
    currentStep: number;
    totalSteps: number;
    label?: string;
    actionHref?: string;
    actionLabel?: string;
  };
  initialUser?: CurrentUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const token = useAuthToken();
  const queriedUser = useQuery(convexApi.currentUser, {});
  const user = queriedUser ?? initialUser;
  const tokenPayload = decodeJwtPayload(token);
  const tokenEmail = readStringClaim(tokenPayload, ["email", "preferred_username"]);
  const tokenName = readStringClaim(tokenPayload, ["name"]);
  const accountLabel = user?.email ?? tokenEmail ?? user?.name ?? tokenName ?? "Account";
  const workspaceName = user?.name ?? tokenName ? `${user?.name ?? tokenName} workspace` : "Founder workspace";
  const avatarLabel = accountLabel.slice(0, 1).toUpperCase();
  const activeBusiness =
    businessTypeConfigs.find(
      (business) =>
        pathname === `/dashboard/${business.slug}` || pathname.startsWith(`/dashboard/${business.slug}/`)
    ) ?? null;
  const resolvedProgress = progress ??
    (activeBusiness
      ? {
          currentStep: activeBusiness.completedSteps,
          totalSteps: activeBusiness.totalSteps,
          actionHref: `/dashboard/${activeBusiness.slug}/dba-fbn`
        }
      : {
          currentStep: 3,
          totalSteps: 10,
          actionHref: "/dashboard/llc"
        });
  const progressPercent =
    resolvedProgress.totalSteps > 0
      ? Math.round((resolvedProgress.currentStep / resolvedProgress.totalSteps) * 100)
      : 0;

  const onSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="appFrame">
      <aside className="appSidebar">
        <Link href="/" className="appBrand">
          <span className="appBrandMark">SF</span>
          <span>
            <strong>StartupFiles</strong>
            <span>{workspaceName}</span>
          </span>
        </Link>

        <nav className="appNav" aria-label="Dashboard">
          {dashboardPrimaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={isActive ? "appNavItem active" : "appNavItem"}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="appNavGroupLabel">Business types</div>
          {dashboardBusinessSections.map((section) => {
            const sectionIsActive = section.items.some(
              (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
            );

            if (section.disabled) {
              return (
                <div key={section.id} className="appNavSection disabled" aria-disabled="true">
                  <div className="appNavSectionSummary">
                    <span className="appNavSectionLabel">
                      <span>{section.label}</span>
                    </span>
                    {section.badge ? <span className="appNavBadge">{section.badge}</span> : null}
                  </div>
                </div>
              );
            }

            return (
              <details key={section.id} className={sectionIsActive ? "appNavSection open" : "appNavSection"} open={sectionIsActive}>
                <summary className="appNavSectionSummary">
                  <span className="appNavSectionLabel">
                    <span className="appNavChevron" aria-hidden="true" />
                    <span>{section.label}</span>
                  </span>
                  {section.badge ? <span className="appNavBadge">{section.badge}</span> : null}
                </summary>
                <div className="appNavSectionItems">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        className={isActive ? "appNavSubItem active" : "appNavSubItem"}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </nav>

        <div className="appSidebarFooter">
          <details className="accountMenu">
            <summary>
              <span className="accountAvatar">{avatarLabel}</span>
              <span className="accountMeta">
                <strong>{accountLabel}</strong>
                <span>Account</span>
              </span>
              <span className="accountArrow" aria-hidden="true" />
            </summary>
            <div className="accountMenuPanel">
              <Link href={"/dashboard/account" as Route}>Account settings</Link>
              <Link href={"/dashboard/privacy" as Route}>Privacy</Link>
              <Link href={"/dashboard/terms" as Route}>Terms</Link>
              <Link href={"/dashboard/contact" as Route}>Contact us</Link>
              <button type="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </details>
        </div>
      </aside>

      <main className="appMain">
        <header className="appTopbar">
          <div className="appTopbarLeft">
            <ThemeToggle />
          </div>
          <div className="appTopbarMeta">
            <div className="appStatus">{activeBusiness ? activeBusiness.label : "Dashboard"}</div>
            <strong>{title || "Founder console"}</strong>
          </div>
          <div className="topbarProgress">
            <div className="topbarProgressMeta">
              <strong>
                Step {resolvedProgress.currentStep} of {resolvedProgress.totalSteps}
              </strong>
              <span>{resolvedProgress.label ?? `${progressPercent}% completed`}</span>
            </div>
            <div
              className="topbarProgressBar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={resolvedProgress.totalSteps}
              aria-valuenow={resolvedProgress.currentStep}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            {resolvedProgress.actionHref ? (
              <Link href={resolvedProgress.actionHref as Route} className="buttonPrimary">
                {resolvedProgress.actionLabel ?? (activeBusiness ? "Continue" : "Resume")}
              </Link>
            ) : (
              <button type="button" className="buttonSecondary" disabled>
                Continue
              </button>
            )}
          </div>
        </header>

        <section className="appContent stack">
          {showHeader ? (
            <div className="appPageIntro">
              <div className="appStatus">{activeBusiness ? activeBusiness.label : "Dashboard"}</div>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          ) : null}
          {children}
        </section>
      </main>
    </div>
  );
}
