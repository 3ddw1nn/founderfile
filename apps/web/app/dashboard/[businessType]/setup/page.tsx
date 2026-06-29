import { notFound } from "next/navigation";
import { SetupWizard } from "../../../../components/setup-wizard";
import { getBusinessTypeConfig } from "@startupfiles/shared/dashboard";
import { getCurrentUser } from "../../../../lib/current-user";

export default async function BusinessSetupPage({
  params
}: {
  params: Promise<{ businessType: string }>;
}) {
  const { businessType } = await params;
  const business = getBusinessTypeConfig(businessType);
  const currentUser = await getCurrentUser();

  if (!business || !business.available) {
    notFound();
  }

  return <SetupWizard businessType={businessType} initialUser={currentUser} />;
}