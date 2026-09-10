"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSiteSettings } from "@/services/whitelabel-api";
import type { SiteSettings } from "@/types/whitelabel";

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

interface SiteSettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: SiteSettings | null;
}

export function SiteSettingsProvider({ children, initialSettings = null }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  useEffect(() => {
    if (initialSettings) return;

    let cancelled = false;

    getSiteSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setSettings(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
