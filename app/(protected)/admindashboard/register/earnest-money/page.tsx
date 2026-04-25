import { db } from "@/lib/db"
import { formatDate } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"

const page = async () => {
  const emdList = await db.earnestMoneyRegister.findMany({
    include: {
      bidderName: {
        include: {
          WorksDetail: {
            include: {
              nitDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Earnest Money Register</h1>
              <p className="text-muted-foreground">Manage and track earnest money deposits for government contracts</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5 bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" asChild>
                <Link href="/admindashboard/register/earnest-money/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Entry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Status</label>
                <Select>
                  <SelectTrigger className="border-input bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="forfeited">Forfeited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date Range</label>
                <Select>
                  <SelectTrigger className="border-input bg-background">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Earnest Money List</CardTitle>
              <div className="text-sm text-muted-foreground">Showing {emdList.length} records</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 bg-muted/30">
                    <TableHead className="font-semibold text-foreground">NIT Number</TableHead>
                    <TableHead className="font-semibold text-foreground">Agency Name</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">EMD Amount</TableHead>
                    <TableHead className="font-semibold text-foreground">Payment Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Payment Date</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emdList.map((emd) => {
                    const agencyDetails = emd.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails
                    const nitDetails = emd.bidderName?.WorksDetail?.nitDetails

                    return (
                      <TableRow key={emd.id} className="border-border/50 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-foreground">{nitDetails?.memoNumber || "N/A"}</TableCell>
                        <TableCell className="text-foreground">{agencyDetails?.name || "N/A"}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          ₹{emd.earnestMoneyAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              emd.paymentstatus === "paid"
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                : emd.paymentstatus === "pending"
                                  ? "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                            }
                          >
                            {emd.paymentstatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {emd.paymentDate ? formatDate(emd.paymentDate) : "Not Paid"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" asChild>
                            <Link href={`/admindashboard/register/earnest-money/payment/${emd.id}`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
