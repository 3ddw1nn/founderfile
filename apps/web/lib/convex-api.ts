import type { CurrentUser, DashboardData, OnboardingInput, TaskStatus } from "@startupfiles/shared/domain";
import { makeFunctionReference } from "convex/server";

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
  >("app:setTaskStatus")
};
