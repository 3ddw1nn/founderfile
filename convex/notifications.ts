import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const getNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(args.limit ?? 50);

    return notifications;
  }
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) return 0;

    const all = await ctx.db
      .query("notifications")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    return all.filter((n: any) => !n.isRead).length;
  }
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");
    await ctx.db.patch(args.notificationId, { isRead: true });
    return true;
  }
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) return true;

    const all = await ctx.db
      .query("notifications")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const unread = all.filter((n: any) => !n.isRead);
    await Promise.all(unread.map((n: any) => ctx.db.patch(n._id, { isRead: true })));
    return true;
  }
});
