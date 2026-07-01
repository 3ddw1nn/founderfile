import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { CALIFORNIA_CITIES } from "@startupfiles/shared/california-cities";

// Convex provides process.env at runtime for environment variables
declare const process: {
  env: Record<string, string | undefined>;
};

const query = queryGeneric;
const mutation = mutationGeneric;

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_review")
);

const sourceKindValidator = v.union(
  v.literal("html"),
  v.literal("pdf"),
  v.literal("js"),
  v.literal("cms"),
  v.literal("unknown")
);

const retrievalStatusValidator = v.union(
  v.literal("not_run"),
  v.literal("retrieved"),
  v.literal("partial"),
  v.literal("cant_retrieve"),
  v.literal("error")
);

const feeRowValidator = v.object({ tier: v.string(), fee: v.string(), detail: v.string() });

const editableFields = {
  sourceKind: sourceKindValidator,
  retrievalStatus: retrievalStatusValidator,
  businessLicenseUrl: v.string(),
  applicationUrl: v.string(),
  applicationPdfUrl: v.optional(v.string()),
  feeUrl: v.string(),
  checklistUrl: v.string(),
  downloadUrl: v.string(),
  feeSummary: v.string(),
  feeTable: v.optional(v.array(feeRowValidator)),
  documentLinks: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
  requirementsSummary: v.string(),
  applicationFields: v.array(v.string()),
  scraperNotes: v.string(),
  reviewerNotes: v.string(),
  confidence: v.number()
};

const ADMIN_EMAILS = new Set(["ehleedev@gmail.com"]);

function isAdminUser(user: any) {
  return user?.role === "admin" || user?.role === "owner" || ADMIN_EMAILS.has(String(user?.email ?? "").trim().toLowerCase());
}

type SeedReview = {
  city: string;
  county: string;
  populationRank: number;
  sourceKind: "html" | "pdf" | "js" | "cms" | "unknown";
  retrievalStatus: "not_run" | "retrieved" | "partial" | "cant_retrieve" | "error";
  businessLicenseUrl: string;
  applicationUrl: string;
  feeUrl: string;
  checklistUrl: string;
  downloadUrl: string;
  feeSummary: string;
  requirementsSummary: string;
  applicationFields: string[];
  scraperNotes: string;
  confidence: number;
};

const TOP_CITY_SEEDS: SeedReview[] = [
  {
    city: "Los Angeles",
    county: "Los Angeles",
    populationRank: 1,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "5-city pilot. Run scraper to populate.",
    confidence: 0
  },
  {
    city: "San Diego",
    county: "San Diego",
    populationRank: 2,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "5-city pilot. Run scraper to populate.",
    confidence: 0
  },
  {
    city: "San Francisco",
    county: "San Francisco",
    populationRank: 4,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "5-city pilot. Run scraper to populate.",
    confidence: 0
  },
  {
    city: "Irvine",
    county: "Orange",
    populationRank: 14,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "5-city pilot. Run scraper to populate.",
    confidence: 0
  },
  {
    city: "Costa Mesa",
    county: "Orange",
    populationRank: 26,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "5-city pilot. Run scraper to populate.",
    confidence: 0
  }
];

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("You must be signed in.");

  const user = await ctx.db.get(userId);
  if (!isAdminUser(user)) {
    throw new Error("Admin access required.");
  }

  return userId;
}

export const listTopCityReviews = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(statusValidator)
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 100, 500);

    if (args.status) {
      return await ctx.db
        .query("cityLicenseSourceReviews")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .take(limit);
    }

    return await ctx.db
      .query("cityLicenseSourceReviews")
      .withIndex("by_population_rank")
      .take(limit);
  }
});

export const clearCityReviews = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("cityLicenseSourceReviews").collect();
    for (const doc of all) await ctx.db.delete(doc._id);
    return { deleted: all.length };
  }
});

