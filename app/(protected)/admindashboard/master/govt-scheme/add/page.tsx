import type { Metadata } from "next";
import SchemeUploadForm from "@/components/form/SchemeUploadForm";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Add New Government Scheme",
  description: "Upload and add a new government scheme to the system.",
};

export default function NewSchemePage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Government Scheme</CardTitle>
          <CardDescription>
            Upload details of a new government scheme. Please ensure all
            information is accurate and complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemeUploadForm />
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/admindashboard/master/govt-scheme/view">
          View all schemes
        </Link>
      </div>
    </div>
  );
}
