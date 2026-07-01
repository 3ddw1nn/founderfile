"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { DashboardLayout } from "./dashboard-layout";
import { convexApi } from "../lib/convex-api";
import { ui } from "./ui-classes";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { getSetupConfig, type SetupConfig, type SetupStep } from "@startupfiles/shared/setup";
import { getCityByName, searchCities } from "@startupfiles/shared/california-cities";

type SetupSession = {
  currentStep: number;
  stepStatuses: string[];
  isEntityApplication?: boolean;
  legalFirstName?: string;
  legalMiddleName?: string;
  legalLastName?: string;
  legalSuffix?: string;
  needsDba?: boolean;
  dbaName?: string;
  dbaCounty?: string;
  dbaNewspaperName?: string;
  dbaPublicationFiled?: boolean;
  cityLicenseCity?: string;
  cityLicenseCounty?: string;
  cityLicenseBusinessAddress?: string;
  cityLicenseBusinessCity?: string;
  cityLicenseBusinessZip?: string;
  cityLicensePhone?: string;
  cityLicenseEmail?: string;
  cityLicenseStartDate?: string;
  cityLicenseActivity?: string;
  cityLicenseIsHomeBased?: boolean;
  cityLicenseEmployeeCount?: string;
  cityLicenseGrossReceipts?: string;
  cityLicenseBusinessCategory?: string;
  cityLicenseWebsite?: string;
  isCompleted: boolean;
} | null;

type StepOneDraft = {
  isEntityApplication: boolean | null;
  legalFirstName: string;
  legalMiddleName: string;
  legalLastName: string;
  legalSuffix: string;
};

type StepTwoDraft = {
  needsDba: boolean | null;
  dbaName: string;
  dbaCounty: string;
  dbaNewspaperName: string;
  dbaPublicationFiled: boolean | null;
  dbaProofMode: "upload" | "self" | null;
};

type StepThreeDraft = {
  city: string;
  county: string;
  businessAddress: string;
  businessCity: string;
  businessZip: string;
  phone: string;
  email: string;
  startDate: string;
  activity: string;
  isHomeBased: boolean | null;
  employeeCount: string;
  grossReceipts: string;
  businessCategory: string;
  website: string;
};

const tw = {
  muted: "text-[var(--muted)]",
  stack: "grid gap-[18px]",
  kicker: ui.kicker,
  surfaceInset:
    "rounded-[20px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_76%,transparent)] p-5",
  setupWorkspace:
    "grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,360px)]",
  setupRail: "mt-6 grid gap-[18px] xl:sticky xl:top-[92px]",
  setupRailPanel: `${ui.surface} p-[22px]`,
  setupWorkbench: `${ui.surface} mt-6 grid gap-6 p-7`,
  setupStage: "grid gap-5",
  setupInfoPanel:
    "rounded-[20px] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_84%,transparent),color-mix(in_srgb,var(--panel)_70%,transparent))] p-[22px]",
  setupBulletList: "m-0 grid list-none gap-3 p-0",
  setupBulletListSimple: "m-0 grid list-none gap-3 p-0",
  setupSummaryGrid: "grid gap-4 md:grid-cols-2",
  setupReviewGrid: "grid gap-4 md:grid-cols-2",
  setupChoiceGrid: "grid gap-4 md:grid-cols-2",
  setupFormGrid: "grid gap-4 md:grid-cols-2",
  setupField: "grid gap-2",
  setupError:
    "rounded-2xl border border-[color-mix(in_srgb,#ff6b6b_34%,transparent)] bg-[color-mix(in_srgb,#ff6b6b_10%,transparent)] px-4 py-3 text-[var(--text)]",
  setupActionBar:
    "grid items-center gap-4 border-t border-[var(--border)] pt-[18px] md:grid-cols-[auto_minmax(0,1fr)_auto]",
  setupActionMeta: "grid gap-1",
  setupButtonPrimary:
    "min-h-[52px] rounded-2xl border border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_86%,white),var(--accent))] px-[22px] font-bold tracking-[-0.01em] text-white shadow-[0_16px_36px_color-mix(in_srgb,var(--accent)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:shadow-none",
  setupButtonSecondary:
    "min-h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-[22px] font-bold tracking-[-0.01em] text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-[0.55]",
  setupPageSpacing: "",
  setupContentGrid: "grid items-start gap-[18px]",
  setupPrimaryPanel: "grid gap-[18px]",
  setupRoadmapPreview: "grid gap-2.5",
  setupRoadmapRow: "grid gap-1.5",
  setupMiniStats: "grid gap-3 md:grid-cols-2"
} as const;

function getStatusLabel(status: string) {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "Incomplete";
  if (status === "not_needed") return "Not needed";
  return "Not started";
}

function getStatusTone(status: string) {
  if (status === "complete") return "complete";
  if (status === "in_progress") return "incomplete";
  if (status === "not_needed") return "muted";
  return "idle";
}

function getStepPreparation(step: SetupStep) {
  return [
    `Review the scope for ${step.title.toLowerCase()} before you click through it.`,
    `Capture the business name, timing, and jurisdiction details that connect to this step.`,
    "Keep documents and decisions consistent so the later filings do not drift."
  ];
}

function getStepOutputs(step: SetupStep) {
  return [
    `${step.title} plan recorded`,
    "Inputs aligned with your other documents",
    "Clear handoff into the next step"
  ];
}

function getDefaultSubstepIndex(step: SetupStep, session: SetupSession) {
  if (!session) return 0;
  if (step.stepNumber !== 1) return 0;
  if (session.stepStatuses[0] === "complete") return step.substeps.length - 1;
  if (session.isEntityApplication === undefined) return 0;
  if (session.isEntityApplication === false) {
    const hasName = Boolean(session.legalFirstName?.trim() && session.legalLastName?.trim());
    return hasName ? step.substeps.length - 1 : 1;
  }
  return step.substeps.length - 1;
}

function getCurrentStepPercent(step: SetupStep, session: SetupSession, substepIndex: number) {
  if (!session) return 0;
  const status = session.stepStatuses[step.stepNumber - 1] ?? "not_started";
  if (status === "complete" || status === "not_needed") return 100;
  const total = Math.max(step.substeps.length, 1);
  return Math.round((substepIndex / total) * 100);
}

function normalizeStepStatuses(config: SetupConfig, statuses: string[] | undefined, currentStep: number) {
  const latestInProgressIndex = statuses?.reduce(
    (latest, status, index) => (status === "in_progress" ? index : latest),
    -1
  ) ?? -1;
  const minimumStep = statuses ? 1 : 0;
  const effectiveCurrentStep = Math.min(
    Math.max(currentStep, latestInProgressIndex + 1, minimumStep),
    config.totalSteps
  );

  return config.steps.map((step, index) => {
    const status = statuses?.[index] ?? (step.stepNumber === effectiveCurrentStep ? "in_progress" : "not_started");
    if (step.stepNumber < effectiveCurrentStep && status !== "not_needed") return "complete";
    if (step.stepNumber === effectiveCurrentStep && status === "not_started") return "in_progress";
    return status;
  });
}

function getEffectiveCurrentStep(statuses: string[] | undefined, fallbackStep: number) {
  const latestInProgressIndex = statuses?.reduce(
    (latest, status, index) => (status === "in_progress" ? index : latest),
    -1
  ) ?? -1;
  const minimumStep = statuses ? 1 : 0;
  return Math.max(fallbackStep, latestInProgressIndex + 1, minimumStep);
}

