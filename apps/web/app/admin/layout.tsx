import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}
