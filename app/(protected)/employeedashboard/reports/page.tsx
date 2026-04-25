
"use client"

import { useState } from "react"
import FinancialYearSelect from "./FinancialYearSelect"
import MonthSelect from "./MonthSelect"
import FundTypeSelect from "./FundTypeSelect"
import SearchButton from "./SearchButton"
import ReportTable from "./ReportTable"
import { workReport } from "@/action/report"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, FileSpreadsheet } from "lucide-react"
import type { workdetailsreporttype } from "@/types/worksdetails"

type WorkReportResponse =
  | {
      success: true
      data: workdetailsreporttype[]
    }
  | {
      success: false
      message: string
    }

export default function FinancialReportPage() {
  const [financialYear, setFinancialYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [fundType, setFundType] = useState<string>("All")
  const [searchResults, setSearchResults] = useState<workdetailsreporttype[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("filters")

  const handleSearch = async () => {
    if (!financialYear || !month) {
      setError("Please select financial year and month")
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const response = (await workReport({
        fiscalYear: financialYear,
        month,
        fundType: fundType !== "All" ? fundType : undefined,
      })) as WorkReportResponse

      if (response.success) {
        if (response.data.length > 0) {
          setSearchResults(response.data)
          setActiveTab("results")
        } else {
          setError("No records found matching your criteria")
        }
      } else {
        setError(response.message || "Server returned an error")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(`Request failed: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Report</h1>
          <p className="text-muted-foreground mt-1">Generate and view financial reports based on selected criteria</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="results" disabled={searchResults.length === 0 && !isLoading}>
            Results {searchResults.length > 0 && `(${searchResults.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Report Criteria</CardTitle>
              <CardDescription>Select the parameters to generate your financial report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <FinancialYearSelect
                    value={financialYear}
                    onChange={(value: string) => {
                      setFinancialYear(value)
                      setError(null)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <MonthSelect
                    value={month}
                    onChange={(value: string) => {
                      setMonth(value)
                      setError(null)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <FundTypeSelect
                    value={fundType}
                    onChange={(value: string) => {
                      setFundType(value)
                      setError(null)
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <SearchButton onSearch={handleSearch} isLoading={isLoading} />
              </div>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>
                  {searchResults.length > 0
                    ? `Showing ${searchResults.length} records for ${month} ${financialYear}${fundType !== "All" ? ` (${fundType})` : ""}`
                    : "No results to display"}
                </CardDescription>
              </div>
              <button onClick={() => setActiveTab("filters")} className="text-sm text-primary hover:underline">
                Modify filters
              </button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading report data...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                  <ReportTable data={searchResults} isLoading={isLoading} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

