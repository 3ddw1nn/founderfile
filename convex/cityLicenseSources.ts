import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

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

const editableFields = {
  sourceKind: sourceKindValidator,
  retrievalStatus: retrievalStatusValidator,
  businessLicenseUrl: v.string(),
  applicationUrl: v.string(),
  feeUrl: v.string(),
  checklistUrl: v.string(),
  downloadUrl: v.string(),
  feeSummary: v.string(),
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
    sourceKind: "js",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://business.lacity.gov/plan-business/register-your-business/business-tax-registration-certificate",
    applicationUrl: "https://latax.lacity.org/businessregapp/eappreg_criteria",
    feeUrl: "https://finance.lacity.gov/tax-education/business-taxes/know-your-rates",
    checklistUrl: "https://finance.lacity.gov/tax-education/new-business-registration/how-register-btrc",
    downloadUrl: "",
    feeSummary: "Business tax varies by classification and gross receipts. Needs reviewer confirmation before template use.",
    requirementsSummary: "City Business Tax Registration Certificate is required for businesses operating in Los Angeles.",
    applicationFields: ["legal name", "business address", "mailing address", "tax ID", "business activity", "start date"],
    scraperNotes: "Application portal is JS-backed; store the official portal URL and review manually.",
    confidence: 0.82
  },
  {
    city: "San Diego",
    county: "San Diego",
    populationRank: 2,
    sourceKind: "html",
    retrievalStatus: "retrieved",
    businessLicenseUrl: "https://www.sandiego.gov/treasurer/taxesfees/btax",
    applicationUrl: "https://pay.sandiego.gov/BTaxApp",
    feeUrl: "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow",
    checklistUrl: "https://www.sandiego.gov/treasurer/taxesfees/btax/btaxhow",
    downloadUrl: "",
    feeSummary: "Fee depends on employee count. Existing estimate: about $34-$125 per year.",
    requirementsSummary: "Businesses operating in San Diego need a Business Tax Certificate.",
    applicationFields: ["business name", "business address", "owner information", "start date", "employee count"],
    scraperNotes: "Official application and instruction pages are separate.",
    confidence: 0.88
  },
  {
    city: "San Jose",
    county: "Santa Clara",
    populationRank: 3,
    sourceKind: "js",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration",
    applicationUrl: "https://businesstax.sanjoseca.gov/",
    feeUrl: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/business-tax-rates",
    checklistUrl: "https://www.sanjoseca.gov/your-government/departments-offices/finance/business-tax-registration/register-for-a-business-tax-certificate",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $195 per year base plus employee-based charges. Needs current rate check.",
    requirementsSummary: "Businesses conducting work in San Jose must register for a Business Tax Certificate.",
    applicationFields: ["business name", "business location", "mailing address", "ownership type", "activity", "employee count"],
    scraperNotes: "Tax portal is separate from city content pages.",
    confidence: 0.82
  },
  {
    city: "San Francisco",
    county: "San Francisco",
    populationRank: 4,
    sourceKind: "js",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://sftreasurer.org/business/register-business",
    applicationUrl: "https://etaxstatement.sfgov.org/accountupdate/newbusinessregistration/",
    feeUrl: "https://sftreasurer.org/business/register-business",
    checklistUrl: "https://sftreasurer.org/business/register-business",
    downloadUrl: "",
    feeSummary: "Registration fee is based on gross receipts. Existing estimate starts at $55+.",
    requirementsSummary: "Businesses operating in San Francisco must register with the Treasurer and Tax Collector.",
    applicationFields: ["owner details", "business location", "activity", "gross receipts estimate", "start date"],
    scraperNotes: "Official registration portal is a separate app; review portal fields manually.",
    confidence: 0.78
  },
  {
    city: "Fresno",
    county: "Fresno",
    populationRank: 5,
    sourceKind: "pdf",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.fresno.gov/finance/business-license-and-tax-certificate/",
    applicationUrl: "https://businesstax.fresno.gov/Webblappformfresno/",
    feeUrl: "https://www.fresno.gov/wp-content/uploads/2024/07/MFS-Finance_580-ED-2024.07.01-1.pdf",
    checklistUrl: "https://www.fresno.gov/business-checklist/",
    downloadUrl: "https://www.fresno.gov/wp-content/uploads/2024/07/MFS-Finance_580-ED-2024.07.01-1.pdf",
    feeSummary: "Fee data is in the city master fee schedule PDF. Automatic extraction not guaranteed.",
    requirementsSummary: "Business Tax Certificate application may require zone clearance before payment.",
    applicationFields: ["business name", "location", "owner information", "business activity", "zone clearance"],
    scraperNotes: "Fee page is a PDF; link is stored for download/review.",
    confidence: 0.76
  },
  {
    city: "Sacramento",
    county: "Sacramento",
    populationRank: 6,
    sourceKind: "pdf",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.cityofsacramento.gov/finance/revenue/business-operations-tax",
    applicationUrl: "https://www.cityofsacramento.gov/content/dam/portal/finance/Revenue/permits-and-taxes/BUSINESS-TAX-app_Revised-12-2019-FILLABLE.pdf",
    feeUrl: "https://www.cityofsacramento.gov/finance/revenue/business-operations-tax",
    checklistUrl: "",
    downloadUrl: "https://www.cityofsacramento.gov/content/dam/portal/finance/Revenue/permits-and-taxes/BUSINESS-TAX-app_Revised-12-2019-FILLABLE.pdf",
    feeSummary: "City uses Business Operations Tax rather than a standard business license. Rates need template-specific review.",
    requirementsSummary: "Most businesses operating in the city need a Business Operations Tax account.",
    applicationFields: ["business owner", "business address", "mailing address", "business description", "start date"],
    scraperNotes: "Application is a fillable PDF; store download URL and mark extraction as partial.",
    confidence: 0.74
  },
  {
    city: "Long Beach",
    county: "Los Angeles",
    populationRank: 7,
    sourceKind: "cms",
    retrievalStatus: "retrieved",
    businessLicenseUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/",
    applicationUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/apply-for-a-business-license/",
    feeUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/taxes--fees/",
    checklistUrl: "https://www.longbeach.gov/finance/business-info/business-licenses/business-license-application-instructions/",
    downloadUrl: "",
    feeSummary: "Rates vary by business type. Existing estimate: about $33-$300 per year.",
    requirementsSummary: "Business license required for businesses operating in Long Beach.",
    applicationFields: ["business type", "location", "owner", "employees", "business activity"],
    scraperNotes: "City CMS separates application, tax/fee, and instruction pages.",
    confidence: 0.86
  },
  {
    city: "Oakland",
    county: "Alameda",
    populationRank: 8,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits",
    applicationUrl: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits",
    feeUrl: "https://www.oaklandca.gov/Business/Business-Taxes-Licenses-Permits",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: minimum tax plus gross receipts. Needs exact fee/rate page.",
    requirementsSummary: "Businesses operating in Oakland generally need a business tax certificate.",
    applicationFields: ["business name", "owner", "address", "activity", "gross receipts"],
    scraperNotes: "Old service URL redirects to a broad city business page; needs second-pass exact links.",
    confidence: 0.58
  },
  {
    city: "Bakersfield",
    county: "Kern",
    populationRank: 9,
    sourceKind: "unknown",
    retrievalStatus: "not_run",
    businessLicenseUrl: "https://www.bakersfieldcity.us/gov/depts/finance/business_license.htm",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs official source verification.",
    applicationFields: [],
    scraperNotes: "Seeded from existing static city data; run SerpApi scrape before approval.",
    confidence: 0.2
  },
  {
    city: "Anaheim",
    county: "Orange",
    populationRank: 10,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.anaheim.net/1281/Business-License",
    applicationUrl: "https://www.anaheim.net/1281/Business-License",
    feeUrl: "https://www.anaheim.net/1281/Business-License",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $49 per year. Needs exact fee source verification.",
    requirementsSummary: "Needs official source verification before template use.",
    applicationFields: [],
    scraperNotes: "Broad official page found; exact fee/checklist links still need review.",
    confidence: 0.55
  },
  {
    city: "Santa Ana",
    county: "Orange",
    populationRank: 11,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.santa-ana.org/finance-department/business-license/",
    applicationUrl: "https://www.santa-ana.org/finance-department/business-license/",
    feeUrl: "https://www.santa-ana.org/finance-department/business-license/",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $95 per year. Needs exact fee source verification.",
    requirementsSummary: "Needs official source verification before template use.",
    applicationFields: [],
    scraperNotes: "Broad official page found; exact fee/checklist links still need review.",
    confidence: 0.55
  },
  {
    city: "Riverside",
    county: "Riverside",
    populationRank: 12,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://riversideca.gov/finance/business-tax",
    applicationUrl: "https://riversideca.gov/finance/business-tax",
    feeUrl: "https://riversideca.gov/finance/business-tax",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $80-$200 per year. Needs exact fee source verification.",
    requirementsSummary: "Needs official source verification before template use.",
    applicationFields: [],
    scraperNotes: "Broad official page found; exact fee/checklist links still need review.",
    confidence: 0.55
  },
  {
    city: "Stockton",
    county: "San Joaquin",
    populationRank: 13,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html",
    applicationUrl: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html",
    feeUrl: "https://www.stocktonca.gov/government/departments/administrativeServices/businessLicense.html",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $50-$200 per year. Needs exact fee source verification.",
    requirementsSummary: "Needs official source verification before template use.",
    applicationFields: [],
    scraperNotes: "Broad official page found; exact fee/checklist links still need review.",
    confidence: 0.55
  },
  {
    city: "Irvine",
    county: "Orange",
    populationRank: 14,
    sourceKind: "js",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://secure.cityofirvine.org/businesslicenseapplication/",
    applicationUrl: "https://secure.cityofirvine.org/businesslicenseapplication/",
    feeUrl: "https://secure.cityofirvine.org/businesslicenseapplication/",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing data: $76-$152 new, with renewal fees by employee count. Needs current source review.",
    requirementsSummary: "Apply within 60 days of start date. City portal collects business and owner details.",
    applicationFields: ["business address", "start date", "activity description", "business category", "owner information"],
    scraperNotes: "Existing static data is detailed, but the portal should be reviewed before approval.",
    confidence: 0.62
  },
  {
    city: "Chula Vista",
    county: "San Diego",
    populationRank: 15,
    sourceKind: "cms",
    retrievalStatus: "partial",
    businessLicenseUrl: "https://www.chulavistaca.gov/departments/finance/business-license",
    applicationUrl: "https://www.chulavistaca.gov/departments/finance/business-license",
    feeUrl: "https://www.chulavistaca.gov/departments/finance/business-license",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Existing estimate: about $45-$200 per year. Needs exact fee source verification.",
    requirementsSummary: "Needs official source verification before template use.",
    applicationFields: [],
    scraperNotes: "Broad official page found; exact fee/checklist links still need review.",
    confidence: 0.55
  },
  ...[
    ["Fremont", "Alameda", 16],
    ["Santa Clarita", "Los Angeles", 17],
    ["San Bernardino", "San Bernardino", 18],
    ["Modesto", "Stanislaus", 19],
    ["Fontana", "San Bernardino", 20],
    ["Moreno Valley", "Riverside", 21],
    ["Oxnard", "Ventura", 22],
    ["Huntington Beach", "Orange", 23],
    ["Glendale", "Los Angeles", 24],
    ["Santa Rosa", "Sonoma", 25]
  ].map(([city, county, populationRank]) => ({
    city: city as string,
    county: county as string,
    populationRank: populationRank as number,
    sourceKind: "unknown" as const,
    retrievalStatus: "not_run" as const,
    businessLicenseUrl: "",
    applicationUrl: "",
    feeUrl: "",
    checklistUrl: "",
    downloadUrl: "",
    feeSummary: "Not scraped yet.",
    requirementsSummary: "Needs SerpApi discovery and official source verification.",
    applicationFields: [],
    scraperNotes: "Top-25 placeholder row. The scraper/cron should populate this record before approval.",
    confidence: 0
  }))
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
    const limit = Math.min(args.limit ?? 25, 100);

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

