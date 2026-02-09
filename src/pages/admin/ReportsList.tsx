import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminTopNav from "@/components/admin/AdminTopNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface Report {
  id: string;
  client_id: string;
  month: string;
  created_at: string;
  clients: {
    id: string;
    name: string;
    website_url: string | null;
  };
}

interface ActiveClient {
  id: string;
  name: string;
  website_url: string | null;
}

type ReportItem =
  | { type: "report"; report: Report }
  | { type: "pending"; client: ActiveClient };

const ReportsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentMonth = format(new Date(), "yyyy-MM-01");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          client_id,
          month,
          created_at,
          clients (
            id,
            name,
            website_url
          )
        `)
        .order("month", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
  });

  const { data: activeClients, isLoading: isLoadingActiveClients } = useQuery({
    queryKey: ["active-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, website_url")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as ActiveClient[];
    },
  });

  const groupedReports = useMemo(() => {
    const reportsList = reports ?? [];
    const groupsMap = new Map<string, { month: string; items: ReportItem[] }>();

    reportsList.forEach((report) => {
      const group = groupsMap.get(report.month) ?? { month: report.month, items: [] };
      group.items.push({ type: "report", report });
      groupsMap.set(report.month, group);
    });

    if (activeClients) {
      const currentMonthReports = reportsList.filter((report) => report.month === currentMonth);
      const reportedClientIds = new Set(currentMonthReports.map((report) => report.client_id));
      const pendingClients = activeClients.filter((client) => !reportedClientIds.has(client.id));

      if (pendingClients.length > 0 || currentMonthReports.length > 0) {
        const currentGroup = groupsMap.get(currentMonth) ?? { month: currentMonth, items: [] };
        pendingClients.forEach((client) => {
          currentGroup.items.push({ type: "pending", client });
        });
        groupsMap.set(currentMonth, currentGroup);
      }
    }

    return Array.from(groupsMap.values()).sort(
      (a, b) => parseISO(b.month).getTime() - parseISO(a.month).getTime(),
    );
  }, [reports, activeClients, currentMonth]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Raport został usunięty");
    },
    onError: () => {
      toast.error("Nie udało się usunąć raportu");
    },
  });

  const copyReportLink = (id: string) => {
    const url = `${window.location.origin}/reports/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link skopiowany do schowka");
  };

  if (isLoading || isLoadingActiveClients) {
    return (
      <div className="min-h-screen bg-background">
        <AdminTopNav />
        <div className="p-6">
          <div className="container mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminTopNav />
      <div className="p-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/panel">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Raporty</h1>
            </div>
            <Button asChild>
              <Link to="/panel/raporty/nowy">
                <Plus className="mr-2 h-4 w-4" />
                Utwórz raport
              </Link>
            </Button>
          </div>

          <div className="space-y-8">
            {groupedReports.map((group) => (
              <Card key={group.month}>
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold capitalize">
                    {format(parseISO(group.month), "LLLL yyyy", { locale: pl })}
                  </h2>
                </div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Klient</TableHead>
                        <TableHead>Adres strony</TableHead>
                        <TableHead>Utworzono</TableHead>
                        <TableHead className="w-32">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => {
                        if (item.type === "report") {
                          const report = item.report;
                          return (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.clients.name}</TableCell>
                              <TableCell>
                                {report.clients.website_url ? (
                                  <a
                                    href={report.clients.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {report.clients.website_url.replace(/^https?:\/\//, '')}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(parseISO(report.created_at), "dd.MM.yyyy")}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyReportLink(report.id)}
                                    title="Kopiuj link"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    title="Zobacz raport"
                                  >
                                    <a href={`/reports/${report.id}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/panel/raporty/${report.id}/edycja`)}
                                    title="Edytuj"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Usuń">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Usunąć raport?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Ta akcja usunie raport. Nie można tego cofnąć.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteMutation.mutate(report.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Usuń
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return (
                          <TableRow key={`pending-${item.client.id}`}>
                            <TableCell className="font-medium">{item.client.name}</TableCell>
                            <TableCell>
                              {item.client.website_url ? (
                                <a
                                  href={item.client.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {item.client.website_url.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">Brak raportu</span>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" asChild>
                                <Link to={`/panel/raporty/nowy?clientId=${item.client.id}&month=${currentMonth}`}>
                                  Utwórz raport
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
            
            {groupedReports.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Brak raportów. Utwórz pierwszy raport.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
