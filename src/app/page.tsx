"use client";

import Link from "next/link";
import {
  Video,
  Shield,
  Database,
  Palette,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { SetupChecklist } from "@/components/setup-checklist";
import { StarterPromptModal } from "@/components/starter-prompt-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDiagnostics } from "@/hooks/use-diagnostics";

export default function Home() {
  const { isAuthReady, isAiReady, loading } = useDiagnostics();
  return (
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[1.4rem] border border-border/60 bg-card/50 backdrop-blur">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-chart-2/10 blur-3xl" />
          </div>

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modern wealth workflows
                </Badge>
                <Badge variant="outline" className="border-border/70 bg-background/30">
                  Premium UI foundation
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Wealth building,{" "}
                  <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/65 bg-clip-text text-transparent">
                    without the guesswork
                  </span>
                  .
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Track portfolios, set goals, and get AI-powered insights designed around
                  structured investment strategies.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {loading || !isAuthReady ? (
                  <Button size="lg" className="sm:flex-1" disabled>
                    View Dashboard
                  </Button>
                ) : (
                  <Button size="lg" asChild className="sm:flex-1">
                    <Link href="/dashboard" className="inline-flex items-center gap-2">
                      View Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {loading || !isAiReady ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="sm:flex-1"
                    disabled
                  >
                    Try AI Advisor
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="sm:flex-1"
                  >
                    <Link href="/chat" className="inline-flex items-center gap-2">
                      Try AI Advisor <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Better Auth + session-ready UI
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  OpenRouter-backed AI insights
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-2 rounded-[2rem] bg-primary/10 blur-2xl" />
              <Card className="relative rounded-[1.4rem] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/15">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Live experience</p>
                      <p className="font-semibold">Your wealth overview</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                    Real data UI
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/70 bg-background/30 p-3">
                    <p className="text-xs text-muted-foreground">Net Worth</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">$—</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Auto-calculated</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/30 p-3">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">— / 10</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Actionable insights</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-border/70 bg-background/30 p-3">
                    <p className="text-xs text-muted-foreground">AI Advisor</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        Ask: <span className="text-primary">“Should I rebalance?”</span>
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Structured answers
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Built-in capabilities</h2>
            <p className="text-muted-foreground mt-1">
              Everything you need to ship a modern AI finance experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication
              </h3>
              <p className="text-sm text-muted-foreground">
                Better Auth with session-ready UI patterns.
              </p>
            </Card>
            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </h3>
              <p className="text-sm text-muted-foreground">
                Drizzle ORM with PostgreSQL schema + migrations.
              </p>
            </Card>
            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Ready
              </h3>
              <p className="text-sm text-muted-foreground">
                Vercel AI SDK with OpenRouter integration.
              </p>
            </Card>
            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                UI Components
              </h3>
              <p className="text-sm text-muted-foreground">
                shadcn/ui with Tailwind CSS and dark mode.
              </p>
            </Card>
          </div>
        </section>

        {/* Video + Value */}
        <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card className="p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Watch the walkthrough</h3>
            </div>
            <p className="text-muted-foreground mb-5">
              Follow the complete setup and feature tour.
            </p>
            <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-background/30">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/JQ86N3WOAh4"
                  title="Agentic Coding Boilerplate Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Structured workflows</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Design your investment strategy with clear inputs and measurable progress.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Modern, polished UI</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cards, buttons, and layout primitives tuned for a premium look.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">AI advisor ready</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask questions about risk, allocation, and goals with OpenRouter models.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Setup + Next Steps */}
        <section className="space-y-6">
          <SetupChecklist />

          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Next steps</h3>
              <p className="text-muted-foreground mt-1">Get from setup to insights in minutes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Card className="p-5">
              <h4 className="font-medium mb-2">1. Set up environment variables</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Copy <code>.env.example</code> to <code>.env.local</code> and configure:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>POSTGRES_URL (PostgreSQL connection string)</li>
                <li>GOOGLE_CLIENT_ID (OAuth credentials)</li>
                <li>GOOGLE_CLIENT_SECRET (OAuth credentials)</li>
                <li>OPENROUTER_API_KEY (for AI functionality)</li>
              </ul>
            </Card>

            <Card className="p-5">
              <h4 className="font-medium mb-2">2. Set up your database</h4>
              <p className="text-sm text-muted-foreground mb-2">Run database migrations:</p>
              <div className="space-y-2">
                <code className="text-sm bg-muted p-2 rounded block">
                  npm run db:generate
                </code>
                <code className="text-sm bg-muted p-2 rounded block">
                  npm run db:migrate
                </code>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-medium mb-2">3. Try the features</h4>
              <div className="space-y-2">
                {loading || !isAuthReady ? (
                  <Button size="sm" className="w-full" disabled>
                    View Dashboard
                  </Button>
                ) : (
                  <Button asChild size="sm" className="w-full">
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                )}

                {loading || !isAiReady ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Try AI Advisor
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/chat">Try AI Advisor</Link>
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-medium mb-2">4. Start building</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customize components, add your pages, and build your application on top of this foundation.
              </p>
              <StarterPromptModal />
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
