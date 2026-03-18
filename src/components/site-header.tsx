"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/goals", label: "Goals" },
  { href: "/markets", label: "Markets" },
  { href: "/analysis", label: "Analysis" },
  { href: "/reports", label: "Reports" },
  { href: "/strategies", label: "Strategies" },
  { href: "/chat", label: "AI Advisor" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur-sm" role="banner">
        <nav
          className="container mx-auto px-4 py-3 flex items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0"
            aria-label="WealthPath — Go to Dashboard"
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"
              aria-hidden="true"
            >
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WealthPath
            </span>
          </Link>

          {/* Primary nav links — hidden on small screens */}
          <div className="hidden md:flex items-center gap-1" role="group" aria-label="Site navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3" role="group" aria-label="User actions">
            <UserProfile />
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile nav — scrollable row */}
        <div className="md:hidden border-t overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2 min-w-max">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}
