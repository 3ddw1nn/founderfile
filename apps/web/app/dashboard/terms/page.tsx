import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";

export default async function DashboardTermsPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Terms"
      description="The operating terms for using StartupFiles as a setup console."
      initialUser={currentUser}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Terms</div>
          <h2 style={{ margin: "10px 0 0" }}>Use of the console</h2>
        </div>
        <ul className="list">
          <li>
            <div style={{ fontWeight: 700 }}>Guidance, not legal advice</div>
            <div className="muted" style={{ marginTop: 6 }}>
              StartupFiles prepares documents and setup guidance, but it does not replace a lawyer, CPA, or tax professional.
            </div>
          </li>
          <li>
            <div style={{ fontWeight: 700 }}>Verification remains your responsibility</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Founders remain responsible for checking filing rules, deadlines, and agency requirements before submitting anything official.
            </div>
          </li>
        </ul>
      </section>
    </DashboardLayout>
  );
}
