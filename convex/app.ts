import { getAuthUserId } from "@convex-dev/auth/server";
import type {
  BusinessPhase,
  CurrentUser,
  DashboardData,
  OnboardingInput,
  RoadmapTaskView,
  TaskStatus
} from "@startupfiles/shared/domain";
import { mutationGeneric, queryGeneric } from "convex/server";
import type { GenericId } from "convex/values";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

const onboardingArgs = {
  founderProfile: v.object({
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
    plansHardwareOrPreorders: v.boolean()
  }),
  businessProfile: v.object({
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
    )
  }),
  productLines: v.array(
    v.object({
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
      )
    })
  )
};

const taskStatusValidator = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("blocked"),
  v.literal("ready"),
  v.literal("complete"),
  v.literal("not_needed")
);

type WorkspaceBundle = {
  workspace: any;
  founderProfile: any;
  businessProfile: any;
  productLines: any[];
  tasks: any[];
};

type TaskSeed = Omit<RoadmapTaskView, "id">;

const DEFAULT_WARNING =
  "StartupFiles provides structured guidance and document prep support. Verify filings and get professional review when needed.";

const ADMIN_EMAILS = new Set(["ehleedev@gmail.com"]);

function roleForEmail(email: string) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase()) ? "admin" : "user";
}

function normalizeRole(user: any): "user" | "admin" {
  if (!user) return "user";
  if (user.role === "admin" || user.role === "owner") return "admin";
  return roleForEmail(user.email ?? "");
}

export const currentUser = query({
  args: {},
  handler: async (ctx): Promise<CurrentUser | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      id: userId,
      email: user.email,
      name: user.name,
      role: normalizeRole(user)
    };
  }
});

export const viewer = query({
  args: {},
  handler: async (ctx): Promise<DashboardData | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const data = await getWorkspaceBundle(ctx, userId);
    if (!data) {
      return null;
    }

    return buildDashboardPayload(userId, await ctx.db.get(userId), data);
  }
});

export const saveOnboarding = mutation({
  args: onboardingArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in.");
    }

    const data = await getWorkspaceBundle(ctx, userId);
    if (!data) {
      throw new Error("Workspace not found.");
    }

    const now = Date.now();
    const nextPhase = derivePhase(args);

    await ctx.db.patch(data.founderProfile._id, {
      ...args.founderProfile,
      updatedAt: now
    });

    await ctx.db.patch(data.businessProfile._id, {
      ...args.businessProfile,
      currentPhase: nextPhase,
      onboardingCompletedAt: now,
      updatedAt: now
    });

    for (const product of data.productLines) {
      await ctx.db.delete(product._id);
    }

    for (const product of args.productLines) {
      await ctx.db.insert("productLines", {
        workspaceId: data.workspace._id,
        ...product,
        createdAt: now,
        updatedAt: now
      });
    }

    await rebuildRoadmap(ctx, data.workspace._id, args, data.tasks);

    await ctx.db.insert("auditEvents", {
      workspaceId: data.workspace._id,
      userId,
      action: "workspace.onboarding_saved",
      entityType: "workspace",
      entityId: data.workspace._id,
      metadata: {
        phase: nextPhase,
        productCount: args.productLines.length
      },
      createdAt: now
    });

    const refreshed = await getWorkspaceBundle(ctx, userId);
    const user = await ctx.db.get(userId);
    return buildDashboardPayload(userId, user, refreshed!);
  }
});

export const setTaskStatus = mutation({
  args: {
    taskId: v.id("roadmapTasks"),
    status: taskStatusValidator
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in.");
    }

    const data = await getWorkspaceBundle(ctx, userId);
    if (!data) {
      throw new Error("Workspace not found.");
    }

    const task = data.tasks.find((item) => item._id === args.taskId);
    if (!task) {
      throw new Error("Task not found.");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now()
    });

    return true;
  }
});

export const resetProgress = mutation({
  args: {
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const userId = args.userId ?? await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in.");
    }

    const data = await getWorkspaceBundle(ctx, userId);
    if (!data) {
      throw new Error("Workspace not found.");
    }

    const now = Date.now();
    for (const task of data.tasks) {
      const resetStatus: TaskStatus = task.status === "not_needed" ? "not_needed" : "not_started";
      await ctx.db.patch(task._id, {
        status: resetStatus,
        updatedAt: now
      });
    }

    const setupSessions = await ctx.db
      .query("setupSessions")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", data.workspace._id))
      .collect();

    for (const session of setupSessions) {
      await ctx.db.delete(session._id);
    }

    return true;
  }
});

