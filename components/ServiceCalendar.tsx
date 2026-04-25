"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isAfter,
  startOfDay,
  getDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Wrench,
  CalendarIcon,
  Droplet,
  Trash,
} from "lucide-react";

// Types
enum ServiceType {
  WATER_TANKER = "WATER_TANKER",
  DUSTBIN_VAN = "DUSTBIN_VAN",
}

interface ServiceAvailability {
  id: string;
  date: Date;
  serviceType: ServiceType;
  available: boolean;
  booked: number;
  capacity: number;
  maintenance: boolean;
}

interface CalendarProps {
  onDayClick?: (date: Date, serviceType: ServiceType) => void;
}

interface ServiceCapacity {
  [ServiceType.WATER_TANKER]: number;
  [ServiceType.DUSTBIN_VAN]: number;
}

const ServiceCalendar = ({ onDayClick }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [serviceCapacities, setServiceCapacities] =
    useState<ServiceCapacity | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | "ALL">(
    "ALL"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        // Fetch capacities and availability in parallel
        const [capacitiesRes, availabilityRes] = await Promise.all([
          fetch("/api/capacities"),
          fetch("/api/availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start: start.toISOString(),
              end: end.toISOString(),
            }),
          }),
        ]);

        if (capacitiesRes.ok) {
          const capacitiesData = await capacitiesRes.json();
          setServiceCapacities(capacitiesData);
        } else {
          console.error("Failed to fetch service capacities");
        }

        if (availabilityRes.ok) {
          const availabilityData = await availabilityRes.json();
          setAvailability(availabilityData);
        } else {
          console.warn("API unavailable, using default availability logic");
          setAvailability([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Calculate empty cells for the start of the month
  const firstDayOfMonth = getDay(startOfMonth(currentDate));
  const emptyDaysAtStart = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getServiceStatus = (date: Date, serviceType: ServiceType) => {
    const today = startOfDay(new Date());
    const targetDate = startOfDay(date);
    const isPastDate =
      !isAfter(targetDate, today) && !isSameDay(targetDate, today);

    // Check if we have specific availability data
    const entry = availability.find(
      (a) => isSameDay(new Date(a.date), date) && a.serviceType === serviceType
    );

    // Get capacity from database or use default if not available
    const defaultCapacity = serviceCapacities?.[serviceType] || 3;

    if (entry) {
      return {
        available: entry.available && !isPastDate,
        booked: entry.booked,
        capacity: entry.capacity,
        maintenance: entry.maintenance,
        isPast: isPastDate,
      };
    }

    // Default logic for dates without specific data
    if (isPastDate) {
      return {
        available: false,
        booked: 0,
        capacity: defaultCapacity,
        maintenance: false,
        isPast: true,
      };
    }

    // Future dates get default capacity
    return {
      available: true,
      booked: 0,
      capacity: defaultCapacity,
      maintenance: false,
      isPast: false,
    };
  };

  // Different color schemes for each service type
  const getStatusColor = (
    serviceType: ServiceType,
    status: ReturnType<typeof getServiceStatus>
  ) => {
    // Common colors for all services
    if (status.isPast) return "bg-gray-100 text-gray-500 border-gray-200";
    if (status.maintenance)
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    if (!status.available)
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";

    // Service-specific colors
    if (serviceType === ServiceType.WATER_TANKER) {
      if (status.booked >= status.capacity)
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    } else {
      if (status.booked >= status.capacity)
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    }
  };

  const getStatusText = (status: ReturnType<typeof getServiceStatus>) => {
    if (status.isPast) return "Past date";
    if (status.maintenance) return "Maintenance";
    if (!status.available) return "Unavailable";
    if (status.booked >= status.capacity) return "Fully booked";
    return `${status.capacity - status.booked} slots left`;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-4 sm:p-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="rounded-full p-2 sm:px-4 sm:py-2"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Previous</span>
            </Button>

            <div className="flex items-center gap-2 mx-2 sm:mx-0">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {format(currentDate, "MMMM yyyy")}
              </h2>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="rounded-full p-2 sm:px-4 sm:py-2"
              aria-label="Next month"
            >
              <span className="hidden sm:inline mr-2">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Service Filter - Full width on mobile */}
        <div className="mb-4 sm:mb-6">
          <Select
            value={selectedService}
            onValueChange={(value) =>
              setSelectedService(value as ServiceType | "ALL")
            }
          >
            <SelectTrigger className="w-full sm:w-48 border-2 rounded-full">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              <SelectItem value={ServiceType.WATER_TANKER}>
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  Water Tanker
                </div>
              </SelectItem>
              <SelectItem value={ServiceType.DUSTBIN_VAN}>
                <div className="flex items-center gap-2">
                  <Trash className="h-4 w-4 text-green-500" />
                  Dustbin Van
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend - Responsive with service-specific colors */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium mb-2">Water Tanker Status</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs sm:text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-gray-700">Fully Booked</span>
            </div>
          </div>

          <h3 className="text-sm font-medium mb-2">Dustbin Van Status</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-50 border border-purple-200 rounded"></div>
              <span className="text-gray-700">Fully Booked</span>
            </div>
          </div>

          <h3 className="text-sm font-medium mt-4 mb-2">Common Status</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
              <span className="text-gray-700">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-700">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-gray-700">Past Date</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid - Mobile Optimized */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          {/* Day Headers - Abbreviated on mobile */}
          <div className="grid grid-cols-7 bg-gray-50">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div
                key={day}
                className="text-center font-medium p-2 text-xs sm:text-sm text-gray-600 border-b"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before the start of the month */}
            {emptyDaysAtStart.map((index) => (
              <div
                key={`empty-${index}`}
                className="min-h-20 p-1 bg-gray-50 border-r border-b"
              ></div>
            ))}

            {/* Actual days of the month */}
            {daysInMonth.map((day) => {
              const waterTanker = getServiceStatus(
                day,
                ServiceType.WATER_TANKER
              );
              const dustbinVan = getServiceStatus(day, ServiceType.DUSTBIN_VAN);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-20 p-1 border-r border-b transition-colors ${
                    isCurrentMonth ? "bg-white" : "bg-gray-50"
                  } ${isToday ? "ring-1 ring-blue-500 ring-inset" : ""}`}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                        isCurrentMonth ? "text-gray-900" : "text-gray-400"
                      } ${
                        isToday
                          ? "bg-blue-500 text-white"
                          : isCurrentMonth
                          ? "hover:bg-gray-100"
                          : "bg-gray-50"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {isToday && (
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs border-blue-200 text-blue-700 bg-blue-50"
                      >
                        Today
                      </Badge>
                    )}
                  </div>

                  {/* Water Tanker Service */}
                  {(selectedService === "ALL" ||
                    selectedService === ServiceType.WATER_TANKER) && (
                    <div
                      className={`mb-1 text-[10px] sm:text-xs p-1 rounded-lg border transition-all ${getStatusColor(
                        ServiceType.WATER_TANKER,
                        waterTanker
                      )} ${
                        !waterTanker.isPast
                          ? "hover:shadow-md cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                      onClick={() =>
                        !waterTanker.isPast &&
                        onDayClick?.(day, ServiceType.WATER_TANKER)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Droplet className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                          <span className="hidden sm:inline">Water</span>
                        </div>
                        {waterTanker.maintenance && (
                          <Wrench className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-0.5 font-medium truncate">
                        {waterTanker.isPast
                          ? "Past"
                          : waterTanker.maintenance
                          ? "Maint"
                          : waterTanker.booked >= waterTanker.capacity
                          ? "Full"
                          : `${waterTanker.capacity - waterTanker.booked} left`}
                      </div>
                    </div>
                  )}

                  {/* Dustbin Van Service */}
                  {(selectedService === "ALL" ||
                    selectedService === ServiceType.DUSTBIN_VAN) && (
                    <div
                      className={`text-[10px] sm:text-xs p-1 rounded-lg border transition-all ${getStatusColor(
                        ServiceType.DUSTBIN_VAN,
                        dustbinVan
                      )} ${
                        !dustbinVan.isPast
                          ? "hover:shadow-md cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                      onClick={() =>
                        !dustbinVan.isPast &&
                        onDayClick?.(day, ServiceType.DUSTBIN_VAN)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                          <span className="hidden sm:inline">Dustbin</span>
                        </div>
                        {dustbinVan.maintenance && (
                          <Wrench className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-0.5 font-medium truncate">
                        {dustbinVan.isPast
                          ? "Past"
                          : dustbinVan.maintenance
                          ? "Maint"
                          : dustbinVan.booked >= dustbinVan.capacity
                          ? "Full"
                          : `${dustbinVan.capacity - dustbinVan.booked} left`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="text-center mt-4 sm:mt-6 py-3 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading availability...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCalendar;
