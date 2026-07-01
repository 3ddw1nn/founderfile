"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { businessTypeConfigs } from "@startupfiles/shared/dashboard";
import {
  dashboardBusinessSections,
  dashboardFactsNavSection,
  dashboardPrimaryNavItems
} from "@startupfiles/shared/navigation";
import { convexApi } from "../lib/convex-api";
import { ThemeToggle } from "./theme-toggle";
import { ui } from "./ui-classes";

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 transition-transform ${open ? "rotate-90" : "rotate-0"}`}
    >
      <path
        d="M3 2.5 7 6l-4 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-[22px] min-w-[42px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--panel-strong)_60%,transparent)] px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
      {children}
    </span>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <span
      className="relative inline-grid h-8 w-8 place-items-center rounded-full"
      aria-hidden="true"
      style={{
        background: `conic-gradient(var(--accent) ${percent * 3.6}deg, color-mix(in srgb, var(--muted) 16%, transparent) 0deg)`
      }}
    >
      <span className="absolute inset-[3px] rounded-full bg-[var(--panel-strong)]" />
      <span className="relative z-[1] text-[0.56rem] font-extrabold tracking-[-0.01em] text-[var(--text)]">
        {percent}%
      </span>
    </span>
  );
}

function navItemClass(active: boolean) {
  return active
    ? "flex min-h-[38px] items-center rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-3 py-2.5 text-[0.94rem] font-bold text-[var(--text)]"
    : "flex min-h-[38px] items-center rounded-[10px] border border-transparent px-3 py-2.5 text-[0.94rem] font-bold text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:text-[var(--text)]";
}

function navSubItemClass(active: boolean) {
  return active
    ? "flex min-h-9 items-center rounded-lg border border-[color-mix(in_srgb,var(--accent)_24%,transparent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-3 py-2 text-[0.9rem] text-[var(--text)]"
    : "flex min-h-9 items-center rounded-lg border border-transparent px-3 py-2 text-[0.9rem] text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_9%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-[var(--text)]";
}

export function DashboardLayout({
  title,
  description,
  showHeader = true,
  showTopProgress = true,
  progress,
  initialUser = null,
  topRightContent,
  children
}: {
  title: string;
  description: string;
  showHeader?: boolean;
  showTopProgress?: boolean;
  progress?: {
    currentStep: number;
    totalSteps: number;
    completedSteps?: number;
    label?: string;
    actionHref?: string;
    actionLabel?: string;
  };
  initialUser?: CurrentUser | null;
  topRightContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const token = useAuthToken();
  const queriedUser = useQuery(convexApi.currentUser, {});
  const startSetup = useMutation(convexApi.startSetup);
  const user = queriedUser ?? initialUser;
  const isAdmin = user?.role === "admin";
  const tokenPayload = decodeJwtPayload(token);
  const tokenEmail = readStringClaim(tokenPayload, ["email", "preferred_username"]);
  const tokenName = readStringClaim(tokenPayload, ["name"]);
  const rawAccountLabel = user?.email ?? tokenEmail ?? user?.name ?? tokenName ?? "Account";
  const [hideEmail, setHideEmail] = useState(false);
  const accountLabel = hideEmail ? "••••••@•••••.•••" : rawAccountLabel;
  const workspaceName = user?.name ?? tokenName ? `${user?.name ?? tokenName} workspace` : "Founder workspace";
  const avatarLabel = rawAccountLabel.slice(0, 1).toUpperCase();
  const activeBusiness =
    businessTypeConfigs.find(
      (business) =>
        pathname === `/dashboard/${business.slug}` || pathname.startsWith(`/dashboard/${business.slug}/`)
    ) ?? null;
  const setupOverview = useQuery(convexApi.getSetupOverview, {});
  const lastBusinessType = setupOverview?.lastActiveBusinessType ?? null;
  const topbarBusinessType = activeBusiness?.slug ?? lastBusinessType ?? "sole-proprietor";
  const topbarBusiness =
    businessTypeConfigs.find((business) => business.slug === topbarBusinessType) ?? activeBusiness ?? null;
  const setupSession = useQuery(convexApi.getSetupSession, {
    businessType: topbarBusinessType
  });
  const setupSummary = setupOverview?.summaries.find((summary) => summary.businessType === topbarBusinessType);
  const hasStartedSetup = setupSession !== undefined && setupSession !== null;
  const resolvedProgress = progress ??
    (topbarBusiness
      ? {
          currentStep: setupSummary?.currentStep ?? 0,
          totalSteps: setupSummary?.totalSteps ?? topbarBusiness.totalSteps,
          actionHref: `/dashboard/${topbarBusiness.slug}/setup` as Route,
          actionLabel: "Start"
        }
      : {
          currentStep: 3,
          totalSteps: 10,
          actionHref: "/dashboard/llc" as Route
        });

  const completedStepsCount = resolvedProgress.completedSteps ?? setupSummary?.completedSteps ?? Math.max(resolvedProgress.currentStep - 1, 0);
  const effectiveHref = hasStartedSetup
    ? (`/dashboard/${topbarBusinessType}/setup` as Route)
    : (topbarBusiness ? (`/dashboard/${topbarBusiness.slug}/setup` as Route) : resolvedProgress.actionHref);
  const effectiveLabel = (hasStartedSetup && completedStepsCount > 0) ? "Resume" : (topbarBusiness ? "Start" : resolvedProgress.actionLabel);
  const isSetupAction = effectiveHref?.endsWith("/setup") ?? false;
  const substepCompletedCount = setupSummary?.completedSubsteps ?? null;
  const substepTotalCount = setupSummary?.totalSubsteps ?? null;
  const progressPercent =
    substepCompletedCount !== null && substepTotalCount !== null && substepTotalCount > 0
      ? Math.round((substepCompletedCount / substepTotalCount) * 100)
      : resolvedProgress.totalSteps > 0
        ? Math.round((completedStepsCount / resolvedProgress.totalSteps) * 100)
        : 0;
  const currentSubstep = setupSummary?.currentSubstep ?? 0;
  const displayStepLabel = resolvedProgress.currentStep > 0
    ? `Step ${resolvedProgress.currentStep}.${currentSubstep + 1} of ${resolvedProgress.totalSteps}`
    : `Step 0 of ${resolvedProgress.totalSteps}`;
  const isSetupIncomplete = hasStartedSetup && completedStepsCount > 0 && completedStepsCount < resolvedProgress.totalSteps;

  // Notifications
  const notifications = useQuery(convexApi.getNotifications, { limit: 20 }) ?? [];
  const unreadCount = useQuery(convexApi.getUnreadCount, {}) ?? 0;
  const markAllRead = useMutation(convexApi.markAllNotificationsRead);
  const [bellOpen, setBellOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!notifications.length) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      notifications.forEach((n) => seenIds.current.add(n._id));
      return;
    }
    const newOnes = notifications.filter((n) => !seenIds.current.has(n._id));
    newOnes.forEach((n) => {
      seenIds.current.add(n._id);
      const id = n._id;
      setToasts((prev) => [...prev, { id, title: n.title, body: n.body }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    });
  }, [notifications]);

  const onSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const onTopbarAction = () => {
    if (!effectiveHref) return;

    router.push(effectiveHref as Route);

    if (!hasStartedSetup && isSetupAction && topbarBusiness) {
      void startSetup({ businessType: topbarBusiness.slug }).catch((cause) => {
        console.error("Failed to start setup from the dashboard top bar", cause);
      });
    }
  };

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  return (
    <div className="grid min-h-screen grid-cols-[292px_minmax(0,1fr)] bg-transparent">
      <aside className="sticky top-0 z-[1] grid h-screen grid-rows-[auto_1fr_auto] gap-[18px] border-r border-[var(--border)] bg-[var(--panel-strong)] p-[18px] backdrop-blur-[24px]">
        <Link href="/" className="grid min-h-[54px] grid-cols-[38px_minmax(0,1fr)] items-center gap-3">
          <span className="inline-grid h-[38px] w-[38px] place-items-center rounded-xl bg-[linear-gradient(180deg,var(--text),color-mix(in_srgb,var(--text)_78%,var(--accent)))] text-[0.84rem] font-extrabold text-[var(--panel-strong)]">
            SF
          </span>
          <span className="min-w-0">
            <strong className="block text-[1rem]">StartupFiles</strong>
            <span className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[0.86rem] text-[var(--muted)]">
              {workspaceName}
            </span>
          </span>
        </Link>

        <nav className="grid content-start gap-2.5 overflow-auto py-2" aria-label="Dashboard">
          {dashboardPrimaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href as Route} className={navItemClass(isActive)}>
                {item.label}
              </Link>
            );
          })}

          {isAdmin ? (
            <details className="grid gap-1.5 py-0.5" open={pathname.startsWith("/admin")}>
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-[10px] border border-transparent px-3 py-2.5 text-[0.94rem] font-bold text-[var(--text)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
                <span className="grid min-w-0 gap-0.5">
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <Chevron open={pathname.startsWith("/admin")} />
                    <span>Admin</span>
                  </span>
                  <span className="text-[0.72rem] font-semibold tracking-[0.01em] text-[var(--muted)]">
                    Sources and content ops
                  </span>
                </span>
              </summary>
              <div className="mt-0.5 grid gap-1 border-l border-[color-mix(in_srgb,var(--border)_80%,transparent)] pl-[18px]">
                {[
                  { href: "/admin", label: "Overview" },
                  { href: "/admin/city-license-sources", label: "City licenses" },
                  { href: "/admin/sources", label: "Sources" },
                  { href: "/admin/templates", label: "Templates" }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href as Route} className={navSubItemClass(isActive)}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          ) : null}

          <details className="grid gap-1.5 py-0.5" open={pathname.startsWith("/dashboard/facts")}>
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-[10px] border border-transparent px-3 py-2.5 text-[0.94rem] font-bold text-[var(--text)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
              <span className="grid min-w-0 gap-0.5">
                <span className="inline-flex min-w-0 items-center gap-2.5">
                  <Chevron open={pathname.startsWith("/dashboard/facts")} />
                  <span>{dashboardFactsNavSection.label}</span>
                </span>
                <span className="text-[0.72rem] font-semibold tracking-[0.01em] text-[var(--muted)]">
                  Business tradeoffs and cost transparency
                </span>
              </span>
            </summary>
            <div className="mt-0.5 grid gap-1 border-l border-[color-mix(in_srgb,var(--border)_80%,transparent)] pl-[18px]">
              {dashboardFactsNavSection.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href as Route} className={navSubItemClass(isActive)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </details>

          <div className="px-2.5 pb-0.5 pt-3.5 font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            Business types
          </div>
          {dashboardBusinessSections.map((section) => {
            const sectionIsActive = section.items.some(
              (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
            );
            const sectionSummary = setupOverview?.summaries.find((summary) => summary.businessType === section.id);
            const sectionTotalSteps =
              sectionSummary?.totalSteps ??
              businessTypeConfigs.find((business) => business.slug === section.id)?.totalSteps ??
              0;
            const sectionCompletedSteps = sectionSummary?.completedSteps ?? 0;
            const sectionPercent =
              sectionTotalSteps > 0 ? Math.round((sectionCompletedSteps / sectionTotalSteps) * 100) : 0;
            const sectionCurrentStep = sectionSummary?.currentStep ?? 0;
            const sectionCurrentSubstep = sectionSummary?.currentSubstep ?? 0;
            const sectionStepLabel = sectionCurrentStep > 0
              ? `Step ${sectionCurrentStep}.${sectionCurrentSubstep + 1} of ${sectionSummary?.totalSteps ?? sectionTotalSteps}`
              : `Step 0 of ${sectionTotalSteps}`;
            const sectionIsIncomplete = !!sectionSummary && sectionCompletedSteps > 0 && sectionCompletedSteps < sectionTotalSteps;

            if (section.disabled) {
              return (
                <div key={section.id} className="grid gap-1.5 py-0.5" aria-disabled="true">
                  <div className="flex min-h-10 items-center justify-between gap-3 rounded-[10px] bg-[color-mix(in_srgb,var(--panel-strong)_55%,transparent)] px-3 py-2.5 text-[color-mix(in_srgb,var(--muted)_70%,transparent)]">
                    <span className="grid min-w-0 gap-0.5">
                      <span className="inline-flex min-w-0 items-center gap-2.5">
                        <span>{section.label}</span>
                      </span>
                      <span className="text-[0.72rem] font-semibold tracking-[0.01em] text-[var(--muted)]">
                        Coming soon
                      </span>
                    </span>
                    {section.badge ? <NavBadge>{section.badge}</NavBadge> : null}
                  </div>
                </div>
              );
            }

            return (
              <details key={section.id} className="grid gap-1.5 py-0.5" open={sectionIsActive}>
                <summary
                  className={`flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5 text-[0.94rem] font-bold transition-colors ${
                    sectionIsActive
                      ? "border-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
                      : "border-transparent hover:border-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  }`}
                >
                  <span className="grid min-w-0 gap-0.5">
                    <span className="inline-flex min-w-0 items-center gap-2.5">
                      <Chevron open={sectionIsActive} />
                      <span>{section.label}</span>
                    </span>
                    <span className={`text-[0.72rem] font-semibold tracking-[0.01em] ${sectionIsIncomplete ? "text-[#f59e0b]" : "text-[var(--muted)]"}`}>
                      {sectionStepLabel}{sectionIsIncomplete ? " · Incomplete" : ""}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <ProgressRing percent={sectionPercent} />
                    {section.badge ? <NavBadge>{section.badge}</NavBadge> : null}
                  </span>
                </summary>
                <div className="mt-0.5 grid gap-1 border-l border-[color-mix(in_srgb,var(--border)_80%,transparent)] pl-[18px]">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href as Route} className={navSubItemClass(isActive)}>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </nav>

        <div className="grid content-end gap-3">
          <button
            type="button"
            onClick={() => setHideEmail((v) => !v)}
            className={`flex items-center justify-between rounded-[10px] border px-3 py-2 text-[0.75rem] font-bold tracking-[0.04em] transition-colors ${
              hideEmail
                ? "border-[color-mix(in_srgb,#f59e0b_40%,transparent)] bg-[color-mix(in_srgb,#f59e0b_12%,transparent)] text-[#f59e0b]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <span>{hideEmail ? "Email hidden" : "Hide email"}</span>
            <span className="font-mono text-[0.68rem] tracking-[0.08em]">DEV</span>
          </button>
          <details className="relative">
            <summary className="grid min-h-[52px] cursor-pointer list-none grid-cols-[34px_minmax(0,1fr)_12px] items-center gap-2.5 rounded-[14px] border border-[var(--border)] bg-[var(--panel-strong)] p-2">
              <span className="inline-grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] font-extrabold text-[var(--accent-strong)]">
                {avatarLabel}
              </span>
              <span className="min-w-0">
                <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.9rem]">
                  {accountLabel}
                </strong>
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.82rem] text-[var(--muted)]">
                  Account
                </span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-[var(--muted)]">
                <path
                  d="M2.5 4.25 6 7.75l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="absolute bottom-[calc(100%+10px)] left-0 z-[5] grid min-w-[220px] gap-1 rounded-[16px] border border-[var(--border)] bg-[var(--panel-strong)] p-2 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
              <Link href={"/dashboard/account" as Route} className="flex min-h-9 items-center rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]">
                Account settings
              </Link>
              <Link href={"/dashboard/privacy" as Route} className="flex min-h-9 items-center rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]">
                Privacy
              </Link>
              <Link href={"/dashboard/terms" as Route} className="flex min-h-9 items-center rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]">
                Terms
              </Link>
              <Link href={"/dashboard/contact" as Route} className="flex min-h-9 items-center rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]">
                Contact us
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="flex min-h-9 w-full items-center rounded-md border-0 bg-transparent px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
              >
                Sign out
              </button>
            </div>
          </details>
        </div>
      </aside>

      <main className="relative z-[2] min-w-0 pb-[42px]">
        {/* Toast overlay */}
        <div className="fixed right-4 top-[92px] z-[100] grid gap-2.5 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex min-w-[300px] max-w-[380px] items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--panel-strong)] p-4 shadow-[0_16px_48px_rgba(2,6,23,0.32)] animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
              <div className="min-w-0">
                <strong className="block text-[0.88rem]">{toast.title}</strong>
                <p className="mt-0.5 text-[0.8rem] text-[var(--muted)]">{toast.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-auto shrink-0 text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <header className="sticky top-0 z-[9] grid min-h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[18px] border-b border-[var(--border)] bg-white px-[22px] py-[10px] backdrop-blur-[20px] [html[data-theme='dark']_&]:bg-[rgba(11,17,32,0.94)]">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div className="grid min-w-0 gap-0.5">
            <div className="font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
              {topbarBusiness ? topbarBusiness.label : "Dashboard"}
            </div>
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.98rem] leading-[1.1] tracking-[-0.02em]">
              {title || "Founder console"}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                aria-label="Notifications"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 h-[18px] w-[18px]">
                  <path d="M10 2a6 6 0 0 0-6 6v2.586l-.707.707A1 1 0 0 0 4 13h12a1 1 0 0 0 .707-1.707L16 10.586V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.6rem] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[20] w-[340px] rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                    <strong className="text-[0.92rem]">Notifications</strong>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllRead({})}
                          className="text-[0.75rem] text-[var(--accent)] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button type="button" onClick={() => setBellOpen(false)} className="text-[var(--muted)] hover:text-[var(--text)]">✕</button>
                    </div>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[0.85rem] text-[var(--muted)]">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          className={`flex items-start gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0 ${!n.isRead ? "bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]" : ""}`}
                        >
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-[var(--accent)]" : "bg-transparent border border-[var(--border)]"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.85rem] font-bold">{n.title}</p>
                            <p className="mt-0.5 text-[0.8rem] text-[var(--muted)]">{n.body}</p>
                            <p className="mt-1 text-[0.72rem] text-[var(--muted)]">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-[var(--border)] px-4 py-2.5">
                    <Link
                      href={"/dashboard/notifications" as Route}
                      className="block text-center text-[0.82rem] text-[var(--accent)] hover:underline"
                      onClick={() => setBellOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {showTopProgress ? (
              <div className="flex items-center gap-3.5">
                <div className="grid min-w-[152px] gap-0.5">
                  <strong className="text-[0.88rem]">
                    {displayStepLabel}
                  </strong>
                  <span className={`text-[0.78rem] ${isSetupIncomplete ? "font-bold text-[#f59e0b]" : "text-[var(--muted)]"}`}>
                    {isSetupIncomplete ? `Incomplete · ${progressPercent}%` : (resolvedProgress.label ?? `${progressPercent}% completed`)}
                  </span>
                </div>
                <div
                  className="h-2 flex-[1_1_180px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--muted)_18%,transparent)]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={resolvedProgress.totalSteps}
                  aria-valuenow={resolvedProgress.currentStep}
                >
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),color-mix(in_srgb,var(--accent)_45%,#22c55e))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {effectiveHref ? (
                  <button type="button" className={ui.buttonPrimary} onClick={onTopbarAction}>
                    {effectiveLabel ?? "Continue"}
                  </button>
                ) : (
                  <button type="button" className={ui.buttonSecondary} disabled>
                    Continue
                  </button>
                )}
              </div>
            ) : topRightContent ? (
              <div className="flex items-center">{topRightContent}</div>
            ) : null}
          </div>
        </header>

        <section className="grid max-w-[1240px] gap-[18px] px-[22px]">
          {showHeader ? (
            <div className="grid max-w-[960px] gap-2 px-[22px] pb-0 pt-6">
              <div className="font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                {activeBusiness ? activeBusiness.label : "Dashboard"}
              </div>
              <h1 className="m-0 text-[clamp(2.1rem,4vw,3rem)] leading-[1.02] tracking-[-0.045em]">
                {title}
              </h1>
              <p className="m-0 text-[1rem] leading-[1.5] text-[var(--muted)]">{description}</p>
            </div>
          ) : null}
          {children}
        </section>
      </main>
    </div>
  );
}