function SetupProgressRail({
  config,
  session,
  currentStep,
  stepStatuses,
  activeSubstepIndex,
  onNavigate,
  onNavigateSubstep
}: {
  config: SetupConfig;
  session: SetupSession;
  currentStep: number;
  stepStatuses: string[];
  activeSubstepIndex: number;
  onNavigate: (stepNumber: number) => void;
  onNavigateSubstep: (stepNumber: number, substepIndex: number) => void;
}) {
  const totalSubstepsRail = config.steps.reduce((sum, step) => sum + step.substeps.length, 0);
  const completedSubstepsRail = stepStatuses.reduce((sum, status, idx) => {
    const step = config.steps[idx];
    if (!step) return sum;
    if (status === "complete" || status === "not_needed") return sum + step.substeps.length;
    if (status === "in_progress" && (idx + 1) === currentStep) return sum + activeSubstepIndex;
    return sum;
  }, 0);
  const overallPercent = totalSubstepsRail > 0 ? Math.round((completedSubstepsRail / totalSubstepsRail) * 100) : 0;
  const completedSteps = stepStatuses.filter((status) => status === "complete" || status === "not_needed").length;

  return (
    <aside className={tw.setupRail}>
      <section className={tw.setupRailPanel}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={tw.kicker}>Progress map</div>
            <h2 className="mt-2 text-[1.15rem]">Roadmap</h2>
          </div>
          <div className="rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-3 py-2 font-bold text-[var(--text)]">{overallPercent}%</div>
        </div>
        <div className="mt-[18px] grid gap-2.5">
          {config.steps.map((step) => {
            const status = stepStatuses[step.stepNumber - 1] ?? "not_started";
            const tone = getStatusTone(status);
            const isCurrent = currentStep === step.stepNumber;
            const isDone = status === "complete" || status === "not_needed";
            const progress = isCurrent
              ? getCurrentStepPercent(step, session, activeSubstepIndex)
              : status === "complete" || status === "not_needed"
                ? 100
                : 0;
            const hasStarted = isCurrent || isDone;

            return (
              <div
                key={step.stepNumber}
                className={`rounded-[18px] border px-[14px] py-[14px] ${
                  isCurrent
                    ? "border-[color-mix(in_srgb,var(--accent)_44%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_11%,var(--panel))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_22%,transparent)]"
                    : "border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)]"
                }`}
              >
                <button
                  type="button"
                  className="grid w-full items-center gap-[14px] text-left md:grid-cols-[48px_minmax(0,1fr)]"
                  onClick={() => onNavigate(step.stepNumber)}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full border text-[0.95rem] font-extrabold ${
                      isDone
                        ? "border-[color-mix(in_srgb,var(--success)_42%,transparent)] bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]"
                        : tone === "incomplete"
                          ? "border-[color-mix(in_srgb,#f59e0b_50%,transparent)] bg-[color-mix(in_srgb,#f59e0b_12%,transparent)] text-[#f59e0b]"
                          : "border-[color-mix(in_srgb,var(--border)_88%,transparent)] text-[var(--muted)]"
                    }`}
                    style={{ ["--progress" as string]: `${progress}%` }}
                    aria-hidden="true"
                  >
                    {isDone ? "✓" : step.stepNumber}
                  </span>
                  <span className="grid gap-1">
                    <span className="flex items-center justify-between gap-2.5 text-[0.8rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                      <strong>Step {step.stepNumber}</strong>
                      <span>{step.substeps.length} checkpoints</span>
                    </span>
                    <span className="text-[1rem] font-bold">{step.title}</span>
                    <span className={`text-[0.92rem] ${tone === "incomplete" ? "font-bold text-[#f59e0b]" : "text-[var(--muted)]"}`}>{getStatusLabel(status)}</span>
                  </span>
                </button>

                {hasStarted && (
                  <div className="mt-2.5 grid gap-0.5 pl-[62px]">
                    {step.substeps.map((substep, substepIdx) => {
                      const isActiveSubstep = isCurrent && substepIdx === activeSubstepIndex;
                      const isSubstepDone = status === "complete" || (isCurrent && substepIdx < activeSubstepIndex);
                      const isSubstepSkipped = status === "not_needed";
                      return (
                        <button
                          key={substep.key}
                          type="button"
                          onClick={() => onNavigateSubstep(step.stepNumber, substepIdx)}
                          className={`flex items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-[0.8rem] transition-colors ${
                            isActiveSubstep
                              ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] font-bold text-[var(--accent)]"
                              : isSubstepSkipped
                                ? "text-[var(--muted)] opacity-75 hover:bg-[color-mix(in_srgb,var(--border)_40%,transparent)]"
                                : isSubstepDone
                                  ? "text-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_8%,transparent)]"
                                  : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--border)_40%,transparent)]"
                          }`}
                        >
                          <span className="shrink-0 font-mono font-bold">{step.stepNumber}.{substepIdx + 1}</span>
                          <span className="truncate">{substep.label}</span>
                          {isSubstepSkipped && <span className="ml-auto shrink-0 text-[0.7rem] text-[var(--muted)]">Skipped</span>}
                          {isSubstepDone && !isActiveSubstep && !isSubstepSkipped && <span className="ml-auto shrink-0 text-[0.7rem]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={tw.setupRailPanel}>
        <div className={tw.kicker}>Session status</div>
        <div className={`${tw.setupMiniStats} mt-[18px]`}>
          <article className="rounded-[18px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-5 py-[18px]">
            <span className="block text-[0.82rem] uppercase tracking-[0.14em] text-[var(--muted)]">Completed</span>
            <strong className="mt-2.5 block text-[1.3rem]">{completedSubstepsRail}</strong>
            <span className="text-[0.75rem] text-[var(--muted)]">of {totalSubstepsRail} checkpoints</span>
          </article>
          <article className="rounded-[18px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-5 py-[18px]">
            <span className="block text-[0.82rem] uppercase tracking-[0.14em] text-[var(--muted)]">Remaining</span>
            <strong className="mt-2.5 block text-[1.3rem]">{Math.max(totalSubstepsRail - completedSubstepsRail, 0)}</strong>
            <span className="text-[0.75rem] text-[var(--muted)]">of {totalSubstepsRail} checkpoints</span>
          </article>
        </div>
        <p className={`m-0 mt-[18px] ${tw.muted}`}>
          Each step can hold multiple checkpoints, so we can keep the flow structured without flattening everything into one long form.
        </p>
      </section>
    </aside>
  );
}

function SetupKickoff({
  config,
  businessType,
  saving,
  error,
  onStart
}: {
  config: SetupConfig;
  businessType: string;
  saving: boolean;
  error: string | null;
  onStart: () => Promise<void>;
}) {
  const businessLabel = businessType === "llc" ? "LLC" : "Sole proprietor";

  return (
    <div className={tw.setupWorkspace}>
      <section className={tw.setupWorkbench}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <div>
            <div className={tw.kicker}>{businessLabel}</div>
            <h1 className="mt-2.5 font-sans text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.95] tracking-[-0.05em]">Build this setup one decision at a time.</h1>
            <p className="mt-[14px] max-w-[760px] text-[1.05rem] leading-[1.7] text-[var(--muted)]">
              This setup flow is now structured around core steps and smaller checkpoints inside each one, so the user always knows what comes next and what is already locked in.
            </p>
          </div>
          <div className="grid gap-3">
            <article className="rounded-[18px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-5 py-[18px]">
              <span className="block text-[0.82rem] uppercase tracking-[0.14em] text-[var(--muted)]">Total steps</span>
              <strong className="mt-2.5 block text-[1.3rem]">{config.totalSteps}</strong>
            </article>
            <article className="rounded-[18px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-5 py-[18px]">
              <span className="block text-[0.82rem] uppercase tracking-[0.14em] text-[var(--muted)]">Checkpoints</span>
              <strong className="mt-2.5 block text-[1.3rem]">{config.steps.reduce((total, step) => total + step.substeps.length, 0)}</strong>
            </article>
            <article className="rounded-[18px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-5 py-[18px]">
              <span className="block text-[0.82rem] uppercase tracking-[0.14em] text-[var(--muted)]">Current status</span>
              <strong className="mt-2.5 block text-[1.3rem]">Not started</strong>
            </article>
          </div>
        </div>

        <div className="grid gap-[18px] md:grid-cols-2">
          <article className={`${tw.surfaceInset} ${tw.stack}`}>
            <div className={tw.kicker}>How it works</div>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <strong>Step flow</strong>
                <p className={tw.muted}>Every major setup task lives in its own step with dedicated back and next controls.</p>
              </div>
              <div className="grid gap-1.5">
                <strong>Checkpoint system</strong>
                <p className={tw.muted}>Each step can hold smaller questions and reviews, like a step 1.1, 1.2, and 1.3 flow.</p>
              </div>
              <div className="grid gap-1.5">
                <strong>Persistent progress</strong>
                <p className={tw.muted}>Main step progress stays connected to the saved setup session so the dashboard stays in sync.</p>
              </div>
            </div>
          </article>

          <article className={`${tw.surfaceInset} ${tw.stack}`}>
            <div className={tw.kicker}>What you will cover</div>
            <ul className={tw.setupBulletList}>
              {config.steps.slice(0, 4).map((step) => (
                <li key={step.stepNumber} className="grid gap-0.5">
                  <strong>Step {step.stepNumber}</strong>
                  <span className={tw.muted}>{step.title}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        {error ? <div className={tw.setupError}>{error}</div> : null}

        <div className={tw.setupActionBar}>
          <div className={tw.setupActionMeta}>
            <strong>Ready to begin?</strong>
            <span className={tw.muted}>The first step starts with applicant identity and legal naming.</span>
          </div>
          <button type="button" className={tw.setupButtonPrimary} disabled={saving} onClick={onStart}>
            {saving ? "Starting..." : "Launch setup flow"}
          </button>
        </div>
      </section>

      <aside className={tw.setupRail}>
        <section className={tw.setupRailPanel}>
          <div className={tw.kicker}>Roadmap preview</div>
          <div className={`${tw.setupRoadmapPreview} mt-[18px]`}>
            {config.steps.map((step) => (
              <div key={step.stepNumber} className={tw.setupRoadmapRow}>
                <span className="text-[0.78rem] uppercase tracking-[0.12em] text-[var(--muted)]">Step {step.stepNumber}</span>
                <strong className="text-[1.02rem]">{step.title}</strong>
                <span className={tw.muted}>{step.substeps.length} checkpoints</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function EntityChoiceCard({
  selected,
  title,
  detail,
  onClick
}: {
  selected: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`grid min-h-[190px] gap-2.5 rounded-[22px] border p-[22px] text-left ${
        selected
          ? "border-[color-mix(in_srgb,var(--accent)_46%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--panel))] shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_74%,transparent)]"
      }`}
      onClick={onClick}
    >
      <span
        className={`h-[14px] w-[14px] rounded-full border-2 ${selected ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)] bg-transparent"}`}
        aria-hidden="true"
      />
      <strong>{title}</strong>
      <p className={`m-0 leading-[1.65] ${tw.muted}`}>{detail}</p>
    </button>
  );
}

