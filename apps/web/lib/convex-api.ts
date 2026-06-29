import type { CurrentUser, DashboardData, OnboardingInput, TaskStatus } from "@startupfiles/shared/domain";
import { makeFunctionReference } from "convex/server";

type SetupSessionDoc = {
  _id: string;
  workspaceId: string;
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

export const convexApi = {
  currentUser: makeFunctionReference<"query", Record<string, never>, CurrentUser | null>("app:currentUser"),
  viewer: makeFunctionReference<"query", Record<string, never>, DashboardData | null>("app:viewer"),
  saveOnboarding: makeFunctionReference<"mutation", OnboardingInput, DashboardData>("app:saveOnboarding"),
  setTaskStatus: makeFunctionReference<
    "mutation",
    {
      taskId: string;
      status: TaskStatus;
    },
    boolean
  >("app:setTaskStatus"),
  resetProgress: makeFunctionReference<"mutation", { userId?: string }, boolean>("app:resetProgress"),
  resetDb: makeFunctionReference<"mutation", Record<string, never>, boolean>("app:resetDb"),
  getSetupSession: makeFunctionReference<"query", { businessType: string }, SetupSessionDoc | null>("setup:getSetupSession"),
  startSetup: makeFunctionReference<"mutation", { businessType: string }, string>("setup:startSetup"),
  saveSetupStep: makeFunctionReference<
    "mutation",
    {
      businessType: string;
      currentStep: number;
      stepStatuses: string[];
      isEntityApplication?: boolean;
      legalFirstName?: string;
      legalMiddleName?: string;
      legalLastName?: string;
      legalSuffix?: string;
      isCompleted?: boolean;
    },
    boolean
  >("setup:saveSetupStep")
};
