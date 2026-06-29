"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { convexApi } from "../lib/convex-api";
import { DashboardLayout } from "./dashboard-layout";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { getSetupConfig, type SetupConfig } from "@startupfiles/shared/setup";

const STEP_TITLE_MAP: Record<number, string> = {
  1: "Are you applying as a business entity?",
  2: "DBA / FBN filing",
  3: "City business license",
  4: "Tax registration",
  5: "Banking & payments",
  6: "Legal pages & launch",
  7: "Review & submit"
};

function getStatusIcon(status: string): string {
  switch (status) {
    case "complete":
      return "✓";
    case "in_progress":
      return "●";
    case "not_needed":
      return "—";
    default:
      return "○";
  }
}

function StepIndicator({
  config,
  session,
  onNavigate
}: {
  config: SetupConfig;
  session: {
    currentStep: number;
    stepStatuses: string[];
    isCompleted: boolean;
  } | null | undefined;
  onNavigate: (stepNum: number) => void;
}) {
  const currentStep = session?.currentStep ?? 1;
  const stepStatuses = session?.stepStatuses ?? config.steps.map(() => "not_started");

  return (
    <div className="setupSidebar">
      <div className="kicker" style={{ marginBottom: 12 }}>Progress</div>
      <div className="setupStepList">
        {config.steps.map((step, i) => {
          const stepNum = i + 1;
          const status = stepStatuses[i] ?? "not_started";
          const isCurrent = stepNum === currentStep;
          const isComplete = status === "complete";
          const isSkipped = status === "not_needed";
          const isClickable = isComplete || stepNum === currentStep || (stepNum < currentStep && !isSkipped);

          return (
            <div
              key={stepNum}
              className={`setupStepItem ${isCurrent ? "current" : ""} ${isComplete ? "complete" : ""} ${isSkipped ? "skipped" : ""} ${!isCurrent && isClickable ? "clickable" : ""}`}
              onClick={() => {
                if (isClickable && !isCurrent) {
                  onNavigate(stepNum);
                }
              }}
              role={isClickable && !isCurrent ? "button" : undefined}
              tabIndex={isClickable && !isCurrent ? 0 : undefined}
              onKeyDown={(e) => {
                if (isClickable && !isCurrent && (e.key === "Enter" || e.key === " ")) {
                  onNavigate(stepNum);
                }
              }}
            >
              <span className="setupStepIcon">{getStatusIcon(status)}</span>
              <div className="setupStepContent">
                <span className="setupStepNumber">Step {stepNum}</span>
                <span className="setupStepTitle">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>
      {session?.isCompleted && (
        <div className="setupCompletedBadge">
          ✓ Setup complete
        </div>
      )}
    </div>
  );
}

function StepOne({
  isEntityApplication,
  legalFirstName,
  legalMiddleName,
  legalLastName,
  legalSuffix,
  onAnswer,
  saving
}: {
  isEntityApplication: boolean | null;
  legalFirstName: string;
  legalMiddleName: string;
  legalLastName: string;
  legalSuffix: string;
  onAnswer: (data: {
    isEntityApplication: boolean;
    legalFirstName?: string;
    legalMiddleName?: string;
    legalLastName?: string;
    legalSuffix?: string;
  }) => void;
  saving: boolean;
}) {
  const [showNameForm, setShowNameForm] = useState(false);
  const [firstName, setFirstName] = useState(legalFirstName);
  const [middleName, setMiddleName] = useState(legalMiddleName);
  const [lastName, setLastName] = useState(legalLastName);
  const [suffix, setSuffix] = useState(legalSuffix);

  // Sync name fields when session data loads
  useEffect(() => {
    if (legalFirstName) setFirstName(legalFirstName);
  }, [legalFirstName]);
  useEffect(() => {
    if (legalMiddleName) setMiddleName(legalMiddleName);
  }, [legalMiddleName]);
  useEffect(() => {
    if (legalLastName) setLastName(legalLastName);
  }, [legalLastName]);
  useEffect(() => {
    if (legalSuffix) setSuffix(legalSuffix);
  }, [legalSuffix]);

  if (showNameForm || isEntityApplication === false) {
    return (
      <div className="setupStepContent">
        <h2>Enter your legal name</h2>
        <p className="muted">
          Since you are applying as an individual, we need your full legal name. Include your first name,
          middle name (if applicable), last name, and any suffix (e.g., Jr., III).
        </p>
        <div className="setupForm">
          <div className="formGroup">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="formGroup">
            <label htmlFor="middleName">Middle name <span className="optional">(optional)</span></label>
            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Michael"
            />
          </div>
          <div className="formGroup">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="formGroup">
            <label htmlFor="suffix">Suffix <span className="optional">(optional)</span></label>
            <input
              id="suffix"
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Jr., III, etc."
            />
          </div>
          <button
            type="button"
            className="buttonPrimary"
            disabled={!firstName.trim() || !lastName.trim() || saving}
            onClick={() =>
              onAnswer({
                isEntityApplication: false,
                legalFirstName: firstName.trim(),
                legalMiddleName: middleName.trim() || undefined,
                legalLastName: lastName.trim(),
                legalSuffix: suffix.trim() || undefined
              })
            }
          >
            {saving ? "Submitting..." : "Submit & continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="setupStepContent">
      <h2>Are you applying as a business entity?</h2>
      <p className="muted">
        A business entity means you are registering a formal structure like an LLC or corporation.
        If you are operating as yourself (sole proprietor), you are applying as an individual.
      </p>
      <div className="setupDecision">
        <button
          type="button"
          className="buttonPrimary"
          onClick={() => {
            setShowNameForm(true);
          }}
        >
          No, I am applying as an individual
        </button>
        <button
          type="button"
          className="buttonSecondary"
          onClick={() =>
            onAnswer({
              isEntityApplication: true
            })
          }
        >
          Yes, I am applying as a business entity
        </button>
      </div>
    </div>
  );
}

function PlaceholderStep({ stepNum }: { stepNum: number }) {
  return (
    <div className="setupStepContent">
      <h2>{STEP_TITLE_MAP[stepNum] ?? `Step ${stepNum}`}</h2>
      <p className="muted">
        This step is coming soon. The setup experience for this section is being built.
      </p>
      <div className="setupPlaceholder">
        <span>Content for this step will appear here.</span>
      </div>
    </div>
  );
}

function ReviewStep({
  config,
  session
}: {
  config: SetupConfig;
  session: {
    currentStep: number;
    stepStatuses: string[];
    isEntityApplication?: boolean;
    legalFirstName?: string;
    legalMiddleName?: string;
    legalLastName?: string;
    legalSuffix?: string;
    isCompleted: boolean;
  } | null | undefined;
}) {
  if (!session) return null;

  const fullName = [
    session.legalFirstName,
    session.legalMiddleName,
    session.legalLastName
  ]
    .filter(Boolean)
    .join(" ");
  const nameWithSuffix = session.legalSuffix ? `${fullName}, ${session.legalSuffix}` : fullName;

  return (
    <div className="setupStepContent">
      <h2>Review & submit</h2>
      <p className="muted">
        Review all the information collected during setup before marking this as complete.
      </p>
      <div className="setupReviewList">
        <div className="setupReviewItem">
          <span className="setupReviewLabel">Entity application</span>
          <span className="setupReviewValue">
            {session.isEntityApplication
              ? "Applying as a business entity"
              : "Applying as an individual"}
          </span>
        </div>
        {nameWithSuffix && (
          <div className="setupReviewItem">
            <span className="setupReviewLabel">Legal name</span>
            <span className="setupReviewValue">{nameWithSuffix}</span>
          </div>
        )}
        {config.steps.map((step) => {
          const status = session.stepStatuses[step.stepNumber - 1] ?? "not_started";
          return (
            <div key={step.stepNumber} className="setupReviewItem">
              <span className="setupReviewLabel">Step {step.stepNumber}: {step.title}</span>
              <span className={`setupReviewStatus ${status}`}>
                {status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : status === "not_needed" ? "Skipped" : "Not started"}
              </span>
            </div>
          );
        })}
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
  const session = useQuery(convexApi.getSetupSession, { businessType });
  const startSetup = useMutation(convexApi.startSetup);
  const saveSetupStep = useMutation(convexApi.saveSetupStep);
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStep, setLocalStep] = useState<number | null>(null);

  // Sync local step with session when it loads
  useEffect(() => {
    if (session?.currentStep) {
      setLocalStep(session.currentStep);
    }
  }, [session?.currentStep]);

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

  const currentStep = localStep ?? session?.currentStep ?? 1;
  const isLastStep = currentStep === config.totalSteps;
  const isFirstStep = currentStep === 1;
  const isReviewStep = isLastStep;
  const stepStatuses = session?.stepStatuses ?? config.steps.map(() => "not_started");

  const handleStart = async () => {
    setSaving(true);
    setStarted(true);
    setError(null);
    try {
      await startSetup({ businessType });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start setup");
      setStarted(false);
    } finally {
      setSaving(false);
    }
  };

  const handleStepOneAnswer = async (data: {
    isEntityApplication: boolean;
    legalFirstName?: string;
    legalMiddleName?: string;
    legalLastName?: string;
    legalSuffix?: string;
  }) => {
    setSaving(true);
    setError(null);
    try {
      const newStatuses = [...stepStatuses];
      newStatuses[0] = "complete";

      let nextStep = 2;
      if (data.isEntityApplication) {
        if (config.steps.length > 1) {
          newStatuses[1] = "in_progress";
        }
        nextStep = 2;
      } else {
        if (config.steps.length > 2) {
          newStatuses[1] = "not_needed";
          newStatuses[2] = "in_progress";
        }
        nextStep = 3;
      }

      await saveSetupStep({
        businessType,
        currentStep: nextStep,
        stepStatuses: newStatuses,
        isEntityApplication: data.isEntityApplication,
        legalFirstName: data.legalFirstName,
        legalMiddleName: data.legalMiddleName,
        legalLastName: data.legalLastName,
        legalSuffix: data.legalSuffix
      });

      // Optimistically update local step
      setLocalStep(nextStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save step");
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceholderContinue = async () => {
    setSaving(true);
    setError(null);
    try {
      const newStatuses = [...stepStatuses];
      newStatuses[currentStep - 1] = "complete";
      if (currentStep < config.totalSteps && currentStep < config.steps.length) {
        newStatuses[currentStep] = "in_progress";
      }

      const nextStep = currentStep < config.totalSteps ? currentStep + 1 : currentStep;
      await saveSetupStep({
        businessType,
        currentStep: nextStep,
        stepStatuses: newStatuses,
        isCompleted: isLastStep
      });

      setLocalStep(nextStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save step");
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = async (stepNum: number) => {
    if (!session) return;
    const targetStatus = stepStatuses[stepNum - 1];
    if (targetStatus === "not_needed") return;

    setSaving(true);
    setError(null);
    try {
      const newStatuses = [...stepStatuses];
      if (newStatuses[stepNum - 1] === "not_started") {
        newStatuses[stepNum - 1] = "in_progress";
      }
      if (newStatuses[currentStep - 1] !== "complete") {
        newStatuses[currentStep - 1] = "not_started";
      }
      if (newStatuses[stepNum - 1] !== "complete") {
        newStatuses[stepNum - 1] = "in_progress";
      }

      await saveSetupStep({
        businessType,
        currentStep: stepNum,
        stepStatuses: newStatuses
      });

      setLocalStep(stepNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to navigate");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    if (!session || currentStep <= 1) return;
    setSaving(true);
    setError(null);
    try {
      const newStatuses = [...stepStatuses];
      const prevStep = currentStep - 1;
      if (newStatuses[prevStep - 1] !== "complete") {
        newStatuses[prevStep - 1] = "in_progress";
      }
      if (newStatuses[currentStep - 1] !== "complete") {
        newStatuses[currentStep - 1] = "not_started";
      }

      await saveSetupStep({
        businessType,
        currentStep: prevStep,
        stepStatuses: newStatuses
      });

      setLocalStep(prevStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to go back");
    } finally {
      setSaving(false);
    }
  };

  const safeSession = session ?? null;

  const renderStep = () => {
    if (!session && !saving && !started) {
      return (
        <div className="setupStepContent">
          <h2>Welcome to the {config.steps.length}-step setup</h2>
          <p className="muted">
            This wizard will guide you through everything needed to set up your business.
            Click below to get started.
          </p>
          {error && <div className="setupError">{error}</div>}
          <button type="button" className="buttonPrimary" onClick={handleStart}>
            Start setup
          </button>
        </div>
      );
    }

    return (
      <div className="setupStepContent">
        {error && <div className="setupError">{error}</div>}
        {isReviewStep ? (
          <ReviewStep config={config} session={session} />
        ) : currentStep === 1 ? (
          <StepOne
            isEntityApplication={session?.isEntityApplication ?? null}
            legalFirstName={session?.legalFirstName ?? ""}
            legalMiddleName={session?.legalMiddleName ?? ""}
            legalLastName={session?.legalLastName ?? ""}
            legalSuffix={session?.legalSuffix ?? ""}
            onAnswer={handleStepOneAnswer}
            saving={saving}
          />
        ) : (
          <PlaceholderStep stepNum={currentStep} />
        )}

        <div className="setupNavButtons">
          {!isFirstStep && (
            <button
              type="button"
              className="buttonSecondary"
              disabled={saving}
              onClick={handleBack}
            >
              Back
            </button>
          )}
          {currentStep > 1 && (
            <button
              type="button"
              className="buttonPrimary"
              disabled={saving}
              onClick={handlePlaceholderContinue}
            >
              {isLastStep ? "Mark as complete" : "Continue"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title={`Setup wizard`}
      description="Follow the steps to set up your business."
      initialUser={initialUser}
      showHeader={false}
    >
      <div className="setupLayout">
        <div className="setupMain">{renderStep()}</div>
        <StepIndicator config={config} session={safeSession} onNavigate={handleNavigate} />
      </div>
    </DashboardLayout>
  );
}