function StepOneContent({
  substepIndex,
  draft,
  onDraftChange
}: {
  substepIndex: number;
  draft: StepOneDraft;
  onDraftChange: (patch: Partial<StepOneDraft>) => void;
}) {
  if (substepIndex === 0) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Who is applying?</h2>
          <p className={tw.muted}>
            This first checkpoint anchors the rest of the setup. We need to know whether the paperwork is tied directly to you or to an existing entity.
          </p>
        </div>
        <div className={tw.setupChoiceGrid}>
          <EntityChoiceCard
            selected={draft.isEntityApplication === false}
            title="I am applying as myself"
            detail="Use this when the business is tied directly to your personal legal identity."
            onClick={() => onDraftChange({ isEntityApplication: draft.isEntityApplication === false ? null : false })}
          />
          <EntityChoiceCard
            selected={draft.isEntityApplication === true}
            title="I am applying as an entity"
            detail="Use this when the filing runs through a separate legal business entity."
            onClick={() => onDraftChange({ isEntityApplication: draft.isEntityApplication === true ? null : true })}
          />
        </div>
      </div>
    );
  }

  if (substepIndex === 1) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Confirm your legal name</h2>
          <p className={tw.muted}>
            Enter the full legal name for the person or signer tied to this setup. We use this for filings and the saved setup session.
          </p>
        </div>
        <div className={tw.setupFormGrid}>
          <label className={tw.setupField}>
            <span>First name</span>
            <input
              type="text"
              value={draft.legalFirstName}
              onChange={(event) => onDraftChange({ legalFirstName: event.target.value })}
              placeholder="John"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
          <label className={tw.setupField}>
            <span>Middle name <span className={tw.muted}>(optional)</span></span>
            <input
              type="text"
              value={draft.legalMiddleName}
              onChange={(event) => onDraftChange({ legalMiddleName: event.target.value })}
              placeholder="Michael"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
          <label className={tw.setupField}>
            <span>Last name</span>
            <input
              type="text"
              value={draft.legalLastName}
              onChange={(event) => onDraftChange({ legalLastName: event.target.value })}
              placeholder="Doe"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
          <label className={tw.setupField}>
            <span>Suffix <span className={tw.muted}>(optional)</span></span>
            <input
              type="text"
              value={draft.legalSuffix}
              onChange={(event) => onDraftChange({ legalSuffix: event.target.value })}
              placeholder="Jr., III"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
        </div>
      </div>
    );
  }

  return null;
}