export const resetDb = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const user = await ctx.db.get(userId);
    if (!user || normalizeRole(user) !== "admin") throw new Error("Only an admin can reset the database.");

    // Delete setup sessions
    const sessions = await ctx.db.query("setupSessions").collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    // Delete roadmap tasks
    const tasks = await ctx.db.query("roadmapTasks").collect();
    for (const t of tasks) {
      await ctx.db.delete(t._id);
    }

    // Delete product lines
    const products = await ctx.db.query("productLines").collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }

    // Delete founder profiles
    const fps = await ctx.db.query("founderProfiles").collect();
    for (const fp of fps) {
      await ctx.db.delete(fp._id);
    }

    // Delete business profiles
    const bps = await ctx.db.query("businessProfiles").collect();
    for (const bp of bps) {
      await ctx.db.delete(bp._id);
    }

    // Delete workspaces (but NOT users or auth tables)
    const workspaces = await ctx.db.query("workspaces").collect();
    for (const w of workspaces) {
      await ctx.db.delete(w._id);
    }

    // Delete audit events
    const events = await ctx.db.query("auditEvents").collect();
    for (const e of events) {
      await ctx.db.delete(e._id);
    }

    return true;
  }
});

export const normalizeUserRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const current = await ctx.db.get(userId);
    if (!current || normalizeRole(current) !== "admin") {
      throw new Error("Admin access required.");
    }

    const users = await ctx.db.query("users").take(100);
    const now = Date.now();
    let updated = 0;

    for (const user of users) {
      const nextRole = roleForEmail(user.email);
      if (user.role !== nextRole) {
        await ctx.db.patch(user._id, {
          role: nextRole,
          updatedAt: now
        });
        updated += 1;
      }
    }

    await ctx.db.insert("auditEvents", {
      userId,
      action: "users.roles_normalized",
      entityType: "users",
      metadata: { updated },
      createdAt: now
    });

    return { updated };
  }
});

