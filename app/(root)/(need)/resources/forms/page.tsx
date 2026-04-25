import { Suspense } from 'react';
import { getForms } from "@/action/public-action";
import FormsClient from './forms-client';
import { Skeleton } from "@/components/ui/skeleton";

export default async function FormsPage() {
  const forms = await getForms();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gram Panchayat Forms</h1>
      <Suspense fallback={<FormsSkeleton />}>
        <FormsClient initialForms={forms} />
      </Suspense>
    </div>
  );
}

function FormsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

