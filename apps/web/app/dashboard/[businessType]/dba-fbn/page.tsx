import { notFound } from "next/navigation";
import { BusinessDbaPage } from "../../../../components/business-pages";
import { getBusinessTypeConfig } from "@startupfiles/shared/dashboard";
import { getCurrentUser } from "../../../../lib/current-user";

export default async function BusinessTypeDbaPage({
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

  return <BusinessDbaPage business={business} initialUser={currentUser} />;
}
