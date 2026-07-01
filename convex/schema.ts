import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_email", ["email"]),
  workspaces: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    activeBusinessProfileId: v.optional(v.id("businessProfiles")),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_owner", ["ownerUserId"]),
  founderProfiles: defineTable({
    workspaceId: v.id("workspaces"),
    legalName: v.string(),
    state: v.string(),
    city: v.string(),
    county: v.string(),
    operatesFromHome: v.boolean(),
    acceptsPayments: v.boolean(),
    usesSeparateBusinessName: v.boolean(),
    separateBusinessName: v.string(),
    hasContractors: v.boolean(),
    hasCustomerContracts: v.boolean(),
    collectsUserData: v.boolean(),
    sellsTangibleGoods: v.boolean(),
    plansHardwareOrPreorders: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_workspace", ["workspaceId"]),
  businessProfiles: defineTable({
    workspaceId: v.id("workspaces"),
    currentPhase: v.union(
      v.literal("sole_proprietor"),
      v.literal("llc_ready"),
      v.literal("llc_formed")
    ),
    legalOperatorName: v.string(),
    plannedLlcName: v.string(),
    cityBusinessLicenseCity: v.string(),
    cityBusinessLicenseStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("complete")
    ),
    dbaStatus: v.union(
      v.literal("not_needed"),
      v.literal("considering"),
      v.literal("ready"),
      v.literal("complete")
    ),
    stripeSetupStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("complete")
    ),
    sellerPermitStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("complete")
    ),
    domainName: v.string(),
    domainOwnershipStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("complete")
    ),
    onboardingCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_workspace", ["workspaceId"]),
  productLines: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("software"),
      v.literal("browser_extension"),
      v.literal("hardware"),
      v.literal("services"),
      v.literal("digital_product"),
      v.literal("other")
    ),
    acceptsPayments: v.boolean(),
    collectsUserData: v.boolean(),
    hasAdvertiserMoney: v.boolean(),
    hasRewardsOrPayouts: v.boolean(),
    hasHardwareRisk: v.boolean(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("complete")
    ),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_workspace", ["workspaceId"]),
  roadmapTasks: defineTable({
    workspaceId: v.id("workspaces"),
    phaseKey: v.union(v.literal("phase_0"), v.literal("phase_1")),
    taskKey: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("ready"),
      v.literal("complete"),
      v.literal("not_needed")
    ),
    priority: v.number(),
    dueLabel: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_task", ["workspaceId", "taskKey"]),
  setupSessions: defineTable({
    workspaceId: v.id("workspaces"),
    businessType: v.string(),
    currentStep: v.number(),
    stepStatuses: v.array(v.string()),
    isEntityApplication: v.optional(v.boolean()),
    legalFirstName: v.optional(v.string()),
    legalMiddleName: v.optional(v.string()),
    legalLastName: v.optional(v.string()),
    legalSuffix: v.optional(v.string()),
    needsDba: v.optional(v.boolean()),
    dbaName: v.optional(v.string()),
    dbaCounty: v.optional(v.string()),
    dbaNewspaperName: v.optional(v.string()),
    dbaPublicationFiled: v.optional(v.boolean()),
    cityLicenseCity: v.optional(v.string()),
    cityLicenseCounty: v.optional(v.string()),
    cityLicenseBusinessAddress: v.optional(v.string()),
    cityLicenseBusinessCity: v.optional(v.string()),
    cityLicenseBusinessZip: v.optional(v.string()),
    cityLicensePhone: v.optional(v.string()),
    cityLicenseEmail: v.optional(v.string()),
    cityLicenseStartDate: v.optional(v.string()),
    cityLicenseActivity: v.optional(v.string()),
    cityLicenseIsHomeBased: v.optional(v.boolean()),
    cityLicenseEmployeeCount: v.optional(v.string()),
    cityLicenseGrossReceipts: v.optional(v.string()),
    cityLicenseBusinessCategory: v.optional(v.string()),
    cityLicenseWebsite: v.optional(v.string()),
    currentSubstep: v.optional(v.number()),
    completedSubsteps: v.optional(v.number()),
    totalSubsteps: v.optional(v.number()),
    isCompleted: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_workspace_and_type", ["workspaceId", "businessType"])
    .index("by_workspace", ["workspaceId"]),
  setupDocuments: defineTable({
    workspaceId: v.id("workspaces"),
    businessType: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    createdAt: v.number()
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_type_category", ["workspaceId", "businessType", "category"]),
  notifications: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    isRead: v.boolean(),
    href: v.optional(v.string()),
    createdAt: v.number()
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_created", ["workspaceId", "createdAt"]),
  auditEvents: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number()
  }).index("by_workspace", ["workspaceId"]),
  cityLicenseSourceReviews: defineTable({
    city: v.string(),
    county: v.string(),
    populationRank: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("needs_review")
    ),
    sourceKind: v.union(
      v.literal("html"),
      v.literal("pdf"),
      v.literal("js"),
      v.literal("cms"),
      v.literal("unknown")
    ),
    retrievalStatus: v.union(
      v.literal("not_run"),
      v.literal("retrieved"),
      v.literal("partial"),
      v.literal("cant_retrieve"),
      v.literal("error")
    ),
    businessLicenseUrl: v.string(),
    applicationUrl: v.string(),
    applicationPdfUrl: v.optional(v.string()),
    feeUrl: v.string(),
    checklistUrl: v.string(),
    downloadUrl: v.string(),
    feeSummary: v.string(),
    feeTable: v.optional(v.array(v.object({
      tier: v.string(),
      fee: v.string(),
      detail: v.string()
    }))),
    documentLinks: v.optional(v.array(v.object({
      label: v.string(),
      url: v.string(),
    }))),
    requirementsSummary: v.string(),
    applicationFields: v.array(v.string()),
    scraperNotes: v.string(),
    reviewerNotes: v.string(),
    confidence: v.number(),
    lastScrapedAt: v.optional(v.number()),
    formTemplate: v.optional(v.any()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_city", ["city"])
    .index("by_status", ["status"])
    .index("by_population_rank", ["populationRank"]),
  cityDocuments: defineTable({
    cityReviewId: v.id("cityLicenseSourceReviews"),
    city: v.string(),
    documentType: v.union(
      v.literal("license_application"),
      v.literal("fee_schedule"),
      v.literal("requirements_checklist"),
      v.literal("tax_application"),
      v.literal("renewal_form"),
      v.literal("home_occupation_permit"),
      v.literal("zoning_info"),
      v.literal("general_info"),
      v.literal("other")
    ),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
    createdAt: v.number()
  }).index("by_city_review", ["cityReviewId"])
});
