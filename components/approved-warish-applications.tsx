"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import type { WarishApplicationProps, WarishDetailProps } from "@/types"
import WarishCertificatePDF from "@/components/PrintTemplet/WarishCertificatePDF"
import { searchWarishApplications } from "@/action/warishApplicationAction"
import { formatDate } from "@/utils/utils"
import { FileSearch, Loader2, Search, BadgeIcon as Certificate, RefreshCw, Download, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z
  .object({
    deceasedName: z.string(),
    acknowledgementNo: z.string(),
    applicantName: z.string(),
    dateRange: z.string().optional(),
  })
  .refine(
    (data) => {
      return Object.values(data).some((value) => typeof value === "string" && value.trim() !== "")
    },
    {
      message: "At least one search field must be filled",
      path: ["deceasedName"],
    },
  )

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />
}

export default function ApprovedWarishApplications({ enableUpload = false }: { enableUpload?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [warish, setWarish] = useState<WarishApplicationProps[]>([])
  const [isSearched, setIsSearched] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deceasedName: "",
      acknowledgementNo: "",
      applicantName: "",
      dateRange: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const results = await searchWarishApplications(values)
        const transformedResults: WarishApplicationProps[] = results.map((result) => ({
          ...result,
          warishDetails: result.warishDetails.map((detail) => ({
            ...detail,
            children: [] as WarishDetailProps[],
          })),
          warishRefDate: result.warishRefDate ? result.warishRefDate : null,
        }))
        setWarish(transformedResults)
        setIsSearched(true)
        router.refresh()
      } catch (error) {
        console.error(error)
      }
    })
  }

  const handleReset = () => {
    form.reset()
    setWarish([])
    setIsSearched(false)
  }

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newOrder)

    // Sort the warish array based on date
    const sortedWarish = [...warish].sort((a, b) => {
      const dateA = a.warishRefDate ? new Date(a.warishRefDate).getTime() : 0
      const dateB = b.warishRefDate ? new Date(b.warishRefDate).getTime() : 0

      return newOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setWarish(sortedWarish)
  }

  const dateRangeOptions = [
    { value: "last30days", label: "Last 30 Days" },
    { value: "last90days", label: "Last 90 Days" },
    { value: "last6months", label: "Last 6 Months" },
    { value: "lastyear", label: "Last Year" },
  ]

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Certificate className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Approved Inheritance Certificates</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Search and generate verified inheritance certificates</p>
        </div>
        <Badge className="bg-primary/90 hover:bg-primary text-white px-4 py-2 shadow-sm">Legal Certificates</Badge>
      </div>

      {/* Search Card */}
      <Card className="shadow-lg border-gray-100 dark:border-gray-800">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-blue-900/10">
          <CardTitle className="text-xl flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <Search className="h-6 w-6 text-primary" />
            Certificate Search
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Find certificates using any available information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="deceasedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Deceased Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter deceased name"
                          {...field}
                          className="focus:ring-2 focus:ring-primary rounded-lg py-5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acknowledgementNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Acknowledgement No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter acknowledgement number"
                          {...field}
                          className="focus:ring-2 focus:ring-primary rounded-lg py-5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Applicant Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter applicant name"
                          {...field}
                          className="focus:ring-2 focus:ring-primary rounded-lg py-5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Date Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-2 focus:ring-primary rounded-lg py-5">
                            <SelectValue placeholder="Select time period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dateRangeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button type="button" variant="outline" onClick={handleReset} className="py-5 px-6">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-5 text-base bg-primary/90 hover:bg-primary gap-3"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Search Certificates
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isPending ? (
        <Card className="animate-pulse shadow-md border-gray-100 dark:border-gray-800">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/40">
            <Skeleton className="h-6 w-48 rounded-lg" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isSearched ? (
        <Card className="shadow-lg border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Search Results</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  {warish.length} matching certificates found
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleSort} className="h-9 w-9">
                        <Filter className={`h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""} transition-transform`} />
                        <span className="sr-only">Sort by date</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sort by date {sortOrder === "asc" ? "oldest first" : "newest first"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="ghost" onClick={handleReset} className="text-primary hover:bg-primary/10">
                  Clear Search
                </Button>

                {warish.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export results as CSV</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {warish.length > 0 ? (
              <div className="border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
                    <TableRow>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">#</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Deceased</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Relative</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold">
                        Reference
                      </TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold">Date</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warish.map((application, index) => (
                      <TableRow
                        key={application.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-b border-gray-100 dark:border-gray-800"
                      >
                        <TableCell className="font-medium text-gray-600 dark:text-gray-400">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                          {application.nameOfDeceased}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {application.gender === "female" && application.maritialStatus === "married"
                            ? application.spouseName
                            : application.fatherName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-mono px-3 py-1.5">
                            {application.warishRefNo || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-gray-600 dark:text-gray-400">
                          {application.warishRefDate ? formatDate(application.warishRefDate) : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Search className="h-4 w-4" />
                                    <span className="sr-only">View details</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View certificate details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <WarishCertificatePDF applicationDetails={application} mode={enableUpload ? "uploadAndDownload" : "downloadOnly"} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="rounded-full bg-red-100/50 dark:bg-red-900/20 p-5">
                  <FileSearch className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">No Certificates Found</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  No certificates match your search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </CardContent>
          {warish.length > 0 && (
            <CardFooter className="bg-gray-50 dark:bg-gray-800/20 py-3 px-6 border-t border-gray-100 dark:border-gray-800">
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {warish.length} of {warish.length} results
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Card className="shadow-lg border-gray-100 dark:border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="rounded-full bg-primary/10 p-6">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Start Your Search</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Use the search form above to find approved inheritance certificates by any available information about the
              case.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
