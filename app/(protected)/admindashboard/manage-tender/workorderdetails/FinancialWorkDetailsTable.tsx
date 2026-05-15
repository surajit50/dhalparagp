"use client"

import { useState, Fragment, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import {
  FileTextIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon
} from "lucide-react"

import WorkOrderAOCDialog from "./WorkOrderAOCDialog"

interface Props {
  financialWorkDetails: any[]
}

export default function FinancialWorkDetailsTable({
  financialWorkDetails,
}: Props) {

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const [fundFilter, setFundFilter] = useState("all")
  const [nitFilter, setNitFilter] = useState("")

  const uniqueFunds = useMemo(() => {
    const funds = new Set(
      financialWorkDetails.map(
        (item) => item.ApprovedActionPlanDetails?.schemeName
      )
    )
    return Array.from(funds).filter(Boolean)
  }, [financialWorkDetails])

  const filteredData = useMemo(() => {

    return financialWorkDetails.filter((item) => {

      const fundType = item.ApprovedActionPlanDetails?.schemeName || ""
      const nitNo = item.nitDetails?.memoNumber || ""

      const fundMatch =
        fundFilter === "all" || fundType === fundFilter

      const nitMatch =
        nitFilter === "" ||
        nitNo.toLowerCase().includes(nitFilter.toLowerCase())

      return fundMatch && nitMatch
    })

  }, [financialWorkDetails, fundFilter, nitFilter])

  const totalCount = filteredData.length

  function toggleRowExpansion(id: string) {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      newSet.has(id) ? newSet.delete(id) : newSet.add(id)
      return newSet
    })
  }

  return (
    <div className="w-full bg-white border border-orange-200 rounded-lg shadow-sm">

      {/* Header */}
      <div className="bg-orange-700 text-white px-4 py-3 flex justify-between items-center">

        <div>
          <h2 className="font-semibold text-lg">
            Financial Evaluation Works
          </h2>
          <p className="text-orange-100 text-sm">
            Pending Acceptance of Contract (AOC)
          </p>
        </div>

        <Badge className="bg-white text-orange-700 font-semibold px-3 py-1">
          Total: {totalCount}
        </Badge>

      </div>

      {/* Filters */}
      <div className="p-4 flex flex-wrap gap-4 border-b bg-gray-50">

        {/* Fund Type Filter */}
        <Select
          value={fundFilter}
          onValueChange={setFundFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Fund Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Funds</SelectItem>

            {uniqueFunds.map((fund) => (
              <SelectItem key={fund} value={fund}>
                {fund}
              </SelectItem>
            ))}

          </SelectContent>
        </Select>

        {/* NIT Filter */}
        <Input
          placeholder="Search NIT No"
          value={nitFilter}
          onChange={(e) => setNitFilter(e.target.value)}
          className="w-[220px]"
        />

      </div>

      {/* Empty */}
      {totalCount === 0 && (
        <div className="py-12 text-center">
          <AlertCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-3"/>
          <p className="text-gray-600">No works available</p>
        </div>
      )}

      {/* Table */}
      {totalCount > 0 && (
        <div className="overflow-x-auto">
          <Table>

            <TableHeader className="bg-orange-50">
              <TableRow>
                <TableHead className="w-12">Sl</TableHead>
                <TableHead>NIT Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">
                  Estimated Cost
                </TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, index) => {

                const expanded = expandedRows.has(item.id)
                const isFinalized = item.isAOCFinalized === true

                const memoDate = item.nitDetails?.memoDate
                  ? new Date(item.nitDetails.memoDate).toLocaleDateString("en-IN")
                  : "-"

                return (
                  <Fragment key={item.id}>

                    <TableRow className="hover:bg-orange-50">

                      <TableCell>{index + 1}</TableCell>

                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-800">
                            NIT No: {item.nitDetails?.memoNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Work No: {item.workslno}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isFinalized ? (
                          <Badge className="bg-green-600 text-white flex gap-1 items-center">
                            <CheckCircleIcon className="w-3 h-3"/>
                            AOC Finalized
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500 text-white flex gap-1 items-center">
                            <ClockIcon className="w-3 h-3"/>
                            Financial Evaluation
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-start gap-2">

                          <div
                            className={`text-gray-700 cursor-pointer ${
                              expanded ? "" : "line-clamp-1"
                            }`}
                            onClick={() => toggleRowExpansion(item.id)}
                          >
                            {item.ApprovedActionPlanDetails?.activityDescription}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(item.id)}
                          >
                            {expanded
                              ? <ChevronUpIcon className="h-4 w-4"/>
                              : <ChevronDownIcon className="h-4 w-4"/>
                            }
                          </Button>

                        </div>
                      </TableCell>

                      <TableCell>
                        #{item.ApprovedActionPlanDetails?.activityCode}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        ₹{
                          item.ApprovedActionPlanDetails?.estimatedCost
                            ?.toLocaleString("en-IN")
                        }
                      </TableCell>

                      <TableCell className="text-right">

                        {isFinalized ? (
                          <Badge className="bg-gray-300 text-gray-700">
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            className="bg-orange-700 hover:bg-orange-800 text-white"
                            size="sm"
                            onClick={() => {
                              setSelectedWorkId(item.id)
                              setDialogOpen(true)
                            }}
                          >
                            <FileTextIcon className="h-4 w-4 mr-1"/>
                            Process AOC
                          </Button>
                        )}

                      </TableCell>

                    </TableRow>

                    {expanded && (
                      <TableRow className="bg-orange-50">
                        <TableCell colSpan={7}>
                          <div className="p-3 text-sm text-gray-700 space-y-1">

                            <div>
                              <strong>Activity:</strong>{" "}
                              {item.ApprovedActionPlanDetails?.activityDescription}
                            </div>

                            <div>
                              <strong>Work ID:</strong> {item.id}
                            </div>

                            <div>
                              <strong>Memo Date:</strong> {memoDate}
                            </div>

                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                  </Fragment>
                )
              })}
            </TableBody>

          </Table>
        </div>
      )}

      <WorkOrderAOCDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedWorkId(null)
        }}
        workId={selectedWorkId}
      />

    </div>
  )
}