export const deleteCity = mutation({
  args: { reviewId: v.id("cityLicenseSourceReviews") },
  handler: async (ctx, { reviewId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(reviewId);
    return true;
  }
});

export const seedTopCityReviews = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAdmin(ctx);
    const now = Date.now();

    // Clear existing records before reseeding
    const existing = await ctx.db.query("cityLicenseSourceReviews").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    let inserted = 0;
    for (const seed of TOP_CITY_SEEDS) {
      await ctx.db.insert("cityLicenseSourceReviews", {
        ...seed,
        status: "needs_review",
        reviewerNotes: "",
        createdAt: now,
        updatedAt: now
      });
      inserted += 1;
    }

    await ctx.db.insert("auditEvents", {
      userId,
      action: "city_license_reviews.seeded",
      entityType: "cityLicenseSourceReviews",
      metadata: { inserted },
      createdAt: now
    });

    return { inserted };
  }
});

export const seedSelectedCities = mutation({
  args: { cityNames: v.array(v.string()) },
  handler: async (ctx, { cityNames }) => {
    const userId = await requireAdmin(ctx);
    const now = Date.now();

    // Build a map of city name → rank for population ranking
    const cityRankMap = new Map<string, number>();
    CALIFORNIA_CITIES.forEach((city, idx) => {
      cityRankMap.set(city.name.toLowerCase(), idx + 1);
    });

    let inserted = 0;
    for (const cityName of cityNames) {
      // Check if city already exists
      const existing = await ctx.db
        .query("cityLicenseSourceReviews")
        .withIndex("by_city", (q: any) => q.eq("city", cityName))
        .first();

      if (existing) continue;

      // Find city in CALIFORNIA_CITIES to get county
      const caCity = CALIFORNIA_CITIES.find(c => c.name === cityName);
      if (!caCity) continue;

      await ctx.db.insert("cityLicenseSourceReviews", {
        city: cityName,
        county: caCity.county,
        populationRank: cityRankMap.get(cityName.toLowerCase()) || 999,
        status: "needs_review",
        sourceKind: "unknown",
        retrievalStatus: "not_run",
        businessLicenseUrl: "",
        applicationUrl: "",
        feeUrl: "",
        checklistUrl: "",
        downloadUrl: "",
        feeSummary: "Not scraped yet.",
        requirementsSummary: "Needs SerpApi discovery and official source verification.",
        applicationFields: [],
        scraperNotes: "Added via seed selection.",
        reviewerNotes: "",
        confidence: 0,
        createdAt: now,
        updatedAt: now
      });
      inserted += 1;
    }

    await ctx.db.insert("auditEvents", {
      userId,
      action: "city_license_reviews.seed_selected",
      entityType: "cityLicenseSourceReviews",
      metadata: { inserted, count: cityNames.length },
      createdAt: now
    });

    return { inserted, attempted: cityNames.length };
  }
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("cityLicenseSourceReviews"),
    ...editableFields
  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);
    const { reviewId, ...patch } = args;
    const now = Date.now();

    await ctx.db.patch(reviewId, {
      ...patch,
      status: "pending",
      updatedAt: now
    });

    await ctx.db.insert("auditEvents", {
      userId,
      action: "city_license_review.updated",
      entityType: "cityLicenseSourceReview",
      entityId: reviewId,
      metadata: { cityReviewId: reviewId },
      createdAt: now
    });

    return true;
  }
});

export const setReviewStatus = mutation({
  args: {
    reviewId: v.id("cityLicenseSourceReviews"),
    status: statusValidator,
    reviewerNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);
    const now = Date.now();
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: now
    };

    if (args.reviewerNotes !== undefined) patch.reviewerNotes = args.reviewerNotes;
    if (args.status === "approved") {
      patch.approvedAt = now;
      patch.approvedBy = userId;
    }

    await ctx.db.patch(args.reviewId, patch);
    await ctx.db.insert("auditEvents", {
      userId,
      action: `city_license_review.${args.status}`,
      entityType: "cityLicenseSourceReview",
      entityId: args.reviewId,
      metadata: { status: args.status },
      createdAt: now
    });

    return true;
  }
});

