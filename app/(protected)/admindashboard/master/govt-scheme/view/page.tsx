import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
}

export default async function GovernmentSchemesPage() {
  let schemes: GovernmentScheme[] = [];

  try {
    schemes = await db.governmentScheme.findMany();
  } catch (error) {
    console.error("Failed to fetch government schemes:", error);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Government Schemes
        </h1>
        <Button asChild>
          <Link href="/admindashboard/master/govt-scheme/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Scheme
          </Link>
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sl No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schemes.map((scheme, index) => (
              <TableRow key={scheme.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{scheme.title}</TableCell>
                <TableCell className="max-w-md truncate">
                  {scheme.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admindashboard/master/govt-scheme/edit/${scheme.id}`}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="destructive" size="sm">
                      <Link
                        href={`/admindashboard/master/govt-scheme/delete/${scheme.id}`}
                      >
                        Delete
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
