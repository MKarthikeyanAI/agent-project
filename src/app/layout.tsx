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
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
