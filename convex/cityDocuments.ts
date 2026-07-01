import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Convex provides process.env at runtime for environment variables
declare const process: {
  env: Record<string, string | undefined>;
};

const query = queryGeneric;
const mutation = mutationGeneric;

const ADMIN_EMAILS = new Set(["ehleedev@gmail.com"]);
function isAdminUser(user: { role?: string; email?: string } | null) {
  return (
    user?.role === "admin" ||
    user?.role === "owner" ||
    ADMIN_EMAILS.has(String(user?.email ?? "").trim().toLowerCase())
  );
}

const docTypeValidator = v.union(
  v.literal("license_application"),
  v.literal("fee_schedule"),
  v.literal("requirements_checklist"),
  v.literal("tax_application"),
  v.literal("renewal_form"),
  v.literal("home_occupation_permit"),
  v.literal("zoning_info"),
  v.literal("general_info"),
  v.literal("other")
);

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!isAdminUser(user as any)) throw new Error("Admin only");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    cityReviewId: v.id("cityLicenseSourceReviews"),
    city: v.string(),
    documentType: docTypeValidator,
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!isAdminUser(user as any)) throw new Error("Admin only");
    const now = Date.now();
    return await ctx.db.insert("cityDocuments", { ...args, uploadedAt: now, createdAt: now });
  },
});

export const listDocuments = query({
  args: { cityReviewId: v.id("cityLicenseSourceReviews") },
  handler: async (ctx, { cityReviewId }) => {
    const docs = await ctx.db
      .query("cityDocuments")
      .withIndex("by_city_review", (q: any) => q.eq("cityReviewId", cityReviewId))
      .collect();
    return Promise.all(
      (docs as any[]).map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );
  },
});

export const listDocumentCounts = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("cityDocuments").collect();
    const counts: Record<string, number> = {};
    for (const doc of docs as any[]) {
      const id = String(doc.cityReviewId);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  },
});

export const updateDocumentType = mutation({
  args: { documentId: v.id("cityDocuments"), documentType: docTypeValidator },
  handler: async (ctx, { documentId, documentType }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!isAdminUser(user as any)) throw new Error("Admin only");
    await ctx.db.patch(documentId, { documentType });
    return true;
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("cityDocuments") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!isAdminUser(user as any)) throw new Error("Admin only");
    const doc = await ctx.db.get(documentId);
    if (!doc) return false;
    await ctx.storage.delete((doc as any).storageId);
    await ctx.db.delete(documentId);
    return true;
  },
});

// Internal helpers used by analyzeDocuments action
export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => ctx.db.get(userId),
});

export const getDocsForCity = internalQuery({
  args: { cityReviewId: v.id("cityLicenseSourceReviews") },
  handler: async (ctx, { cityReviewId }) => {
    const docs = await ctx.db
      .query("cityDocuments")
      .withIndex("by_city_review", (q: any) => q.eq("cityReviewId", cityReviewId))
      .collect();
    return Promise.all(
      (docs as any[]).map(async (doc) => ({
        _id: String(doc._id),
        fileName: String(doc.fileName),
        mimeType: String(doc.mimeType),
        documentType: String(doc.documentType),
        url: (await ctx.storage.getUrl(doc.storageId)) as string | null,
      }))
    );
  },
});

// Returns which cities have an uploaded license_application file
export const listCityApplicationSources = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("cityDocuments").collect();
    const result: Record<string, boolean> = {};
    for (const doc of docs as any[]) {
      if (doc.documentType === "license_application") {
        result[String(doc.cityReviewId)] = true;
      }
    }
    return result;
  },
});

export const storeFormTemplate = internalMutation({
  args: { cityReviewId: v.id("cityLicenseSourceReviews"), formTemplate: v.any() },
  handler: async (ctx, { cityReviewId, formTemplate }) => {
    await ctx.db.patch(cityReviewId, { formTemplate, updatedAt: Date.now() });
  },
});

export const updateCityData = internalMutation({
  args: {
    cityReviewId: v.id("cityLicenseSourceReviews"),
    feeSummary: v.string(),
    requirementsSummary: v.string(),
  },
  handler: async (ctx, { cityReviewId, feeSummary, requirementsSummary }) => {
    await ctx.db.patch(cityReviewId, {
      feeSummary,
      requirementsSummary,
      updatedAt: Date.now(),
    });
  },
});

