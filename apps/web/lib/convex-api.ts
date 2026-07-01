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

export type FeeRow = { tier: string; fee: string; detail: string };

export type FormTemplate = {
  analyzedAt?: number;
  model?: string;
  fields?: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    notes?: string;
  }>;
  fees?: Array<{ tier: string; fee: string; notes?: string }>;
  requirements?: string[];
  processingTime?: string;
  renewalPeriod?: string;
  notes?: string;
};

export type CityDocument = {
  _id: string;
  cityReviewId: string;
  city: string;
  documentType:
    | "license_application"
    | "fee_schedule"
    | "requirements_checklist"
    | "tax_application"
    | "renewal_form"
    | "home_occupation_permit"
    | "zoning_info"
    | "general_info"
    | "other";
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageId: string;
  url: string | null;
  uploadedAt: number;
  createdAt: number;
};

export const CITY_DOC_TYPE_LABELS: Record<CityDocument["documentType"], string> = {
  license_application: "License Application",
  fee_schedule: "Fee Schedule",
  requirements_checklist: "Requirements Checklist",
  tax_application: "Tax Application",
  renewal_form: "Renewal Form",
  home_occupation_permit: "Home Occupation",
  zoning_info: "Zoning Info",
  general_info: "General Info",
  other: "Other",
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
  applicationPdfUrl?: string;
  feeUrl: string;
  checklistUrl: string;
  downloadUrl: string;
  feeSummary: string;
  feeTable?: FeeRow[];
  documentLinks?: Array<{ label: string; url: string }>;
  formTemplate?: FormTemplate;
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
  applicationPdfUrl?: string;
  feeUrl: string;
  checklistUrl: string;
  downloadUrl: string;
  feeSummary: string;
  feeTable: FeeRow[];
  documentLinks?: Array<{ label: string; url: string }>;
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
  clearCityReviews: makeFunctionReference<"mutation", Record<string, never>, { deleted: number }>("cityLicenseSources:clearCityReviews"),
  deleteCity: makeFunctionReference<"mutation", { reviewId: string }, boolean>("cityLicenseSources:deleteCity"),
  seedTopCityReviews: makeFunctionReference<"mutation", Record<string, never>, { inserted: number }>("cityLicenseSources:seedTopCityReviews"),
  seedSelectedCities: makeFunctionReference<
    "mutation",
    { cityNames: string[] },
    { inserted: number; attempted: number }
  >("cityLicenseSources:seedSelectedCities"),
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
  >("cityLicenseSources:scrapeCity"),
  generateCityDocumentUploadUrl: makeFunctionReference<"mutation", Record<string, never>, string>(
    "cityDocuments:generateUploadUrl"
  ),
  saveCityDocument: makeFunctionReference<
    "mutation",
    {
      cityReviewId: string;
      city: string;
      documentType: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      storageId: string;
    },
    string
  >("cityDocuments:saveDocument"),
  listCityDocuments: makeFunctionReference<
    "query",
    { cityReviewId: string },
    CityDocument[]
  >("cityDocuments:listDocuments"),
  listCityDocumentCounts: makeFunctionReference<
    "query",
    Record<string, never>,
    Record<string, number>
  >("cityDocuments:listDocumentCounts"),
  updateCityDocumentType: makeFunctionReference<
    "mutation",
    { documentId: string; documentType: string },
    boolean
  >("cityDocuments:updateDocumentType"),
  deleteCityDocument: makeFunctionReference<
    "mutation",
    { documentId: string },
    boolean
  >("cityDocuments:deleteDocument"),
  listCityApplicationSources: makeFunctionReference<
    "query",
    Record<string, never>,
    Record<string, boolean>
  >("cityDocuments:listCityApplicationSources"),
  analyzeDocumentsForCity: makeFunctionReference<
    "action",
    { cityReviewId: string; modelProvider?: string; applicationSource?: "url" | "file"; applicationUrl?: string },
    Record<string, unknown>
  >("cityDocuments:analyzeDocuments"),
  analyzeDocumentsFromSources: makeFunctionReference<
    "action",
    { cityReviewId: string; feeUrl?: string; customLinks?: Array<{ label: string; url: string }> },
    { feeSummary: string; requirementsSummary: string; notes: string }
  >("cityDocuments:analyzeDocumentsForCity"),
  parseFeeText: makeFunctionReference<
    "action",
    { feeSummary: string },
    Array<{ tier: string; fee: string; detail: string }>
  >("cityDocuments:parseFeeText"),
};
