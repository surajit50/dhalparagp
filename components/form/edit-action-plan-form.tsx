"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  BookOpen, Calendar, Clock, Hash, MapPin, 
  Wallet, Edit3, CheckCircle2, AlertCircle, FileText, LayoutGrid, Activity, Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

import { ActionPlanDetailsProps, actionplanschema } from "@/schema/actionplan";
import { updateActionPlan } from "@/action/fetchApprovedActionPlans";
import { STATUTORY_FUNDS } from "@/constants/funds";
import { cn } from "@/lib/utils";

export default function EditActionPlanForm({
  initialData,
  id,
}: {
  initialData: ActionPlanDetailsProps;
  id: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Default fallback for fundType if missing in older data
  if (!initialData.fundType) initialData.fundType = "Tied";
  if (!initialData.upasamiti) initialData.upasamiti = "Annayna_o_Bividho";

  const form = useForm<z.infer<typeof actionplanschema>>({
    resolver: zodResolver(actionplanschema),
    defaultValues: initialData,
  });

  const general = form.watch("generalFund") || 0;
  const sc = form.watch("scFund") || 0;
  const st = form.watch("stFund") || 0;
  const estimatedCost = form.watch("estimatedCost") || 0;

  const totalFund = useMemo(() => general + sc + st, [general, sc, st]);
  const isFundMatched = totalFund === estimatedCost && estimatedCost > 0;
  const fundDifference = estimatedCost - totalFund;

  async function onSubmit(values: z.infer<typeof actionplanschema>) {
    if (totalFund !== values.estimatedCost) {
      toast({
        title: "Fund Mismatch",
        description: `Total funds (₹${totalFund}) do not match Estimated Cost (₹${values.estimatedCost}). Difference: ₹${Math.abs(fundDifference)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateActionPlan(id, values);
      toast({
        title: "Action Plan Updated",
        description: "Your action plan has been successfully updated.",
      });
      router.push("/admindashboard/work-manage/view)");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update action plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Edit3 className="h-8 w-8 text-blue-600" />
          Edit Action Plan
        </h1>
        <p className="text-gray-500 mt-1">Update the details for Activity Code: <span className="font-semibold">{initialData.activityCode}</span></p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Project Classification */}
          <Card className="border-t-4 border-t-blue-600 shadow-md">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                <LayoutGrid className="h-5 w-5" /> Project Classification
              </CardTitle>
              <CardDescription>Basic organizational details for this action plan.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField control={form.control} name="financialYear" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-500"/> Financial Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                      <SelectItem value="2027-28">2027-28</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="upasamiti" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-gray-500"/> Upasamiti (Sector)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Upasamiti" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Janasastha">Janasastha (Public Health)</SelectItem>
                      <SelectItem value="Nari_O_Sishu">Nari O Sishu (Women & Child)</SelectItem>
                      <SelectItem value="Samajkalyan">Samajkalyan (Social Welfare)</SelectItem>
                      <SelectItem value="Krishi">Krishi (Agriculture)</SelectItem>
                      <SelectItem value="Pranisampad_Bikash">Pranisampad Bikash (Animal Resources)</SelectItem>
                      <SelectItem value="Silpa">Silpa (Industry/Infrastructure)</SelectItem>
                      <SelectItem value="Parikathama">Parikathama</SelectItem>
                      <SelectItem value="Annayna_o_Bividho">Annayna O Bividho (Others)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="themeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Theme" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Poverty Free and Enhanced Livelihood Village">Poverty Free and Enhanced Livelihood Village</SelectItem>
                      <SelectItem value="Healthy Village">Healthy Village</SelectItem>
                      <SelectItem value="Child Friendly Village">Child Friendly Village</SelectItem>
                      <SelectItem value="Water Sufficient Village">Water Sufficient Village</SelectItem>
                      <SelectItem value="Clean and Green Village">Clean and Green Village</SelectItem>
                      <SelectItem value="Self Sufficient Infrastructure in Village">Self Sufficient Infrastructure in Village</SelectItem>
                      <SelectItem value="Socially Secured Village">Socially Secured Village</SelectItem>
                      <SelectItem value="Village with Good Governance">Village with Good Governance</SelectItem>
                      <SelectItem value="Women Friendly Village">Women Friendly Village</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sector" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Water Supply">Water Supply</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Section 2: Activity Details */}
          <Card className="border-t-4 border-t-purple-600 shadow-md">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-purple-800">
                <Activity className="h-5 w-5" /> Activity Details
              </CardTitle>
              <CardDescription>Describe what this project will accomplish.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="activityCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Hash className="h-4 w-4 text-gray-500"/> Activity Code</FormLabel>
                    <FormControl><Input placeholder="e.g. ACT-2024-001" {...field} className="focus-visible:ring-purple-500" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl><Input placeholder="Brief title of the work" {...field} className="focus-visible:ring-purple-500" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="activityDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-gray-500"/> Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed description of the activity..." className="resize-none h-24 focus-visible:ring-purple-500" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="activityFor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl><Input placeholder="e.g. General Public, Farmers" {...field} className="focus-visible:ring-purple-500" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="locationofAsset" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-500"/> Location</FormLabel>
                    <FormControl><Input placeholder="Specific village/sansad" {...field} className="focus-visible:ring-purple-500" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalduration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-500"/> Duration</FormLabel>
                    <FormControl><Input placeholder="e.g. 6 Months, 30 Days" {...field} className="focus-visible:ring-purple-500" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Financial Planning */}
          <Card className="border-t-4 border-t-green-600 shadow-md">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                <Wallet className="h-5 w-5" /> Funding & Budget
              </CardTitle>
              <CardDescription>Configure schemes, estimated costs, and fund distribution.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-green-50/50 p-4 rounded-lg border border-green-100">
                <div className="lg:col-span-2">
                  <FormField control={form.control} name="schemeName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheme Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {STATUTORY_FUNDS.map((group, idx) => (
                            <SelectGroup key={idx}>
                              <SelectLabel className="font-bold text-gray-900 bg-gray-100">{group.category}</SelectLabel>
                              {group.funds.map((fund) => (
                                <SelectItem key={fund} value={fund}>{fund}</SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div>
                  <FormField control={form.control} name="fundType" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Fund Type Category</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 bg-white p-2 rounded-md border">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Tied" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">Tied</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Untied" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">Untied</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Fund Distribution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <FormField control={form.control} name="estimatedCost" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-900">Total Estimated Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="text-lg font-bold focus-visible:ring-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="generalFund" render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Fund Split (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="focus-visible:ring-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="scFund" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SC Fund Split (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="focus-visible:ring-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="stFund" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ST Fund Split (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="focus-visible:ring-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Dynamic Progress/Status Bar */}
              <div className={cn(
                "p-4 rounded-lg flex items-center justify-between border transition-colors duration-300",
                estimatedCost === 0 ? "bg-gray-50 border-gray-200" :
                isFundMatched ? "bg-green-100 border-green-300" : "bg-red-50 border-red-200"
              )}>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Distribution Check</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">Estimate: ₹{estimatedCost.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">Distributed: ₹{totalFund.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  {estimatedCost === 0 ? (
                    <Badge variant="outline" className="text-gray-500">Enter Costs</Badge>
                  ) : isFundMatched ? (
                    <Badge className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="h-3 w-3" /> Perfect Match</Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Short by ₹{Math.abs(fundDifference).toLocaleString()}</Badge>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !isFundMatched || estimatedCost === 0} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]">
              {isLoading ? "Saving..." : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
