"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit p-3", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "inline-flex items-center gap-1 text-sm font-medium",
        dropdowns: "flex items-center gap-1",
        dropdown_root:
          "relative inline-flex items-center rounded-md border border-input bg-background px-2 py-1 has-[select:focus]:border-ring has-[select:focus]:ring-2 has-[select:focus]:ring-ring/30",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        chevron: "h-4 w-4 text-muted-foreground",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "border-b",
        weekday: "h-9 w-9 text-center text-[0.8rem] font-normal text-muted-foreground",
        week: "border-b last:border-b-0",
        day: "h-11 w-11 p-0 text-center text-sm",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "ring-1 ring-ring ring-offset-1 ring-offset-background",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation = "left", ...iconProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
          }
          return <ChevronDown className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
        }
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
