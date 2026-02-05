import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ClientsList from "./pages/admin/ClientsList";
import ClientForm from "./pages/admin/ClientForm";
import ReportsList from "./pages/admin/ReportsList";
import ReportForm from "./pages/admin/ReportForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reports/:id" element={<Report />} />
            
            {/* Admin routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/manage-xyz"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/clients"
              element={
                <ProtectedRoute>
                  <ClientsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/clients/new"
              element={
                <ProtectedRoute>
                  <ClientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/clients/:id/edit"
              element={
                <ProtectedRoute>
                  <ClientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/reports"
              element={
                <ProtectedRoute>
                  <ReportsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/reports/new"
              element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-xyz/reports/:id/edit"
              element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
