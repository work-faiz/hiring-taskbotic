
import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Label } from "@/components/ui/label";

export interface ApplicationDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
}

export function ApplicationDatePicker({ value, onChange }: ApplicationDatePickerProps) {
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(
    value ? parseISO(value) : new Date()
  );

  React.useEffect(() => {
    if (calendarDate) {
      onChange(format(calendarDate, "yyyy-MM-dd"));
    }
  }, [calendarDate]);

  React.useEffect(() => {
    if (value && !isNaN(Date.parse(value))) {
      setCalendarDate(parseISO(value));
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="application_date" className="text-white">Application Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal border-gray-300",
              !calendarDate && "text-muted-foreground"
            )}
          >
            {calendarDate ? (
              <span>{format(calendarDate, "PPP")}</span>
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarDays className="ml-auto h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={setCalendarDate}
            initialFocus
            toDate={new Date()}
            className={cn("p-3")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
