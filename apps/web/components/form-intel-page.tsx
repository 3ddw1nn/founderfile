"use client";

import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import type { CityLicenseSourceReview, FormTemplate } from "../lib/convex-api";
import { convexApi } from "../lib/convex-api";
import { DashboardLayout } from "./dashboard-layout";
import { cx, ui } from "./ui-classes";

const MODEL_OPTIONS = [
  { value: "gemini", label: "Gemini 2.0 Flash", notes: "PDF + HTML + text · Google free tier" },
  { value: "mistral", label: "Mistral Small", notes: "PDF (via OCR) + HTML + text · Mistral free tier" },
  { value: "groq", label: "Llama 3.3 70B", notes: "PDF (via Mistral OCR) + HTML + text · Groq free tier" },
];

function TemplateDisplay({ template }: { template: FormTemplate }) {
  return (
    <div className="grid gap-4 mt-4 pt-4 border-t border-[var(--border)]">
      {template.fields && template.fields.length > 0 && (
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)] mb-2">
            Form Fields ({template.fields.length})
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--panel-strong)]">
                  {["Label", "Type", "Required", "Notes / Options"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {template.fields.map((f, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2 font-medium">{f.label}</td>
                    <td className="px-3 py-2 font-mono text-[0.75rem] text-[var(--muted)]">{f.type}</td>
                    <td className="px-3 py-2">
                      {f.required ? (
                        <span className="font-bold text-[var(--accent-strong)]">Yes</span>
                      ) : (
                        <span className="text-[var(--muted)]">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[var(--muted)]">
                      {f.notes ?? (f.options?.join(", ") ?? "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {template.fees && template.fees.length > 0 && (
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)] mb-2">Fees</div>
          <div className="grid gap-1.5">
            {template.fees.map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.84rem]">
                <span className="font-mono font-bold text-[var(--accent-strong)]">{f.fee}</span>
                <span className="text-[var(--muted)]">—</span>
                <span className="flex-1">{f.tier}</span>
                {f.notes && <span className="text-[0.76rem] text-[var(--muted)]">{f.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {template.requirements && template.requirements.length > 0 && (
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)] mb-2">Requirements</div>
          <ul className="grid gap-1">
            {template.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.84rem]">
                <span className="mt-[3px] text-[var(--muted)]">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(template.processingTime ?? template.renewalPeriod ?? template.notes) && (
        <div className="grid gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-[0.84rem]">
          {template.processingTime && (
            <div><span className="font-medium">Processing time:</span> {template.processingTime}</div>
          )}
          {template.renewalPeriod && (
            <div><span className="font-medium">Renewal:</span> {template.renewalPeriod}</div>
          )}
          {template.notes && <div className="text-[var(--muted)]">{template.notes}</div>}
        </div>
      )}

      <div className="text-[0.72rem] text-[var(--muted)]">
        Analyzed {template.analyzedAt ? new Date(template.analyzedAt).toLocaleString() : "—"} · Model: {template.model ?? "unknown"}
      </div>
    </div>
  );
}

export function FormIntelPage() {
  const reviews = useQuery(convexApi.listTopCityReviews, { limit: 100 });
  const docCounts = useQuery(convexApi.listCityDocumentCounts, {});
  const appSources = useQuery(convexApi.listCityApplicationSources, {});
  const analyzeDocuments = useAction(convexApi.analyzeDocumentsForCity);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [appSourceChoice, setAppSourceChoice] = useState<Record<string, "url" | "file">>({});

  async function onAnalyze(review: CityLicenseSourceReview) {
    setMessage(null);
    setAnalyzingId(review._id);
    try {
      const choice = appSourceChoice[review._id];
      await analyzeDocuments({
        cityReviewId: review._id,
        modelProvider: selectedModel,
        applicationSource: choice,
        applicationUrl: review.applicationPdfUrl,
      });
      setMessage(`${review.city} analyzed successfully.`);
      setExpandedId(review._id);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to analyze ${review.city}.`);
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <DashboardLayout
      title="Form Intel"
      description="Upload city documents on the City Sources page, then use AI here to extract business license form fields, fees, and requirements per city."
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">AI Model</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.88rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label} — {m.notes}</option>
          ))}
        </select>
        <p className="text-[0.8rem] text-[var(--muted)]">
          API keys go in .env.local <strong>and</strong> must be set in Convex:{" "}
          <code className="rounded bg-[var(--panel-strong)] px-1">npx convex env set GEMINI_API_KEY &lt;key&gt;</code>
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-[0.92rem]">
          {message}
        </div>
      )}

      {!reviews ? (
        <div className={cx(ui.surface, "p-8 text-center text-[var(--muted)]")}>Loading cities…</div>
      ) : reviews.length === 0 ? (
        <div className={cx(ui.surface, "p-8 text-center text-[var(--muted)]")}>
          No cities found. Seed and scrape cities on the City Sources page first.
        </div>
      ) : (
        <section className="grid gap-4">
          {reviews.map((review) => {
            const docCount = docCounts?.[review._id] ?? 0;
            const hasAppFile = appSources?.[review._id] ?? false;
            const hasAppUrl = !!review.applicationPdfUrl;
            const showSourcePicker = hasAppFile && hasAppUrl;
            const chosenSource = appSourceChoice[review._id] ?? (hasAppFile ? "file" : hasAppUrl ? "url" : undefined);
            const hasAnything = docCount > 0 || hasAppUrl;
            const isAnalyzing = analyzingId === review._id;
            const isExpanded = expandedId === review._id;
            const hasTemplate = !!review.formTemplate;

            return (
              <article key={review._id} className={cx(ui.surface, "p-5")}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[1.1rem] font-black tracking-[-0.02em]">{review.city}</h2>
                      <span className="text-[0.78rem] text-[var(--muted)]">{review.county} County</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-[0.8rem] text-[var(--muted)]">
                      <span>
                        {!hasAnything
                          ? "No sources — add application URL or upload files on City Scrapes page"
                          : `${docCount} file${docCount !== 1 ? "s" : ""}${hasAppUrl ? " · application URL" : ""}${hasAppFile ? " · application PDF" : ""}`}
                      </span>
                      {hasTemplate && (
                        <span className="text-[var(--success)]">
                          Template ready · {review.formTemplate!.fields?.length ?? 0} fields
                        </span>
                      )}
                    </div>

                    {/* Application source picker — shown only when both URL and file are available */}
                    {showSourcePicker && (
                      <div className="mt-2 flex items-center gap-2 text-[0.8rem]">
                        <span className="text-[var(--muted)]">App source:</span>
                        {(["file", "url"] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAppSourceChoice(prev => ({ ...prev, [review._id]: opt }))}
                            className={cx(
                              "rounded-lg border px-2.5 py-1 text-[0.76rem] font-semibold transition-colors",
                              chosenSource === opt
                                ? "border-[color-mix(in_srgb,var(--accent)_42%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent-strong)]"
                                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                            )}
                          >
                            {opt === "file" ? "Uploaded PDF" : "URL"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasTemplate && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : review._id)}
                        className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem]")}
                      >
                        {isExpanded ? "Hide" : "View template"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void onAnalyze(review)}
                      disabled={!hasAnything || isAnalyzing || analyzingId !== null}
                      title={!hasAnything ? "Add an application URL or upload files on City Scrapes page" : undefined}
                      className={cx(
                        ui.buttonPrimary,
                        "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55"
                      )}
                    >
                      {isAnalyzing ? "Analyzing…" : hasTemplate ? "Re-analyze" : "Analyze"}
                    </button>
                  </div>
                </div>

                {isExpanded && review.formTemplate && (
                  <TemplateDisplay template={review.formTemplate} />
                )}
              </article>
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
}
