import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface ReportHeaderProps {
  clientName: string;
  month: string;
  websiteUrl?: string | null;
}

export const ReportHeader = ({ clientName, month, websiteUrl }: ReportHeaderProps) => {
  const formattedMonth = format(parseISO(month), "LLLL yyyy", { locale: pl });
  
  return (
    <header className="animate-fade-in-up space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          Raport miesięczny · <span className="capitalize">{formattedMonth}</span>
        </p>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          {clientName}
        </h1>
      </div>
      
      {websiteUrl && (
        <a 
          href={websiteUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-2xl text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>{websiteUrl.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </header>
  );
};