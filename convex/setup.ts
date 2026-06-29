import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericId } from "convex/values";

type SetupStep = {
  stepNumber: number;
  title: string;
  description: string;
};

type SetupConfig = {
  businessType: string;
  totalSteps: number;
  steps: SetupStep[];
};

const soleProprietorSetup: SetupConfig = {
  businessType: "sole-proprietor",
  totalSteps: 7,
  steps: [
    { stepNumber: 1, title: "Entity application", description: "Decide whether you are applying as yourself or as a business entity, and provide your legal name." },
    { stepNumber: 2, title: "DBA / FBN filing", description: "If you are using a separate business name, file the DBA or Fictitious Business Name with your county." },
    { stepNumber: 3, title: "City business license", description: "Register for a business license with your local city before accepting payments." },
    { stepNumber: 4, title: "Tax registration", description: "Obtain an EIN, register for state taxes, and apply for a seller's permit if needed." },
    { stepNumber: 5, title: "Banking & payments", description: "Set up a separate bank account, payment processing, and bookkeeping." },
    { stepNumber: 6, title: "Legal pages & launch", description: "Prepare terms of service, privacy policy, and finalize your domain and website." },
    { stepNumber: 7, title: "Review & submit", description: "Review all your answers and confirm everything is ready." }
  ]
};

const llcSetup: SetupConfig = {
  businessType: "llc",
  totalSteps: 9,
  steps: [
    { stepNumber: 1, title: "Entity application", description: "Decide whether you are applying as a business entity and provide your legal name." },
    { stepNumber: 2, title: "DBA / FBN filing", description: "If the LLC operates under a brand name different from its legal name, file the DBA." },
    { stepNumber: 3, title: "LLC name & formation", description: "Check name availability and file Articles of Organization with the state." },
    { stepNumber: 4, title: "Registered agent & operating agreement", description: "Designate a registered agent and draft an operating agreement." },
    { stepNumber: 5, title: "EIN & tax setup", description: "Obtain an EIN from the IRS and handle state tax registration." },
    { stepNumber: 6, title: "City business license", description: "Register for a business license with your local city." },
    { stepNumber: 7, title: "Banking, payments & bookkeeping", description: "Set up a business bank account, Stripe, and accounting." },
    { stepNumber: 8, title: "Legal pages & launch", description: "Prepare terms of service, privacy policy, and finalize your online presence." },
    { stepNumber: 9, title: "Review & submit", description: "Review all your answers and confirm everything is ready." }
  ]
};

function getSetupConfig(businessType: string): SetupConfig | null {
  if (businessType === "sole-proprietor") return soleProprietorSetup;
  if (businessType === "llc") return llcSetup;
  return null;
}

const query = queryGeneric;
const mutation = mutationGeneric;

const stepStatusValidator = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("complete"),
  v.literal("not_needed")
);

type SetupSessionDoc = {
  _id: GenericId<"setupSessions">;
  workspaceId: GenericId<"workspaces">;
  businessType: string;
  currentStep: number;
  stepStatuses: string[];
  isEntityApplication?: boolean;
  legalFirstName?: string;
  legalMiddleName?: string;
  legalLastName?: string;
  legalSuffix?: string;
  isCompleted: boolean;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export const getSetupSession = query({
  args: {
    businessType: v.string()
  },
  handler: async (ctx, args): Promise<SetupSessionDoc | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) return null;

    const session = await ctx.db
      .query("setupSessions")
      .withIndex("by_workspace_and_type", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("businessType", args.businessType)
      )
      .unique();

    return (session as SetupSessionDoc) ?? null;
  }
});

export const startSetup = mutation({
  args: {
    businessType: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) throw new Error("Workspace not found.");

    const config = getSetupConfig(args.businessType);
    if (!config) throw new Error(`Unknown business type: ${args.businessType}`);

    const existing = await ctx.db
      .query("setupSessions")
      .withIndex("by_workspace_and_type", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("businessType", args.businessType)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    const stepStatuses = config.steps.map((_s: any, i: number) =>
      i === 0 ? "in_progress" : "not_started"
    );

    const id = await ctx.db.insert("setupSessions", {
      workspaceId: workspace._id,
      businessType: args.businessType,
      currentStep: 1,
      stepStatuses,
      isCompleted: false,
      startedAt: now,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }
});

export const saveSetupStep = mutation({
  args: {
    businessType: v.string(),
    currentStep: v.number(),
    stepStatuses: v.array(stepStatusValidator),
    isEntityApplication: v.optional(v.boolean()),
    legalFirstName: v.optional(v.string()),
    legalMiddleName: v.optional(v.string()),
    legalLastName: v.optional(v.string()),
    legalSuffix: v.optional(v.string()),
    isCompleted: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) throw new Error("Workspace not found.");

    const session = await ctx.db
      .query("setupSessions")
      .withIndex("by_workspace_and_type", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("businessType", args.businessType)
      )
      .unique();

    if (!session) throw new Error("Setup session not found. Start the setup first.");

    const now = Date.now();
    const patch: Record<string, any> = {
      currentStep: args.currentStep,
      stepStatuses: args.stepStatuses,
      updatedAt: now
    };

    if (args.isEntityApplication !== undefined) {
      patch.isEntityApplication = args.isEntityApplication;
    }
    if (args.legalFirstName !== undefined) {
      patch.legalFirstName = args.legalFirstName;
    }
    if (args.legalMiddleName !== undefined) {
      patch.legalMiddleName = args.legalMiddleName;
    }
    if (args.legalLastName !== undefined) {
      patch.legalLastName = args.legalLastName;
    }
    if (args.legalSuffix !== undefined) {
      patch.legalSuffix = args.legalSuffix;
    }
    if (args.isCompleted) {
      patch.isCompleted = true;
      patch.completedAt = now;
    }

    await ctx.db.patch(session._id, patch);
    return true;
  }
});