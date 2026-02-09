import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportInvoiceProps {
  invoiceUrl?: string | null;
}

export const ReportInvoice = ({ invoiceUrl }: ReportInvoiceProps) => {
  const handleDownload = () => {
    if (!invoiceUrl) return;
    window.open(invoiceUrl, "_blank");
  };

  return (
    <div
      className="animate-fade-in-up space-y-4 py-8"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Faktura do pobrania</h2>
          <p className="text-sm text-muted-foreground">
            Pobierz fakturę za ten miesiąc
          </p>
        </div>
        {invoiceUrl && (
          <Button onClick={handleDownload} className="w-full gap-2 rounded-lg sm:w-auto">
            <Download className="h-4 w-4" />
            Pobierz fakturę
          </Button>
        )}
      </div>
    </div>
  );
};
