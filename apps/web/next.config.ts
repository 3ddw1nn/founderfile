import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

function readRootEnv() {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const contents = fs.readFileSync(envPath, "utf8");
  return contents.split("\n").reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return acc;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
}

const rootEnv = readRootEnv();
const vercelAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

const nextConfig: NextConfig = {
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_CONVEX_URL:
      process.env.NEXT_PUBLIC_CONVEX_URL ??
      process.env.CONVEX_URL ??
      rootEnv.CONVEX_URL,
    NEXT_PUBLIC_APP_URL: vercelAppUrl
      ? `https://${vercelAppUrl.replace(/^https?:\/\//, "")}`
      : "http://localhost:3000"
  }
};

export default nextConfig;
