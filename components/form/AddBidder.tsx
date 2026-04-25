"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AgencyDetails } from "@prisma/client";
import { ChevronDown, Check, Search, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { addBiderDetails, getAgencyDetails } from "@/action/bookNitNuber";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

/* ---------------- SCHEMA ---------------- */

export const biderdetailsValidationSchema = z.object({
  bidderdetails: z.array(z.string()).min(1, "Please select at least one bidder"),
});

type FormValues = z.infer<typeof biderdetailsValidationSchema>;

interface Props {
  workid: string;
}

/* ---------------- COMPONENT ---------------- */

export default function AddBidderTechnicalDetails({ workid }: Props) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<FormValues>({
    defaultValues: { bidderdetails: [] },
    resolver: zodResolver(biderdetailsValidationSchema),
  });

  const { data: agencyList, isLoading } = useQuery<AgencyDetails[]>({
    queryKey: ["getAgencyDetails"],
    queryFn: async () => (await getAgencyDetails()) || [],
  });

  const filteredAgencies = useMemo(() => {
    if (!agencyList) return [];
    return agencyList.filter(
      (agency) =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agencyList, searchTerm]);

  const selectedIds = form.watch("bidderdetails");

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAgencies.length) {
      form.setValue("bidderdetails", []);
    } else {
      form.setValue(
        "bidderdetails",
        filteredAgencies.map((a) => a.id)
      );
    }
  };

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const result = await addBiderDetails(values, workid);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: result?.success || "Bidders added successfully",
        });
        form.reset();
      }
    },
    [form, workid, toast]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-6 w-6 border-2 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card className="border border-gray-300 shadow-sm">
      <CardHeader className="bg-orange-100 border-b border-gray-300 py-3">
        <CardTitle className="text-orange-900 text-base font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Add Bidders
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Select Bidders Field */}
            <FormField
              control={form.control}
              name="bidderdetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Bidders</FormLabel>
                  <FormControl>

                    {/* Dialog Trigger */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full justify-between"
                    >
                      <span>
                        {field.value.length > 0
                          ? `${field.value.length} bidder selected`
                          : "Choose bidders"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>

                  </FormControl>
                  <FormDescription>
                    Minimum 1 bidder required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Adding..."
                : "Add Selected Bidders"}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* ---------------- MODAL ---------------- */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">

          <DialogHeader>
            <DialogTitle className="text-orange-700">
              Select Bidders
            </DialogTitle>
          </DialogHeader>

          {/* Search + Select All */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSelectAll}
            >
              {selectedIds.length === filteredAgencies.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          {/* Agency List */}
          <ScrollArea className="h-[350px] border rounded-md">
            <div className="divide-y">
              {filteredAgencies.length > 0 ? (
                filteredAgencies.map((agency) => {
                  const checked = selectedIds.includes(agency.id);

                  return (
                    <div
                      key={agency.id}
                      className={cn(
                        "flex items-start gap-3 p-3 hover:bg-orange-50 transition",
                        checked && "bg-orange-100"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const newValue = value
                            ? [...selectedIds, agency.id]
                            : selectedIds.filter((id) => id !== agency.id);

                          form.setValue("bidderdetails", newValue);
                        }}
                      />

                      <div className="flex-1">
                        <div className="font-medium">
                          {agency.name}
                        </div>

                        {agency.agencyType === "FARM" &&
                          agency.proprietorName && (
                            <div className="text-xs text-muted-foreground">
                              Proprietor: {agency.proprietorName}
                            </div>
                          )}

                        {agency.email && (
                          <div className="text-xs text-muted-foreground">
                            {agency.email}
                          </div>
                        )}
                      </div>

                      {checked && (
                        <Check className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No matching bidders found
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>

            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Apply
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </Card>
  );
}