// ─── Internal helpers used by the scraper action ───────────────────────────

export const getReviewById = internalQuery({
  args: { reviewId: v.id("cityLicenseSourceReviews") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reviewId);
  }
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }
});

export const applyScrapedData = internalMutation({
  args: {
    reviewId: v.id("cityLicenseSourceReviews"),
    sourceKind: sourceKindValidator,
    retrievalStatus: v.union(v.literal("retrieved"), v.literal("partial"), v.literal("error")),
    businessLicenseUrl: v.string(),
    applicationUrl: v.string(),
    applicationPdfUrl: v.optional(v.string()),
    feeUrl: v.string(),
    checklistUrl: v.string(),
    downloadUrl: v.string(),
    feeSummary: v.string(),
    feeTable: v.optional(v.array(feeRowValidator)),
    scraperNotes: v.string(),
    confidence: v.number()
  },
  handler: async (ctx, args) => {
    const { reviewId, retrievalStatus, ...fields } = args;
    const newStatus = retrievalStatus === "retrieved" ? "pending" : "needs_review";
    await ctx.db.patch(reviewId, {
      ...fields,
      retrievalStatus,
      status: newStatus,
      lastScrapedAt: Date.now(),
      updatedAt: Date.now()
    });
    return true;
  }
});

// ─── Public action: scrape a single city via SerpAPI ───────────────────────

function classifyUrls(results: Array<{ link?: string; title?: string; snippet?: string }>) {
  let businessLicenseUrl = "";
  let applicationUrl = "";
  let applicationPdfUrl = "";
  let feeUrl = "";
  let checklistUrl = "";
  let downloadUrl = "";
  let sourceKind: "html" | "pdf" | "js" | "cms" | "unknown" = "unknown";

  for (const result of results) {
    const url = (result.link ?? "").trim();
    const title = (result.title ?? "").toLowerCase();
    const snippet = (result.snippet ?? "").toLowerCase();
    if (!url) continue;

    const isPdf = url.toLowerCase().endsWith(".pdf") || snippet.includes("[pdf]");
    const isHdl = url.includes("hdlgov.com");
    const isAvenu = url.includes("bizlicenseonline.com");
    const isGov = url.includes(".gov") || url.includes(".us");

    // HdL / Avenu portals → definitive applicationUrl
    if (!applicationUrl && (isHdl || isAvenu)) {
      applicationUrl = url;
      sourceKind = "js";
    }

    // Online application paths
    if (!applicationUrl && (
      url.includes("/apply") ||
      url.includes("/application") ||
      url.includes("eapplication") ||
      url.includes("businessregapp") ||
      (title.includes("apply") && (title.includes("business license") || title.includes("business tax")))
    )) {
      applicationUrl = url;
      sourceKind = isPdf ? "pdf" : "html";
    }

    // Application PDF form (not fee schedule)
    if (!applicationPdfUrl && isPdf && (
      title.includes("application") || title.includes("form") || title.includes("fillable")
    ) && !(title.includes("fee") || title.includes("schedule") || title.includes("rate"))) {
      applicationPdfUrl = url;
    }

    // PDF fee schedule
    if (!feeUrl && isPdf && (title.includes("fee") || title.includes("rate") || title.includes("schedule") || title.includes("tax"))) {
      feeUrl = url;
      downloadUrl = url;
      sourceKind = "pdf";
    }

    // HTML fee page
    if (!feeUrl && !isPdf && (
      url.includes("/fee") ||
      url.includes("rate-schedule") ||
      title.includes("fee schedule") ||
      title.includes("tax rate") ||
      title.includes("business tax rates")
    )) {
      feeUrl = url;
      if (sourceKind === "unknown") sourceKind = "html";
    }

    // Checklist / requirements
    if (!checklistUrl && (
      url.includes("checklist") ||
      title.includes("checklist") ||
      title.includes("requirements") ||
      title.includes("what you need") ||
      title.includes("how to apply")
    )) {
      checklistUrl = url;
    }

    // Main business license landing page (official gov domain)
    if (!businessLicenseUrl && isGov && (
      title.includes("business license") ||
      title.includes("business tax") ||
      title.includes("business registration")
    )) {
      businessLicenseUrl = url;
      if (sourceKind === "unknown") sourceKind = isPdf ? "pdf" : "html";
    }
  }

  return { businessLicenseUrl, applicationUrl, applicationPdfUrl, feeUrl, checklistUrl, downloadUrl, sourceKind };
}

