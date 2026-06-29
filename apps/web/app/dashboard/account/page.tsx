import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";

export default async function DashboardAccountPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Account settings"
      description="Manage the identity and workspace details attached to your StartupFiles console."
      initialUser={currentUser}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Account</div>
          <h2 style={{ margin: "10px 0 0" }}>Workspace identity</h2>
        </div>
        <div className="stack">
          <article className="documentCard">
            <div>
              <strong>Email</strong>
              <p>{currentUser?.email ?? "Signed-in email unavailable."}</p>
            </div>
          </article>
          <article className="documentCard">
            <div>
              <strong>Name</strong>
              <p>{currentUser?.name ?? "Founder workspace"}</p>
            </div>
          </article>
          <article className="documentCard">
            <div>
              <strong>Role</strong>
              <p>{currentUser?.role ?? "owner"}</p>
            </div>
          </article>
        </div>
      </section>
    </DashboardLayout>
  );
}
