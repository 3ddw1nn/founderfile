import { notFound } from "next/navigation";
import { BusinessDocumentsPage } from "../../../../components/business-pages";
import { getBusinessTypeConfig } from "@startupfiles/shared/dashboard";
import { getCurrentUser } from "../../../../lib/current-user";

export default async function BusinessTypeDocumentsPage({
  params
}: {
  params: Promise<{ businessType: string }>;
}) {
  const { businessType } = await params;
  const business = getBusinessTypeConfig(businessType);
  const currentUser = await getCurrentUser();

  if (!business) {
    notFound();
  }

  return <BusinessDocumentsPage business={business} initialUser={currentUser} />;
}
