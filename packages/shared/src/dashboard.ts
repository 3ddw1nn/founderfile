export type BusinessTypeSlug =
  | "sole-proprietor"
  | "llc"
  | "s-corporation"
  | "c-corporation";

export type SetupDocument = {
  title: string;
  detail: string;
  status: "ready" | "in_progress" | "tba";
};

export type BusinessTypeConfig = {
  slug: BusinessTypeSlug;
  label: string;
  shortLabel: string;
  badge?: string;
  available: boolean;
  totalSteps: number;
  completedSteps: number;
  summary: string;
  nextStep: string;
  milestones: string[];
  dbaChecklist: string[];
  documents: SetupDocument[];
};

export const businessTypeConfigs: BusinessTypeConfig[] = [
  {
    slug: "sole-proprietor",
    label: "Sole proprietor",
    shortLabel: "Sole prop",
    available: true,
    totalSteps: 7,
    completedSteps: 0,
    summary: "Best when you want to start quickly and keep the business tied directly to you.",
    nextStep: "Confirm whether you need a city license and whether your public business name requires a DBA or FBN filing.",
    milestones: [
      "Choose the operating name and confirm whether you are using your legal name or a trade name.",
      "Review local city and county registration requirements before taking payments.",
      "Set up banking, invoicing, and a clean document folder for licenses, tax IDs, and contracts."
    ],
    dbaChecklist: [
      "Decide whether you are operating under your personal legal name or a different public-facing name.",
      "Check county DBA or fictitious business name rules where you operate.",
      "Reserve a matching domain and social handles before publishing the name."
    ],
    documents: [
      {
        title: "Business launch checklist",
        detail: "A running list of permits, tax registrations, and setup decisions for your sole proprietorship.",
        status: "ready"
      },
      {
        title: "DBA / FBN worksheet",
        detail: "A worksheet for name usage, filing dates, and newspaper publication requirements if your county needs them.",
        status: "in_progress"
      }
    ]
  },
  {
    slug: "llc",
    label: "LLC",
    shortLabel: "LLC",
    available: true,
    totalSteps: 10,
    completedSteps: 0,
    summary: "Great when you want liability separation, a cleaner business identity, and room to grow.",
    nextStep: "Finalize the LLC name, line up your registered agent details, and prepare the formation filing.",
    milestones: [
      "Lock in the legal LLC name and confirm it is available in your state.",
      "Prepare formation details like registered agent, business address, and management structure.",
      "Collect core documents like the operating agreement, EIN confirmation, and banking paperwork."
    ],
    dbaChecklist: [
      "Confirm whether the LLC will market under its legal name or a separate brand name.",
      "File a DBA or FBN if the brand name differs from the LLC legal name.",
      "Keep the DBA aligned across the website, contracts, invoices, and bank paperwork."
    ],
    documents: [
      {
        title: "LLC formation packet",
        detail: "Tracks articles of organization, operating agreement, EIN, and initial compliance steps.",
        status: "ready"
      },
      {
        title: "DBA / FBN worksheet",
        detail: "Keeps alternate name decisions and filing details connected to the LLC setup.",
        status: "ready"
      }
    ]
  },
  {
    slug: "s-corporation",
    label: "S corporation",
    shortLabel: "S corp",
    badge: "TBA",
    available: false,
    totalSteps: 12,
    completedSteps: 0,
    summary: "This track is planned but not available yet.",
    nextStep: "This experience is still being designed.",
    milestones: [
      "Business-specific setup guidance will appear here soon."
    ],
    dbaChecklist: [
      "DBA or FBN guidance for S corporations is coming soon."
    ],
    documents: [
      {
        title: "S corporation documents",
        detail: "Templates and tracking for this entity type are still in planning.",
        status: "tba"
      }
    ]
  },
  {
    slug: "c-corporation",
    label: "C corporation",
    shortLabel: "C corp",
    badge: "TBA",
    available: false,
    totalSteps: 14,
    completedSteps: 0,
    summary: "This track is planned but not available yet.",
    nextStep: "This experience is still being designed.",
    milestones: [
      "Business-specific setup guidance will appear here soon."
    ],
    dbaChecklist: [
      "DBA or FBN guidance for C corporations is coming soon."
    ],
    documents: [
      {
        title: "C corporation documents",
        detail: "Templates and tracking for this entity type are still in planning.",
        status: "tba"
      }
    ]
  }
];

export function getBusinessTypeConfig(slug: string) {
  return businessTypeConfigs.find((config) => config.slug === slug) ?? null;
}