function UploadZone({
  businessType,
  category,
  label
}: {
  businessType: string;
  category: string;
  label: string;
}) {
  const generateUploadUrl = useMutation(convexApi.generateUploadUrl);
  const saveDocument = useMutation(convexApi.saveDocument);
  const deleteDocument = useMutation(convexApi.deleteDocument);
  const documents = useQuery(convexApi.getDocuments, { businessType, category }) ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          setUploadError("File must be under 20 MB.");
          continue;
        }
        const uploadUrl = await generateUploadUrl({});
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file
        });
        if (!result.ok) throw new Error("Upload failed.");
        const { storageId } = await result.json();
        await saveDocument({
          businessType,
          category,
          storageId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size
        });
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function fileIcon(fileType: string) {
    if (fileType.startsWith("image/")) return "🖼";
    if (fileType === "application/pdf") return "📄";
    return "📎";
  }

  return (
    <div className="grid gap-3">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); void handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
            : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-2xl">
          {isUploading ? "⏳" : "⬆"}
        </div>
        <div>
          <p className="font-semibold text-[var(--text)]">
            {isUploading ? "Uploading..." : "Drop file here or click to browse"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">PDF, JPG, PNG, DOC — up to 20 MB</p>
        </div>
      </div>

      {uploadError && (
        <p className="rounded-xl border border-[color-mix(in_srgb,#ff6b6b_30%,transparent)] bg-[color-mix(in_srgb,#ff6b6b_8%,transparent)] px-4 py-2.5 text-sm text-[var(--text)]">
          {uploadError}
        </p>
      )}

      {/* Uploaded files */}
      {documents.length > 0 && (
        <div className="grid gap-2">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] px-4 py-3"
            >
              <span className="text-lg">{fileIcon(doc.fileType)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">{doc.fileName}</p>
                <p className="text-xs text-[var(--muted)]">{formatBytes(doc.fileSize)}</p>
              </div>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-[var(--accent)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </a>
              )}
              <button
                type="button"
                onClick={() => void deleteDocument({ documentId: doc._id })}
                className="shrink-0 text-[var(--muted)] transition-colors hover:text-[#ff6b6b]"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepTwoContent({
  substepIndex,
  isEntityApplication,
  businessType,
  draft,
  onDraftChange
}: {
  substepIndex: number;
  isEntityApplication: boolean | null;
  businessType: string;
  draft: StepTwoDraft;
  onDraftChange: (patch: Partial<StepTwoDraft>) => void;
}) {
  const [proofMode, setProofMode] = useState<"upload" | "self" | null>(null);
  const [newspaperTouched, setNewspaperTouched] = useState(false);

  useEffect(() => {
    if (substepIndex !== 2) {
      setProofMode(null);
      onDraftChange({ dbaProofMode: null });
    }
  }, [substepIndex]);

  if (substepIndex === 0) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Do you need a DBA / FBN filing?</h2>
          <p className={tw.muted}>
            If the business will operate under a name different from the legal entity name, you will need to file a DBA (doing business as) or FBN (fictitious business name).
          </p>
        </div>
        <div className={tw.setupChoiceGrid}>
          <EntityChoiceCard
            selected={draft.needsDba === true}
            title="Yes, I need a DBA / FBN"
            detail="The public-facing business name differs from the legal entity name."
            onClick={() => onDraftChange({ needsDba: draft.needsDba === true ? null : true })}
          />
          <EntityChoiceCard
            selected={draft.needsDba === false}
            title="No, I will use my legal name"
            detail="The business will operate publicly under its exact legal name."
            onClick={() => onDraftChange({ needsDba: draft.needsDba === false ? null : false })}
          />
        </div>
      </div>
    );
  }

  if (substepIndex === 1) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Business name & county</h2>
          <p className={tw.muted}>
            Capture the exact DBA name and the county where the filing will be made.
          </p>
        </div>
        <div className={tw.setupFormGrid}>
          <label className={tw.setupField}>
            <span>DBA / FBN name</span>
            <input
              type="text"
              value={draft.dbaName}
              onChange={(event) => onDraftChange({ dbaName: event.target.value })}
              placeholder="Doe Consulting"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
          <label className={tw.setupField}>
            <span>Filing county</span>
            <input
              type="text"
              value={draft.dbaCounty}
              onChange={(event) => onDraftChange({ dbaCounty: event.target.value })}
              placeholder="Orange County"
              className="h-[52px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] px-4 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            />
          </label>
        </div>
      </div>
    );
  }

  if (substepIndex === 2) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Publish in a newspaper</h2>
          <p className={tw.muted}>
            Most California counties require publishing the DBA/FBN in a newspaper of general circulation before the filing is considered final.
          </p>
        </div>
        <div className={tw.setupInfoPanel}>
          <strong>California publication requirement</strong>
          <ul className={tw.setupBulletListSimple}>
            <li className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">Publish the filing once a week for 4 consecutive weeks in a newspaper of general circulation in the filing county.</li>
            <li className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">Publication generally must start within 30 days of filing the DBA/FBN with the county clerk.</li>
            <li className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">After the last publication, you must file a Proof of Publication with the county clerk within 30 days.</li>
            <li className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">Approved newspapers vary by county — confirm with your county clerk's office.</li>
          </ul>
        </div>

        <div className={tw.setupField}>
          <span>Which newspaper will you use?</span>
          <input
            type="text"
            value={draft.dbaNewspaperName}
            onChange={(event) => onDraftChange({ dbaNewspaperName: event.target.value })}
            onBlur={() => setNewspaperTouched(true)}
            placeholder="e.g. Orange County Register"
            className={`h-[52px] rounded-2xl border px-4 text-[var(--text)] outline-none transition-colors ${
              newspaperTouched && !draft.dbaNewspaperName.trim()
                ? "border-[color-mix(in_srgb,#ff6b6b_60%,transparent)] bg-[color-mix(in_srgb,#ff6b6b_6%,var(--panel))] focus:border-[#ff6b6b] focus:shadow-[0_0_0_3px_color-mix(in_srgb,#ff6b6b_14%,transparent)]"
                : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
            }`}
          />
          {newspaperTouched && !draft.dbaNewspaperName.trim() && (
            <p className="text-sm text-[#ff6b6b]">Required — enter the newspaper you plan to use for publication.</p>
          )}
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium text-[var(--text)]">Do you have your proof of publication?</p>
          <div className={tw.setupChoiceGrid}>
            <button
              type="button"
              onClick={() => onDraftChange({ dbaPublicationFiled: draft.dbaPublicationFiled === true ? null : true })}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                draft.dbaPublicationFiled === true
                  ? "border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                  : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] hover:border-[color-mix(in_srgb,var(--accent)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]"
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                draft.dbaPublicationFiled === true ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
              }`}>
                {draft.dbaPublicationFiled === true && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <div>
                <p className="font-semibold text-[var(--text)]">Yes, I have it</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Publication is complete and proof is in hand.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onDraftChange({ dbaPublicationFiled: draft.dbaPublicationFiled === false ? null : false })}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                draft.dbaPublicationFiled === false
                  ? "border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                  : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,var(--panel))] hover:border-[color-mix(in_srgb,var(--accent)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]"
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                draft.dbaPublicationFiled === false ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
              }`}>
                {draft.dbaPublicationFiled === false && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <div>
                <p className="font-semibold text-[var(--text)]">Not yet</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Still in progress or haven't started the run yet.</p>
              </div>
            </button>
          </div>
        </div>

        {draft.dbaPublicationFiled === true && (
          <div className="grid gap-3">
            <UploadZone
              businessType={businessType}
              category="proof_of_publication"
              label="Upload your proof of publication"
            />
            <button
              type="button"
              onClick={() => {
                const next = proofMode === "self" ? null : "self";
                setProofMode(next);
                onDraftChange({ dbaProofMode: next });
              }}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 px-5 py-3.5 text-sm font-bold transition-all ${
                proofMode === "self"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                  : "border-dashed border-[color-mix(in_srgb,var(--muted)_40%,transparent)] bg-transparent text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {proofMode === "self" ? (
                <>
                  <svg viewBox="0 0 12 10" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 5l3.5 3.5L11 1" />
                  </svg>
                  I'll submit it myself — no upload needed
                </>
              ) : (
                "I'll submit it myself — no upload needed"
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={tw.setupStage}>
      <div>
        <h2>Lock the naming plan</h2>
        <p className={tw.muted}>
          Confirm the DBA / FBN details below so later setup steps use the same name everywhere.
        </p>
      </div>
      <div className={tw.setupReviewGrid}>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Naming plan</span>
          <strong>{draft.dbaName.trim() || "No DBA name entered yet"}</strong>
          <p className={tw.muted}>{draft.dbaCounty.trim() || "No filing county entered yet"}</p>
        </article>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Publication</span>
          <strong>{draft.dbaPublicationFiled ? "Proof of publication filed" : "Not yet filed"}</strong>
          <p className={tw.muted}>{draft.dbaNewspaperName.trim() || "No newspaper recorded yet"}</p>
        </article>
      </div>
    </div>
  );
}

function GenericStepContent({
  step,
  substepIndex
}: {
  step: SetupStep;
  substepIndex: number;
}) {
  if (substepIndex === 0) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>{step.substeps[0]?.label ?? step.title}</h2>
          <p className={tw.muted}>{step.substeps[0]?.detail ?? step.description}</p>
        </div>
        <div className={tw.setupSummaryGrid}>
          <article className={`${tw.surfaceInset} ${tw.stack}`}>
            <span className={tw.kicker}>Why this matters</span>
            <strong>{step.title}</strong>
            <p className={tw.muted}>{step.description}</p>
          </article>
          <article className={`${tw.surfaceInset} ${tw.stack}`}>
            <span className={tw.kicker}>What it unlocks</span>
            <strong>Cleaner next steps</strong>
            <p className={tw.muted}>Finishing this step keeps the later filings, documents, and launch work from drifting out of sync.</p>
          </article>
        </div>
      </div>
    );
  }

  if (substepIndex === 1) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>{step.substeps[1]?.label ?? "Prepare inputs"}</h2>
          <p className={tw.muted}>{step.substeps[1]?.detail ?? "Gather what you need before moving forward."}</p>
        </div>
        <div className={tw.setupInfoPanel}>
          <strong>Prepare these inputs</strong>
          <ul className={tw.setupBulletListSimple}>
            {getStepPreparation(step).map((item) => (
              <li key={item} className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={tw.setupStage}>
      <div>
        <h2>{step.substeps[2]?.label ?? "Confirm step"}</h2>
        <p className={tw.muted}>{step.substeps[2]?.detail ?? "Confirm this step is ready to be marked complete."}</p>
      </div>
      <div className={tw.setupInfoPanel}>
        <strong>Expected outcome</strong>
        <ul className={tw.setupBulletListSimple}>
          {getStepOutputs(step).map((item) => (
            <li key={item} className="relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StepThreeContent({
  substepIndex,
  draft,
  onDraftChange,
  stepOneDraft,
  stepTwoDraft
}: {
  substepIndex: number;
  draft: StepThreeDraft;
  onDraftChange: (patch: Partial<StepThreeDraft>) => void;
  stepOneDraft: StepOneDraft;
  stepTwoDraft: StepTwoDraft;
}) {
  const [cityQuery, setCityQuery] = useState(draft.city);
  const cityResults = searchCities(cityQuery);
  const selectedCity = getCityByName(draft.city);

  const applicantName = stepTwoDraft.needsDba && stepTwoDraft.dbaName.trim()
    ? stepTwoDraft.dbaName.trim()
    : [stepOneDraft.legalFirstName, stepOneDraft.legalLastName].filter(Boolean).join(" ") || "your legal name";

  const li = "relative pl-[18px] leading-[1.6] text-[var(--muted)] before:absolute before:left-0 before:top-[0.65rem] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--accent)]";

  // 3.1 — City selection
  if (substepIndex === 0) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Which city are you operating in?</h2>
          <p className={tw.muted}>
            Select the California city where your business is physically located or where you primarily operate. This determines which city portal you will file through.
          </p>
        </div>
        <div className={tw.setupField}>
          <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">City</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search cities…"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                if (!e.target.value.trim()) onDraftChange({ city: "", county: "" });
              }}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            {cityQuery && !draft.city && cityResults.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-[260px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-lg">
                {cityResults.slice(0, 40).map((city) => (
                  <button
                    key={`${city.name}-${city.county}`}
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-[10px] text-left hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                    onClick={() => {
                      onDraftChange({ city: city.name, county: city.county });
                      setCityQuery(city.name);
                    }}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-[0.82rem] text-[var(--muted)]">{city.county} County</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {draft.city && (
            <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
              {draft.city}, {draft.county} County
              {selectedCity?.portal ? ` · ${selectedCity.portal.fee}` : ""}
              {" "}
              <button
                type="button"
                className="text-[var(--accent)] underline"
                onClick={() => { onDraftChange({ city: "", county: "" }); setCityQuery(""); }}
              >
                Change
              </button>
            </p>
          )}
        </div>
        {selectedCity?.portal && (
          <div className={tw.setupInfoPanel}>
            <strong>{selectedCity.portal.name}</strong>
            {selectedCity.portal.feeTable ? (
              <div className="mt-2 mb-1">
                <table className="w-full text-[0.8rem] border-collapse">
                  <thead>
                    <tr className="text-left text-[var(--muted)]">
                      <th className="pb-1 pr-4 font-medium">Team size</th>
                      <th className="pb-1 pr-4 font-medium text-right">New</th>
                      <th className="pb-1 font-medium text-right">Renewal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCity.portal.feeTable.map((row) => (
                      <tr key={row.label} className="border-t border-[var(--border)]">
                        <td className="py-1 pr-4">{row.label}</td>
                        <td className="py-1 pr-4 text-right">{row.newFee}</td>
                        <td className="py-1 text-right">{row.renewal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedCity.portal.feeFootnote && (
                  <p className="mt-1.5 text-[0.75rem] text-[var(--muted)]">{selectedCity.portal.feeFootnote}</p>
                )}
              </div>
            ) : (
              <p className={tw.muted}>{selectedCity.portal.fee}</p>
            )}
            {selectedCity.portal.notes && <p className={tw.muted}>{selectedCity.portal.notes}</p>}
            <a
              href={selectedCity.portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[0.88rem] text-[var(--accent)] underline"
            >
              Open business license application ↗
            </a>
          </div>
        )}
        {!selectedCity?.portal && draft.city && (
          <div className={tw.setupInfoPanel}>
            <strong>Filing info for {draft.city}</strong>
            <p className={tw.muted}>
              Search "{draft.city} business license" on the city's official website (.gov or .ca.us) to find the exact portal and fee schedule. Most California cities charge $30–$200/year for sole proprietors.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 3.2 — Application details
  if (substepIndex === 1) {
    return (
      <div className={tw.setupStage}>
        <div>
          <h2>Business license application details</h2>
          <p className={tw.muted}>
            Fill out the information required on the {draft.city || "city"} business license application. Fields pre-filled from your earlier answers — update anything that doesn't look right.
          </p>
        </div>

        <div className={tw.setupFormGrid}>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Applicant / owner name</label>
            <input
              type="text"
              readOnly
              value={[stepOneDraft.legalFirstName, stepOneDraft.legalMiddleName, stepOneDraft.legalLastName, stepOneDraft.legalSuffix].filter(Boolean).join(" ") || ""}
              placeholder="Pulled from Step 1"
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] px-4 py-3 text-[var(--muted)] focus:outline-none"
            />
          </div>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business name on license</label>
            <input
              type="text"
              readOnly
              value={applicantName}
              placeholder="DBA or legal name"
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] px-4 py-3 text-[var(--muted)] focus:outline-none"
            />
          </div>
        </div>

        <div className={tw.setupField}>
          <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business street address</label>
          <input
            type="text"
            placeholder="123 Main St"
            value={draft.businessAddress}
            onChange={(e) => onDraftChange({ businessAddress: e.target.value })}
            className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className={tw.setupFormGrid}>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">City</label>
            <input
              type="text"
              value={draft.businessCity || draft.city}
              onChange={(e) => onDraftChange({ businessCity: e.target.value })}
              placeholder={draft.city || "City"}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">ZIP code</label>
            <input
              type="text"
              placeholder="90210"
              value={draft.businessZip}
              onChange={(e) => onDraftChange({ businessZip: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className={tw.setupFormGrid}>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Phone number</label>
            <input
              type="tel"
              placeholder="(555) 000-0000"
              value={draft.phone}
              onChange={(e) => onDraftChange({ phone: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={draft.email}
              onChange={(e) => onDraftChange({ email: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className={tw.setupFormGrid}>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business start date</label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => onDraftChange({ startDate: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Number of employees (incl. owner)</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={draft.employeeCount}
              onChange={(e) => onDraftChange({ employeeCount: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className={tw.setupField}>
          <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business activity description</label>
          <textarea
            rows={3}
            placeholder="e.g. Online software development and consulting services"
            value={draft.activity}
            onChange={(e) => onDraftChange({ activity: e.target.value })}
            className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <p className="text-[0.8rem] text-[var(--muted)]">Describe what the business does. This goes on the application as the "type of business."</p>
        </div>

        <div className={tw.setupFormGrid}>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business category</label>
            <select
              value={draft.businessCategory}
              onChange={(e) => onDraftChange({ businessCategory: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">Select a category…</option>
              <option value="Advertising / Marketing">Advertising / Marketing</option>
              <option value="Consulting / Professional Services">Consulting / Professional Services</option>
              <option value="Construction / Contracting">Construction / Contracting</option>
              <option value="E-commerce / Online Retail">E-commerce / Online Retail</option>
              <option value="Education / Training">Education / Training</option>
              <option value="Finance / Accounting">Finance / Accounting</option>
              <option value="Food / Beverage">Food / Beverage</option>
              <option value="Healthcare / Medical">Healthcare / Medical</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Retail (Physical Store)">Retail (Physical Store)</option>
              <option value="Technology / Software">Technology / Software</option>
              <option value="Transportation / Delivery">Transportation / Delivery</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[0.8rem] text-[var(--muted)]">Required on city applications — pick the closest match.</p>
          </div>
          <div className={tw.setupField}>
            <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Business website <span className="font-normal opacity-60">(optional)</span></label>
            <input
              type="url"
              placeholder="https://example.com"
              value={draft.website}
              onChange={(e) => onDraftChange({ website: e.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <p className="text-[0.8rem] text-[var(--muted)]">Some cities ask for this on the application.</p>
          </div>
        </div>

        <div className={tw.setupField}>
          <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Estimated annual gross receipts</label>
          <input
            type="text"
            placeholder="e.g. $50,000"
            value={draft.grossReceipts}
            onChange={(e) => onDraftChange({ grossReceipts: e.target.value })}
            className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <p className="text-[0.8rem] text-[var(--muted)]">Many cities use this to calculate your annual fee. Estimate is fine for new businesses.</p>
        </div>

        <div className={tw.setupField}>
          <label className="text-[0.88rem] font-bold tracking-[0.04em] text-[var(--muted)]">Home-based business?</label>
          <div className={tw.setupChoiceGrid}>
            <EntityChoiceCard
              selected={draft.isHomeBased === true}
              title="Yes, home-based"
              detail="Business is operated from a residential address."
              onClick={() => onDraftChange({ isHomeBased: true })}
            />
            <EntityChoiceCard
              selected={draft.isHomeBased === false}
              title="No, separate location"
              detail="Business operates from a commercial or other location."
              onClick={() => onDraftChange({ isHomeBased: false })}
            />
          </div>
          {draft.isHomeBased === true && (
            <p className="mt-2 text-[0.85rem] text-[var(--muted)]">
              Most cities require a separate Home Occupation Permit for home-based businesses. This is usually a low-cost add-on to your business license.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3.3 — Filing confirmation
  return (
    <div className={tw.setupStage}>
      <div>
        <h2>Filing plan for {draft.city || "your city"}</h2>
        <p className={tw.muted}>
          Review what you've entered and confirm the plan before moving to tax registration.
        </p>
      </div>
      <div className={tw.setupSummaryGrid}>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Business identity</span>
          <strong>{applicantName}</strong>
          <p className={tw.muted}>{draft.businessAddress || "No address entered"}{draft.businessCity ? `, ${draft.businessCity}` : ""}{draft.businessZip ? ` ${draft.businessZip}` : ""}</p>
          <p className={tw.muted}>{draft.activity || "No activity description entered"}</p>
        </article>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Filing details</span>
          <strong>{draft.city}{draft.county ? `, ${draft.county} County` : ""}</strong>
          <p className={tw.muted}>Start date: {draft.startDate || "Not set"}</p>
          <p className={tw.muted}>Employees: {draft.employeeCount || "Not set"}</p>
          <p className={tw.muted}>Gross receipts: {draft.grossReceipts || "Not set"}</p>
          <p className={tw.muted}>Category: {draft.businessCategory || "Not set"}</p>
          {draft.website && <p className={tw.muted}>Website: {draft.website}</p>}
          <p className={tw.muted}>{draft.isHomeBased ? "Home-based — may need Home Occupation Permit" : draft.isHomeBased === false ? "Separate location" : ""}</p>
        </article>
      </div>
      {selectedCity?.portal ? (
        <div className={tw.setupInfoPanel}>
          <strong>Where to file</strong>
          <ul className={tw.setupBulletListSimple}>
            <li className={li}>Apply here: <a href={selectedCity.portal.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">{selectedCity.portal.name} ↗</a></li>
            <li className={li}>Fee: {selectedCity.portal.fee}</li>
            {selectedCity.portal.feeFootnote && <li className={li}>{selectedCity.portal.feeFootnote}</li>}
            {selectedCity.portal.notes && <li className={li}>{selectedCity.portal.notes}</li>}
            <li className={li}>Annual renewal — mark your calendar when approved.</li>
          </ul>
        </div>
      ) : draft.city ? (
        <div className={tw.setupInfoPanel}>
          <strong>Next: file online or in person</strong>
          <ul className={tw.setupBulletListSimple}>
            <li className={li}>Search "{draft.city} business license apply" to find the official city portal.</li>
            <li className={li}>Bring your legal name, business address, start date, and activity description.</li>
            <li className={li}>Most California cities charge $30–$200/year for sole proprietors.</li>
            <li className={li}>Renew annually — the city will mail or email a renewal notice.</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function FinalReviewContent({
  config,
  session
}: {
  config: SetupConfig;
  session: SetupSession;
}) {
  const fullName = [
    session?.legalFirstName,
    session?.legalMiddleName,
    session?.legalLastName
  ]
    .filter(Boolean)
    .join(" ");
  const nameWithSuffix = session?.legalSuffix ? `${fullName}, ${session.legalSuffix}` : fullName;

  return (
    <div className={tw.setupStage}>
      <div>
        <h2>Final review</h2>
        <p className={tw.muted}>
          This is the full setup pass before the track is marked complete. The main step stays synced to the dashboard, while this page gives you the smaller checkpoint view.
        </p>
      </div>
      <div className={tw.setupReviewGrid}>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Applicant context</span>
          <strong>{session?.isEntityApplication ? "Entity filing" : "Individual filing"}</strong>
          <p className={tw.muted}>{nameWithSuffix || "No personal legal name recorded."}</p>
        </article>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>DBA / FBN</span>
          <strong>
            {session?.needsDba === false
              ? "Not needed"
              : session?.dbaName || "No DBA name recorded"}
          </strong>
          <p className={tw.muted}>
            {session?.needsDba === false
              ? "Operating under the legal name."
              : session?.dbaCounty
                ? `${session.dbaCounty}${session?.dbaPublicationFiled ? " · Proof of publication filed" : " · Publication pending"}`
                : "Filing details not recorded yet."}
          </p>
        </article>
        <article className={`${tw.surfaceInset} ${tw.stack}`}>
          <span className={tw.kicker}>Step coverage</span>
          <div className="grid gap-2.5">
            {config.steps.map((step) => {
              const status = session?.stepStatuses[step.stepNumber - 1] ?? "not_started";
              return (
                <div key={step.stepNumber} className="grid items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)] px-[14px] py-3 md:grid-cols-[88px_minmax(0,1fr)_auto]">
                  <span className="text-[0.8rem] uppercase tracking-[0.12em] text-[var(--muted)]">Step {step.stepNumber}</span>
                  <strong>{step.title}</strong>
                  <em
                    className={`rounded-full px-2.5 py-2 text-[0.8rem] font-bold not-italic ${
                      getStatusTone(status) === "complete"
                        ? "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]"
                        : getStatusTone(status) === "incomplete"
                          ? "bg-[color-mix(in_srgb,#f59e0b_16%,transparent)] text-[#f59e0b]"
                          : "bg-[color-mix(in_srgb,var(--border)_70%,transparent)] text-[var(--muted)]"
                    }`}
                  >
                    {getStatusLabel(status)}
                  </em>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}

export function SetupWizard({
  businessType,
  initialUser
}: {
  businessType: string;
  initialUser?: CurrentUser | null;
}) {
  const config = getSetupConfig(businessType);
  const session = useQuery(convexApi.getSetupSession, { businessType }) ?? null;
  const startSetup = useMutation(convexApi.startSetup);
  const saveSetupStep = useMutation(convexApi.saveSetupStep);
  const resetSetupStep = useMutation(convexApi.resetSetupStep);
  const resetSetup = useMutation(convexApi.resetSetup);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [localStep, setLocalStep] = useState<number | null>(null);
  const [localStepStatuses, setLocalStepStatuses] = useState<string[] | null>(null);
  const [localSubsteps, setLocalSubsteps] = useState<Record<number, number>>({});
  const [stepOneDraft, setStepOneDraft] = useState<StepOneDraft>({
    isEntityApplication: null,
    legalFirstName: "",
    legalMiddleName: "",
    legalLastName: "",
    legalSuffix: ""
  });
  const [stepTwoDraft, setStepTwoDraft] = useState<StepTwoDraft>({
    needsDba: null,
    dbaName: "",
    dbaCounty: "",
    dbaNewspaperName: "",
    dbaPublicationFiled: null,
    dbaProofMode: null
  });

  const [stepThreeDraft, setStepThreeDraft] = useState<StepThreeDraft>({
    city: "",
    county: "",
    businessAddress: "",
    businessCity: "",
    businessZip: "",
    phone: "",
    email: "",
    startDate: "",
    activity: "",
    isHomeBased: null,
    employeeCount: "",
    grossReceipts: "",
    businessCategory: "",
    website: ""
  });

  useEffect(() => {
    setStepThreeDraft({
      city: session?.cityLicenseCity ?? "",
      county: session?.cityLicenseCounty ?? "",
      businessAddress: session?.cityLicenseBusinessAddress ?? "",
      businessCity: session?.cityLicenseBusinessCity ?? "",
      businessZip: session?.cityLicenseBusinessZip ?? "",
      phone: session?.cityLicensePhone ?? "",
      email: session?.cityLicenseEmail ?? "",
      startDate: session?.cityLicenseStartDate ?? "",
      activity: session?.cityLicenseActivity ?? "",
      isHomeBased: session?.cityLicenseIsHomeBased ?? null,
      employeeCount: session?.cityLicenseEmployeeCount ?? "",
      grossReceipts: session?.cityLicenseGrossReceipts ?? "",
      businessCategory: session?.cityLicenseBusinessCategory ?? "",
      website: session?.cityLicenseWebsite ?? ""
    });
  }, [
    session?.cityLicenseCity,
    session?.cityLicenseCounty,
    session?.cityLicenseBusinessAddress,
    session?.cityLicenseBusinessCity,
    session?.cityLicenseBusinessZip,
    session?.cityLicensePhone,
    session?.cityLicenseEmail,
    session?.cityLicenseStartDate,
    session?.cityLicenseActivity,
    session?.cityLicenseIsHomeBased,
    session?.cityLicenseEmployeeCount,
    session?.cityLicenseGrossReceipts,
    session?.cityLicenseBusinessCategory,
    session?.cityLicenseWebsite
  ]);

  useEffect(() => {
    setStepOneDraft({
      isEntityApplication: session?.isEntityApplication ?? null,
      legalFirstName: session?.legalFirstName ?? "",
      legalMiddleName: session?.legalMiddleName ?? "",
      legalLastName: session?.legalLastName ?? "",
      legalSuffix: session?.legalSuffix ?? ""
    });
  }, [
    session?.isEntityApplication,
    session?.legalFirstName,
    session?.legalMiddleName,
    session?.legalLastName,
    session?.legalSuffix
  ]);

  useEffect(() => {
    setStepTwoDraft({
      needsDba: session?.needsDba ?? null,
      dbaName: session?.dbaName ?? "",
      dbaCounty: session?.dbaCounty ?? "",
      dbaNewspaperName: session?.dbaNewspaperName ?? "",
      dbaPublicationFiled: session?.dbaPublicationFiled ?? null,
      dbaProofMode: null
    });
  }, [
    session?.needsDba,
    session?.dbaName,
    session?.dbaCounty,
    session?.dbaNewspaperName,
    session?.dbaPublicationFiled
  ]);

  useEffect(() => {
    if (session?.currentStep) {
      setLocalStep((current) => current ?? getEffectiveCurrentStep(session.stepStatuses, session.currentStep));
    }
  }, [session?.currentStep, session?.stepStatuses]);

  useEffect(() => {
    if (config && session?.stepStatuses) {
      setLocalStepStatuses((current) =>
        current ?? normalizeStepStatuses(config, session.stepStatuses, session.currentStep)
      );
    }
  }, [config, session?.currentStep, session?.stepStatuses]);

  if (!config) {
    return (
      <DashboardLayout
        title="Setup wizard"
        description="This business type does not have a setup wizard yet."
        initialUser={initialUser}
        showHeader={false}
      >
        <p>Unknown business type: {businessType}</p>
      </DashboardLayout>
    );
  }

  const sessionCurrentStep = session
    ? getEffectiveCurrentStep(session.stepStatuses, session.currentStep)
    : 0;
  const currentStep = localStep ?? sessionCurrentStep;
  const currentStepConfig = currentStep > 0 ? config.steps[currentStep - 1] : null;
  const stepStatuses =
    localStepStatuses ??
    normalizeStepStatuses(config, session?.stepStatuses, currentStep);
  const activeSubstepIndex = currentStepConfig
    ? localSubsteps[currentStep] ?? getDefaultSubstepIndex(currentStepConfig, session)
    : 0;
  const visibleSubsteps = useMemo(() => {
    if (!currentStepConfig) return [];
    return currentStepConfig.substeps;
  }, [currentStepConfig]);
  const currentSubstep = visibleSubsteps[activeSubstepIndex] ?? null;
  const completedSteps = stepStatuses.filter((status) => status === "complete" || status === "not_needed").length;
  const totalSubsteps = config.steps.reduce((sum, step) => sum + step.substeps.length, 0);
  const completedSubsteps = stepStatuses.reduce((sum, status, idx) => {
    const step = config.steps[idx];
    if (!step) return sum;
    if (status === "complete" || status === "not_needed") return sum + step.substeps.length;
    if (status === "in_progress" && (idx + 1) === currentStep) return sum + activeSubstepIndex;
    return sum;
  }, 0);
  const progressPercent = totalSubsteps > 0 ? Math.round((completedSubsteps / totalSubsteps) * 100) : 0;
  const showCheckpointTabs =
    currentStepConfig?.stepNumber === 1 ||
    currentStepConfig?.stepNumber === 2 ||
    currentStepConfig?.stepNumber === 3;

  const updateSubstep = async (stepNumber: number, substepIndex: number) => {
    setLocalSubsteps((current) => ({
      ...current,
      [stepNumber]: substepIndex
    }));

    try {
      await persistCurrentStep(stepNumber, stepStatuses, undefined, substepIndex);
    } catch (cause) {
      console.error("Failed to save substep progress", cause);
    }
  };

  const applyLocalProgress = (targetStep: number, nextStatuses: string[]) => {
    setLocalStep(targetStep);
    setLocalStepStatuses(nextStatuses);
  };

  useEffect(() => {
    if (!currentStepConfig || visibleSubsteps.length === 0) return;
    if (activeSubstepIndex >= visibleSubsteps.length) {
      updateSubstep(currentStepConfig.stepNumber, Math.max(visibleSubsteps.length - 1, 0));
    }
  }, [activeSubstepIndex, currentStepConfig, visibleSubsteps.length]);

  useEffect(() => {
    if (currentStep === 2 && activeSubstepIndex === 0) {
      if (stepTwoDraft.needsDba === false && stepStatuses[1] !== "not_needed") {
        const nextStatuses = [...stepStatuses];
        nextStatuses[1] = "not_needed";
        setLocalStepStatuses(nextStatuses);
      } else if (stepTwoDraft.needsDba === true && stepStatuses[1] === "not_needed") {
        const nextStatuses = [...stepStatuses];
        nextStatuses[1] = "in_progress";
        setLocalStepStatuses(nextStatuses);
      }
    }
  }, [stepTwoDraft.needsDba, currentStep, activeSubstepIndex, stepStatuses]);

  const persistCurrentStep = async (targetStep: number, nextStatuses: string[], isCompleted?: boolean, substepIndex?: number) => {
    const substepIdx = substepIndex ?? localSubsteps[targetStep] ?? 0;
    const totalSubs = config.steps.reduce((sum, step) => sum + step.substeps.length, 0);
    const completedSubs = nextStatuses.reduce((sum, status, idx) => {
      const step = config.steps[idx];
      if (!step) return sum;
      if (status === "complete" || status === "not_needed") return sum + step.substeps.length;
      if (status === "in_progress" && (idx + 1) === targetStep) return sum + substepIdx;
      return sum;
    }, 0);
    await saveSetupStep({
      businessType,
      currentStep: targetStep,
      stepStatuses: nextStatuses,
      currentSubstep: substepIdx,
      completedSubsteps: completedSubs,
      totalSubsteps: totalSubs,
      isEntityApplication: stepOneDraft.isEntityApplication ?? undefined,
      legalFirstName: stepOneDraft.legalFirstName.trim() || undefined,
      legalMiddleName: stepOneDraft.legalMiddleName.trim() || undefined,
      legalLastName: stepOneDraft.legalLastName.trim() || undefined,
      legalSuffix: stepOneDraft.legalSuffix.trim() || undefined,
      needsDba: stepTwoDraft.needsDba ?? undefined,
      dbaName: stepTwoDraft.dbaName.trim() || undefined,
      dbaCounty: stepTwoDraft.dbaCounty.trim() || undefined,
      dbaNewspaperName: stepTwoDraft.dbaNewspaperName.trim() || undefined,
      dbaPublicationFiled: stepTwoDraft.dbaPublicationFiled ?? undefined,
      cityLicenseCity: stepThreeDraft.city.trim() || undefined,
      cityLicenseCounty: stepThreeDraft.county.trim() || undefined,
      cityLicenseBusinessAddress: stepThreeDraft.businessAddress.trim() || undefined,
      cityLicenseBusinessCity: stepThreeDraft.businessCity.trim() || undefined,
      cityLicenseBusinessZip: stepThreeDraft.businessZip.trim() || undefined,
      cityLicensePhone: stepThreeDraft.phone.trim() || undefined,
      cityLicenseEmail: stepThreeDraft.email.trim() || undefined,
      cityLicenseStartDate: stepThreeDraft.startDate.trim() || undefined,
      cityLicenseActivity: stepThreeDraft.activity.trim() || undefined,
      cityLicenseIsHomeBased: stepThreeDraft.isHomeBased ?? undefined,
      cityLicenseEmployeeCount: stepThreeDraft.employeeCount.trim() || undefined,
      cityLicenseGrossReceipts: stepThreeDraft.grossReceipts.trim() || undefined,
      cityLicenseBusinessCategory: stepThreeDraft.businessCategory.trim() || undefined,
      cityLicenseWebsite: stepThreeDraft.website.trim() || undefined,
      isCompleted
    });
    setLocalStep(targetStep);
  };

  const handleStart = async () => {
    setSaving(true);
    setError(null);
    await updateSubstep(1, 0);
    setLocalStep(1);

    try {
      await startSetup({ businessType });
    } catch (cause) {
      console.error("Failed to persist setup start", cause);
      setError("Setup opened, but progress could not save yet. Check that Convex is running, then keep going or try again.");
    } finally {
      setSaving(false);
    }
  };

  const isStepEmpty = (stepNumber: number): boolean => {
    if (stepNumber === 1) return stepOneDraft.isEntityApplication === null && !stepOneDraft.legalFirstName.trim() && !stepOneDraft.legalLastName.trim();
    if (stepNumber === 2) return stepTwoDraft.needsDba === null;
    if (stepNumber === 3) return !stepThreeDraft.city.trim();
    return false;
  };

  const collapseEmptyStep = (statuses: string[], stepNumber: number): string[] => {
    const next = [...statuses];
    if (next[stepNumber - 1] === "in_progress" && isStepEmpty(stepNumber)) {
      next[stepNumber - 1] = "not_started";
    }
    return next;
  };

  const handleNavigate = async (stepNumber: number) => {
    if (!config.steps[stepNumber - 1]) return;
    const targetStatus = stepStatuses[stepNumber - 1] ?? "not_started";
    const canOpenStep = devMode || stepNumber <= currentStep || targetStatus === "complete" || targetStatus === "not_needed";
    if (!canOpenStep) return;

    setSaving(true);
    setError(null);

    try {
      let nextStatuses = collapseEmptyStep([...stepStatuses], currentStep);
      if (nextStatuses[stepNumber - 1] === "not_started") {
        nextStatuses[stepNumber - 1] = "in_progress";
      }
      const defaultSubstepIdx = getDefaultSubstepIndex(config.steps[stepNumber - 1], session);
      applyLocalProgress(stepNumber, nextStatuses);
      setLocalSubsteps((current) => ({ ...current, [stepNumber]: defaultSubstepIdx }));
      await persistCurrentStep(stepNumber, nextStatuses, undefined, defaultSubstepIdx);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to change steps");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    if (activeSubstepIndex > 0 && currentStepConfig) {
      await updateSubstep(currentStepConfig.stepNumber, activeSubstepIndex - 1);
      return;
    }

    if (!currentStepConfig) return;

    if (currentStep === 1) {
      setLocalStep(0);
      return;
    }

    if (currentStep <= 0) return;

    const previousStep = currentStep - 1;
    const previousConfig = config.steps[previousStep - 1];
    setSaving(true);
    setError(null);

    try {
      const nextStatuses = collapseEmptyStep([...stepStatuses], currentStep);
      const prevSubstepIdx = Math.max(previousConfig.substeps.length - 1, 0);
      applyLocalProgress(previousStep, nextStatuses);
      setLocalSubsteps((current) => ({ ...current, [previousStep]: prevSubstepIdx }));
      await persistCurrentStep(previousStep, nextStatuses, undefined, prevSubstepIdx);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to go back");
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToSubstep = async (stepNumber: number, substepIndex: number) => {
    if (stepNumber === currentStep) {
      await updateSubstep(stepNumber, substepIndex);
      return;
    }
    const targetStatus = stepStatuses[stepNumber - 1] ?? "not_started";
    const canOpenStep = devMode || stepNumber <= currentStep || targetStatus === "complete" || targetStatus === "not_needed";
    if (!canOpenStep) return;
    setSaving(true);
    setError(null);
    try {
      let nextStatuses = collapseEmptyStep([...stepStatuses], currentStep);
      if (nextStatuses[stepNumber - 1] === "not_started") nextStatuses[stepNumber - 1] = "in_progress";
      applyLocalProgress(stepNumber, nextStatuses);
      setLocalSubsteps((current) => ({ ...current, [stepNumber]: substepIndex }));
      await persistCurrentStep(stepNumber, nextStatuses, undefined, substepIndex);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to navigate");
    } finally {
      setSaving(false);
    }
  };

  const handleResetStep = async () => {
    if (!currentStepConfig) return;
    if (!window.confirm(`Reset Step ${currentStepConfig.stepNumber} — ${currentStepConfig.title}? This will clear all data entered for this step.`)) return;

    setSaving(true);
    setError(null);
    try {
      await resetSetupStep({ businessType, stepNumber: currentStepConfig.stepNumber });
      setLocalSubsteps((current) => ({ ...current, [currentStepConfig.stepNumber]: 0 }));
      if (currentStepConfig.stepNumber === 1) {
        setStepOneDraft({ isEntityApplication: null, legalFirstName: "", legalMiddleName: "", legalLastName: "", legalSuffix: "" });
      } else if (currentStepConfig.stepNumber === 2) {
        setStepTwoDraft({ needsDba: null, dbaName: "", dbaCounty: "", dbaNewspaperName: "", dbaPublicationFiled: null, dbaProofMode: null });
      } else if (currentStepConfig.stepNumber === 3) {
        setStepThreeDraft({ city: "", county: "", businessAddress: "", businessCity: "", businessZip: "", phone: "", email: "", startDate: "", activity: "", isHomeBased: null, employeeCount: "", grossReceipts: "", businessCategory: "", website: "" });
      }
      const nextStatuses = [...stepStatuses];
      nextStatuses[currentStepConfig.stepNumber - 1] = "not_started";
      setLocalStepStatuses(nextStatuses);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to reset step");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSetup = async () => {
    if (!window.confirm("Reset the entire setup? This will clear all data across every step and start over from Step 1.")) return;

    setSaving(true);
    setError(null);
    try {
      await resetSetup({ businessType });
      setStepOneDraft({ isEntityApplication: null, legalFirstName: "", legalMiddleName: "", legalLastName: "", legalSuffix: "" });
      setStepTwoDraft({ needsDba: null, dbaName: "", dbaCounty: "", dbaNewspaperName: "", dbaPublicationFiled: null, dbaProofMode: null });
      setStepThreeDraft({ city: "", county: "", businessAddress: "", businessCity: "", businessZip: "", phone: "", email: "", startDate: "", activity: "", isHomeBased: null, employeeCount: "", grossReceipts: "", businessCategory: "", website: "" });
      setLocalSubsteps({});
      setLocalStep(null);
      setLocalStepStatuses(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to reset setup");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!currentStepConfig) return;

    if (!devMode && currentStepConfig.stepNumber === 1 && activeSubstepIndex === 0) {
      if (stepOneDraft.isEntityApplication === null) {
        setError("Choose whether you are applying as yourself or as an entity before moving on.");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const nextStatuses = [...stepStatuses];
        nextStatuses[0] = "in_progress";
        applyLocalProgress(1, nextStatuses);
        setLocalSubsteps((current) => ({ ...current, [1]: 1 }));
        await persistCurrentStep(1, nextStatuses, undefined, 1);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to save applicant choice");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!devMode && currentStepConfig.stepNumber === 1 && activeSubstepIndex === 1) {
      if (!stepOneDraft.legalFirstName.trim() || !stepOneDraft.legalLastName.trim()) {
        setError("First name and last name are required before you finish step 1.");
        return;
      }
    }

    if (!devMode && currentStepConfig.stepNumber === 2 && activeSubstepIndex === 0) {
      if (stepTwoDraft.needsDba === null) {
        setError("Choose whether you need a DBA or FBN filing before continuing.");
        return;
      }

      if (stepTwoDraft.needsDba === false) {
        setSaving(true);
        setError(null);

        try {
          const nextStatuses = [...stepStatuses];
          nextStatuses[1] = "not_needed";
          const nextStep = 3;
          if (nextStatuses[nextStep - 1] !== "complete") {
            nextStatuses[nextStep - 1] = "in_progress";
          }
          applyLocalProgress(nextStep, nextStatuses);
          setLocalSubsteps((current) => ({ ...current, [nextStep]: 0 }));
          await persistCurrentStep(nextStep, nextStatuses, undefined, 0);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Failed to skip step");
        } finally {
          setSaving(false);
        }
        return;
      }
    }

    if (!devMode && currentStepConfig.stepNumber === 2 && activeSubstepIndex === 1) {
      if (!stepTwoDraft.dbaName.trim() || !stepTwoDraft.dbaCounty.trim()) {
        setError("DBA name and filing county are both required before continuing.");
        return;
      }
    }

    if (!devMode && currentStepConfig.stepNumber === 2 && activeSubstepIndex === 2) {
      if (!stepTwoDraft.dbaNewspaperName.trim()) {
        setError("Enter the newspaper you plan to use for publication.");
        return;
      }
      if (stepTwoDraft.dbaPublicationFiled === null) {
        setError("Let us know if you have your proof of publication yet.");
        return;
      }
      if (stepTwoDraft.dbaPublicationFiled === true && stepTwoDraft.dbaProofMode === null) {
        setError("Upload your proof of publication or select \"I'll submit it myself\" to continue.");
        return;
      }
    }

    if (!devMode && currentStepConfig.stepNumber === 3 && activeSubstepIndex === 0) {
      if (!stepThreeDraft.city.trim()) {
        setError("Select a city before continuing.");
        return;
      }
    }

    if (!devMode && currentStepConfig.stepNumber === 3 && activeSubstepIndex === 1) {
      if (!stepThreeDraft.businessAddress.trim() || !stepThreeDraft.businessZip.trim()) {
        setError("Enter the business street address and ZIP code before continuing.");
        return;
      }
      if (!stepThreeDraft.activity.trim()) {
        setError("Add a business activity description before continuing.");
        return;
      }
    }

    if (activeSubstepIndex < visibleSubsteps.length - 1) {
      await updateSubstep(currentStepConfig.stepNumber, activeSubstepIndex + 1);
      return;
    }

    if (!devMode) {
      if (currentStepConfig.stepNumber === 1) {
        if (stepOneDraft.isEntityApplication === null) {
          setError("Choose whether you are applying as yourself or as an entity.");
          return;
        }
        if (!stepOneDraft.legalFirstName.trim() || !stepOneDraft.legalLastName.trim()) {
          setError("First name and last name are required to finish Step 1.");
          return;
        }
      }
      if (currentStepConfig.stepNumber === 2 && stepTwoDraft.needsDba === true) {
        if (!stepTwoDraft.dbaName.trim() || !stepTwoDraft.dbaCounty.trim()) {
          setError("DBA name and filing county are required to finish Step 2.");
          return;
        }
        if (!stepTwoDraft.dbaNewspaperName.trim()) {
          setError("Enter the newspaper name where the DBA will be published.");
          return;
        }
      }
      if (currentStepConfig.stepNumber === 3) {
        if (!stepThreeDraft.city.trim()) {
          setError("Select a city to finish Step 3.");
          return;
        }
        if (!stepThreeDraft.businessAddress.trim() || !stepThreeDraft.businessZip.trim()) {
          setError("Business address and ZIP code are required to finish Step 3.");
          return;
        }
        if (!stepThreeDraft.activity.trim()) {
          setError("Business activity description is required to finish Step 3.");
          return;
        }
        if (!stepThreeDraft.phone.trim()) {
          setError("Phone number is required to finish Step 3.");
          return;
        }
        if (stepThreeDraft.isHomeBased === null) {
          setError("Indicate whether this is a home-based business to finish Step 3.");
          return;
        }
      }
    }

    setSaving(true);
    setError(null);

    try {
      const nextStatuses = [...stepStatuses];
      nextStatuses[currentStepConfig.stepNumber - 1] = "complete";

      if (currentStepConfig.stepNumber < config.totalSteps) {
        if (nextStatuses[currentStepConfig.stepNumber] !== "complete") {
          nextStatuses[currentStepConfig.stepNumber] = "in_progress";
        }

        const nextStep = currentStepConfig.stepNumber + 1;
        applyLocalProgress(nextStep, nextStatuses);
        setLocalSubsteps((current) => ({ ...current, [nextStep]: 0 }));
        await persistCurrentStep(nextStep, nextStatuses, undefined, 0);
      } else {
        await persistCurrentStep(currentStepConfig.stepNumber, nextStatuses, true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const renderMainStage = () => {
    if (!currentStepConfig) {
      return (
        <SetupKickoff
          config={config}
          businessType={businessType}
          saving={saving}
          error={error}
          onStart={handleStart}
        />
      );
    }

    const isFinalStep = currentStepConfig.stepNumber === config.totalSteps;

    return (
      <div className={tw.setupWorkspace}>
        <section className={tw.setupWorkbench}>
          <div className="flex flex-col items-start justify-between gap-6 xl:flex-row">
            <div className="max-w-[760px]">
              <div className={tw.kicker}>
                Step {currentStepConfig.stepNumber} of {config.totalSteps}
                {showCheckpointTabs && currentSubstep ? ` · ${currentStepConfig.stepNumber}.${activeSubstepIndex + 1}` : ""}
              </div>
              <h1 className="mt-2.5 font-sans text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.95] tracking-[-0.05em]">{currentStepConfig.title}</h1>
              <p className="mt-[14px] max-w-[760px] text-[1.05rem] leading-[1.7] text-[var(--muted)]">{currentStepConfig.description}</p>
            </div>
            <div className="min-w-[180px] rounded-[20px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_74%,transparent)] px-5 py-[18px] text-right">
              <span className="block text-[0.88rem] text-[var(--muted)]">{progressPercent}% complete</span>
              <strong className="mt-1.5 block text-[1.3rem]">{completedSubsteps} finished</strong>
            </div>
          </div>

          {showCheckpointTabs ? (
            <div className="grid gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]" role="tablist" aria-label="Current step checkpoints">
              {visibleSubsteps.map((substep, index) => {
                const skippedByLegalName = currentStepConfig.stepNumber === 2 && stepTwoDraft.needsDba === false && index > 0;
                const isLocked = !devMode && !skippedByLegalName && index > activeSubstepIndex;
                const isActive = index === activeSubstepIndex;
                return (
                  <button
                    key={substep.key}
                    type="button"
                    disabled={skippedByLegalName || isLocked}
                    className={`grid gap-1 rounded-[18px] border px-4 py-[14px] text-left transition-opacity ${
                      skippedByLegalName || isLocked
                        ? "cursor-not-allowed border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)] opacity-35"
                        : isActive
                          ? "border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_14%,var(--panel))]"
                          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)] hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                    }`}
                    onClick={() => !skippedByLegalName && !isLocked && updateSubstep(currentStepConfig.stepNumber, index)}
                  >
                    <span className="text-[0.78rem] font-bold tracking-[0.12em] text-[var(--muted)]">
                      {currentStepConfig.stepNumber}.{index + 1}{isLocked ? " 🔒" : ""}
                    </span>
                    <strong className="text-[0.95rem]">{substep.label}</strong>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className={tw.setupContentGrid}>
            <div className={tw.setupPrimaryPanel}>
              {error ? <div className={tw.setupError}>{error}</div> : null}
              {isFinalStep ? (
                <FinalReviewContent config={config} session={session} />
              ) : currentStepConfig.stepNumber === 1 ? (
                <StepOneContent
                  substepIndex={activeSubstepIndex}
                  draft={stepOneDraft}
                  onDraftChange={(patch) =>
                    setStepOneDraft((current) => ({
                      ...current,
                      ...patch
                    }))
                  }
                />
              ) : currentStepConfig.stepNumber === 2 ? (
                <StepTwoContent
                  substepIndex={activeSubstepIndex}
                  isEntityApplication={stepOneDraft.isEntityApplication}
                  businessType={businessType}
                  draft={stepTwoDraft}
                  onDraftChange={(patch) =>
                    setStepTwoDraft((current) => ({
                      ...current,
                      ...patch
                    }))
                  }
                />
              ) : currentStepConfig.stepNumber === 3 ? (
                <StepThreeContent
                  substepIndex={activeSubstepIndex}
                  draft={stepThreeDraft}
                  onDraftChange={(patch) =>
                    setStepThreeDraft((current) => ({
                      ...current,
                      ...patch
                    }))
                  }
                  stepOneDraft={stepOneDraft}
                  stepTwoDraft={stepTwoDraft}
                />
              ) : (
                <GenericStepContent step={currentStepConfig} substepIndex={activeSubstepIndex} />
              )}
            </div>
          </div>

          <div className={tw.setupActionBar}>
            <button
              type="button"
              className={tw.setupButtonSecondary}
              onClick={handleBack}
            >
              Back
            </button>
            <div className={tw.setupActionMeta}>
              <strong>
                {currentSubstep?.label ?? currentStepConfig.title}
              </strong>
              <span className={tw.muted}>
                {isFinalStep
                  ? "Finish the full setup track."
                  : currentStepConfig.stepNumber === 2 && activeSubstepIndex === 0 && stepTwoDraft.needsDba === false
                    ? "Checkpoints 2.2–2.4 are skipped — no filing needed."
                    : activeSubstepIndex === visibleSubsteps.length - 1
                    ? "Mark this step complete and move forward."
                    : "Move to the next checkpoint inside this step."}
              </span>
            </div>
            <button
              type="button"
              className={tw.setupButtonPrimary}
              onClick={handleNext}
              disabled={saving}
            >
              {isFinalStep
                ? "Complete setup"
                : currentStepConfig.stepNumber === 2 && activeSubstepIndex === 0 && stepTwoDraft.needsDba === false
                  ? "Skip to Step 3"
                  : currentStepConfig.stepNumber === 1 && activeSubstepIndex === 0
                    ? "Next"
                    : activeSubstepIndex === visibleSubsteps.length - 1
                  ? "Finish step"
                  : "Next checkpoint"}
            </button>
          </div>
        </section>

        <SetupProgressRail
          config={config}
          session={session}
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          activeSubstepIndex={activeSubstepIndex}
          onNavigate={handleNavigate}
          onNavigateSubstep={handleNavigateToSubstep}
        />
      </div>
    );
  };

  const topRightContent = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setDevMode((v) => !v)}
        className={`rounded-xl border px-3 py-1.5 text-[0.75rem] font-bold tracking-[0.06em] transition-colors ${
          devMode
            ? "border-[color-mix(in_srgb,#f59e0b_50%,transparent)] bg-[color-mix(in_srgb,#f59e0b_18%,transparent)] text-[#f59e0b]"
            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
        }`}
        title="Toggle dev mode — skip all validation"
      >
        {devMode ? "DEV ON" : "DEV"}
      </button>
      {currentStepConfig && (
        <button
          type="button"
          disabled={saving}
          onClick={handleResetStep}
          className="rounded-xl border border-[color-mix(in_srgb,#ef4444_40%,transparent)] px-3 py-1.5 text-[0.75rem] font-bold tracking-[0.06em] text-[color-mix(in_srgb,#ef4444_80%,var(--text))] transition-colors hover:bg-[color-mix(in_srgb,#ef4444_10%,transparent)]"
          title="Clear data for this step only"
        >
          Reset step
        </button>
      )}
      {session && (
        <button
          type="button"
          disabled={saving}
          onClick={handleResetSetup}
          className="rounded-xl border border-[color-mix(in_srgb,#ef4444_40%,transparent)] px-3 py-1.5 text-[0.75rem] font-bold tracking-[0.06em] text-[color-mix(in_srgb,#ef4444_80%,var(--text))] transition-colors hover:bg-[color-mix(in_srgb,#ef4444_10%,transparent)]"
          title="Clear all setup data and start over"
        >
          Reset all
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout
      title="Setup wizard"
      description="Follow the steps to set up your business."
      initialUser={initialUser}
      showHeader={false}
      showTopProgress={false}
      topRightContent={topRightContent}
    >
      <div className={tw.setupPageSpacing}>{renderMainStage()}</div>
    </DashboardLayout>
  );
}
