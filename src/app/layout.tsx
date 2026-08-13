import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { buildThemeStyleTag } from "@/lib/theme-color";
import { getSiteSettings } from "@/services/whitelabel-api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tiqwa Travel — Book Flights Worldwide",
  description:
    "Search, compare, and book flights to destinations around the world with Tiqwa Travel.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings().catch(() => null);
  const themeCss = buildThemeStyleTag(settings?.primary_color, settings?.secondary_color);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Brand colors from the site-settings API, injected server-side so they're
            present on first paint — no client fetch, no flash of default color. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tiqwa-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProviders initialSettings={settings}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
