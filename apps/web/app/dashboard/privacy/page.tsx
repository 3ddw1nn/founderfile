import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";

export default async function DashboardPrivacyPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Privacy"
      description="What StartupFiles stores and how founder workspace data is used."
      initialUser={currentUser}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Privacy</div>
          <h2 style={{ margin: "10px 0 0" }}>Workspace data</h2>
        </div>
        <ul className="list">
          <li>
            <div style={{ fontWeight: 700 }}>Profile and setup answers</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Founder details, business inputs, task progress, and document selections are stored so the workspace can tailor the setup path.
            </div>
          </li>
          <li>
            <div style={{ fontWeight: 700 }}>Operational metadata</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Workspace events and timestamps are retained so changes can be tracked and guidance stays consistent across sessions.
            </div>
          </li>
        </ul>
      </section>
    </DashboardLayout>
  );
}
