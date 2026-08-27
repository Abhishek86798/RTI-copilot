import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Sans_Devanagari } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { AccessibilityBar } from "@/components/accessibility-bar";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { I18nProvider } from "@/lib/client/i18n";
import "./globals.css";

/**
 * Inter, as the Latin face for both body and display.
 *
 * This replaces Noto Sans, which the design canvas named. Noto Sans is a
 * humanist face — softer terminals, wider apertures, a little more warmth —
 * and the editorial layout this page now uses is a Swiss grotesque one, where
 * that warmth reads as slightly generic. Inter is the closest freely licensed
 * grotesque to the neo-grotesque the reference layouts are set in, holds
 * tight tracking at display sizes without the counters closing up, and has a
 * genuine variable weight axis so headings and captions come from one file.
 *
 * Reference numbers — PPO, FIR, registration — still render in the monospace
 * face wherever they appear on screen, which is what actually prevents a
 * misread character. That never depended on the body typeface.
 *
 * Devanagari is unaffected: Inter has no Devanagari coverage, so the Hindi
 * interface continues to use Noto Sans Devanagari below.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      <SmoothScroll />
      {/* First tab stop on every page, for keyboard and switch users. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <AccessibilityBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </I18nProvider>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const tree = <Shell>{children}</Shell>;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${devanagari.variable} ${geistMono.variable} h-full antialiased`}
      // The pre-paint script below sets `class` and `data-theme` on this
      // element before React hydrates, which is the whole point — it is what
      // stops a dark-mode user seeing a white flash. React must be told that
      // difference is expected, or it warns on every load.
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint so a dark-mode user never sees a white flash, and
          so a reader who chose larger text or high contrast never sees the
          page render at the default and then jump.

          It sets every hook at once: `.dark` for our Tailwind styles,
          data-theme for UX4G's palette, and data-text-size / data-contrast
          for the reader controls in the accessibility bar.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var t=localStorage.getItem("rti-copilot:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);r.classList.toggle("dark",d);r.setAttribute("data-theme",d?"dark":"light");var s=localStorage.getItem("rti-copilot:text-size");if(s==="large"||s==="larger")r.setAttribute("data-text-size",s);if(localStorage.getItem("rti-copilot:contrast")==="high")r.setAttribute("data-contrast","high");}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background">{tree}</body>
    </html>
  );
}
