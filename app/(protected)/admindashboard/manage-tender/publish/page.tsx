import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateTime } from '@/utils/utils';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Trash2 } from "lucide-react";
import { gpcode } from "@/constants/gpinfor";

export default async function DemoPage() {
    const today = new Date();
    const existnit = await db.nitDetails.findMany({
        where: {
            WorksDetail: {
                every: {
                    tenderStatus: "published", // Only show nitDetails if there's a related WorksDetail with tenderStatus "published"
                },
            },

            publishingDate: {
                lt: today, // 'lt' means 'less than' (i.e., date is before today)
            },
        },
        orderBy: {
            createdAt: "desc", // Order by createdAt in descending order
        },
        include: {
            WorksDetail: true, // Include related WorksDetail records
        },
    });




    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4">
                <h2 className="text-2xl font-bold text-white">Existing NITs</h2>
            </div>
            <div className="p-6">
                <Table>
                    <TableCaption>A list of all NITs</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Sl No</TableHead>
                            <TableHead>NIT Memo Number</TableHead>
                            <TableHead>NIT Memo Date</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {existnit && existnit.length > 0 ? (
                            existnit.map((nit, index) => (
                                <TableRow key={nit.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{nit.memoNumber}/${gpcode}/2024</TableCell>
                                    <TableCell>{formatDateTime(nit.memoDate).dateOnly}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            {
                                                nit.WorksDetail.length === 0 && (
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                )
                                            }

                                            {
                                                nit.isPublished === false && (
                                                    <Link href={`/admindashboard/manage-tender/add/${nit.id}`}>
                                                        <Button variant="secondary" size="sm">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Add Work
                                                        </Button>
                                                    </Link>
                                                )
                                            }




                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No NITs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
