interface ReportAdditionalInfoProps {
  infoText: string;
}

export const ReportAdditionalInfo = ({ infoText }: ReportAdditionalInfoProps) => {
  return (
    <div
      className="animate-fade-in-up space-y-4 py-6"
      style={{ animationDelay: "0.55s" }}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">
          Dodatkowe informacje
        </h2>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {infoText}
      </p>
    </div>
  );
};
