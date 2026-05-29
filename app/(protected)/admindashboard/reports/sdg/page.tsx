import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function sdgPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Under Construction</h2>
      </div>
      <Card className="border-t-4 border-t-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Construction className="h-6 w-6" />
            SDG Report
          </CardTitle>
          <CardDescription>
            This page is currently being built.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            The data and layout for the <strong>SDG</strong> report will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
