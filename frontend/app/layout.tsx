import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AgentForgeProvider } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "AgentForge — Business AI-Agent Platform",
  description: "Configure an AI employee, not an LLM. Grounded, verified, trustworthy business AI operations.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

import { AuthProvider } from "@/lib/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-primary-text font-sans antialiased selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
        <ThemeProvider>
          <AuthProvider>
            <AgentForgeProvider>
              <ToastProvider>{children}</ToastProvider>
            </AgentForgeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
