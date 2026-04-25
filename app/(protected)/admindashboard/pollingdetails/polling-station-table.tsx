"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditPollingStationDialog } from "./edit-polling-station-dialog"
import { DeletePollingStationDialog } from "./delete-polling-station-dialog"
import { AssignMemberDialog } from "./assign-member-dialog"

type PollingStation = {
  id: string
  stationNumber: string
  location: string
  boothAddress: string
  totalVoters: number
  assignedMember?: string
}

const dummyData: PollingStation[] = [
  {
    id: "1",
    stationNumber: "45/1",
    location: "Primary School",
    boothAddress: "Ward No. 1, Main Road",
    totalVoters: 856,
    assignedMember: "Amit Kumar",
  },
  {
    id: "2",
    stationNumber: "45/2",
    location: "Community Hall",
    boothAddress: "Ward No. 2, Market Area",
    totalVoters: 945,
  },
  // Add more dummy data as needed
]

export function PollingStationTable() {
  const [stations, setStations] = useState<PollingStation[]>(dummyData)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Station No.</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Booth Address</TableHead>
            <TableHead>Total Voters</TableHead>
            <TableHead>Assigned Member</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell>{station.stationNumber}</TableCell>
              <TableCell>{station.location}</TableCell>
              <TableCell>{station.boothAddress}</TableCell>
              <TableCell>{station.totalVoters}</TableCell>
              <TableCell>
                {station.assignedMember || <span className="text-muted-foreground">Not assigned</span>}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <AssignMemberDialog stationId={station.id} />
                <EditPollingStationDialog station={station} />
                <DeletePollingStationDialog stationId={station.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

