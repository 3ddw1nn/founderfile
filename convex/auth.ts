import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { sendResendEmail, getDefaultFromEmail } from "./lib/resend";

const ADMIN_EMAILS = new Set(["ehleedev@gmail.com"]);

function roleForEmail(email: string) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase()) ? "admin" : "user";
}

async function ensureDefaultWorkspace(
  ctx: {
    db: {
      query: (table: string) => any;
      insert: (table: string, value: Record<string, unknown>) => Promise<any>;
      patch: (id: string, value: Record<string, unknown>) => Promise<void>;
    };
  },
  userId: Id<"users">,
  name: string
) {
  const existingWorkspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
    .unique();
  if (existingWorkspace) {
    return;
  }

  const now = Date.now();
  const workspaceId = await ctx.db.insert("workspaces", {
    ownerUserId: userId,
    name: `${name || "Founder"} Workspace`,
    createdAt: now,
    updatedAt: now
  });

  const founderProfileId = await ctx.db.insert("founderProfiles", {
    workspaceId,
    legalName: name ?? "",
    state: "California",
    city: "Irvine",
    county: "Orange",
    operatesFromHome: true,
    acceptsPayments: false,
    usesSeparateBusinessName: false,
    separateBusinessName: "",
    hasContractors: false,
    hasCustomerContracts: false,
    collectsUserData: false,
    sellsTangibleGoods: false,
    plansHardwareOrPreorders: false,
    createdAt: now,
    updatedAt: now
  });

  const businessProfileId = await ctx.db.insert("businessProfiles", {
    workspaceId,
    currentPhase: "sole_proprietor",
    legalOperatorName: name ?? "",
    plannedLlcName: "Whale Tales Labs LLC",
    cityBusinessLicenseCity: "Irvine",
    cityBusinessLicenseStatus: "not_started",
    dbaStatus: "not_needed",
    stripeSetupStatus: "not_started",
    sellerPermitStatus: "not_started",
    domainName: "",
    domainOwnershipStatus: "not_started",
    createdAt: now,
    updatedAt: now
  });

  await ctx.db.patch(workspaceId, {
    activeBusinessProfileId: businessProfileId
  });

  const defaultProducts = [
    {
      name: "MOMO",
      description: "Software product line.",
      type: "software",
      acceptsPayments: false,
      collectsUserData: false,
      hasAdvertiserMoney: false,
      hasRewardsOrPayouts: false,
      hasHardwareRisk: false,
      status: "not_started"
    },
    {
      name: "Trovr",
      description: "Software or consumer app product line.",
      type: "software",
      acceptsPayments: false,
      collectsUserData: false,
      hasAdvertiserMoney: false,
      hasRewardsOrPayouts: false,
      hasHardwareRisk: false,
      status: "not_started"
    }
  ] as const;

  for (const product of defaultProducts) {
    await ctx.db.insert("productLines", {
      workspaceId,
      ...product,
      createdAt: now,
      updatedAt: now
    });
  }

  await ctx.db.insert("auditEvents", {
    workspaceId,
    userId,
    action: "workspace.seeded",
    entityType: "workspace",
    entityId: workspaceId,
    metadata: { founderProfileId, businessProfileId },
    createdAt: now
  });
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: {
        id: "password-reset",
        type: "email",
        name: "Resend Password Reset",
        from: getDefaultFromEmail(),
        maxAge: 60 * 30,
        async sendVerificationRequest({ identifier, token, expires }) {
          await sendResendEmail({
            to: identifier,
            subject: "Reset your StartupFiles password",
            html: [
              "<div style=\"font-family: Arial, sans-serif; line-height: 1.5; color: #22170b;\">",
              "<h1 style=\"font-size: 20px;\">Reset your StartupFiles password</h1>",
              "<p>Use this verification code to reset your password:</p>",
              `<p style=\"font-size: 28px; font-weight: 700; letter-spacing: 0.08em;\">${token}</p>`,
              `<p>This code expires at ${expires.toUTCString()}.</p>`,
              "<p>If you did not request this, you can ignore this email.</p>",
              "</div>"
            ].join("")
          });
        }
      },
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const now = Date.now();
        return {
          email,
          name:
            typeof params.name === "string" && params.name.trim().length > 0
              ? params.name.trim()
              : email.split("@")[0] ?? "Founder",
          role: roleForEmail(email),
          createdAt: now,
          updatedAt: now
        };
      }
    })
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      const storedUser = await (ctx as any).db.get(args.userId);
      const emailFromProfile =
        typeof args.profile.email === "string"
          ? args.profile.email.trim().toLowerCase()
          : "";
      const emailFromStore =
        typeof storedUser?.email === "string"
          ? storedUser.email.trim().toLowerCase()
          : "";
      const email = emailFromProfile || emailFromStore;
      const nextRole = roleForEmail(email);
      await (ctx as any).db.patch(args.userId, {
        role: nextRole,
        updatedAt: Date.now()
      });

      if (args.existingUserId !== null) {
        return;
      }
      const name =
        typeof args.profile.name === "string" && args.profile.name.trim().length > 0
          ? args.profile.name.trim()
          : typeof args.profile.email === "string"
            ? args.profile.email.split("@")[0] ?? "Founder"
            : "Founder";
      await ensureDefaultWorkspace(ctx as any, args.userId, name);
    }
  }
});
