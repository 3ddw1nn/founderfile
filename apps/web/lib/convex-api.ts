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
  needsDba?: boolean;
  dbaName?: string;
  dbaCounty?: string;
  dbaNewspaperName?: string;
  dbaPublicationFiled?: boolean;
  cityLicenseCity?: string;
  cityLicenseCounty?: string;
  cityLicenseBusinessAddress?: string;
  cityLicenseBusinessCity?: string;
  cityLicenseBusinessZip?: string;
  cityLicensePhone?: string;
  cityLicenseEmail?: string;
  cityLicenseStartDate?: string;
  cityLicenseActivity?: string;
  cityLicenseIsHomeBased?: boolean;
  cityLicenseEmployeeCount?: string;
  cityLicenseGrossReceipts?: string;
  cityLicenseBusinessCategory?: string;
  cityLicenseWebsite?: string;
  currentSubstep?: number;
  isCompleted: boolean;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
};

type SetupOverview = {
  lastActiveBusinessType: string | null;
  summaries: Array<{
    businessType: string;
    currentStep: number;
    currentSubstep: number;
    totalSteps: number;
    completedSteps: number;
    completedSubsteps: number | null;
    totalSubsteps: number | null;
    updatedAt: number;
    isCompleted: boolean;
  }>;
};

type SetupDocumentDoc = {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: number;
  url: string | null;
};

type NotificationDoc = {
  _id: string;
  workspaceId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  href?: string;
  createdAt: number;
};

export type CityLicenseSourceReview = {
  _id: string;
  city: string;
  county: string;
  populationRank: number;
  status: "pending" | "approved" | "rejected" | "needs_review";
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
  reviewerNotes: string;
  confidence: number;
  lastScrapedAt?: number;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type CityLicenseSourceReviewInput = {
  sourceKind: CityLicenseSourceReview["sourceKind"];
  retrievalStatus: CityLicenseSourceReview["retrievalStatus"];
  businessLicenseUrl: string;
  applicationUrl: string;
  feeUrl: string;
  checklistUrl: string;
  downloadUrl: string;
  feeSummary: string;
  requirementsSummary: string;
  applicationFields: string[];
  scraperNotes: string;
  reviewerNotes: string;
  confidence: number;
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
  normalizeUserRoles: makeFunctionReference<"mutation", Record<string, never>, { updated: number }>("app:normalizeUserRoles"),
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
      needsDba?: boolean;
      dbaName?: string;
      dbaCounty?: string;
      dbaNewspaperName?: string;
      dbaPublicationFiled?: boolean;
      cityLicenseCity?: string;
      cityLicenseCounty?: string;
      cityLicenseBusinessAddress?: string;
      cityLicenseBusinessCity?: string;
      cityLicenseBusinessZip?: string;
      cityLicensePhone?: string;
      cityLicenseEmail?: string;
      cityLicenseStartDate?: string;
      cityLicenseActivity?: string;
      cityLicenseIsHomeBased?: boolean;
      cityLicenseEmployeeCount?: string;
      cityLicenseGrossReceipts?: string;
      cityLicenseBusinessCategory?: string;
      cityLicenseWebsite?: string;
      currentSubstep?: number;
      completedSubsteps?: number;
      totalSubsteps?: number;
      isCompleted?: boolean;
    },
    boolean
  >("setup:saveSetupStep"),
  resetSetupStep: makeFunctionReference<"mutation", { businessType: string; stepNumber: number }, boolean>("setup:resetSetupStep"),
  resetSetup: makeFunctionReference<"mutation", { businessType: string }, boolean>("setup:resetSetup"),
  getSetupOverview: makeFunctionReference<"query", Record<string, never>, SetupOverview>("setup:getSetupOverview"),
  generateUploadUrl: makeFunctionReference<"mutation", Record<string, never>, string>("documents:generateUploadUrl"),
  saveDocument: makeFunctionReference<
    "mutation",
    {
      businessType: string;
      category: string;
      storageId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    },
    string
  >("documents:saveDocument"),
  getDocuments: makeFunctionReference<
    "query",
    { businessType: string; category: string },
    SetupDocumentDoc[]
  >("documents:getDocuments"),
  deleteDocument: makeFunctionReference<"mutation", { documentId: string }, boolean>("documents:deleteDocument"),
  getNotifications: makeFunctionReference<"query", { limit?: number }, NotificationDoc[]>("notifications:getNotifications"),
  getUnreadCount: makeFunctionReference<"query", Record<string, never>, number>("notifications:getUnreadCount"),
  markNotificationRead: makeFunctionReference<"mutation", { notificationId: string }, boolean>("notifications:markNotificationRead"),
  markAllNotificationsRead: makeFunctionReference<"mutation", Record<string, never>, boolean>("notifications:markAllNotificationsRead"),
  listTopCityReviews: makeFunctionReference<
    "query",
    {
      limit?: number;
      status?: CityLicenseSourceReview["status"];
    },
    CityLicenseSourceReview[]
  >("cityLicenseSources:listTopCityReviews"),
  seedTopCityReviews: makeFunctionReference<"mutation", Record<string, never>, { inserted: number }>("cityLicenseSources:seedTopCityReviews"),
  updateCityLicenseReview: makeFunctionReference<
    "mutation",
    CityLicenseSourceReviewInput & { reviewId: string },
    boolean
  >("cityLicenseSources:updateReview"),
  setCityLicenseReviewStatus: makeFunctionReference<
    "mutation",
    {
      reviewId: string;
      status: CityLicenseSourceReview["status"];
      reviewerNotes?: string;
    },
    boolean
  >("cityLicenseSources:setReviewStatus"),
  scrapeCity: makeFunctionReference<
    "action",
    { reviewId: string },
    { retrievalStatus: string; applicationUrl: string; feeUrl: string; businessLicenseUrl: string }
  >("cityLicenseSources:scrapeCity")
};
