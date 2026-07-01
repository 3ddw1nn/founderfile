"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CityDocument,
  CityLicenseSourceReview,
  CityLicenseSourceReviewInput,
  FeeRow
} from "../lib/convex-api";
import { CITY_DOC_TYPE_LABELS, convexApi } from "../lib/convex-api";
import { CALIFORNIA_CITIES } from "@startupfiles/shared/california-cities";
import { DashboardLayout } from "./dashboard-layout";
import { cx, ui } from "./ui-classes";

const SOURCE_KIND_OPTIONS: CityLicenseSourceReview["sourceKind"][] = ["html", "pdf", "js", "cms", "unknown"];

function badgeClass(status: CityLicenseSourceReview["status"]) {
  if (status === "approved") return "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]";
  if (status === "rejected") return "border-[color-mix(in_srgb,#ef4444_35%,transparent)] bg-[color-mix(in_srgb,#ef4444_10%,transparent)] text-[#dc2626]";
  if (status === "needs_review") return "border-[color-mix(in_srgb,var(--warning)_42%,transparent)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]";
  return "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent-strong)]";
}

function sourceKindLabel(kind: CityLicenseSourceReview["sourceKind"]) {
  if (kind === "js") return "JS";
  if (kind === "cms") return "CMS";
  if (kind === "pdf") return "PDF";
  if (kind === "html") return "HTML";
  return "Unknown";
}

function toDraft(review: CityLicenseSourceReview): CityLicenseSourceReviewInput {
  return {
    sourceKind: review.sourceKind,
    retrievalStatus: review.retrievalStatus,
    businessLicenseUrl: review.businessLicenseUrl,
    applicationUrl: review.applicationUrl,
    applicationPdfUrl: review.applicationPdfUrl,
    feeUrl: review.feeUrl,
    checklistUrl: review.checklistUrl,
    downloadUrl: review.downloadUrl,
    feeSummary: review.feeSummary,
    feeTable: review.feeTable ?? [],
    documentLinks: review.documentLinks ?? [],
    requirementsSummary: review.requirementsSummary,
    applicationFields: review.applicationFields,
    scraperNotes: review.scraperNotes,
    reviewerNotes: review.reviewerNotes,
    confidence: review.confidence
  };
}

const DOC_TYPES = Object.entries(CITY_DOC_TYPE_LABELS) as Array<[CityDocument["documentType"], string]>;

function LinkOut({ href }: { href: string }) {
  if (!href?.trim()) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:border-[color-mix(in_srgb,var(--accent)_42%,transparent)] hover:text-[var(--accent-strong)]"
      title="Open link"
    >
      ↗
    </a>
  );
}

function DeleteBtn({ onClick, small }: { onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "shrink-0 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:border-red-400 hover:text-red-500",
        small ? "h-8 w-8" : "h-10 w-10"
      )}
    >
      ✕
    </button>
  );
}

function urlInputCls(val: string) {
  return cx(
    "flex-1 min-w-0 min-h-10 rounded-xl border px-3 text-[0.88rem] outline-none transition-colors",
    val.trim()
      ? "border-[var(--border)] bg-[var(--panel-strong)] focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
      : "border-[color-mix(in_srgb,#eab308_50%,transparent)] bg-[color-mix(in_srgb,#eab308_6%,transparent)] focus:border-[color-mix(in_srgb,#eab308_70%,transparent)]"
  );
}

