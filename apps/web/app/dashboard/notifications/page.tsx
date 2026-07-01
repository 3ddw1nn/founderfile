"use client";

import { useMutation, useQuery } from "convex/react";
import { DashboardLayout } from "../../../components/dashboard-layout";
import { convexApi } from "../../../lib/convex-api";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationsPage() {
  const notifications = useQuery(convexApi.getNotifications, { limit: 100 }) ?? [];
  const markRead = useMutation(convexApi.markNotificationRead);
  const markAllRead = useMutation(convexApi.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <DashboardLayout
      title="Notifications"
      description="Activity updates and alerts across your setup and compliance tasks."
    >
      <section className="grid gap-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.85rem] text-[var(--muted)]">
            {notifications.length} total · {unread.length} unread
          </span>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead({})}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-[0.8rem] font-bold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)]">
          {notifications.length === 0 ? (
            <p className="px-6 py-10 text-center text-[0.9rem] text-[var(--muted)]">No notifications yet. They appear here when you complete setup steps.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`flex items-start gap-4 px-5 py-4 ${!n.isRead ? "bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]" : ""}`}
                >
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{n.title}</p>
                    <p className="mt-0.5 text-[0.88rem] text-[var(--muted)]">{n.body}</p>
                    <p className="mt-1 text-[0.75rem] text-[var(--muted)]">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => void markRead({ notificationId: n._id })}
                      className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[0.75rem] text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
