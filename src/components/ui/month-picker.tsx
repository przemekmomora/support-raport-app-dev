import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, setMonth, setYear, getMonth, getYear } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MONTHS_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień",
  "Maj", "Czerwiec", "Lipiec", "Sierpień",
  "Wrzesień", "Październik", "Listopad", "Grudzień"
];

interface MonthPickerProps {
  value?: string; // Format: "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
}

const MonthPicker = React.forwardRef<HTMLButtonElement, MonthPickerProps>(
  ({ value, onChange, placeholder = "Wybierz miesiąc" }, ref) => {
    const [open, setOpen] = React.useState(false);
    
    // Parse the value or use current date
    const currentDate = value ? new Date(value) : new Date();
    const [viewYear, setViewYear] = React.useState(getYear(currentDate));
    
    const selectedMonth = value ? getMonth(new Date(value)) : null;
    const selectedYear = value ? getYear(new Date(value)) : null;

    const handleMonthSelect = (monthIndex: number) => {
      const newDate = setMonth(setYear(new Date(), viewYear), monthIndex);
      // Format as YYYY-MM-01
      const formatted = format(newDate, "yyyy-MM-01");
      onChange(formatted);
      setOpen(false);
    };

    const handlePrevYear = () => setViewYear(prev => prev - 1);
    const handleNextYear = () => setViewYear(prev => prev + 1);

    const displayValue = value 
      ? format(new Date(value), "LLLL yyyy", { locale: pl })
      : null;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue ? (
              <span className="capitalize">{displayValue}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
          <div className="space-y-4">
            {/* Year navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handlePrevYear}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{viewYear}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleNextYear}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Months grid */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS_PL.map((monthName, index) => {
                const isSelected = selectedMonth === index && selectedYear === viewYear;
                return (
                  <Button
                    key={monthName}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    type="button"
                    className={cn(
                      "h-9 text-sm",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {monthName.slice(0, 3)}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

MonthPicker.displayName = "MonthPicker";

export { MonthPicker };
