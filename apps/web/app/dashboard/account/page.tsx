import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";
import { ui } from "../../../components/ui-classes";

export default async function DashboardAccountPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="Account settings"
      description="Manage the identity and workspace details attached to your StartupFiles console."
      initialUser={currentUser}
    >
      <section className={`${ui.surface} grid gap-[18px] p-6`}>
        <div>
          <div className={ui.kicker}>Account</div>
          <h2 className="mt-[10px]">Workspace identity</h2>
        </div>
        <div className="grid gap-[18px]">
          <article className={ui.infoCard}>
            <div>
              <strong className="block text-[1rem]">Email</strong>
              <p className="mt-2 text-[var(--muted)]">{currentUser?.email ?? "Signed-in email unavailable."}</p>
            </div>
          </article>
          <article className={ui.infoCard}>
            <div>
              <strong className="block text-[1rem]">Name</strong>
              <p className="mt-2 text-[var(--muted)]">{currentUser?.name ?? "Founder workspace"}</p>
            </div>
          </article>
          <article className={ui.infoCard}>
            <div>
              <strong className="block text-[1rem]">Role</strong>
              <p className="mt-2 text-[var(--muted)]">{currentUser?.role ?? "user"}</p>
            </div>
          </article>
        </div>
      </section>
    </DashboardLayout>
  );
}
