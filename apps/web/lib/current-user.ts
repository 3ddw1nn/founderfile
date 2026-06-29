import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import type { CurrentUser } from "@startupfiles/shared/domain";
import { convexApi } from "./convex-api";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return null;
  }

  return await fetchQuery(convexApi.currentUser, {}, { token });
}
