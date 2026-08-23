import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { AccountGate } from "@/components/account-gate";
import { SiteHeader } from "@/components/site-header";
import { isAuthConfigured } from "@/lib/client/auth-config";
import { I18nProvider } from "@/lib/client/i18n";
import "./globals.css";

/**
 * Noto Sans, matching the approved design canvas exactly (its own foundations
 * screen names "Noto Sans · Noto Sans Display" as the type system). Reference
 * numbers — PPO, FIR, registration — still render in the monospace face
 * (--font-mono) wherever they appear on screen, which is what actually
 * prevents a misread character; that did not depend on the body typeface and
 * is unaffected by this change.
 */
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** The design's display face for large headings. */
const notoSansDisplay = Noto_Sans({
  variable: "--font-noto-sans-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/** Devanagari for the Hindi interface; Noto Sans has no Devanagari coverage. */
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RTI Copilot — file an RTI without knowing the department",
    template: "%s · RTI Copilot",
  },
  description:
    "Describe a grievance in plain language. RTI Copilot finds the public authority that holds the records, rewrites it into a valid RTI request, and tracks the 30-day statutory deadline.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale and no user-scalable=no: pinch-zoom stays available.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AccountGate />
      {/* First tab stop on every page, for keyboard and switch users. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </I18nProvider>
  );
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const shell = <Shell>{children}</Shell>;

  /*
   * Clerk is imported at runtime, and only when it is configured.
   *
   * A static `import { ClerkProvider } from "@clerk/nextjs"` throws on every
   * request when the publishable key is missing — even on pages that never
   * render it — which returned 500 for the entire guest journey. Guest mode is
   * a shipped path that is meant to need no external service, so the SDK is
   * loaded behind the flag rather than at module scope.
   */
  let tree = shell;
  if (isAuthConfigured) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    tree = <ClerkProvider>{shell}</ClerkProvider>;
  }

  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansDisplay.variable} ${devanagari.variable} ${geistMono.variable} h-full antialiased`}
      // The pre-paint script below sets `class` and `data-theme` on this
      // element before React hydrates, which is the whole point — it is what
      // stops a dark-mode user seeing a white flash. React must be told that
      // difference is expected, or it warns on every load.
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint so a dark-mode user never sees a white flash. It
          sets both hooks: `.dark` for our Tailwind styles and data-theme for
          UX4G's, which keys its palette off the attribute.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("rti-copilot:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.setAttribute("data-theme",d?"dark":"light");}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background">{tree}</body>
    </html>
  );
}
