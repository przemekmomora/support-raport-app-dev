import { CircleCheck } from "lucide-react";

interface ReportExtraPaidTasksProps {
  tasks: string[];
}

export const ReportExtraPaidTasks = ({ tasks }: ReportExtraPaidTasksProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div
      className="animate-fade-in-up space-y-6 border-t border-border bg-[#FFF8ED] px-6 py-8"
      style={{ animationDelay: "0.45s" }}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-foreground">Prace dodatkowe - Płatne</h2>
        <span className="text-sm text-muted-foreground">{tasks.length} zadań</span>
      </div>

      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#E6A04B]" />
            <span className="text-foreground leading-relaxed">{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