// ── AI analysis ────────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `You are analyzing city business license documents for a California city. Extract all form fields, fees, and requirements for the business license application.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "fields": [
    {
      "id": "snake_case_id",
      "label": "Human-readable label",
      "type": "text|number|date|select|checkbox|email|phone|address|textarea",
      "required": true,
      "options": ["option1"],
      "notes": "any notes"
    }
  ],
  "fees": [
    { "tier": "who/what this applies to", "fee": "$XX", "notes": "renewal date, etc" }
  ],
  "requirements": ["requirement 1"],
  "processingTime": "X business days",
  "renewalPeriod": "annual",
  "notes": "any other important info"
}

Be thorough. Include every field an applicant must fill out.`;

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 8192;
  let result = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    result += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(result);
}

async function callGemini(
  apiKey: string,
  docs: Array<{ fileName: string; url: string | null; mimeType: string }>
): Promise<object> {
  const parts: object[] = [{ text: `${ANALYSIS_PROMPT}\n\nDocuments to analyze:` }];
  for (const doc of docs) {
    if (!doc.url) continue;
    const res = await fetch(doc.url);
    if (!res.ok) continue;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 20_000_000) {
      parts.push({ text: `\n[File skipped — too large: ${doc.fileName}]` });
      continue;
    }
    parts.push({ text: `\n--- ${doc.fileName} ---` });
    parts.push({ inline_data: { mime_type: doc.mimeType || "application/octet-stream", data: toBase64(buf) } });
  }
  parts.push({ text: "\nReturn the JSON object." });

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    }
  );
  if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
  const json = await resp.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return JSON.parse(json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}");
}

async function mistralOcrExtract(url: string, mistralKey: string): Promise<string> {
  const resp = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mistralKey}` },
    body: JSON.stringify({ model: "mistral-ocr-latest", document: { type: "document_url", document_url: url } }),
  });
  if (!resp.ok) return `[OCR failed: ${resp.status}]`;
  const json = await resp.json() as { pages?: Array<{ markdown?: string }> };
  return (json.pages ?? []).map(p => p.markdown ?? "").join("\n\n").slice(0, 60_000);
}

async function callOpenAICompat(
  baseUrl: string,
  apiKey: string,
  model: string,
  docs: Array<{ fileName: string; url: string | null; mimeType: string }>,
  mistralKeyForOcr?: string
): Promise<object> {
  let content = "Analyze these business license documents:\n\n";
  for (const doc of docs) {
    if (!doc.url) continue;
    const isPdf = doc.mimeType.includes("pdf") || doc.fileName.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      if (mistralKeyForOcr) {
        const text = await mistralOcrExtract(doc.url, mistralKeyForOcr);
        content += `--- ${doc.fileName} (extracted from PDF) ---\n${text}\n\n`;
      } else {
        content += `[PDF: ${doc.fileName} — set MISTRAL_API_KEY to enable PDF extraction]\n`;
      }
    } else {
      const res = await fetch(doc.url);
      if (!res.ok) continue;
      const raw = await res.text();
      // strip HTML tags for .html files; markdown/txt pass through as-is
      const text = doc.mimeType.includes("html") || doc.fileName.match(/\.html?$/i)
        ? raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
        : raw.trim();
      content += `--- ${doc.fileName} ---\n${text.slice(0, 40_000)}\n\n`;
    }
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) throw new Error(`${model} ${resp.status}: ${await resp.text()}`);
  const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
  return JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
}

