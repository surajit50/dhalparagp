"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SCHEME_FUNDS, getFundDisplayName } from "@/constants/funds";

// Validation schema – adjust fields to match your Prisma model
const formSchema = z.object({
  activityName: z.string().min(1, "Activity name is required"),
  activityCode: z.string().optional(),
  activityDescription: z.string().optional(),
  financialYear: z.string().min(1, "Financial year is required"),
  themeName: z.string().optional(),
  activityFor: z.string().optional(),
  sector: z.string().optional(),
  locationofAsset: z.string().optional(),
  estimatedCost: z.number().min(0).default(0),
  generalFund: z.number().min(0).default(0),
  scFund: z.number().min(0).default(0),
  stFund: z.number().min(0).default(0),
  fundType: z.string().optional(),
  totalduration: z.string().optional(),
  schemeName: z.string().optional(),
  upasamiti: z.string().optional(),
  focusArea: z.string().optional(),
  workType: z.string().optional(),
  componentType: z.string().optional(),
  gramSansad: z.string().optional(),
  sdgs: z.string().optional(),
  beneficiariesSC: z.number().min(0).default(0),
  beneficiariesST: z.number().min(0).default(0),
  beneficiariesGen: z.number().min(0).default(0),
  unitType: z.string().optional(),
  totalUnit: z.number().min(0).default(0),
  implementedBy: z.string().optional(),
  remarks: z.string().optional(),
  isPublish: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ActionPlanFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ActionPlanForm({ initialData, onSubmit, isSubmitting = false }: ActionPlanFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimatedCost: 0,
      generalFund: 0,
      scFund: 0,
      stFund: 0,
      beneficiariesSC: 0,
      beneficiariesST: 0,
      beneficiariesGen: 0,
      totalUnit: 0,
      isPublish: false,
      ...initialData,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  // Optional: show fund mismatch warning
  const estimatedCost = form.watch("estimatedCost");
  const generalFund = form.watch("generalFund");
  const scFund = form.watch("scFund");
  const stFund = form.watch("stFund");
  const totalFund = (generalFund || 0) + (scFund || 0) + (stFund || 0);
  const isFundMatched = estimatedCost > 0 && totalFund === estimatedCost;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="border-l-4 border-blue-500 pl-4 space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="themeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Poverty Free and Enhanced Livelihoods Village">
                        Theme_1 – Poverty Free and Enhanced Livelihoods Village
                      </SelectItem>
                      <SelectItem value="Healthy Village">Theme_2 – Healthy Village</SelectItem>
                      <SelectItem value="Child Friendly Village">Theme_3 – Child Friendly Village</SelectItem>
                      <SelectItem value="Water Sufficient Village">Theme_4 – Water Sufficient Village</SelectItem>
                      <SelectItem value="Clean and Green Village">Theme_5 – Clean and Green Village</SelectItem>
                      <SelectItem value="Self sufficient Infrastructure in Village">
                        Theme_6 – Self sufficient Infrastructure in Village
                      </SelectItem>
                      <SelectItem value="Socially Just and Socially Secured Village">
                        Theme_7 – Socially Just and Socially Secured Village
                      </SelectItem>
                      <SelectItem value="Village with Good Governance">
                        Theme_8 – Village with Good Governance
                      </SelectItem>
                      <SelectItem value="Women Friendly Village">Theme_9 – Women Friendly Village</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Group">Group</SelectItem>
                      <SelectItem value="Institution">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Roads">Roads</SelectItem>
                      <SelectItem value="Water">Water</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="activityDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Funding & Budget Section – Scheme Source dropdown uses getFundDisplayName */}
        <div className="border-l-4 border-green-500 pl-4 space-y-4">
          <h3 className="text-lg font-semibold">Funding & Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-green-50/50 p-4 rounded-lg border border-green-100">
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="schemeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheme Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Scheme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-80">
                        {SCHEME_FUNDS.map((group, idx) => (
                          <SelectGroup key={idx}>
                            <SelectLabel className="font-bold text-gray-900 bg-gray-100 sticky top-0">
                              {group.category}
                            </SelectLabel>
                            {group.funds.map((fund) => (
                              <SelectItem key={fund} value={fund}>
                                {getFundDisplayName(fund)}  {/* ✅ Shows friendly name */}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fundType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select fund type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tied">Tied</SelectItem>
                      <SelectItem value="Untied">Untied</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalduration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Duration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generalFund"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Fund (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scFund"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SC Fund (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stFund"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ST Fund (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {estimatedCost > 0 && (
            <div className={`p-3 rounded-md flex items-center justify-between ${isFundMatched ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="text-sm">
                <span className="font-medium">Fund Distribution:</span>{' '}
                ₹{totalFund.toLocaleString("en-IN")} allocated of ₹{estimatedCost.toLocaleString("en-IN")}
              </div>
              {isFundMatched ? (
                <span className="text-green-700 text-sm font-medium">✓ Matched</span>
              ) : (
                <span className="text-red-700 text-sm font-medium">⚠ Short by ₹{(estimatedCost - totalFund).toLocaleString("en-IN")}</span>
              )}
            </div>
          )}
        </div>

        {/* Location & Classification */}
        <div className="border-l-4 border-purple-500 pl-4 space-y-4">
          <h3 className="text-lg font-semibold">Location & Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locationofAsset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location of Asset</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Renovation">Renovation</SelectItem>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Supply">Supply</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="componentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Building">Building</SelectItem>
                      <SelectItem value="Bridge">Bridge</SelectItem>
                      <SelectItem value="Culvert">Culvert</SelectItem>
                      <SelectItem value="Pipeline">Pipeline</SelectItem>
                      <SelectItem value="Road">Road</SelectItem>
                      <SelectItem value="Waterbody">Waterbody</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upasamiti"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upasamiti</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Upasamiti" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GRAM_PANCHAYAT">Gram Panchayat</SelectItem>
                      <SelectItem value="PANCHAYAT_SAMITY">Panchayat Samity</SelectItem>
                      <SelectItem value="ZILLA_PARISHAD">Zilla Parishad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Beneficiaries & Units */}
        <div className="border-l-4 border-orange-500 pl-4 space-y-4">
          <h3 className="text-lg font-semibold">Beneficiaries & Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="beneficiariesSC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiaries (SC)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="beneficiariesST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiaries (ST)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="beneficiariesGen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiaries (Gen)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nos, Meters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Unit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-l-4 border-gray-500 pl-4 space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="focusArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Focus Area</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gramSansad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gram Sansad</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sdgs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SDGs</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1,2,3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="implementedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Implemented By</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isPublish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Status</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "true")} defaultValue={field.value ? "true" : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Published</SelectItem>
                      <SelectItem value="false">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Action Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
