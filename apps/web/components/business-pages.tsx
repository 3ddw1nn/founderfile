import Link from "next/link";
import type { Route } from "next";
import type { BusinessTypeConfig, SetupDocument } from "@startupfiles/shared/dashboard";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { DashboardLayout } from "./dashboard-layout";

function getDocumentStatusLabel(status: SetupDocument["status"]) {
  if (status === "ready") {
    return "Ready";
  }

  if (status === "in_progress") {
    return "In progress";
  }

  return "TBA";
}

export function BusinessOverviewPage({
  business,
  initialUser
}: {
  business: BusinessTypeConfig;
  initialUser?: CurrentUser | null;
}) {
  const completionPercent =
    business.totalSteps > 0 ? Math.round((business.completedSteps / business.totalSteps) * 100) : 0;

  return (
    <DashboardLayout
      title={`${business.label} setup`}
      description={business.summary}
      initialUser={initialUser}
      progress={{
        currentStep: business.completedSteps,
        totalSteps: business.totalSteps,
        label: `${completionPercent}% complete`,
        actionHref: business.available ? (`/dashboard/${business.slug}/dba-fbn` as Route) : undefined
      }}
    >
      <section className="gridThree">
        <article className="surface pageSection metric">
          <span className="kicker">Completed</span>
          <strong>{business.completedSteps}</strong>
          <div className="muted">Steps finished for this business type.</div>
        </article>
        <article className="surface pageSection metric">
          <span className="kicker">Remaining</span>
          <strong>{Math.max(business.totalSteps - business.completedSteps, 0)}</strong>
          <div className="muted">Tasks still ahead before this setup track is complete.</div>
        </article>
        <article className="surface pageSection metric">
          <span className="kicker">Next focus</span>
          <strong style={{ fontSize: "1.2rem", lineHeight: 1.35 }}>{business.available ? "Keep moving" : "Coming soon"}</strong>
          <div className="muted">{business.nextStep}</div>
        </article>
      </section>

      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Overall progress</div>
          <h2 style={{ margin: "10px 0 0" }}>{business.label} roadmap</h2>
          <p className="muted" style={{ margin: "8px 0 0", maxWidth: 760 }}>
            {business.nextStep}
          </p>
        </div>
        <ul className="list">
          {business.milestones.map((item) => (
            <li key={item}>
              <div style={{ fontWeight: 700 }}>{item}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="gridTwo">
        <article className="surface pageSection stack">
          <div className="kicker">DBA / FBN</div>
          <h3 style={{ margin: "6px 0 0" }}>Naming and filing</h3>
          <p className="muted" style={{ margin: 0 }}>
            Keep your public name, county filing, and document set aligned from the start.
          </p>
          <Link href={`/dashboard/${business.slug}/dba-fbn` as Route} className="buttonSecondary">
            Open DBA / FBN
          </Link>
        </article>

        <article className="surface pageSection stack">
          <div className="kicker">Documents</div>
          <h3 style={{ margin: "6px 0 0" }}>Track your paperwork</h3>
          <p className="muted" style={{ margin: 0 }}>
            Keep formation paperwork, registrations, and supporting docs in one place.
          </p>
          <Link href={`/dashboard/${business.slug}/documents` as Route} className="buttonSecondary">
            Open documents
          </Link>
        </article>
      </section>
    </DashboardLayout>
  );
}

export function BusinessDbaPage({
  business,
  initialUser
}: {
  business: BusinessTypeConfig;
  initialUser?: CurrentUser | null;
}) {
  return (
    <DashboardLayout
      title={`${business.label} DBA / FBN`}
      description="Track whether this business needs a trade-name filing and what documents should stay aligned with it."
      initialUser={initialUser}
      progress={{
        currentStep: business.completedSteps,
        totalSteps: business.totalSteps,
        actionHref: business.available ? (`/dashboard/${business.slug}/documents` as Route) : undefined
      }}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">DBA / FBN checklist</div>
          <h2 style={{ margin: "10px 0 0" }}>Name setup for {business.label}</h2>
        </div>
        <ul className="list">
          {business.dbaChecklist.map((item) => (
            <li key={item}>
              <div style={{ fontWeight: 700 }}>{item}</div>
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
}

export function BusinessDocumentsPage({
  business,
  initialUser
}: {
  business: BusinessTypeConfig;
  initialUser?: CurrentUser | null;
}) {
  return (
    <DashboardLayout
      title={`${business.label} documents`}
      description="A focused document shelf for the paperwork that belongs to this setup path."
      initialUser={initialUser}
      progress={{
        currentStep: business.completedSteps,
        totalSteps: business.totalSteps,
        actionHref: business.available ? (`/dashboard/${business.slug}` as Route) : undefined
      }}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Documents</div>
          <h2 style={{ margin: "10px 0 0" }}>{business.label} paperwork</h2>
        </div>
        <div className="stack">
          {business.documents.map((document) => (
            <article key={document.title} className="documentCard">
              <div>
                <strong>{document.title}</strong>
                <p>{document.detail}</p>
              </div>
              <span className={`statusBadge ${document.status}`}>{getDocumentStatusLabel(document.status)}</span>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
