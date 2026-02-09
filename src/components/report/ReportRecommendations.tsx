import { ArrowRight } from "lucide-react";

interface ReportRecommendationsProps {
  recommendations: string[];
}

export const ReportRecommendations = ({ recommendations }: ReportRecommendationsProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className="animate-fade-in-up space-y-6 rounded-[10px] bg-[#ffeded] px-6 py-8"
      style={{ animationDelay: "0.5s" }}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Rekomendacje
        </h2>
        <span className="text-sm text-warning font-medium">
          {recommendations.length}
        </span>
      </div>

      <ul className="space-y-4">
        {recommendations.map((rec, index) => (
          <li 
            key={index} 
            className="flex items-start gap-3"
          >
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <span className="text-foreground leading-relaxed">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};