// ─── Fee page fetcher: fetches a URL and extracts dollar-amount context ────

async function extractFeeFromPage(url: string): Promise<string> {
  if (!url) return "";
  const isPdf = url.toLowerCase().endsWith(".pdf");
  if (isPdf) return "[PDF fee schedule — amounts in download URL]";

  const tryFetch = async (ua: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  // Try a real browser UA first, then a simpler one as fallback
  let res = await tryFetch(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  if (!res || !res.ok) {
    res = await tryFetch("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");
  }
  if (!res || !res.ok) return "";

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("pdf")) return "[PDF fee schedule — amounts in download URL]";
  if (!ct.includes("html") && !ct.includes("text")) return "";

  const html = await res.text();

  // Strip scripts, styles, nav, header, footer boilerplate, then all tags
  const clean = html
    .replace(/<(script|style|nav|header|footer|noscript|aside)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    // Preserve table structure: replace <tr> and <td>/<th> with pipe delimiters before stripping
    .replace(/<\/tr>/gi, "\n").replace(/<\/(td|th)>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Split into lines for table-style parsing
  const textLines = clean.split("\n").map(l => l.trim()).filter(Boolean);

  const feeKeywords = /employee|gross|receipt|annual|per.?year|renewal|new.?bus|home.?based|commercial|tier|class|categor|base.?fee|flat|minimum|maximum|permit|license|registr/i;

  // Strategy 1: Find lines that contain both a dollar amount AND fee context
  const richLines = textLines.filter(l => /\$[\d,]+/.test(l) && feeKeywords.test(l));

  // Strategy 2: Find any lines with dollar amounts + enough nearby context
  const dollarLines = textLines.filter(l => /\$[\d,]+(?:\.\d{2})?/.test(l));

  // Strategy 3: Extract dollar amounts with surrounding text using regex window
  const windowMatches = (clean.match(/.{0,150}\$[\d,]+(?:\.\d{2})?.{0,150}/g) ?? []).map(m => m.trim());
  const relevantWindows = windowMatches.filter(m => feeKeywords.test(m));

  // Pick the best source
  let candidates: string[] = [];
  if (richLines.length > 0) candidates = richLines;
  else if (relevantWindows.length > 0) candidates = relevantWindows;
  else candidates = dollarLines;

  // Deduplicate
  const seen = new Set<string>();
  const unique = candidates.filter(l => {
    const key = l.replace(/\s+/g, " ").toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 12).join("\n").slice(0, 1100);
}

function parseFeeTable(text: string): Array<{ tier: string; fee: string; detail: string }> {
  if (!text) return [];

  const rows: Array<{ tier: string; fee: string; detail: string }> = [];

  // Expand the text: split on newlines AND on sentence boundaries around dollar amounts
  const lines = text
    .split(/\n|\.\s+(?=[A-Z])/)
    .map(l => l.replace(/^\[.*?\]\s*/, "").trim()) // strip section headers like [Fee page extract]
    .filter(l => l.length > 3 && /\$[\d,]/.test(l));

  for (const line of lines) {
    // ── Pipe-delimited table rows (preserved from <tr><td> HTML) ──────────
    if (line.includes("|")) {
      const parts = line.split("|").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const feePart = parts.find(p => /\$[\d,]/.test(p));
        if (!feePart) continue;
        const tierPart = parts.find(p => p !== feePart && !/^\$/.test(p) && p.length > 0);
        const extraParts = parts.filter(p => p !== feePart && p !== tierPart);
        rows.push({
          tier: (tierPart ?? line).slice(0, 80),
          fee: feePart.match(/\$[\d,]+(?:\.\d{2})?(?:[^|]{0,25})?/)?.[0]?.trim() ?? feePart.slice(0, 30),
          detail: extraParts.join(" — ").slice(0, 120)
        });
        continue;
      }
    }

    // ── "Tier text: $fee additional context" ──────────────────────────────
    const colonMatch = line.match(/^([^$:]{2,70}):\s*(\$[\d,]+(?:\.\d{2})?(?:[^,\n]{0,40})?)(.*)$/);
    if (colonMatch) {
      rows.push({
        tier: colonMatch[1].trim().slice(0, 80),
        fee: colonMatch[2].trim().slice(0, 40),
        detail: colonMatch[3].trim().replace(/^[,;–\-\s]+/, "").slice(0, 120)
      });
      continue;
    }

    // ── "Tier text is/costs $fee" ─────────────────────────────────────────
    const textFirstMatch = line.match(/^(.{3,70?}?)\s+(?:is|are|costs?|fee[:\s]|tax[:\s])?\s*(\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/|annually|per year|a year)[^,\n]{0,30})?)(.*)$/i);
    if (textFirstMatch) {
      const tier = textFirstMatch[1].trim();
      const fee = textFirstMatch[2].trim();
      const detail = textFirstMatch[3].trim().replace(/^[,;–\-\s]+/, "").slice(0, 120);
      if (tier.length >= 2 && fee.length >= 2) {
        rows.push({ tier: tier.slice(0, 80), fee: fee.slice(0, 40), detail });
        continue;
      }
    }

    // ── "$fee for/per tier" ───────────────────────────────────────────────
    const dollarFirstMatch = line.match(/^(\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/)[^,–\n]{0,25})?)\s+(?:for|per|each)?\s*(.{3,80})$/i);
    if (dollarFirstMatch) {
      rows.push({
        tier: dollarFirstMatch[2].trim().slice(0, 80),
        fee: dollarFirstMatch[1].trim().slice(0, 40),
        detail: ""
      });
      continue;
    }

    // ── Fallback: whole line as tier, extract first $ as fee ─────────────
    const anyDollar = line.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/|\w+){0,4})?/);
    if (anyDollar) {
      const fee = anyDollar[0].trim();
      const tier = line.replace(anyDollar[0], "").replace(/[:\-–]+/g, "").trim().slice(0, 80);
      if (tier.length >= 3) {
        rows.push({ tier, fee: fee.slice(0, 40), detail: "" });
      }
    }
  }

  // Deduplicate by tier, require non-empty fee
  const seen = new Set<string>();
  return rows.filter(r => {
    const key = r.tier.toLowerCase().slice(0, 40);
    if (seen.has(key) || !r.fee.trim() || !r.tier.trim()) return false;
    seen.add(key);
    return true;
  }).slice(0, 20);
}

