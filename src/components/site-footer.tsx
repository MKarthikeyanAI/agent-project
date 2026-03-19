import { GitHubStars } from "./ui/github-stars";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-5">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          <GitHubStars repo="leonvanzyl/agentic-coding-starter-kit" />
          <p className="leading-relaxed">
            Built with an agentic foundation{" "}
            <span className="text-muted-foreground/80">for WealthPath</span> by{" "}
            <a
              href="https://youtube.com/@leonvanzyl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Leon van Zyl
            </a>
            . <span className="text-muted-foreground/70">© {year}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
