import type { Metadata } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { siteConfig } from "@startupfiles/shared/site";
import { ConvexProviders } from "../components/convex-providers";
import { ThemeScript } from "../components/theme-script";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <ConvexAuthNextjsServerProvider>
          <ConvexProviders>{children}</ConvexProviders>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