export const parseFeeText = action({
  args: { feeSummary: v.string() },
  handler: async (ctx, { feeSummary }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.cityDocuments.getUser, { userId });
    if (!isAdminUser(user as any)) throw new Error("Admin only");

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set. Run: npx convex env set GEMINI_API_KEY <key>");

    const prompt = `Extract all business license fee tiers from the text below. Return ONLY a valid JSON array, no markdown:
[{"tier":"who/what it applies to","fee":"$XX or $XX/yr","detail":"renewal date or extra info"}]

Fee text:
${feeSummary}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );
    if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
    const json = await resp.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const result = JSON.parse(json.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]");
    return Array.isArray(result) ? result as Array<{ tier: string; fee: string; detail: string }> : [];
  },
});

export const analyzeDocumentsForCity = action({
  args: {
    cityReviewId: v.id("cityLicenseSourceReviews"),
    feeUrl: v.optional(v.string()),
    customLinks: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
  },
  handler: async (ctx, { cityReviewId, feeUrl, customLinks }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.cityDocuments.getUser, { userId });
    if (!isAdminUser(user as any)) throw new Error("Admin only");

    // Get uploaded documents for this city
    const uploadedDocs = await ctx.runQuery(internal.cityDocuments.getDocsForCity, { cityReviewId });
    const otherFiles = uploadedDocs.filter(d => d.documentType !== "license_application");

    // Build document list: fee URL + custom links + uploaded files
    const docs: Array<{ fileName: string; url: string | null; mimeType: string }> = [];
    if (feeUrl) docs.push({ fileName: "Fees URL", url: feeUrl, mimeType: "text/html" });
    if (customLinks) {
      for (const link of customLinks) {
        docs.push({ fileName: link.label, url: link.url, mimeType: "text/html" });
      }
    }
    for (const doc of otherFiles) {
      if (doc.url) docs.push({ fileName: doc.fileName, url: doc.url, mimeType: doc.mimeType });
    }

    if (docs.length === 0) throw new Error("No documents or links to analyze.");

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set");

    const prompt = `You are analyzing city business license documents. Extract and return ONLY a valid JSON object (no markdown):
{
  "feeSummary": "Complete fee information extracted from documents",
  "requirementsSummary": "All requirements for business license",
  "notes": "Any other important information"
}

Extract ALL fee tiers, requirements, and important details. Be comprehensive.`;

    const parts: object[] = [{ text: prompt + "\n\nDocuments:" }];
    for (const doc of docs) {
      if (!doc.url) continue;
      const res = await fetch(doc.url);
      if (!res.ok) continue;
      const raw = await res.text();
      const text = doc.mimeType.includes("html")
        ? raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
        : raw.trim();
      parts.push({ text: `\n--- ${doc.fileName} ---\n${text.slice(0, 30000)}` });
    }
    parts.push({ text: "\nReturn the JSON object." });

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );
    if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
    const json = await resp.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const result = JSON.parse(json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}");

    // Update the city review with extracted data
    await ctx.runMutation(internal.cityDocuments.updateCityData, {
      cityReviewId,
      feeSummary: result.feeSummary || "",
      requirementsSummary: result.requirementsSummary || "",
    });

    return result;
  },
});

export const analyzeDocuments = action({
  args: {
    cityReviewId: v.id("cityLicenseSourceReviews"),
    modelProvider: v.optional(v.string()),
    applicationSource: v.optional(v.union(v.literal("url"), v.literal("file"))),
    applicationUrl: v.optional(v.string()),
  },
  handler: async (ctx, { cityReviewId, modelProvider = "gemini", applicationSource, applicationUrl }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.cityDocuments.getUser, { userId });
    if (!isAdminUser(user as any)) throw new Error("Admin only");

    const allDocs = await ctx.runQuery(internal.cityDocuments.getDocsForCity, { cityReviewId });
    const appFileDocs = allDocs.filter(d => d.documentType === "license_application");
    const otherDocs = allDocs.filter(d => d.documentType !== "license_application");

    // Determine which application source to use
    let chosenAppDocs: typeof allDocs = [];
    if (applicationSource === "url" && applicationUrl) {
      chosenAppDocs = [{ _id: "app-url", fileName: "application.pdf", mimeType: "application/pdf", documentType: "license_application", url: applicationUrl }];
    } else if (applicationSource === "file") {
      chosenAppDocs = appFileDocs;
    } else {
      // Auto: prefer uploaded file, fall back to URL
      chosenAppDocs = appFileDocs.length > 0
        ? appFileDocs
        : applicationUrl
          ? [{ _id: "app-url", fileName: "application.pdf", mimeType: "application/pdf", documentType: "license_application", url: applicationUrl }]
          : [];
    }

    const docs = [...chosenAppDocs, ...otherDocs];
    if (docs.length === 0) throw new Error("No documents or application URL available. Upload a file or add an application URL on the City Scrapes page.");

    let result: object;
    if (modelProvider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error("GEMINI_API_KEY not set. Run: npx convex env set GEMINI_API_KEY <key>");
      result = await callGemini(key, docs);
    } else if (modelProvider === "mistral") {
      const key = process.env.MISTRAL_API_KEY;
      if (!key) throw new Error("MISTRAL_API_KEY not set. Run: npx convex env set MISTRAL_API_KEY <key>");
      result = await callOpenAICompat("https://api.mistral.ai/v1", key, "mistral-small-latest", docs, key);
    } else if (modelProvider === "groq") {
      const key = process.env.GROQ_API_KEY;
      if (!key) throw new Error("GROQ_API_KEY not set. Run: npx convex env set GROQ_API_KEY <key>");
      const mistralKey = process.env.MISTRAL_API_KEY;
      result = await callOpenAICompat("https://api.groq.com/openai/v1", key, "llama-3.3-70b-versatile", docs, mistralKey);
    } else {
      throw new Error(`Unknown model provider: ${modelProvider}`);
    }

    const formTemplate = { ...(result as object), analyzedAt: Date.now(), model: modelProvider };
    await ctx.runMutation(internal.cityDocuments.storeFormTemplate, { cityReviewId, formTemplate });
    return formTemplate;
  },
});
