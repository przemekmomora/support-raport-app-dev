import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error("Błąd logowania", {
        description: "Nieprawidłowy email lub hasło",
      });
      setIsSubmitting(false);
      return;
    }

    toast.success("Zalogowano pomyślnie");
    navigate("/panel");
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast.error("Brak emaila", {
        description: "Podaj adres email, aby wysłać link do resetu hasła",
      });
      return;
    }

    setIsResetting(true);
    const { error } = await resetPassword(email.trim());

    if (error) {
      toast.error("Nie udało się wysłać linku", {
        description: "Spróbuj ponownie za chwilę",
      });
      setIsResetting(false);
      return;
    }

    toast.success("Wysłano link do resetu hasła", {
      description: "Sprawdź swoją skrzynkę pocztową",
    });
    setIsResetting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Panel Administracyjny</CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać raportami</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={handleResetPassword}
              disabled={isSubmitting || isResetting}
            >
              {isResetting ? "Wysyłanie linku..." : "Nie pamiętasz hasła?"}
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logowanie...
                </>
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
