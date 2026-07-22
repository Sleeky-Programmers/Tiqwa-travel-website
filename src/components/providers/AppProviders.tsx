"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <AuthProvider>{children}</AuthProvider>
    </SiteSettingsProvider>
  );
}
