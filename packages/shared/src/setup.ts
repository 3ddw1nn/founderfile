export type SetupStepStatus = "not_started" | "in_progress" | "complete" | "not_needed";

export type SetupStep = {
  stepNumber: number;
  title: string;
  description: string;
};

export type SetupConfig = {
  businessType: string;
  totalSteps: number;
  steps: SetupStep[];
};

export const soleProprietorSetup: SetupConfig = {
  businessType: "sole-proprietor",
  totalSteps: 7,
  steps: [
    {
      stepNumber: 1,
      title: "Entity application",
      description: "Decide whether you are applying as yourself or as a business entity, and provide your legal name."
    },
    {
      stepNumber: 2,
      title: "DBA / FBN filing",
      description: "If you are using a separate business name, file the DBA or Fictitious Business Name with your county."
    },
    {
      stepNumber: 3,
      title: "City business license",
      description: "Register for a business license with your local city before accepting payments."
    },
    {
      stepNumber: 4,
      title: "Tax registration",
      description: "Obtain an EIN, register for state taxes, and apply for a seller's permit if needed."
    },
    {
      stepNumber: 5,
      title: "Banking & payments",
      description: "Set up a separate bank account, payment processing, and bookkeeping."
    },
    {
      stepNumber: 6,
      title: "Legal pages & launch",
      description: "Prepare terms of service, privacy policy, and finalize your domain and website."
    },
    {
      stepNumber: 7,
      title: "Review & submit",
      description: "Review all your answers and confirm everything is ready."
    }
  ]
};

export const llcSetup: SetupConfig = {
  businessType: "llc",
  totalSteps: 9,
  steps: [
    {
      stepNumber: 1,
      title: "Entity application",
      description: "Decide whether you are applying as a business entity and provide your legal name."
    },
    {
      stepNumber: 2,
      title: "DBA / FBN filing",
      description: "If the LLC operates under a brand name different from its legal name, file the DBA."
    },
    {
      stepNumber: 3,
      title: "LLC name & formation",
      description: "Check name availability and file Articles of Organization with the state."
    },
    {
      stepNumber: 4,
      title: "Registered agent & operating agreement",
      description: "Designate a registered agent and draft an operating agreement."
    },
    {
      stepNumber: 5,
      title: "EIN & tax setup",
      description: "Obtain an EIN from the IRS and handle state tax registration."
    },
    {
      stepNumber: 6,
      title: "City business license",
      description: "Register for a business license with your local city."
    },
    {
      stepNumber: 7,
      title: "Banking, payments & bookkeeping",
      description: "Set up a business bank account, Stripe, and accounting."
    },
    {
      stepNumber: 8,
      title: "Legal pages & launch",
      description: "Prepare terms of service, privacy policy, and finalize your online presence."
    },
    {
      stepNumber: 9,
      title: "Review & submit",
      description: "Review all your answers and confirm everything is ready."
    }
  ]
};

export function getSetupConfig(businessType: string): SetupConfig | null {
  if (businessType === "sole-proprietor") return soleProprietorSetup;
  if (businessType === "llc") return llcSetup;
  return null;
}