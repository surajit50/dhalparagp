'use client'


import { format } from 'date-fns'
import {
    ColumnDef,

} from '@tanstack/react-table'

import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UserIcon } from "lucide-react"
import { WarishApplicationProps } from "@/types"
import StaffAssignForm from '@/components/staff-asing-form'


export const asignstaffcolumns: ColumnDef<WarishApplicationProps>[] = [
    {
        accessorKey: 'index',
        header: 'Sl No',
        cell: ({ row }) => <div className="text-center font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'acknowlegment',
        header: 'Application ID',
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.acknowlegment}</Badge>
        ),
    },
    {
        accessorKey: 'applicantName',
        header: 'Applicant Name',
        cell: ({ row }) => (
            <div className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {row.original.applicantName}
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Application Date',
        cell: ({ row }) => (
            <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(new Date(row.original.createdAt), 'dd MMM yyyy')}
            </div>
        ),
    },
    {
        id: 'actions',
        header: 'Assign to Staff',
        cell: ({ row }) => (
            <StaffAssignForm applicationId={row.original.id} staff={[]} />
        ),
    }
]