function CityDocumentsSection({
  cityReviewId,
  city,
  applicationPdfUrl,
  feeUrl,
  documentLinks,
  onApplicationPdfUrlChange,
  onFeeUrlChange,
  onDocumentLinksChange,
  onAIAnalyzed,
}: {
  cityReviewId: string;
  city: string;
  applicationPdfUrl: string;
  feeUrl: string;
  documentLinks: Array<{ label: string; url: string }>;
  onApplicationPdfUrlChange: (v: string) => void;
  onFeeUrlChange: (v: string) => void;
  onDocumentLinksChange: (links: Array<{ label: string; url: string }>) => void;
  onAIAnalyzed: (feeSummary: string, requirementsSummary: string) => void;
}) {
  const analyzeDocumentsFromSources = useAction(convexApi.analyzeDocumentsFromSources);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const documents = useQuery(convexApi.listCityDocuments, { cityReviewId });
  const generateUploadUrl = useMutation(convexApi.generateCityDocumentUploadUrl);
  const saveDocument = useMutation(convexApi.saveCityDocument);
  const updateType = useMutation(convexApi.updateCityDocumentType);
  const deleteDocument = useMutation(convexApi.deleteCityDocument);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingApp, setIsUploadingApp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appFileInputRef = useRef<HTMLInputElement>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  async function handleAIAnalyze() {
    setIsAnalyzing(true);
    setAiStatus(null);
    try {
      const result = await analyzeDocumentsFromSources({
        cityReviewId,
        feeUrl: feeUrl || undefined,
        customLinks: documentLinks.length > 0 ? documentLinks.filter(l => l.label.trim() && l.url.trim()) : undefined,
      });
      onAIAnalyzed(result.feeSummary || "", result.requirementsSummary || "");
      setAiStatus("AI analysis complete. Fee details and requirements updated.");
    } catch (err) {
      setAiStatus(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    docType: CityDocument["documentType"],
    setUploading: (v: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { storageId } = await uploadRes.json() as { storageId: string };
      await saveDocument({
        cityReviewId,
        city,
        documentType: docType,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        storageId,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  function addLink() {
    onDocumentLinksChange([...documentLinks, { label: "", url: "" }]);
  }

  function updateLink(i: number, field: "label" | "url", value: string) {
    onDocumentLinksChange(documentLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function removeLink(i: number) {
    onDocumentLinksChange(documentLinks.filter((_, idx) => idx !== i));
  }

  const labelCls = "w-[120px] shrink-0 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.82rem] min-h-10 outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]";
  const staticLabelCls = "w-[120px] shrink-0 flex items-center text-[0.8rem] font-medium text-[var(--muted)]";

  const appDocs = documents?.filter(d => d.documentType === "license_application") ?? [];
  const otherDocs = documents?.filter(d => d.documentType !== "license_application") ?? [];

  return (
    <div className="grid gap-5 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          Documents & Links
        </span>
        <div className="flex items-center gap-2">
          {aiStatus && (
            <span className="text-[0.72rem] text-[var(--muted)] max-w-[300px] truncate">{aiStatus}</span>
          )}
          <button
            type="button"
            onClick={() => void handleAIAnalyze()}
            disabled={isAnalyzing}
            className={cx(ui.buttonSecondary, "min-h-8 rounded-xl px-3 text-[0.78rem] disabled:opacity-55")}
          >
            {isAnalyzing ? "Analyzing…" : "AI → Analyze"}
          </button>
        </div>
      </div>

      {/* Application Source — dedicated section for Form Intel */}
      <div className="grid gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
            Application Source
          </span>
          <span className="text-[0.68rem] text-[var(--muted)]">Used by Form Intel AI</span>
        </div>

        {/* Application URL */}
        <div className="flex items-center gap-2">
          <span className={staticLabelCls}>URL</span>
          <input
            value={applicationPdfUrl}
            onChange={e => onApplicationPdfUrlChange(e.target.value)}
            placeholder="Application PDF or page URL"
            className={urlInputCls(applicationPdfUrl)}
          />
          <LinkOut href={applicationPdfUrl} />
          {applicationPdfUrl && <DeleteBtn onClick={() => onApplicationPdfUrlChange("")} />}
        </div>

        {/* Application PDF upload */}
        <div className="flex items-center gap-2">
          <span className={staticLabelCls}>File</span>
          {appDocs.length > 0 ? (
            <div className="flex flex-1 flex-wrap gap-2">
              {appDocs.map(doc => (
                <div key={doc._id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1.5">
                  <span className="text-[0.82rem]">
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-strong)] hover:underline">{doc.fileName}</a>
                    ) : doc.fileName}
                  </span>
                  <span className="text-[0.7rem] text-[var(--muted)]">{(doc.fileSize / 1024).toFixed(0)}KB</span>
                  <DeleteBtn small onClick={() => void deleteDocument({ documentId: doc._id })} />
                </div>
              ))}
            </div>
          ) : (
            <span className="flex-1 text-[0.82rem] text-[var(--muted)]">No application file uploaded</span>
          )}
          <button
            type="button"
            onClick={() => appFileInputRef.current?.click()}
            disabled={isUploadingApp}
            className="shrink-0 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[0.8rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:opacity-50"
          >
            {isUploadingApp ? "Uploading…" : appDocs.length > 0 ? "Replace" : "+ Upload"}
          </button>
          <input
            ref={appFileInputRef}
            type="file"
            className="hidden"
            onChange={e => void handleFileUpload(e, "license_application", setIsUploadingApp)}
            accept=".pdf,.html,.htm,.txt,.md"
          />
        </div>
      </div>

      {/* URL Links */}
      <div className="grid gap-2">
        <span className="text-[0.72rem] uppercase tracking-[0.08em] text-[var(--muted)]">URL Links</span>

        {/* Fees URL */}
        <div className="flex items-center gap-2">
          <span className={staticLabelCls}>Fees URL</span>
          <input
            value={feeUrl}
            onChange={e => onFeeUrlChange(e.target.value)}
            placeholder="https://…"
            className={urlInputCls(feeUrl)}
          />
          <LinkOut href={feeUrl} />
          {feeUrl && <DeleteBtn onClick={() => onFeeUrlChange("")} />}
        </div>

        {/* Custom URL links */}
        {documentLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={link.label}
              onChange={e => updateLink(i, "label", e.target.value)}
              placeholder="Label"
              className={labelCls}
            />
            <input
              value={link.url}
              onChange={e => updateLink(i, "url", e.target.value)}
              placeholder="https://…"
              className={urlInputCls(link.url)}
            />
            <LinkOut href={link.url} />
            <DeleteBtn onClick={() => removeLink(i)} />
          </div>
        ))}

        <button
          type="button"
          onClick={addLink}
          className="self-start rounded-xl border border-dashed border-[var(--border)] px-4 py-2 text-[0.82rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          + Add URL link
        </button>
      </div>

      {/* Other Uploaded Files */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.72rem] uppercase tracking-[0.08em] text-[var(--muted)]">
            Other Files{otherDocs.length > 0 ? ` (${otherDocs.length})` : ""}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[0.8rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:opacity-50"
          >
            {isUploading ? "Uploading…" : "+ Upload file"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={e => void handleFileUpload(e, "other", setIsUploading)}
            accept=".pdf,.html,.htm,.txt,.md,.doc,.docx"
          />
        </div>

        {otherDocs.length > 0 ? (
          <div className="grid gap-2">
            {otherDocs.map(doc => (
              <div key={doc._id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2">
                <span className="flex-1 min-w-0 truncate text-[0.82rem]">
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-strong)] hover:underline">
                      {doc.fileName}
                    </a>
                  ) : doc.fileName}
                </span>
                <span className="shrink-0 text-[0.72rem] text-[var(--muted)]">{(doc.fileSize / 1024).toFixed(0)}KB</span>
                <select
                  value={doc.documentType}
                  onChange={e => void updateType({ documentId: doc._id, documentType: e.target.value })}
                  className="shrink-0 min-h-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 text-[0.78rem] outline-none"
                >
                  {DOC_TYPES.filter(([v]) => v !== "license_application").map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <DeleteBtn small onClick={() => void deleteDocument({ documentId: doc._id })} />
              </div>
            ))}
          </div>
        ) : documents !== undefined ? (
          <p className="text-[0.84rem] text-[var(--muted)]">No additional files uploaded.</p>
        ) : null}
      </div>
    </div>
  );
}

function FeeTableEditor({ rows, onChange }: { rows: FeeRow[]; onChange: (rows: FeeRow[]) => void }) {
  const update = (i: number, field: keyof FeeRow, value: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  return (
    <div className="grid gap-2">
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Tier / Who it applies to", "Fee", "Details / What for", ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-1 py-1.5">
                    <input value={row.tier} onChange={e => update(i, "tier", e.target.value)} placeholder="e.g. 0–5 employees"
                           className="w-full min-h-9 rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] px-2.5 text-[0.85rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]" />
                  </td>
                  <td className="px-1 py-1.5">
                    <input value={row.fee} onChange={e => update(i, "fee", e.target.value)} placeholder="e.g. $55/yr"
                           className="w-full min-w-[90px] min-h-9 rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] px-2.5 text-[0.85rem] font-mono outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]" />
                  </td>
                  <td className="px-1 py-1.5">
                    <input value={row.detail} onChange={e => update(i, "detail", e.target.value)} placeholder="e.g. Annual renewal, due Jan 31"
                           className="w-full min-h-9 rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] px-2.5 text-[0.85rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]" />
                  </td>
                  <td className="px-1 py-1.5">
                    <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[#ef4444] hover:text-[#ef4444]">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange([...rows, { tier: "", fee: "", detail: "" }])}
        className="self-start rounded-xl border border-dashed border-[var(--border)] px-4 py-2 text-[0.82rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
      >
        + Add row
      </button>
    </div>
  );
}

function ReviewCard({
  review,
  draft,
  onDraftChange,
  onSave,
  onApprove,
  onReject,
  onScrape,
  onDelete,
  isBusy,
  isScraping
}: {
  review: CityLicenseSourceReview;
  draft: CityLicenseSourceReviewInput;
  onDraftChange: (patch: Partial<CityLicenseSourceReviewInput>) => void;
  onSave: () => void;
  onApprove: () => void;
  onReject: () => void;
  onScrape: () => void;
  onDelete: () => void;
  isBusy: boolean;
  isScraping: boolean;
}) {
  const parseFeeText = useAction(convexApi.parseFeeText);
  const [isParsingFees, setIsParsingFees] = useState(false);

  async function onParseFees() {
    if (!draft.feeSummary.trim()) return;
    setIsParsingFees(true);
    try {
      const rows = await parseFeeText({ feeSummary: draft.feeSummary });
      onDraftChange({ feeTable: rows });
    } catch (err) {
      alert(err instanceof Error ? err.message : "AI fee parse failed");
    } finally {
      setIsParsingFees(false);
    }
  }

  const topLinkRows = [
    { label: "Business License URL", field: "businessLicenseUrl" as const },
    { label: "Application URL", field: "applicationUrl" as const },
    { label: "Checklist URL", field: "checklistUrl" as const },
  ];

  return (
    <article className={cx(ui.surface, "grid gap-5 p-5")}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">#{review.populationRank}</span>
            <span className={cx("rounded-full border px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em]", badgeClass(review.status))}>
              {review.status.replace("_", " ")}
            </span>
            <select
              value={draft.sourceKind}
              onChange={e => onDraftChange({ sourceKind: e.target.value as CityLicenseSourceReview["sourceKind"] })}
              className="rounded-full border border-[var(--border)] bg-transparent px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)] outline-none cursor-pointer"
            >
              {SOURCE_KIND_OPTIONS.map(opt => <option key={opt} value={opt}>{sourceKindLabel(opt)}</option>)}
            </select>
          </div>
          <h2 className="mt-3 text-[1.45rem] font-black tracking-[-0.03em]">{review.city}</h2>
          <p className="mt-0.5 text-[0.88rem] text-[var(--muted)]">
            {review.county} County
            {review.lastScrapedAt && (
              <span className="ml-3">· Last scraped {new Date(review.lastScrapedAt).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onScrape} disabled={isBusy || isScraping}
                  className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}>
            {isScraping ? "Scraping…" : "Scrape"}
          </button>
          <button type="button" onClick={onApprove} disabled={isBusy || isScraping}
                  className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}>Approve</button>
          <button type="button" onClick={onReject} disabled={isBusy || isScraping}
                  className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}>Reject</button>
          <button type="button" onClick={onDelete} disabled={isBusy || isScraping}
                  className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem] text-red-500 disabled:opacity-55")}>Remove</button>
        </div>
      </div>

      {/* URL Fields */}
      <div className="grid gap-3">
        {topLinkRows.map(({ label, field }) => (
          <div key={field}>
            <span className="mb-1.5 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
            <div className="flex gap-1.5">
              <input
                value={draft[field]}
                onChange={e => onDraftChange({ [field]: e.target.value } as Partial<CityLicenseSourceReviewInput>)}
                placeholder="Official source URL"
                className={urlInputCls(draft[field])}
              />
              <LinkOut href={draft[field]} />
            </div>
          </div>
        ))}
      </div>

      {/* Fee Details */}
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Fee Details</span>
          <span className="text-[0.72rem] text-[var(--muted)]">Raw scraped text</span>
        </div>
        <textarea
          value={draft.feeSummary}
          onChange={e => onDraftChange({ feeSummary: e.target.value })}
          rows={7}
          className="rounded-xl border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] px-3 py-2.5 font-mono text-[0.82rem] leading-[1.6] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
        />
      </div>

      {/* AI Fee Table */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">AI Fee Table Breakdown</span>
          <button
            type="button"
            onClick={() => void onParseFees()}
            disabled={isParsingFees || !draft.feeSummary.trim()}
            title={!draft.feeSummary.trim() ? "Enter fee details text above first" : undefined}
            className={cx(ui.buttonSecondary, "min-h-8 rounded-xl px-3 text-[0.78rem] disabled:opacity-55")}
          >
            {isParsingFees ? "Parsing…" : "AI → Parse fees"}
          </button>
        </div>
        <FeeTableEditor rows={draft.feeTable} onChange={rows => onDraftChange({ feeTable: rows })} />
      </div>

      {/* Documents & Links */}
      <CityDocumentsSection
        cityReviewId={review._id}
        city={review.city}
        applicationPdfUrl={draft.applicationPdfUrl ?? ""}
        feeUrl={draft.feeUrl}
        documentLinks={draft.documentLinks ?? []}
        onApplicationPdfUrlChange={val => onDraftChange({ applicationPdfUrl: val })}
        onFeeUrlChange={val => onDraftChange({ feeUrl: val })}
        onDocumentLinksChange={links => onDraftChange({ documentLinks: links })}
        onAIAnalyzed={(feeSummary, requirementsSummary) => {
          onDraftChange({ feeSummary, requirementsSummary });
        }}
      />

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div className="text-[0.84rem] text-[var(--muted)]">Updated {new Date(review.updatedAt).toLocaleString()}</div>
        <button type="button" onClick={onSave} disabled={isBusy}
                className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
          Save edits
        </button>
      </div>
    </article>
  );
}

// ── Scrape Picker Modal ────────────────────────────────────────────────────────

function ScrapePicker({
  reviews,
  onClose,
  onScrapeSelected,
  isScraping,
}: {
  reviews: CityLicenseSourceReview[];
  onClose: () => void;
  onScrapeSelected: (ids: string[]) => void;
  isScraping: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? reviews.filter(r => r.city.toLowerCase().includes(q) || r.county.toLowerCase().includes(q)) : reviews;
  }, [reviews, search]);

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r._id)));
    }
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cx(ui.surface, "flex h-[min(90vh,620px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0")}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-[1.1rem] font-black tracking-[-0.02em]">Scrape Cities</h2>
            <p className="text-[0.82rem] text-[var(--muted)]">{selected.size} selected</p>
          </div>
          <button type="button" onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]">✕</button>
        </div>

        {/* Search + select all */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cities…"
            className="flex-1 min-h-9 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.88rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
          <button type="button" onClick={toggleAll}
                  className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-1.5 text-[0.82rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">
            {allFilteredSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(review => (
            <label
              key={review._id}
              className="flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-5 py-3 hover:bg-[var(--panel-strong)] last:border-0"
            >
              <input
                type="checkbox"
                checked={selected.has(review._id)}
                onChange={() => toggle(review._id)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[0.92rem]">{review.city}</span>
                  <span className={cx("rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em]", badgeClass(review.status))}>
                    {review.status.replace("_", " ")}
                  </span>
                </div>
                <span className="text-[0.78rem] text-[var(--muted)]">{review.county} County</span>
              </div>
              <span className="shrink-0 font-mono text-[0.7rem] text-[var(--muted)]">#{review.populationRank}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-[0.84rem] text-[var(--muted)]">No cities match "{search}"</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <button type="button" onClick={onClose}
                  className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem]")}>Cancel</button>
          <button
            type="button"
            onClick={() => onScrapeSelected([...selected])}
            disabled={selected.size === 0 || isScraping}
            className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}
          >
            {isScraping ? "Scraping…" : `Scrape ${selected.size} cit${selected.size === 1 ? "y" : "ies"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Seed Cities Picker Modal ───────────────────────────────────────────────────

function SeedCitiesPicker({
  onClose,
  onSeedSelected,
  isSeeding,
}: {
  onClose: () => void;
  onSeedSelected: (cityNames: string[]) => void;
  isSeeding: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CALIFORNIA_CITIES;
    // Exact city name match first, then everything else (partial city + county matches)
    const exact = CALIFORNIA_CITIES.filter(c => c.name.toLowerCase() === q);
    const others = CALIFORNIA_CITIES.filter(c => c.name.toLowerCase() !== q && (c.name.toLowerCase().includes(q) || c.county.toLowerCase().includes(q)));
    return [...exact, ...others];
  }, [search]);

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.name)));
    }
  }

  function selectCustom() {
    // All Orange County cities + major CA metros (up to 50 total)
    const orangeCountyCities = CALIFORNIA_CITIES.filter(c => c.county === "Orange");
    const remaining = Math.max(0, 50 - orangeCountyCities.length);
    const majorCities = [
      "Los Angeles", "San Diego", "San Jose", "San Francisco", "Oakland", "Berkeley",
      "Long Beach", "Pasadena", "Anaheim", "Riverside", "Stockton", "Fresno",
      "Bakersfield", "Modesto", "Santa Ana", "Sacramento", "Irvine", "Huntington Beach",
      "San Bernardino", "Vallejo", "Santa Rosa", "Concord", "Sunnyvale", "Palo Alto",
      "Mountain View", "Cupertino", "Fremont", "Hayward", "Daly City", "Santa Clara",
      "Reno", "Turlock", "Visalia", "Merced", "Chico", "Redding"
    ];
    const majorCitiesSet = new Set(majorCities);
    const selectedMajor = CALIFORNIA_CITIES.filter(c => majorCitiesSet.has(c.name) && c.county !== "Orange").slice(0, remaining);
    const combined = [...orangeCountyCities, ...selectedMajor];
    setSelected(new Set(combined.map(c => c.name)));
  }

  function toggle(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cx(ui.surface, "flex h-[min(90vh,620px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0")}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-[1.1rem] font-black tracking-[-0.02em]">Seed Cities</h2>
            <p className="text-[0.82rem] text-[var(--muted)]">{selected.size} selected from {CALIFORNIA_CITIES.length} CA cities</p>
          </div>
          <button type="button" onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]">✕</button>
        </div>

        {/* Search + buttons */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cities or counties…"
            className="flex-1 min-h-9 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.88rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
          <button type="button" onClick={selectCustom}
                  className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-1.5 text-[0.82rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">
            Custom
          </button>
          <button type="button" onClick={toggleAll}
                  className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-1.5 text-[0.82rem] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">
            {allFilteredSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(city => (
            <label
              key={city.name}
              className="flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-5 py-3 hover:bg-[var(--panel-strong)] last:border-0"
            >
              <input
                type="checkbox"
                checked={selected.has(city.name)}
                onChange={() => toggle(city.name)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[0.92rem]">{city.name}</div>
                <span className="text-[0.78rem] text-[var(--muted)]">{city.county} County</span>
              </div>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-[0.84rem] text-[var(--muted)]">No cities match "{search}"</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <button type="button" onClick={onClose}
                  className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem]")}>Cancel</button>
          <button
            type="button"
            onClick={() => onSeedSelected([...selected])}
            disabled={selected.size === 0 || isSeeding}
            className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}
          >
            {isSeeding ? "Seeding…" : `Seed ${selected.size} cit${selected.size === 1 ? "y" : "ies"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CityLicenseSourceReviewPage() {
  const reviews = useQuery(convexApi.listTopCityReviews, { limit: 100 });
  const clearCityReviews = useMutation(convexApi.clearCityReviews);
  const deleteCity = useMutation(convexApi.deleteCity);
  const seedSelectedCities = useMutation(convexApi.seedSelectedCities);
  const updateReview = useMutation(convexApi.updateCityLicenseReview);
  const setReviewStatus = useMutation(convexApi.setCityLicenseReviewStatus);
  const scrapeCity = useAction(convexApi.scrapeCity);
  const [drafts, setDrafts] = useState<Record<string, CityLicenseSourceReviewInput>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scrapingId, setScrapingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [showScrapePicker, setShowScrapePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSeedPicker, setShowSeedPicker] = useState(false);

  useEffect(() => {
    if (!reviews) return;
    setDrafts(current => {
      const next = { ...current };
      for (const review of reviews) {
        if (!next[review._id]) next[review._id] = toDraft(review);
      }
      return next;
    });
  }, [reviews]);

  const counts = useMemo(() => {
    const rows = reviews ?? [];
    return {
      total: rows.length,
      approved: rows.filter(r => r.status === "approved").length,
      pending: rows.filter(r => r.status === "pending").length,
      needsReview: rows.filter(r => r.status === "needs_review").length,
      problemPages: rows.filter(r => r.sourceKind === "pdf" || r.sourceKind === "js" || r.retrievalStatus === "cant_retrieve").length
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    // Apply status filter
    let filtered = reviews;
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    // Apply search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r => r.city.toLowerCase().includes(q) || r.county.toLowerCase().includes(q));
    }
    // Sort by updatedAt
    const sorted = [...filtered].sort((a, b) => {
      return sortOrder === "desc" ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt;
    });
    return sorted;
  }, [reviews, search, statusFilter, sortOrder]);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, page]);

  async function onClearAll() {
    setMessage(null);
    setBusyId("clear");
    try {
      const result = await clearCityReviews({});
      setMessage(`Deleted ${result.deleted} city review records.`);
      setShowDeleteConfirm(false);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Failed to clear records.");
    } finally {
      setBusyId(null);
    }
  }

  async function onSave(review: CityLicenseSourceReview) {
    const draft = drafts[review._id];
    if (!draft) return;
    setMessage(null);
    setBusyId(review._id);
    try {
      await updateReview({ reviewId: review._id, ...draft });
      setMessage(`${review.city} edits saved.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : `Failed to save ${review.city}.`);
    } finally {
      setBusyId(null);
    }
  }

  async function onStatus(review: CityLicenseSourceReview, status: CityLicenseSourceReview["status"]) {
    const draft = drafts[review._id];
    setMessage(null);
    setBusyId(review._id);
    try {
      if (draft) await updateReview({ reviewId: review._id, ...draft });
      await setReviewStatus({ reviewId: review._id, status, reviewerNotes: draft?.reviewerNotes });
      setMessage(`${review.city} marked ${status.replace("_", " ")}.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : `Failed to update ${review.city}.`);
    } finally {
      setBusyId(null);
    }
  }

  async function onScrape(review: CityLicenseSourceReview) {
    setMessage(null);
    setScrapingId(review._id);
    try {
      const result = await scrapeCity({ reviewId: review._id });
      setMessage(`${review.city} scraped — ${result.retrievalStatus}. App URL: ${result.applicationUrl || "not found"}`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : `Scrape failed for ${review.city}.`);
    } finally {
      setScrapingId(null);
    }
  }


  async function onScrapeSelected(ids: string[]) {
    if (!reviews) return;
    const toScrape = reviews.filter(r => ids.includes(r._id));
    setShowScrapePicker(false);
    setMessage(`Scraping ${toScrape.length} cities…`);
    let done = 0;
    for (const review of toScrape) {
      setScrapingId(review._id);
      try {
        await scrapeCity({ reviewId: review._id });
        done++;
        setMessage(`Scraped ${done}/${toScrape.length} — last: ${review.city}`);
      } catch {
        setMessage(`Error scraping ${review.city}, continuing…`);
      }
    }
    setScrapingId(null);
    setMessage(`Done. Scraped ${done} of ${toScrape.length} cities.`);
  }

  async function onSeedSelected(cityNames: string[]) {
    setMessage(null);
    setBusyId("seed");
    try {
      const result = await seedSelectedCities({ cityNames });
      setMessage(`Seeded ${result.inserted} cities (${result.attempted} selected).`);
      setShowSeedPicker(false);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Failed to seed cities.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout
      title="City Scrapes"
      description="Manage scraped business license sources for California cities."
    >
      {showScrapePicker && reviews && (
        <ScrapePicker
          reviews={reviews}
          onClose={() => setShowScrapePicker(false)}
          onScrapeSelected={ids => void onScrapeSelected(ids)}
          isScraping={scrapingId !== null}
        />
      )}

      {showSeedPicker && (
        <SeedCitiesPicker
          onClose={() => setShowSeedPicker(false)}
          onSeedSelected={cityNames => void onSeedSelected(cityNames)}
          isSeeding={busyId === "seed"}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
          <div className={cx(ui.surface, "flex w-full max-w-md flex-col gap-0 overflow-hidden p-0")}>
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[1.1rem] font-black tracking-[-0.02em]">Delete All Records?</h2>
              <p className="mt-1 text-[0.82rem] text-[var(--muted)]">This will permanently delete all city review records. This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
              <button type="button" onClick={() => setShowDeleteConfirm(false)}
                      className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem]")}>Cancel</button>
              <button type="button" onClick={() => void onClearAll()} disabled={busyId !== null}
                      className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] bg-red-600 hover:bg-red-700 disabled:opacity-55")}>
                {busyId === "clear" ? "Deleting…" : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-[18px] lg:grid-cols-5">
        {[
          ["Cities", counts.total],
          ["Approved", counts.approved],
          ["Pending", counts.pending],
          ["Needs review", counts.needsReview],
          ["PDF/JS/CMS", counts.problemPages]
        ].map(([label, value]) => (
          <article key={label} className={cx(ui.surface, "grid gap-1.5 p-5")}>
            <span className={ui.kicker}>{label}</span>
            <strong className="text-[2rem] tracking-[-0.04em]">{value}</strong>
          </article>
        ))}
      </section>

      {message ? (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-[0.92rem] text-[var(--text)]">
          {message}
        </div>
      ) : null}

      {!reviews ? (
        <section className={cx(ui.surface, "p-8 text-center text-[var(--muted)]")}>Loading…</section>
      ) : reviews.length === 0 ? (
        <section className={cx(ui.surface, "grid justify-items-start gap-4 p-8")}>
          <div>
            <div className={ui.kicker}>Empty queue</div>
            <h2 className="mt-2 text-[1.6rem] font-black tracking-[-0.03em]">No cities yet.</h2>
            <p className="mt-2 max-w-[680px] text-[var(--muted)]">
              Seed cities to your database, or scrape existing cities to manage their sources.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowSeedPicker(true)} disabled={busyId !== null} className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
              {busyId === "seed" ? "Seeding…" : "Seed Cities"}
            </button>
            <button type="button" onClick={() => setShowScrapePicker(true)} disabled={busyId !== null || scrapingId !== null} className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
              {scrapingId !== null ? "Scraping…" : "Scrape"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by city or county…"
                className="min-h-11 w-full max-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
              />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.88rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="needs_review">Needs review</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className={cx(ui.buttonSecondary, "min-h-11 rounded-xl px-3 text-[0.82rem] whitespace-nowrap")}
                title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
              >
                {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
              </button>
              {search || statusFilter !== "all" ? (
                <span className="text-[0.84rem] text-[var(--muted)]">{filteredReviews.length} of {reviews.length}</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(true)} disabled={busyId !== null || scrapingId !== null}
                      className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] text-red-500 disabled:opacity-55")}>
                Delete All
              </button>
              <button type="button" onClick={() => setShowScrapePicker(true)} disabled={busyId !== null || scrapingId !== null}
                      className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
                {scrapingId !== null ? "Scraping…" : "Scrape"}
              </button>
            </div>
          </div>

          <section className="grid gap-5">
            {paginatedReviews.length === 0 ? (
              <p className="py-8 text-center text-[var(--muted)]">No cities match your filters.</p>
            ) : paginatedReviews.map(review => {
              const draft = drafts[review._id] ?? toDraft(review);
              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  draft={draft}
                  isBusy={busyId === review._id}
                  isScraping={scrapingId === review._id}
                  onDraftChange={patch =>
                    setDrafts(current => ({
                      ...current,
                      [review._id]: { ...(current[review._id] ?? toDraft(review)), ...patch }
                    }))
                  }
                  onSave={() => void onSave(review)}
                  onApprove={() => void onStatus(review, "approved")}
                  onReject={() => void onStatus(review, "rejected")}
                  onScrape={() => void onScrape(review)}
                  onDelete={() => void deleteCity({ reviewId: review._id })}
                />
              );
            })}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cx(ui.buttonSecondary, "min-h-9 rounded-xl px-3 text-[0.82rem] disabled:opacity-40")}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={cx(
                      "min-h-9 min-w-9 rounded-xl px-2 text-[0.82rem] border outline-none transition-colors",
                      pageNum === page
                        ? "border-[color-mix(in_srgb,var(--accent)_42%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent-strong)]"
                        : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:border-[var(--accent)]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cx(ui.buttonSecondary, "min-h-9 rounded-xl px-3 text-[0.82rem] disabled:opacity-40")}
              >
                Next →
              </button>
              <span className="text-[0.78rem] text-[var(--muted)] ml-2">
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