export const seedTopCityReviews = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAdmin(ctx);
    const now = Date.now();
    let inserted = 0;

    for (const seed of TOP_CITY_SEEDS) {
      const existing = await ctx.db
        .query("cityLicenseSourceReviews")
        .withIndex("by_city", (q: any) => q.eq("city", seed.city))
        .unique();

      if (existing) continue;

      await ctx.db.insert("cityLicenseSourceReviews", {
        ...seed,
        status: seed.retrievalStatus === "retrieved" ? "pending" : "needs_review",
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
    feeUrl: v.string(),
    checklistUrl: v.string(),
    downloadUrl: v.string(),
    feeSummary: v.string(),
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

  return { businessLicenseUrl, applicationUrl, feeUrl, checklistUrl, downloadUrl, sourceKind };
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

    const { businessLicenseUrl, applicationUrl, feeUrl, checklistUrl, downloadUrl, sourceKind } =
      classifyUrls([...licenseResults, ...feeResults]);

    const finalBusinessUrl = businessLicenseUrl || licenseResults[0]?.link || "";

    let feeSummary = review.feeSummary && review.feeSummary !== "Not scraped yet." ? review.feeSummary : "";
    if (!feeSummary) {
      for (const r of feeResults) {
        const snip = r.snippet ?? "";
        if (snip.includes("$") || snip.toLowerCase().includes("fee") || snip.toLowerCase().includes("tax")) {
          feeSummary = snip.length > 400 ? snip.slice(0, 397) + "..." : snip;
          break;
        }
      }
    }

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
      `${totalResults} results across 2 queries. ` +
      `Found: license=${!!finalBusinessUrl}, app=${!!applicationUrl}, fee=${!!feeUrl}, checklist=${!!checklistUrl}.`;

    await ctx.runMutation(internal.cityLicenseSources.applyScrapedData, {
      reviewId: args.reviewId,
      sourceKind,
      retrievalStatus,
      businessLicenseUrl: finalBusinessUrl,
      applicationUrl,
      feeUrl,
      checklistUrl,
      downloadUrl,
      feeSummary: feeSummary || "Fee details require manual review.",
      scraperNotes,
      confidence
    });

    return { retrievalStatus, applicationUrl, feeUrl, businessLicenseUrl: finalBusinessUrl };
  }
});
