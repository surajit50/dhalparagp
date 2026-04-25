"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Droplet,
  Trash,
  Wrench,
  CheckCircle2,
  XCircle,
  Settings,
  CalendarIcon as CalendarIconOutline,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";

enum ServiceType {
  WATER_TANKER = "WATER_TANKER",
  DUSTBIN_VAN = "DUSTBIN_VAN",
}

interface ServiceAvailability {
  id: string;
  serviceType: ServiceType;
  date: Date;
  available: boolean;
  capacity: number;
  booked: number;
  maintenance: boolean;
  notes?: string;
}

interface ServiceFee {
  id: string;
  serviceType: ServiceType;
  amount: number;
}

export default function ServiceManagement() {
  const [availabilities, setAvailabilities] = useState<ServiceAvailability[]>(
    []
  );
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<ServiceType>(
    ServiceType.WATER_TANKER
  );
  const [capacity, setCapacity] = useState(3);
  const [available, setAvailable] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fee management states
  const [waterTankerFee, setWaterTankerFee] = useState(0);
  const [dustbinVanFee, setDustbinVanFee] = useState(0);
const { toast } = useToast()
  useEffect(() => {
    fetchAvailabilities();
    fetchServiceFees();
  }, []);

  const fetchAvailabilities = async () => {
    
    try {
      const response = await fetch("/api/admin/availability");
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(
          data.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching availabilities:", error);
    }
  };

  const fetchServiceFees = async () => {
    try {
      const response = await fetch("/api/admin/service-fees");
      if (response.ok) {
        const data = await response.json();
        setServiceFees(data);

        // Set form values
        const waterFee = data.find(
          (fee: ServiceFee) => fee.serviceType === ServiceType.WATER_TANKER
        );
        const dustbinFee = data.find(
          (fee: ServiceFee) => fee.serviceType === ServiceType.DUSTBIN_VAN
        );

        setWaterTankerFee(waterFee?.amount || 0);
        setDustbinVanFee(dustbinFee?.amount || 0);
      }
    } catch (error) {
      console.error("Error fetching service fees:", error);
    }
  };

  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);
    try {
      const data = {
        serviceType: selectedService,
        date: startOfDay(selectedDate).toISOString(),
        available,
        capacity,
        maintenance,
        notes: notes.trim() || null,
      };

      const url = editingId
        ? `/api/admin/availability/${editingId}`
        : "/api/admin/availability";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Service availability ${
            editingId ? "updated" : "added"
          } successfully`,
          variant: "default",
        });
        resetForm();
        fetchAvailabilities();
      } else {
        throw new Error("Failed to save availability");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceFees = async () => {
    setLoading(true);
    try {
      const fees = [
        { serviceType: ServiceType.WATER_TANKER, amount: waterTankerFee },
        { serviceType: ServiceType.DUSTBIN_VAN, amount: dustbinVanFee },
      ];

      const response = await fetch("/api/admin/service-fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fees }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service fees updated successfully",
          variant: "default",
        });
        fetchServiceFees();
      } else {
        throw new Error("Failed to update fees");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service fees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (availability: ServiceAvailability) => {
    setEditingId(availability.id);
    setSelectedDate(availability.date);
    setSelectedService(availability.serviceType);
    setCapacity(availability.capacity);
    setAvailable(availability.available);
    setMaintenance(availability.maintenance);
    setNotes(availability.notes || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability?")) return;

    try {
      const response = await fetch(`/api/admin/availability/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service availability deleted successfully",
          variant: "default",
        });
        fetchAvailabilities();
      } else {
        throw new Error("Failed to delete availability");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service availability",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(undefined);
    setSelectedService(ServiceType.WATER_TANKER);
    setCapacity(3);
    setAvailable(true);
    setMaintenance(false);
    setNotes("");
  };

  const generateBulkAvailability = async () => {
    if (
      !confirm(
        "Generate availability for the next 30 days with default settings?"
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/availability/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 30 }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bulk availability generated successfully",
          variant: "default",
        });
        fetchAvailabilities();
      } else {
        throw new Error("Failed to generate bulk availability");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bulk availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: ServiceType) => {
    if (serviceType === ServiceType.WATER_TANKER) {
      return <Droplet className="h-5 w-5 text-blue-500" />;
    }
    return <Trash className="h-5 w-5 text-green-500" />;
  };

  const getServiceName = (serviceType: ServiceType) => {
    return serviceType === ServiceType.WATER_TANKER
      ? "Water Tanker"
      : "Dustbin Van";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Service Management
          </h1>
        </div>
        <Button
          onClick={generateBulkAvailability}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate 30 Days
        </Button>
      </div>

      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList className="bg-emerald-50 p-1 rounded-full w-fit">
          <TabsTrigger
            value="availability"
            className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <CalendarIconOutline className="h-4 w-4 mr-2" />
            Service Availability
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Service Fees
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Availability List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {editingId ? "Edit" : "Add"} Service Availability
              </CardTitle>
              <CardDescription className="text-emerald-50">
                Configure service availability for specific dates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitAvailability} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-2",
                            !selectedDate && "text-gray-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-gray-700">
                      Service Type
                    </Label>
                    <Select
                      value={selectedService}
                      onValueChange={(value) =>
                        setSelectedService(value as ServiceType)
                      }
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServiceType.WATER_TANKER}>
                          <div className="flex items-center">
                            <Droplet className="h-4 w-4 mr-2 text-blue-500" />
                            Water Tanker
                          </div>
                        </SelectItem>
                        <SelectItem value={ServiceType.DUSTBIN_VAN}>
                          <div className="flex items-center">
                            <Trash className="h-4 w-4 mr-2 text-green-500" />
                            Dustbin Van
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-gray-700">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      max="20"
                      value={capacity}
                      onChange={(e) =>
                        setCapacity(Number.parseInt(e.target.value) || 0)
                      }
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <Switch
                        id="available"
                        checked={available}
                        onCheckedChange={setAvailable}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <div>
                        <Label
                          htmlFor="available"
                          className="text-gray-700 font-medium"
                        >
                          Available
                        </Label>
                        <p className="text-xs text-gray-500">
                          Service can be booked on this date
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <Switch
                        id="maintenance"
                        checked={maintenance}
                        onCheckedChange={setMaintenance}
                        className="data-[state=checked]:bg-amber-500"
                      />
                      <div>
                        <Label
                          htmlFor="maintenance"
                          className="text-gray-700 font-medium"
                        >
                          Maintenance Mode
                        </Label>
                        <p className="text-xs text-gray-500">
                          Service is under maintenance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-700">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this availability..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-2 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading || !selectedDate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>{editingId ? "Update" : "Add"} Availability</>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-2"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Fees
              </CardTitle>
              <CardDescription className="text-emerald-50">
                Configure pricing for each service type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Droplet className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      Water Tanker Fee
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water-fee" className="text-gray-700">
                      Amount (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        id="water-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={waterTankerFee}
                        onChange={(e) =>
                          setWaterTankerFee(
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="pl-8 border-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Trash className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Dustbin Van Fee
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dustbin-fee" className="text-gray-700">
                      Amount (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        id="dustbin-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={dustbinVanFee}
                        onChange={(e) =>
                          setDustbinVanFee(
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="pl-8 border-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateServiceFees}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  "Update Service Fees"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Current Availability
              </CardTitle>
              <CardDescription className="text-emerald-50">
                Manage existing service availability entries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {availabilities.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">
                      No availability entries found.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Add some using the form in the Service Availability tab.
                    </p>
                  </div>
                ) : (
                  availabilities.map((availability) => (
                    <div
                      key={availability.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            availability.serviceType ===
                            ServiceType.WATER_TANKER
                              ? "bg-blue-100"
                              : "bg-green-100"
                          }`}
                        >
                          {getServiceIcon(availability.serviceType)}
                        </div>

                        <div>
                          <div className="font-medium text-gray-800">
                            {getServiceName(availability.serviceType)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(availability.date, "PPP")}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {availability.available ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800 hover:bg-red-200 border-0"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Unavailable
                            </Badge>
                          )}

                          {availability.maintenance && (
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                            >
                              <Wrench className="h-3.5 w-3.5 mr-1" />
                              Maintenance
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                          <span className="font-medium">
                            {availability.booked}
                          </span>
                          <span className="text-gray-500"> / </span>
                          <span className="font-medium">
                            {availability.capacity}
                          </span>
                          <span className="text-gray-500"> booked</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(availability)}
                          className="border-2 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(availability.id)}
                          className="border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
