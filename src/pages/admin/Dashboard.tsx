import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, LogOut, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const { data: clientsCount } = useQuery({
    queryKey: ["clients-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: reportsCount } = useQuery({
    queryKey: ["reports-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Panel Administracyjny</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Klienci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsCount ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Raporty</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsCount ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Zarządzanie klientami</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                <Link to="/panel/klienci">
                  <Users className="mr-2 h-4 w-4" />
                  Lista klientów
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/panel/klienci/nowy">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj klienta
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zarządzanie raportami</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                <Link to="/panel/raporty">
                  <FileText className="mr-2 h-4 w-4" />
                  Lista raportów
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/panel/raporty/nowy">
                  <Plus className="mr-2 h-4 w-4" />
                  Utwórz raport
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
