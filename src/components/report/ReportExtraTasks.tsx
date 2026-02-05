import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Zap } from "lucide-react";

interface ReportExtraTasksProps {
  tasks: string[];
}

export const ReportExtraTasks = ({ tasks }: ReportExtraTasksProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fade-in-up overflow-hidden border-0 bg-gradient-to-br from-info/10 via-info/5 to-transparent shadow-soft" style={{ animationDelay: "0.4s" }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2.5 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/15">
            <CircleDollarSign className="h-4 w-4 text-info" />
          </div>
          Prace dodatkowe
          <span className="ml-auto rounded-full bg-info/10 px-2.5 py-0.5 text-sm font-medium text-info">
            płatne
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tasks.map((task, index) => (
            <li 
              key={index} 
              className="flex items-start gap-3 rounded-lg bg-background/60 p-3 ring-1 ring-info/10"
            >
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-info" />
              <span className="text-foreground leading-relaxed">{task}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
