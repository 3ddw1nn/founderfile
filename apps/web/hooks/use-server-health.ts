import { useEffect, useState } from "react";

export function useServerHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const checkHealth = setInterval(async () => {
      try {
        const res = await fetch("/api/health", { method: "GET" });
        if (res.ok) {
          if (!isHealthy) {
            setIsHealthy(true);
            window.location.reload();
          }
        } else {
          setIsHealthy(false);
        }
      } catch {
        setIsHealthy(false);
      }
    }, 3000);

    return () => clearInterval(checkHealth);
  }, [isHealthy]);

  const retryConnection = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return { isHealthy, isRetrying, retryConnection };
}
