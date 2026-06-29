import { DashboardLayout } from "../../../components/dashboard-layout";
import { getCurrentUser } from "../../../lib/current-user";

const allDocuments = [
  {
    title: "Business launch checklist",
    detail: "Shared startup checklist covering permits, licensing, tax registration, and document organization.",
    status: "Ready"
  },
  {
    title: "LLC formation packet",
    detail: "Formation paperwork tracker for articles, operating agreement, EIN, and bank setup.",
    status: "Ready"
  },
  {
    title: "DBA / FBN worksheet",
    detail: "Trade-name planning worksheet used across sole proprietor and LLC flows.",
    status: "In progress"
  },
  {
    title: "S corporation workspace",
    detail: "Reserved for a future guided flow once the S corporation setup experience is live.",
    status: "TBA"
  }
];

export default async function DashboardDocumentsPage() {
  const currentUser = await getCurrentUser();

  return (
    <DashboardLayout
      title="All documents"
      description="This is the cross-workspace shelf for every checklist, worksheet, and filing packet connected to your setup."
      initialUser={currentUser}
      progress={{
        currentStep: 4,
        totalSteps: 10,
        label: "Document shelf organized",
        actionHref: "/dashboard/llc/documents"
      }}
    >
      <section className="surface pageSection stack">
        <div>
          <div className="kicker">Documents library</div>
          <h2 style={{ margin: "10px 0 0" }}>Every document in one place</h2>
        </div>
        <div className="stack">
          {allDocuments.map((document) => (
            <article key={document.title} className="documentCard">
              <div>
                <strong>{document.title}</strong>
                <p>{document.detail}</p>
              </div>
              <span className={`statusBadge ${document.status.toLowerCase().replace(/ /g, "_")}`}>{document.status}</span>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