async function getWorkspaceBundle(ctx: any, userId: GenericId<"users">): Promise<WorkspaceBundle | null> {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
    .unique();
  if (!workspace) {
    return null;
  }

  const founderProfile = await ctx.db
    .query("founderProfiles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .unique();
  const businessProfile = await ctx.db
    .query("businessProfiles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .unique();
  const productLines = await ctx.db
    .query("productLines")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .collect();
  const tasks = await ctx.db
    .query("roadmapTasks")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .collect();

  if (!founderProfile || !businessProfile) {
    return null;
  }

  return {
    workspace,
    founderProfile,
    businessProfile,
    productLines,
    tasks
  };
}

function derivePhase(input: OnboardingInput): BusinessPhase {
  const productSignals = input.productLines.some(
    (product: OnboardingInput["productLines"][number]) =>
      product.hasAdvertiserMoney ||
      product.hasRewardsOrPayouts ||
      product.hasHardwareRisk ||
      product.type === "hardware"
  );

  if (
    input.founderProfile.hasContractors ||
    input.founderProfile.hasCustomerContracts ||
    input.founderProfile.collectsUserData ||
    input.founderProfile.plansHardwareOrPreorders ||
    input.founderProfile.sellsTangibleGoods ||
    input.founderProfile.acceptsPayments ||
    productSignals
  ) {
    return "llc_ready";
  }

  return "sole_proprietor";
}

function buildWarnings(input: OnboardingInput, phase: BusinessPhase) {
  const warnings = [DEFAULT_WARNING];

  if (input.founderProfile.usesSeparateBusinessName) {
    warnings.push(
      "Do not use a separate business name publicly during Phase 0 unless the DBA/FBN rules are satisfied."
    );
  }

  if (phase !== "llc_formed") {
    warnings.push(
      "StartupFiles should stay publicly operated by Edward Lee until a DBA/FBN is filed or Whale Tales Labs LLC exists."
    );
  }

  if (input.founderProfile.plansHardwareOrPreorders) {
    warnings.push(
      "Hardware or preorder plans push the business toward LLC formation and a higher-risk review path."
    );
  }

  return warnings;
}

function buildTaskSeeds(input: OnboardingInput, phase: BusinessPhase): TaskSeed[] {
  const llcNeeded = phase !== "sole_proprietor";

  return [
    {
      taskKey: "founder-intake",
      title: "Complete founder and business intake",
      description: "Capture the details that personalize your roadmap, documents, and warnings.",
      phaseKey: "phase_0",
      status: "complete",
      priority: 100,
      dueLabel: null
    },
    {
      taskKey: "irvine-business-license",
      title: "Prepare and file the Irvine business license path",
      description: "Use your legal name, gather the local filing details, and save the confirmation once submitted.",
      phaseKey: "phase_0",
      status:
        input.businessProfile.cityBusinessLicenseStatus === "complete"
          ? "complete"
          : input.businessProfile.cityBusinessLicenseStatus === "in_progress"
            ? "in_progress"
            : "ready",
      priority: 95,
      dueLabel: null
    },
    {
      taskKey: "dba-fbn-decision",
      title: "Resolve the DBA/FBN decision",
      description: "Only use a separate public business name after the naming requirements are satisfied.",
      phaseKey: "phase_0",
      status: input.founderProfile.usesSeparateBusinessName
        ? input.businessProfile.dbaStatus === "complete"
          ? "complete"
          : input.businessProfile.dbaStatus === "ready"
            ? "ready"
            : "in_progress"
        : "not_needed",
      priority: 88,
      dueLabel: null
    },
    {
      taskKey: "stripe-setup",
      title: "Set up Stripe as a sole proprietor if you are accepting payments",
      description: "Prepare the operational setup without storing SSNs or onboarding secrets in StartupFiles.",
      phaseKey: "phase_0",
      status: input.founderProfile.acceptsPayments
        ? input.businessProfile.stripeSetupStatus === "complete"
          ? "complete"
          : input.businessProfile.stripeSetupStatus === "in_progress"
            ? "in_progress"
            : "ready"
        : "not_needed",
      priority: 82,
      dueLabel: null
    },
    {
      taskKey: "seller-permit-decision",
      title: "Evaluate the seller's permit requirement",
      description: "Bring this forward only if the business is selling tangible goods or hardware.",
      phaseKey: "phase_0",
      status: input.founderProfile.sellsTangibleGoods
        ? input.businessProfile.sellerPermitStatus === "complete"
          ? "complete"
          : input.businessProfile.sellerPermitStatus === "in_progress"
            ? "in_progress"
            : "ready"
        : "not_needed",
      priority: 72,
      dueLabel: null
    },
    {
      taskKey: "terms-privacy-readiness",
      title: "Review terms and privacy readiness",
      description: "Make sure policy pages are ready before collecting meaningful user data or accepting payments.",
      phaseKey: "phase_0",
      status:
        input.founderProfile.acceptsPayments || input.founderProfile.collectsUserData
          ? "ready"
          : "not_started",
      priority: 68,
      dueLabel: null
    },
    {
      taskKey: "bookkeeping-setup",
      title: "Track bookkeeping by product line",
      description: "Separate revenue and expenses by product so the sole proprietor phase stays organized.",
      phaseKey: "phase_0",
      status: "ready",
      priority: 65,
      dueLabel: null
    },
    {
      taskKey: "llc-readiness",
      title: "Review whether Whale Tales Labs LLC should be formed",
      description: "Use revenue, contracts, contractors, data risk, payouts, or hardware pressure as the trigger instead of forming too early.",
      phaseKey: "phase_1",
      status: llcNeeded ? "ready" : "not_started",
      priority: 60,
      dueLabel: null
    },
    {
      taskKey: "llc-formation-packet",
      title: "Prepare the Whale Tales Labs LLC formation packet",
      description: "Articles prep, Statement of Information prep, EIN prep, and migration planning.",
      phaseKey: "phase_1",
      status: llcNeeded ? "not_started" : "not_needed",
      priority: 55,
      dueLabel: null
    },
    {
      taskKey: "operator-language-update",
      title: "Update the public operator language once the entity exists",
      description: "Do not switch the public footer and operator identity to Whale Tales Labs until the legal structure is actually in place.",
      phaseKey: "phase_1",
      status: llcNeeded ? "not_started" : "not_needed",
      priority: 40,
      dueLabel: null
    }
  ];
}

async function rebuildRoadmap(
  ctx: any,
  workspaceId: GenericId<"workspaces">,
  input: OnboardingInput,
  existingTasks: any[]
) {
  const now = Date.now();
  const phase = derivePhase(input);
  const existingByKey = new Map(existingTasks.map((task) => [task.taskKey, task]));
  const nextTasks = buildTaskSeeds(input, phase);

  for (const task of existingTasks) {
    await ctx.db.delete(task._id);
  }

  for (const task of nextTasks) {
    const existing = existingByKey.get(task.taskKey);
    const status =
      existing?.status === "complete" && task.status !== "not_needed"
        ? "complete"
        : task.status;
    await ctx.db.insert("roadmapTasks", {
      workspaceId,
      taskKey: task.taskKey,
      title: task.title,
      description: task.description,
      phaseKey: task.phaseKey,
      status,
      priority: task.priority,
      dueLabel: task.dueLabel ?? undefined,
      createdAt: now,
      updatedAt: now
    });
  }
}

function buildDashboardPayload(userId: GenericId<"users">, user: any, data: WorkspaceBundle): DashboardData {
  const founderProfile = {
    legalName: data.founderProfile.legalName,
    state: data.founderProfile.state,
    city: data.founderProfile.city,
    county: data.founderProfile.county,
    operatesFromHome: data.founderProfile.operatesFromHome,
    acceptsPayments: data.founderProfile.acceptsPayments,
    usesSeparateBusinessName: data.founderProfile.usesSeparateBusinessName,
    separateBusinessName: data.founderProfile.separateBusinessName,
    hasContractors: data.founderProfile.hasContractors,
    hasCustomerContracts: data.founderProfile.hasCustomerContracts,
    collectsUserData: data.founderProfile.collectsUserData,
    sellsTangibleGoods: data.founderProfile.sellsTangibleGoods,
    plansHardwareOrPreorders: data.founderProfile.plansHardwareOrPreorders
  };

  const businessProfile = {
    legalOperatorName: data.businessProfile.legalOperatorName,
    plannedLlcName: data.businessProfile.plannedLlcName,
    cityBusinessLicenseCity: data.businessProfile.cityBusinessLicenseCity,
    cityBusinessLicenseStatus: data.businessProfile.cityBusinessLicenseStatus,
    dbaStatus: data.businessProfile.dbaStatus,
    stripeSetupStatus: data.businessProfile.stripeSetupStatus,
    sellerPermitStatus: data.businessProfile.sellerPermitStatus,
    domainName: data.businessProfile.domainName,
    domainOwnershipStatus: data.businessProfile.domainOwnershipStatus
  };

  const productLines = data.productLines.map((product) => ({
    name: product.name,
    description: product.description,
    type: product.type,
    acceptsPayments: product.acceptsPayments,
    collectsUserData: product.collectsUserData,
    hasAdvertiserMoney: product.hasAdvertiserMoney,
    hasRewardsOrPayouts: product.hasRewardsOrPayouts,
    hasHardwareRisk: product.hasHardwareRisk,
    status: product.status
  }));

  const tasks = [...data.tasks]
    .sort((a, b) => b.priority - a.priority)
    .map(
      (task): RoadmapTaskView => ({
        id: task._id,
        taskKey: task.taskKey,
        title: task.title,
        description: task.description,
        phaseKey: task.phaseKey,
        status: task.status,
        priority: task.priority,
        dueLabel: task.dueLabel ?? null
      })
    );

  const completableTasks = tasks.filter(
    (task) => task.status !== "not_needed" && task.status !== "complete"
  );
  const completedTasks = tasks.filter((task) => task.status === "complete").length;
  const progressPercent =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  return {
    user: {
      id: userId,
      email: user.email,
      name: user.name,
      role: normalizeRole(user)
    },
    workspace: {
      id: data.workspace._id,
      name: data.workspace.name,
      progressPercent,
      currentPhase: data.businessProfile.currentPhase,
      onboardingComplete: Boolean(data.businessProfile.onboardingCompletedAt)
    },
    founderProfile,
    businessProfile,
    productLines,
    tasks,
    nextStep: completableTasks[0] ?? null,
    warnings: buildWarnings(
      {
        founderProfile,
        businessProfile,
        productLines
      },
      data.businessProfile.currentPhase
    )
  };
}
