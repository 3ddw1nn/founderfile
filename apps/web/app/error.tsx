"use client";

import { useEffect, useState } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  useEffect(() => {
    const checkServer = setInterval(async () => {
      try {
        const res = await fetch("/__nextjs_original-stack-frame", { method: "HEAD" });
        if (res.ok || res.status !== 500) {
          setAutoRetryCount((c) => c + 1);
          if (autoRetryCount > 0) {
            reset();
          }
        }
      } catch {
        // Server still down
      }
    }, 2000);

    return () => clearInterval(checkServer);
  }, [autoRetryCount, reset]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Something went wrong</h1>
          <p className="mt-2 text-[var(--muted)]">
            The app encountered an error. {autoRetryCount > 0 && "Attempting to recover..."}
          </p>
        </div>

        {error.message && (
          <div className="rounded-2xl border border-[color-mix(in_srgb,#ff6b6b_20%,transparent)] bg-[color-mix(in_srgb,#ff6b6b_8%,transparent)] p-4">
            <p className="text-sm text-[var(--muted)]">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 rounded-2xl bg-[var(--accent)] px-4 py-3 font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isRetrying ? "Retrying..." : "Try again"}
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] px-4 py-3 font-bold text-[var(--text)] transition-colors hover:bg-[color-mix(in_srgb,var(--panel)_90%,transparent)]"
          >
            Go home
          </button>
        </div>

        {autoRetryCount > 0 && (
          <p className="text-xs text-[var(--muted)]">Auto-recovery attempt {autoRetryCount}...</p>
        )}
      </div>
    </div>
  );
}
