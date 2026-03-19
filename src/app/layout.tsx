import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WealthPath",
    template: "%s | WealthPath",
  },
  description:
    "Personal finance and investment app to help you build wealth through structured investment strategies, portfolio tracking, and financial goal planning.",
  keywords: [
    "personal finance",
    "investment tracker",
    "portfolio management",
    "financial goals",
    "wealth building",
    "stock portfolio",
    "SIP calculator",
    "AI financial advisor",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WealthPath",
    title: "WealthPath — Personal Finance & Investment",
    description:
      "Track portfolios, set financial goals, and get AI-powered investment insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WealthPath",
    description:
      "Track portfolios, set financial goals, and get AI-powered investment insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Agentic Coding Boilerplate",
  description:
    "Complete agentic coding boilerplate with authentication, database, AI integration, and modern tooling",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Leon van Zyl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen overflow-x-hidden">
            {/* Ambient background layers (purely visual). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
              <div className="absolute -top-52 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-chart-2/10 blur-3xl" />
              <div className="absolute top-[46rem] -right-24 h-[34rem] w-[34rem] rounded-full bg-chart-4/10 blur-3xl" />
              <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] bg-foreground" />
            </div>

            <SiteHeader />
            <main id="main-content" className="relative">
              {children}
            </main>
            <SiteFooter />
            <Toaster richColors position="top-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
