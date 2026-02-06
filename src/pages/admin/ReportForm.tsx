import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthPicker } from "@/components/ui/month-picker";
import { ArrowLeft, Loader2, Plus, X, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface TaskTemplate {
  id: string;
  name: string;
  category: string;
}

interface Client {
  id: string;
  name: string;
  website_url: string | null;
}

const ReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Form state
  const [clientId, setClientId] = useState("");
  const [month, setMonth] = useState("");
  const [statusText, setStatusText] = useState("Wszystko działa poprawnie. Strona jest aktualna i bezpieczna.");
  const [speedScoreMobile, setSpeedScoreMobile] = useState(80);
  const [speedScoreDesktop, setSpeedScoreDesktop] = useState(90);
  const [pagespeedUrl, setPagespeedUrl] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  
  // Tasks
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [newCustomTask, setNewCustomTask] = useState("");
  const [createdTemplateIds, setCreatedTemplateIds] = useState<string[]>([]);
  
  // Extra tasks
  const [extraTasks, setExtraTasks] = useState<string[]>([]);
  const [newExtraTask, setNewExtraTask] = useState("");
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [newRecommendation, setNewRecommendation] = useState("");

  // PageSpeed fetching state
  const [isFetchingPageSpeed, setIsFetchingPageSpeed] = useState(false);

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, website_url")
        .order("name");
      if (error) throw error;
      return data as Client[];
    },
  });

  // Fetch task templates
  const { data: taskTemplates } = useQuery({
    queryKey: ["task-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as TaskTemplate[];
    },
  });

  // Fetch existing report for editing
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (report && taskTemplates) {
      setClientId(report.client_id);
      setMonth(report.month);
      setStatusText(report.status_text);
      setSpeedScoreMobile(report.speed_score_mobile);
      setSpeedScoreDesktop(report.speed_score_desktop);
      setPagespeedUrl(report.pagespeed_url || "");
      setInvoiceUrl(report.invoice_url || "");
      
      // Parse tasks - separate template tasks from custom ones
      const allTasks = Array.isArray(report.tasks_json) ? report.tasks_json as string[] : [];
      const templateNames = taskTemplates.map(t => t.name);
      const templateTasks = allTasks.filter(t => templateNames.includes(t));
      const custom = allTasks.filter(t => !templateNames.includes(t));
      setSelectedTasks(templateTasks);
      setCustomTasks(custom);
      
      setExtraTasks(Array.isArray(report.extra_tasks_json) ? report.extra_tasks_json as string[] : []);
      setRecommendations(Array.isArray(report.recommendations) ? report.recommendations as string[] : []);
    }
  }, [report, taskTemplates]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("reports").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Raport został utworzony");
      navigate("/panel/raporty");
    },
    onError: (error) => {
      toast.error("Nie udało się utworzyć raportu", { description: error.message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("reports").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      toast.success("Raport został zaktualizowany");
      navigate("/panel/raporty");
    },
    onError: (error) => {
      toast.error("Nie udało się zaktualizować raportu", { description: error.message });
    },
  });

  // Create new task template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("task_templates")
        .insert({ name, category: "standard", sort_order: 100 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      setSelectedTasks([...selectedTasks, data.name]);
      setCreatedTemplateIds(prev => [...prev, data.id]);
      setNewCustomTask("");
      toast.success("Zadanie dodane do szablonów");
    },
    onError: (error) => {
      toast.error("Nie udało się dodać szablonu", { description: error.message });
    },
  });

  // Remove task template (deactivate)
  const deleteTemplateMutation = useMutation({
    mutationFn: async (template: TaskTemplate) => {
      const { error } = await supabase
        .from("task_templates")
        .update({ is_active: false })
        .eq("id", template.id);
      if (error) throw error;
      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      setSelectedTasks(prev => prev.filter(t => t !== template.name));
      setCreatedTemplateIds(prev => prev.filter(id => id !== template.id));
      toast.success("Szablon został usunięty");
    },
    onError: (error) => {
      toast.error("Nie udało się usunąć szablonu", { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!clientId) {
      toast.error("Wybierz klienta");
      return;
    }
    if (!month) {
      toast.error("Wybierz miesiąc");
      return;
    }
    
    // Include pending input values that haven't been added yet
    const finalCustomTasks = newCustomTask.trim() 
      ? [...customTasks, newCustomTask.trim()] 
      : customTasks;
    const finalExtraTasks = newExtraTask.trim() 
      ? [...extraTasks, newExtraTask.trim()] 
      : extraTasks;
    const finalRecommendations = newRecommendation.trim() 
      ? [...recommendations, newRecommendation.trim()] 
      : recommendations;
    
    const allTasks = [...selectedTasks, ...finalCustomTasks];
    
    const data = {
      client_id: clientId,
      month,
      status_text: statusText,
      speed_score_mobile: speedScoreMobile,
      speed_score_desktop: speedScoreDesktop,
      pagespeed_url: pagespeedUrl || null,
      invoice_url: invoiceUrl || null,
      tasks_json: allTasks,
      extra_tasks_json: finalExtraTasks,
      recommendations: finalRecommendations,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleTask = (taskName: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskName)
        ? prev.filter(t => t !== taskName)
        : [...prev, taskName]
    );
  };

  const addCustomTask = () => {
    if (newCustomTask.trim()) {
      setCustomTasks([...customTasks, newCustomTask.trim()]);
      setNewCustomTask("");
    }
  };

  const addCustomTaskAsTemplate = () => {
    if (newCustomTask.trim()) {
      createTemplateMutation.mutate(newCustomTask.trim());
    }
  };

  const removeCustomTask = (index: number) => {
    setCustomTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addExtraTask = () => {
    if (newExtraTask.trim()) {
      setExtraTasks([...extraTasks, newExtraTask.trim()]);
      setNewExtraTask("");
    }
  };

  const removeExtraTask = (index: number) => {
    setExtraTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setRecommendations([...recommendations, newRecommendation.trim()]);
      setNewRecommendation("");
    }
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch PageSpeed data from API
  const handleFetchPageSpeed = async () => {
    const selectedClient = clients?.find(c => c.id === clientId);
    if (!selectedClient?.website_url) {
      toast.error("Klient nie ma przypisanego adresu strony", {
        description: "Dodaj adres strony w ustawieniach klienta"
      });
      return;
    }

    setIsFetchingPageSpeed(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-pagespeed", {
        body: { url: selectedClient.website_url },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setSpeedScoreMobile(data.mobileScore);
      setSpeedScoreDesktop(data.desktopScore);
      setPagespeedUrl(data.pagespeedUrl);
      
      toast.success("Dane PageSpeed zostały pobrane", {
        description: `Mobile: ${data.mobileScore}, Desktop: ${data.desktopScore}`
      });
    } catch (error: unknown) {
      console.error("Error fetching PageSpeed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Nie udało się pobrać danych PageSpeed", {
        description: errorMessage
      });
    } finally {
      setIsFetchingPageSpeed(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingReport) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/panel/raporty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edytuj raport" : "Utwórz raport"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Klient</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Miesiąc raportu</Label>
                <MonthPicker
                  value={month}
                  onChange={setMonth}
                  placeholder="Wybierz miesiąc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Textarea
                  id="status"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="Opis stanu strony..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* PageSpeed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>PageSpeed Insights</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFetchPageSpeed}
                  disabled={isFetchingPageSpeed || !clientId}
                  title={!clientId ? "Najpierw wybierz klienta" : "Pobierz wyniki z Google PageSpeed Insights"}
                >
                  {isFetchingPageSpeed ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Pobierz z API
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Wynik Mobile (0-100)</Label>
                  <Input
                    id="mobile"
                    type="number"
                    min={0}
                    max={100}
                    value={speedScoreMobile}
                    onChange={(e) => setSpeedScoreMobile(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desktop">Wynik Desktop (0-100)</Label>
                  <Input
                    id="desktop"
                    type="number"
                    min={0}
                    max={100}
                    value={speedScoreDesktop}
                    onChange={(e) => setSpeedScoreDesktop(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagespeed-url">Link do raportu PageSpeed</Label>
                <Input
                  id="pagespeed-url"
                  type="url"
                  value={pagespeedUrl}
                  onChange={(e) => setPagespeedUrl(e.target.value)}
                  placeholder="https://pagespeed.web.dev/analysis?url=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Standard Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Wykonane prace (standardowe)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {taskTemplates?.map((template) => {
                  const isNewTemplate = createdTemplateIds.includes(template.id);
                  const isDeletingTemplate =
                    deleteTemplateMutation.isPending &&
                    deleteTemplateMutation.variables?.id === template.id;

                  return (
                    <div key={template.id} className="flex items-center gap-3">
                    <Checkbox
                      id={template.id}
                      checked={selectedTasks.includes(template.name)}
                      onCheckedChange={() => toggleTask(template.name)}
                    />
                    <label
                      htmlFor={template.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {template.name}
                    </label>
                    {isNewTemplate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => deleteTemplateMutation.mutate(template)}
                        disabled={isDeletingTemplate}
                        title="Usuń z szablonów"
                      >
                        {isDeletingTemplate ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* Custom tasks */}
              {customTasks.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-muted-foreground">Dodatkowe (jednorazowe):</Label>
                  {customTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm flex-1">{task}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomTask(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new task */}
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Nowe zadanie..."
                  value={newCustomTask}
                  onChange={(e) => setNewCustomTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTask();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCustomTaskAsTemplate}
                  disabled={!newCustomTask.trim() || createTemplateMutation.isPending}
                  title="Dodaj jako szablon"
                >
                  {createTemplateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "+ Szablon"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Extra Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Prace dodatkowe płatne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {extraTasks.length > 0 && (
                <div className="space-y-2">
                  {extraTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm flex-1">{task}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExtraTask(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Dodaj pracę dodatkową..."
                  value={newExtraTask}
                  onChange={(e) => setNewExtraTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExtraTask();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addExtraTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Rekomendacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length > 0 && (
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm flex-1">{rec}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecommendation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Dodaj rekomendację..."
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRecommendation();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addRecommendation}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice */}
          <Card>
            <CardHeader>
              <CardTitle>Faktura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="invoice">Link do faktury (PDF)</Label>
                <Input
                  id="invoice"
                  type="url"
                  value={invoiceUrl}
                  onChange={(e) => setInvoiceUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : isEditing ? (
                "Zapisz zmiany"
              ) : (
                "Utwórz raport"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/panel/raporty")}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
