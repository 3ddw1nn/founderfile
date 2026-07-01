import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;
const mutation = mutationGeneric;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");
    return await ctx.storage.generateUploadUrl();
  }
});

export const saveDocument = mutation({
  args: {
    businessType: v.string(),
    category: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) throw new Error("Workspace not found.");

    const now = Date.now();
    const id = await ctx.db.insert("setupDocuments", {
      workspaceId: workspace._id,
      businessType: args.businessType,
      category: args.category,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      createdAt: now
    });
    return id;
  }
});

export const getDocuments = query({
  args: {
    businessType: v.string(),
    category: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) return [];

    const docs = await ctx.db
      .query("setupDocuments")
      .withIndex("by_workspace_type_category", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("businessType", args.businessType).eq("category", args.category)
      )
      .take(20);

    return await Promise.all(
      docs.map(async (doc) => ({
        _id: doc._id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
        url: await ctx.storage.getUrl(doc.storageId)
      }))
    );
  }
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("setupDocuments")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in.");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", userId))
      .unique();
    if (!workspace) throw new Error("Workspace not found.");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || (doc as any).workspaceId !== workspace._id) throw new Error("Document not found.");

    await ctx.storage.delete((doc as any).storageId);
    await ctx.db.delete(args.documentId);
    return true;
  }
});
