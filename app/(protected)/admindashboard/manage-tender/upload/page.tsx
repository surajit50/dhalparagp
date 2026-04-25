import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gpcode } from "@/constants/gpinfor";
export const metadata = {
  title: "Published NIT",
  description: "View all published NITs and manage tenders",
};

async function getPublishedNITs() {
  try {
    return await db.nitDetails.findMany({
      where: {
        isPublished: false, // Only get published NITs
      },
      orderBy: {
        memoDate: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch published NITs:", error);
    return [];
  }
}

export default async function PublishedNITPage() {
  const publishedNITs = await getPublishedNITs();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Published NIT</h1>
      <div className="overflow-x-auto rounded-lg border shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sl No</TableHead>
              <TableHead>NIT Memo Number</TableHead>
              <TableHead>NIT Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedNITs.map((nit, index) => (
              <TableRow key={nit.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <p className="font-semibold text-primary">
                    {nit.memoNumber}/${gpcode}/{nit.memoDate.getFullYear()}
                  </p>
                </TableCell>
                <TableCell>{formatDate(nit.memoDate)}</TableCell>
                <TableCell className="text-right">
                  {!nit.publishhardcopy ? (
                    <Button asChild variant="outline">
                      <Link
                        href={`/admindashboard/manage-tender/upload/${nit.id}`}
                      >
                        Upload NIT Document
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Already Uploaded
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {publishedNITs.length === 0 && (
        <p className="text-center text-muted-foreground">
          No published NITs found.
        </p>
      )}
    </div>
  );
}
