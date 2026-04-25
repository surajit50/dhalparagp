"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white rounded-md border shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",

        // Caption (Month + Year + Nav)
        caption: "flex justify-center pt-1 relative items-center px-10",
        caption_label: "text-sm font-semibold flex items-center h-7",

        // Dropdown Support
        caption_dropdowns: "flex justify-center gap-1.5 items-center mx-2",
        dropdown:
          "px-2 py-0.5 border rounded-md bg-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]%20bg-[length:12px]%20bg-[right_6px_center]%20bg-no-repeat",
        dropdown_month: "relative inline-flex items-center",
        dropdown_year: "relative inline-flex items-center",
        vhidden: "hidden visually-hidden sr-only", // Standard way to hide label in v8 when dropdowns are active

        // Navigation
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity z-10",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",

        // Table Layout
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-medium text-[0.75rem]",

        row: "flex w-full mt-2",

        cell: "relative h-9 w-9 text-center text-sm p-0 focus-within:z-20",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal transition-colors",
        ),

        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",

        day_today: "bg-accent text-accent-foreground font-semibold",

        day_outside: "text-muted-foreground opacity-40",

        day_disabled: "text-muted-foreground opacity-40 cursor-not-allowed",

        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
