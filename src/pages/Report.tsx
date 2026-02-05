import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportStatus } from "@/components/report/ReportStatus";
import { ReportMetrics } from "@/components/report/ReportMetrics";
import { ReportTasks } from "@/components/report/ReportTasks";
import { ReportExtraTasks } from "@/components/report/ReportExtraTasks";
import { ReportRecommendations } from "@/components/report/ReportRecommendations";
import { ReportInvoice } from "@/components/report/ReportInvoice";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  client_id: string;
  month: string;
  status_text: string;
  speed_score_mobile: number;
  speed_score_desktop: number;
  uptime_percent: number;
  updates_count: number;
  tasks_json: string[] | null;
  extra_tasks_json: string[] | null;
  recommendations: string[] | null;
  invoice_url: string | null;
  pagespeed_url: string | null;
  created_at: string;
  clients: {
    id: string;
    name: string;
    contact_email: string;
    website_url: string | null;
  };
}

const Report = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          clients (
            id,
            name,
            contact_email,
            website_url
          )
        `,
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Raport nie został znaleziony");

      return data as Report;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-24 space-y-8">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-3xl font-extrabold text-foreground">Nie znaleziono raportu</h1>
          <p className="text-muted-foreground">Sprawdź, czy link jest poprawny lub skontaktuj się z supportem.</p>
        </div>
      </div>
    );
  }

  const tasks = Array.isArray(report.tasks_json) ? report.tasks_json : [];
  const extraTasks = Array.isArray(report.extra_tasks_json) ? report.extra_tasks_json : [];
  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <ReportHeader 
          clientName={report.clients.name} 
          month={report.month}
          websiteUrl={report.clients.website_url}
        />

        <div className="mt-12">
          <ReportStatus statusText={report.status_text} />

          <ReportMetrics
            speedScoreMobile={report.speed_score_mobile}
            speedScoreDesktop={report.speed_score_desktop}
            pagespeedUrl={report.pagespeed_url}
          />

          <ReportTasks tasks={tasks} />

          <ReportExtraTasks tasks={extraTasks} />

          <ReportRecommendations recommendations={recommendations} />

          {report.invoice_url && <ReportInvoice invoiceUrl={report.invoice_url} />}

          <footer className="mt-16 pt-8 border-t border-border text-center space-y-2">
            <p className="text-muted-foreground">
              Jeśli masz pytania, skontaktuj się z nami.
            </p>
            <a 
              href="https://kodooy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-primary hover:underline font-medium"
            >
              kodooy.com
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Report;