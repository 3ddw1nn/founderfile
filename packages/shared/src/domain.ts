export type UserRole = "user" | "admin";

export type BusinessPhase = "sole_proprietor" | "llc_ready" | "llc_formed";

export type CityBusinessLicenseStatus =
  | "not_started"
  | "in_progress"
  | "complete";

export type DbaStatus = "not_needed" | "considering" | "ready" | "complete";

export type SimpleStatus = "not_started" | "in_progress" | "complete";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "ready"
  | "complete"
  | "not_needed";

export type ProductLineType =
  | "software"
  | "browser_extension"
  | "hardware"
  | "services"
  | "digital_product"
  | "other";

export type FounderProfileInput = {
  legalName: string;
  state: string;
  city: string;
  county: string;
  operatesFromHome: boolean;
  acceptsPayments: boolean;
  usesSeparateBusinessName: boolean;
  separateBusinessName: string;
  hasContractors: boolean;
  hasCustomerContracts: boolean;
  collectsUserData: boolean;
  sellsTangibleGoods: boolean;
  plansHardwareOrPreorders: boolean;
};

export type BusinessProfileInput = {
  legalOperatorName: string;
  plannedLlcName: string;
  cityBusinessLicenseCity: string;
  cityBusinessLicenseStatus: CityBusinessLicenseStatus;
  dbaStatus: DbaStatus;
  stripeSetupStatus: SimpleStatus;
  sellerPermitStatus: SimpleStatus;
  domainName: string;
  domainOwnershipStatus: SimpleStatus;
};

export type ProductLineInput = {
  name: string;
  description: string;
  type: ProductLineType;
  acceptsPayments: boolean;
  collectsUserData: boolean;
  hasAdvertiserMoney: boolean;
  hasRewardsOrPayouts: boolean;
  hasHardwareRisk: boolean;
  status: SimpleStatus;
};

export type OnboardingInput = {
  founderProfile: FounderProfileInput;
  businessProfile: BusinessProfileInput;
  productLines: ProductLineInput[];
};

export type RoadmapTaskView = {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  phaseKey: "phase_0" | "phase_1";
  status: TaskStatus;
  priority: number;
  dueLabel: string | null;
};

export type DashboardData = {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  workspace: {
    id: string;
    name: string;
    progressPercent: number;
    currentPhase: BusinessPhase;
    onboardingComplete: boolean;
  };
  founderProfile: FounderProfileInput;
  businessProfile: BusinessProfileInput;
  productLines: ProductLineInput[];
  tasks: RoadmapTaskView[];
  nextStep: RoadmapTaskView | null;
  warnings: string[];
};

export type CurrentUser = DashboardData["user"];
