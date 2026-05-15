"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Loader2, Truck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking } from "@/action/bookings";
import { getServiceFee } from "@/action/service-fee";
import { getAvailableSlots } from "@/action/availability";
import { useRouter, useSearchParams } from "next/navigation";

type ServiceType = "WATER_TANKER" | "DUSTBIN_VAN";

const formSchema = z.object({
  selectedServices: z
    .array(z.enum(["WATER_TANKER", "DUSTBIN_VAN"]))
    .min(1, "Please select at least one service"),
  name: z.string().min(1, "Name is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  bookingDate: z.date({
    required_error: "Booking date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TankerBookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedServices: [],
      name: "",
      address: "",
      phone: "",
      bookingDate: undefined,
    },
  });

  const selectedServices = form.watch("selectedServices");
  const bookingDate = form.watch("bookingDate");

  const today = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    []
  );

  // Set booking date from URL
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        form.setValue("bookingDate", parsed);
      }
    }
  }, [searchParams, form]);

  // Fetch Fees
  const waterTankerFee = useQuery({
    queryKey: ["serviceFee", "WATER_TANKER"],
    queryFn: () => getServiceFee("WATER_TANKER"),
  });

  const dustbinVanFee = useQuery({
    queryKey: ["serviceFee", "DUSTBIN_VAN"],
    queryFn: () => getServiceFee("DUSTBIN_VAN"),
  });

  // Fetch Slots
  const waterTankerSlots = useQuery({
    queryKey: ["slots", "WATER_TANKER", bookingDate],
    queryFn: () => getAvailableSlots("WATER_TANKER", bookingDate!),
    enabled: !!bookingDate && selectedServices.includes("WATER_TANKER"),
  });

  const dustbinVanSlots = useQuery({
    queryKey: ["slots", "DUSTBIN_VAN", bookingDate],
    queryFn: () => getAvailableSlots("DUSTBIN_VAN", bookingDate!),
    enabled: !!bookingDate && selectedServices.includes("DUSTBIN_VAN"),
  });

  // Calculate total
  const totalAmount = useMemo(() => {
    let total = 0;

    if (
      selectedServices.includes("WATER_TANKER") &&
      waterTankerFee.data?.data?.amount
    ) {
      total += waterTankerFee.data.data.amount;
    }

    if (
      selectedServices.includes("DUSTBIN_VAN") &&
      dustbinVanFee.data?.data?.amount
    ) {
      total += dustbinVanFee.data.data.amount;
    }

    return total;
  }, [selectedServices, waterTankerFee.data, dustbinVanFee.data]);

  const hasSlots = (slots?: number) =>
    typeof slots === "number" && slots > 0;

  const allSlotsAvailable = useMemo(() => {
    if (!bookingDate || selectedServices.length === 0) return false;

    return selectedServices.every((service) => {
      if (service === "WATER_TANKER")
        return hasSlots(waterTankerSlots.data?.data);

      if (service === "DUSTBIN_VAN")
        return hasSlots(dustbinVanSlots.data?.data);

      return false;
    });
  }, [
    bookingDate,
    selectedServices,
    waterTankerSlots.data,
    dustbinVanSlots.data,
  ]);

  const isFetchingSlots =
    waterTankerSlots.isFetching || dustbinVanSlots.isFetching;

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await Promise.all(
        values.selectedServices.map((service) =>
          createBooking({
            ...values,
            serviceType: service,
            amount:
              service === "WATER_TANKER"
                ? waterTankerFee.data?.data?.amount ?? 0
                : dustbinVanFee.data?.data?.amount ?? 0,
          })
        )
      );
    },

    onSuccess: (_, values) => {
      toast({
        title: "Booking Successful",
        description: `Service booked for ${format(
          values.bookingDate,
          "PPP"
        )}`,
      });

      form.reset();
      router.refresh();
    },

    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    !!bookingDate &&
    selectedServices.length > 0 &&
    allSlotsAvailable &&
    !isFetchingSlots &&
    !bookingMutation.isPending;

  const services = [
    {
      type: "WATER_TANKER" as ServiceType,
      label: "Water Tanker",
      icon: <Truck className="h-4 w-4 text-orange-600" />,
      fee: waterTankerFee,
      slots: waterTankerSlots,
    },
    {
      type: "DUSTBIN_VAN" as ServiceType,
      label: "Dustbin Van",
      icon: <Trash2 className="h-4 w-4 text-green-600" />,
      fee: dustbinVanFee,
      slots: dustbinVanSlots,
    },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Service Booking</CardTitle>
        <CardDescription>
          Book water tanker and dustbin van services
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              bookingMutation.mutate(v)
            )}
            className="space-y-6"
          >
            {/* Services */}
            <FormField
              control={form.control}
              name="selectedServices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Services</FormLabel>

                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    {services.map((service) => {
                      const checked = field.value.includes(service.type);

                      const noSlots =
                        bookingDate &&
                        typeof service.slots.data?.data === "number" &&
                        service.slots.data.data === 0;

                      return (
                        <div
                          key={service.type}
                          className="border rounded-lg p-4 flex gap-3"
                        >
                          <Checkbox
                            checked={checked}
                            disabled={
                              bookingMutation.isPending || noSlots
                            }
                            onCheckedChange={(c) => {
                              if (c) {
                                field.onChange(
                                  Array.from(
                                    new Set([
                                      ...field.value,
                                      service.type,
                                    ])
                                  )
                                );
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (v) => v !== service.type
                                  )
                                );
                              }
                            }}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {service.icon}
                              <span className="font-medium">
                                {service.label}
                              </span>
                            </div>

                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              {service.fee.isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>₹{service.fee.data?.data?.amount}</>
                              )}
                            </div>

                            {bookingDate && checked && (
                              <div className="text-xs mt-1">
                                {service.slots.isFetching ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : noSlots ? (
                                  <span className="text-red-500 font-medium">
                                    Fully booked
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    {service.slots.data?.data} slots
                                    available
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Customer name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Booking Date */}
            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Date</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) =>
                          date && field.onChange(date)
                        }
                        disabled={(date) => date < today}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {bookingDate && selectedServices.length > 0 && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span>{format(bookingDate, "PPP")}</span>
                </div>

                <div className="flex justify-between font-semibold mt-2">
                  <span>Total:</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Book Service (₹${totalAmount.toLocaleString()})`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
