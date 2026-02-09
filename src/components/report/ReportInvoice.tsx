import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Receipt } from "lucide-react";

interface ReportInvoiceProps {
  invoiceUrl?: string | null;
  invoiceComment?: string | null;
}

export const ReportInvoice = ({ invoiceUrl, invoiceComment }: ReportInvoiceProps) => {
  const handleDownload = () => {
    if (!invoiceUrl) return;
    window.open(invoiceUrl, "_blank");
  };

  return (
    <Card className="animate-fade-in-up overflow-hidden border-0 shadow-soft" style={{ animationDelay: "0.6s" }}>
      <CardContent className="p-6">
        {invoiceComment && (
          <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Dodatkowe informacje</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {invoiceComment}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
            <Receipt className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Faktura do pobrania</h3>
            <p className="text-sm text-muted-foreground">
              Pobierz fakturę za ten miesiąc
            </p>
          </div>
        </div>
        {invoiceUrl && (
          <Button onClick={handleDownload} className="w-full gap-2 rounded-lg sm:w-auto">
            <Download className="h-4 w-4" />
            Pobierz fakturę
          </Button>
        )}
        </div>
      </CardContent>
    </Card>
  );
};
