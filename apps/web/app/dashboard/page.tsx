import Link from "next/link";
import type { Route } from "next";
import { DashboardLayout } from "../../components/dashboard-layout";
import { getCurrentUser } from "../../lib/current-user";

export default async function DashboardHomePage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Your setup dashboard"
      description="Keep moving through the business setup path, track progress, and jump straight into the documents and filings that matter next."
      initialUser={currentUser}
      progress={{
        currentStep: 3,
        totalSteps: 10,
        label: "Formation flow in motion",
        actionHref: "/dashboard/llc" as Route,
        actionLabel: "Resume"
      }}
    >
      <section className="gridThree">
        <article className="surface pageSection metric">
          <span className="kicker">Active track</span>
          <strong>LLC</strong>
          <div className="muted">The most complete guided setup path right now.</div>
        </article>
        <article className="surface pageSection metric">
          <span className="kicker">Documents</span>
          <strong>6</strong>
          <div className="muted">Core checklists, filings, and worksheets gathered in one place.</div>
        </article>
        <article className="surface pageSection metric">
          <span className="kicker">Next action</span>
          <strong style={{ fontSize: "1.2rem", lineHeight: 1.35 }}>Review name setup</strong>
          <div className="muted">Use the DBA / FBN page to align your business name and paperwork.</div>
        </article>
      </section>

      <section className="gridTwo">
        <article className="surface pageSection stack">
          <div>
            <div className="kicker">Business types</div>
            <h2 style={{ margin: "10px 0 0" }}>Choose a setup path</h2>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Each business type now has its own progress overview, document shelf, and DBA / FBN workspace.
            </p>
          </div>
          <div className="buttonRow">
            <Link href={"/dashboard/sole-proprietor" as Route} className="buttonSecondary">
              Sole proprietor
            </Link>
            <Link href={"/dashboard/llc" as Route} className="buttonPrimary">
              Open LLC
            </Link>
          </div>
        </article>

        <article className="surface pageSection stack">
          <div>
            <div className="kicker">All documents</div>
            <h2 style={{ margin: "10px 0 0" }}>One place for every file</h2>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Browse everything across the dashboard or drop into the document page inside any entity section.
            </p>
          </div>
          <Link href={"/dashboard/documents" as Route} className="buttonSecondary">
            Open all documents
          </Link>
        </article>
      </section>
    </DashboardLayout>
  );
}
