import { Smartphone, Monitor, ExternalLink } from "lucide-react";

interface ReportMetricsProps {
  speedScoreMobile: number;
  speedScoreDesktop: number;
  pagespeedUrl?: string | null;
}

export const ReportMetrics = ({
  speedScoreMobile,
  speedScoreDesktop,
  pagespeedUrl,
}: ReportMetricsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <div 
      className="animate-fade-in-up space-y-6 border-t border-border py-8" 
      style={{ animationDelay: "0.2s" }}
    >
      <h2 className="text-lg font-bold text-foreground">
        PageSpeed Insights
      </h2>

      <div className="flex gap-12">
        <div className="space-y-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <p className={`text-5xl font-extrabold tabular-nums tracking-tight ${getScoreColor(speedScoreMobile)}`}>
            {speedScoreMobile}
          </p>
          <p className="text-sm text-muted-foreground">Mobile score</p>
        </div>

        <div className="w-px bg-border" />

        <div className="space-y-2">
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <p className={`text-5xl font-extrabold tabular-nums tracking-tight ${getScoreColor(speedScoreDesktop)}`}>
            {speedScoreDesktop}
          </p>
          <p className="text-sm text-muted-foreground">Desktop score</p>
        </div>
      </div>
      
      {pagespeedUrl && (
        <a 
          href={pagespeedUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Zobacz pełny raport
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
};