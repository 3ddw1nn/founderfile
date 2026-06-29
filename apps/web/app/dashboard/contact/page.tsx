import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";

export default async function DashboardContactPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Contact us"
      description="Reach out when the workspace needs a content correction, product fix, or filing clarification."
      initialUser={currentUser}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Contact</div>
          <h2 style={{ margin: "10px 0 0" }}>Support channels</h2>
        </div>
        <div className="stack">
          <article className="documentCard">
            <div>
              <strong>Email support</strong>
              <p>Use the workspace support inbox for billing questions, product bugs, or content corrections.</p>
            </div>
          </article>
          <article className="documentCard">
            <div>
              <strong>Product feedback</strong>
              <p>Share missing workflows, confusing guidance, or pages that need a clearer founder-facing explanation.</p>
            </div>
          </article>
        </div>
      </section>
    </DashboardLayout>
  );
}