function buildFeeSummary(
  serpFeeData: { organic_results?: Array<{ snippet?: string }>; answer_box?: { snippet?: string; answer?: string; list?: string[] } },
  pageFeeText: string
): string {
  const parts: string[] = [];

  // 1. SerpAPI answer box (featured snippet) — most concise and accurate
  const box = serpFeeData.answer_box;
  if (box) {
    const boxText = [box.answer, box.snippet, ...(box.list ?? [])].filter(Boolean).join(" | ");
    if (boxText && (boxText.includes("$") || /fee|rate|tax/i.test(boxText))) {
      parts.push(`[Google featured snippet]\n${boxText.slice(0, 400)}`);
    }
  }

  // 2. Fee page scraped text (richest source for tiered pricing)
  if (pageFeeText && !pageFeeText.startsWith("[PDF")) {
    parts.push(`[Fee page extract]\n${pageFeeText}`);
  } else if (pageFeeText.startsWith("[PDF")) {
    parts.push(pageFeeText);
  }

  // 3. All SerpAPI snippets that mention dollar amounts
  const snippetLines: string[] = [];
  for (const r of serpFeeData.organic_results ?? []) {
    const snip = r.snippet ?? "";
    if (snip.includes("$") || /\bfee\b|\brate\b|\btax\b/i.test(snip)) {
      snippetLines.push(snip.trim());
    }
  }
  if (snippetLines.length > 0) {
    parts.push(`[Search snippets]\n${snippetLines.slice(0, 5).join("\n")}`);
  }

  return parts.join("\n\n").slice(0, 1500) || "Fee details require manual review.";
}

