import { CircleDollarSign } from "lucide-react";

interface ReportExtraTasksProps {
  tasks: string[];
}

export const ReportExtraTasks = ({ tasks }: ReportExtraTasksProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div
      className="animate-fade-in-up space-y-6 border-t border-border py-8"
      style={{ animationDelay: "0.4s" }}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-foreground">Prace dodatkowe</h2>
        <span className="text-sm text-muted-foreground">{tasks.length} zadań</span>
      </div>

      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-start gap-3">
            <CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-info" />
            <span className="text-foreground leading-relaxed">{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
