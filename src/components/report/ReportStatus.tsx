import { CheckCircle2 } from "lucide-react";

interface ReportStatusProps {
  statusText: string;
}

export const ReportStatus = ({ statusText }: ReportStatusProps) => {
  return (
    <div 
      className="animate-fade-in-up space-y-4 py-6" 
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <h2 className="text-lg font-bold text-foreground">
          Status strony
        </h2>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {statusText}
      </p>
    </div>
  );
};