"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import type {
  CityLicenseSourceReview,
  CityLicenseSourceReviewInput
} from "../lib/convex-api";
import { convexApi } from "../lib/convex-api";
import { DashboardLayout } from "./dashboard-layout";
import { cx, ui } from "./ui-classes";

const SOURCE_KIND_OPTIONS: CityLicenseSourceReview["sourceKind"][] = ["html", "pdf", "js", "cms", "unknown"];
const RETRIEVAL_STATUS_OPTIONS: CityLicenseSourceReview["retrievalStatus"][] = [
  "not_run",
  "retrieved",
  "partial",
  "cant_retrieve",
  "error"
];

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
    feeUrl: review.feeUrl,
    checklistUrl: review.checklistUrl,
    downloadUrl: review.downloadUrl,
    feeSummary: review.feeSummary,
    requirementsSummary: review.requirementsSummary,
    applicationFields: review.applicationFields,
    scraperNotes: review.scraperNotes,
    reviewerNotes: review.reviewerNotes,
    confidence: review.confidence
  };
}

function fieldsToText(fields: string[]) {
  return fields.join("\n");
}

function textToFields(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function ReviewCard({
  review,
  draft,
  onDraftChange,
  onSave,
  onApprove,
  onReject,
  onScrape,
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
  isBusy: boolean;
  isScraping: boolean;
}) {
  const linkRows = [
    ["Business license", "businessLicenseUrl"],
    ["Application", "applicationUrl"],
    ["Fees", "feeUrl"],
    ["Checklist", "checklistUrl"],
    ["Download", "downloadUrl"]
  ] as const;

  return (
    <article className={cx(ui.surface, "grid gap-5 p-5")}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
              #{review.populationRank}
            </span>
            <span className={cx("rounded-full border px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em]", badgeClass(review.status))}>
              {review.status.replace("_", " ")}
            </span>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
              {sourceKindLabel(draft.sourceKind)}
            </span>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
              {draft.retrievalStatus.replace("_", " ")}
            </span>
          </div>
          <h2 className="mt-3 text-[1.45rem] font-black tracking-[-0.03em]">{review.city}</h2>
          <p className="mt-1 text-[0.92rem] text-[var(--muted)]">{review.county} County</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel-strong)_72%,transparent)] px-3 py-2 text-center min-w-[80px]">
            <div className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Confidence</div>
            <strong className="text-[1rem]">{Math.round(draft.confidence * 100)}%</strong>
          </div>
          <button
            type="button"
            onClick={onScrape}
            disabled={isBusy || isScraping}
            className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}
          >
            {isScraping ? "Scraping…" : "Scrape"}
          </button>
          <button type="button" onClick={onApprove} disabled={isBusy || isScraping} className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}>
            Approve
          </button>
          <button type="button" onClick={onReject} disabled={isBusy || isScraping} className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-3 text-[0.85rem] disabled:opacity-55")}>
            Reject
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-3">
          {linkRows.map(([label, field]) => (
            <label key={field} className="grid gap-1.5">
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label} URL</span>
              <input
                value={draft[field]}
                onChange={(event) => onDraftChange({ [field]: event.target.value } as Partial<CityLicenseSourceReviewInput>)}
                placeholder={field === "downloadUrl" ? "PDF or downloadable file link, when present" : "Official source URL"}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[0.88rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
              />
            </label>
          ))}
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Page type</span>
              <select
                value={draft.sourceKind}
                onChange={(event) => onDraftChange({ sourceKind: event.target.value as CityLicenseSourceReview["sourceKind"] })}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 outline-none"
              >
                {SOURCE_KIND_OPTIONS.map((option) => (
                  <option key={option} value={option}>{sourceKindLabel(option)}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Retrieval</span>
              <select
                value={draft.retrievalStatus}
                onChange={(event) => onDraftChange({ retrievalStatus: event.target.value as CityLicenseSourceReview["retrievalStatus"] })}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 outline-none"
              >
                {RETRIEVAL_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option.replace("_", " ")}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Confidence</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={draft.confidence}
              onChange={(event) => onDraftChange({ confidence: Number(event.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Fee summary</span>
          <textarea
            value={draft.feeSummary}
            onChange={(event) => onDraftChange({ feeSummary: event.target.value })}
            rows={4}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Requirements summary</span>
          <textarea
            value={draft.requirementsSummary}
            onChange={(event) => onDraftChange({ requirementsSummary: event.target.value })}
            rows={4}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Application fields</span>
          <textarea
            value={fieldsToText(draft.applicationFields)}
            onChange={(event) => onDraftChange({ applicationFields: textToFields(event.target.value) })}
            rows={6}
            placeholder="One field per line"
            className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Scraper notes</span>
          <textarea
            value={draft.scraperNotes}
            onChange={(event) => onDraftChange({ scraperNotes: event.target.value })}
            rows={6}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Reviewer notes</span>
          <textarea
            value={draft.reviewerNotes}
            onChange={(event) => onDraftChange({ reviewerNotes: event.target.value })}
            rows={6}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[0.9rem] outline-none focus:border-[color-mix(in_srgb,var(--accent)_42%,transparent)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div className="text-[0.84rem] text-[var(--muted)]">
          Updated {new Date(review.updatedAt).toLocaleString()}
        </div>
        <button type="button" onClick={onSave} disabled={isBusy} className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
          Save edits
        </button>
      </div>
    </article>
  );
}

export function CityLicenseSourceReviewPage() {
  const reviews = useQuery(convexApi.listTopCityReviews, { limit: 25 });
  const seedTopCityReviews = useMutation(convexApi.seedTopCityReviews);
  const normalizeUserRoles = useMutation(convexApi.normalizeUserRoles);
  const updateReview = useMutation(convexApi.updateCityLicenseReview);
  const setReviewStatus = useMutation(convexApi.setCityLicenseReviewStatus);
  const scrapeCity = useAction(convexApi.scrapeCity);
  const [drafts, setDrafts] = useState<Record<string, CityLicenseSourceReviewInput>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scrapingId, setScrapingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reviews) return;
    setDrafts((current) => {
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
      approved: rows.filter((row) => row.status === "approved").length,
      pending: rows.filter((row) => row.status === "pending").length,
      needsReview: rows.filter((row) => row.status === "needs_review").length,
      problemPages: rows.filter((row) => row.sourceKind === "pdf" || row.sourceKind === "js" || row.retrievalStatus === "cant_retrieve").length
    };
  }, [reviews]);

  async function onSeed() {
    setMessage(null);
    setBusyId("seed");
    try {
      const result = await seedTopCityReviews({});
      setMessage(result.inserted ? `Seeded ${result.inserted} city review records.` : "Top 25 review records are already seeded.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Failed to seed review records.");
    } finally {
      setBusyId(null);
    }
  }

  async function onNormalizeRoles() {
    setMessage(null);
    setBusyId("normalizeRoles");
    try {
      const result = await normalizeUserRoles({});
      setMessage(result.updated ? `Updated ${result.updated} user role records.` : "User roles are already normalized.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Failed to normalize user roles.");
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
      if (draft) {
        await updateReview({ reviewId: review._id, ...draft });
      }
      await setReviewStatus({
        reviewId: review._id,
        status,
        reviewerNotes: draft?.reviewerNotes
      });
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

  async function onScrapeAll() {
    if (!reviews) return;
    const pending = reviews.filter((r) => r.retrievalStatus === "not_run" || r.retrievalStatus === "error");
    if (pending.length === 0) {
      setMessage("No cities with not_run or error status to scrape.");
      return;
    }
    setMessage(`Scraping ${pending.length} cities…`);
    let done = 0;
    for (const review of pending) {
      setScrapingId(review._id);
      try {
        await scrapeCity({ reviewId: review._id });
        done++;
        setMessage(`Scraped ${done}/${pending.length} — last: ${review.city}`);
      } catch {
        setMessage(`Error scraping ${review.city}, continuing…`);
      }
    }
    setScrapingId(null);
    setMessage(`Done. Scraped ${done} of ${pending.length} cities.`);
  }

  return (
    <DashboardLayout
      title="City license source review"
      description="Review scraped business license sources before they are trusted by templates, walkthroughs, or user-facing city guidance."
      topRightContent={(
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onNormalizeRoles} disabled={busyId !== null || scrapingId !== null} className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
            Normalize roles
          </button>
          <button type="button" onClick={onSeed} disabled={busyId !== null || scrapingId !== null} className={cx(ui.buttonSecondary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
            Seed top 25
          </button>
          <button type="button" onClick={() => void onScrapeAll()} disabled={busyId !== null || scrapingId !== null} className={cx(ui.buttonPrimary, "min-h-10 rounded-xl px-4 text-[0.88rem] disabled:opacity-55")}>
            {scrapingId !== null ? "Scraping…" : "Scrape all pending"}
          </button>
        </div>
      )}
    >
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
        <section className={cx(ui.surface, "p-8 text-center text-[var(--muted)]")}>Loading city review queue...</section>
      ) : reviews.length === 0 ? (
        <section className={cx(ui.surface, "grid justify-items-start gap-4 p-8")}>
          <div>
            <div className={ui.kicker}>Empty queue</div>
            <h2 className="mt-2 text-[1.6rem] font-black tracking-[-0.03em]">Seed the top 25 city review records.</h2>
            <p className="mt-2 max-w-[680px] text-[var(--muted)]">
              This creates editable rows for the first city-license review pass. Later, the SerpApi cron can refresh the same records with new scrape results.
            </p>
          </div>
          <button type="button" onClick={onSeed} disabled={busyId !== null} className={cx(ui.buttonPrimary, "disabled:opacity-55")}>
            Seed top 25
          </button>
        </section>
      ) : (
        <section className="grid gap-5">
          {reviews.map((review) => {
            const draft = drafts[review._id] ?? toDraft(review);
            return (
              <ReviewCard
                key={review._id}
                review={review}
                draft={draft}
                isBusy={busyId === review._id}
                isScraping={scrapingId === review._id}
                onDraftChange={(patch) =>
                  setDrafts((current) => ({
                    ...current,
                    [review._id]: {
                      ...(current[review._id] ?? toDraft(review)),
                      ...patch
                    }
                  }))
                }
                onSave={() => void onSave(review)}
                onApprove={() => void onStatus(review, "approved")}
                onReject={() => void onStatus(review, "rejected")}
                onScrape={() => void onScrape(review)}
              />
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
}
