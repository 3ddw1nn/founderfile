import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin")),
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
    isCompleted: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_workspace_and_type", ["workspaceId", "businessType"])
    .index("by_workspace", ["workspaceId"]),
  auditEvents: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number()
  }).index("by_workspace", ["workspaceId"])
});