export const scrapeCity = action({
  args: {
    reviewId: v.id("cityLicenseSourceReviews")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");
    const user: any = await ctx.runQuery(internal.cityLicenseSources.getUserById, { userId });
    if (!isAdminUser(user)) throw new Error("Admin access required");

    const review: any = await ctx.runQuery(internal.cityLicenseSources.getReviewById, { reviewId: args.reviewId });
    if (!review) throw new Error("Review not found");

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) throw new Error("SERPAPI_API_KEY is not set in Convex environment");

    const city = review.city as string;
    const q1 = encodeURIComponent(`${city} CA business license apply online`);
    const q2 = encodeURIComponent(`${city} CA business license fee schedule`);
    const base = `https://serpapi.com/search.json?engine=google&num=8&api_key=${apiKey}`;

    const [r1, r2] = await Promise.all([
      fetch(`${base}&q=${q1}`),
      fetch(`${base}&q=${q2}`)
    ]);

    if (!r1.ok) throw new Error(`SerpAPI error on license search: ${r1.status} ${r1.statusText}`);
    if (!r2.ok) throw new Error(`SerpAPI error on fee search: ${r2.status} ${r2.statusText}`);

    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

    const licenseResults: Array<{ link?: string; title?: string; snippet?: string }> = d1.organic_results ?? [];
    const feeResults: Array<{ link?: string; title?: string; snippet?: string }> = d2.organic_results ?? [];

    const { businessLicenseUrl, applicationUrl, applicationPdfUrl, feeUrl, checklistUrl, downloadUrl, sourceKind } =
      classifyUrls([...licenseResults, ...feeResults]);

    const finalBusinessUrl = businessLicenseUrl || licenseResults[0]?.link || "";

    // Fetch the actual fee page to extract dollar amounts
    const pageFeeText = feeUrl ? await extractFeeFromPage(feeUrl) : "";

    // Build rich fee summary from all sources
    const feeSummary = buildFeeSummary(d2, pageFeeText);

    // Auto-parse fee summary into structured rows
    const feeTable = parseFeeTable(feeSummary);

    const totalResults = licenseResults.length + feeResults.length;
    const retrievalStatus: "retrieved" | "partial" | "error" =
      applicationUrl && feeUrl ? "retrieved" :
      (finalBusinessUrl || applicationUrl || feeUrl) ? "partial" : "error";

    const confidence =
      applicationUrl && feeUrl ? 0.78 :
      applicationUrl ? 0.55 :
      feeUrl ? 0.5 :
      finalBusinessUrl ? 0.35 : 0.1;

    const scraperNotes =
      `SerpAPI scraped ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}. ` +
      `${totalResults} results across 2 queries. Fee page ${pageFeeText ? "fetched" : "not fetched"}. ` +
      `Found: license=${!!finalBusinessUrl}, app=${!!applicationUrl}, appPdf=${!!applicationPdfUrl}, fee=${!!feeUrl}, checklist=${!!checklistUrl}.`;

    await ctx.runMutation(internal.cityLicenseSources.applyScrapedData, {
      reviewId: args.reviewId,
      sourceKind,
      retrievalStatus,
      businessLicenseUrl: finalBusinessUrl,
      applicationUrl,
      applicationPdfUrl,
      feeUrl,
      checklistUrl,
      downloadUrl,
      feeSummary,
      feeTable: feeTable.length > 0 ? feeTable : undefined,
      scraperNotes,
      confidence
    });

    return { retrievalStatus, applicationUrl, feeUrl, businessLicenseUrl: finalBusinessUrl };
  }
});
