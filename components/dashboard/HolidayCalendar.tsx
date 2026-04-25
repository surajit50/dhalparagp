"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { X, Landmark } from "lucide-react";
import { format, getDay, getDate } from "date-fns";
import { motion } from "framer-motion";

interface Holiday {
  id: string;
  date: Date;
  name: string;
  description?: string | null;
  dateStr?: string;
}

export function HolidayCalendarNIC() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [dbHolidays, setDbHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/holidays");
        const data = await res.json();

        const formatted = data.map((h: any) => {
          const d = new Date(h.date);
          return {
            ...h,
            date: d,
            dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0",
            )}-${String(d.getDate()).padStart(2, "0")}`,
          };
        });

        setDbHolidays(formatted);
      } catch (err) {
        console.error("Holiday fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // Weekly holiday logic
  const isWeeklyHoliday = (date: Date) => {
    const day = getDay(date);

    if (day === 0) return true; // Sunday

    if (day === 6) {
      const weekNumber = Math.ceil(getDate(date) / 7);
      return weekNumber !== 2 && weekNumber !== 4;
    }

    return false;
  };

  // Get holiday name
  const getHolidayName = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    const dateStr = `${y}-${m}-${d}`;

    const db = dbHolidays.find((h) => h.dateStr === dateStr);
    if (db) return db.name;

    if (isWeeklyHoliday(date)) {
      return `Weekly Holiday (${format(date, "EEEE")})`;
    }

    return null;
  };

  const holidayName = selectedDate ? getHolidayName(selectedDate) : null;

  // Calendar highlight
  const modifiers = useMemo(
    () => ({
      holiday: (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");

        const dateStr = `${y}-${m}-${d}`;

        const inDb = dbHolidays.some((h) => h.dateStr === dateStr);

        return inDb || isWeeklyHoliday(date);
      },
    }),
    [dbHolidays],
  );

  return (
    <>
      {/* Floating Button (NIC style) */}
      <div className="fixed bottom-6 right-6 z-50 rounded-full">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 0 0px rgba(30, 58, 138, 0.4)",
              "0 0 0 15px rgba(30, 58, 138, 0)",
              "0 0 0 0px rgba(30, 58, 138, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-2 border-2 border-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Landmark className="w-5 h-5" />
            <span className="hidden md:inline">Holiday Calendar</span>
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[500px] max-w-[95%] border rounded-md shadow-md">
            {/* Header */}
            <div className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center border-b">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-semibold">Holiday Calendar</h3>
                  <p className="text-xs opacity-80">
                    Government of West Bengal
                  </p>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Calendar with rectangular cells and red holiday highlight */}
              <div className="border rounded-md p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersClassNames={{
                    holiday: "bg-red-600 text-white font-semibold rounded",
                  }}
                  classNames={{
                    day: "h-9 w-12 text-sm p-0 font-normal aria-selected:opacity-100",
                    head_cell:
                      "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]",
                    cell: "h-9 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                  }}
                />
              </div>

              {/* Info Panel */}
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                {holidayName ? (
                  <>
                    <p className="text-sm font-semibold text-blue-900">
                      {holidayName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {format(selectedDate!, "EEEE, dd MMM yyyy")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    No holiday on selected date
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-right text-xs text-gray-400">
                {format(new Date(), "yyyy")} Govt Calendar
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
