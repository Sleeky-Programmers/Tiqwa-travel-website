"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import type { SiteSettings } from "@/types/whitelabel";

interface AppProvidersProps {
  children: React.ReactNode;
  initialSettings?: SiteSettings | null;
}

export function AppProviders({ children, initialSettings }: AppProvidersProps) {
  return (
    <SiteSettingsProvider initialSettings={initialSettings}>
      <AuthProvider>{children}</AuthProvider>
    </SiteSettingsProvider>
  );
}
