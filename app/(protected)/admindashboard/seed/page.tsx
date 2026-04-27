"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(500);
  const [result, setResult] = useState<{
    count: number;
    message: string;
  } | null>(null);

  const handleSeed = async (shouldClear: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch("/api/seed/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, clear: shouldClear }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to seed applications");
        return;
      }

      setResult(data);
      toast.success(
        `Successfully created ${data.count} Samabyathi applications!`,
      );
    } catch (error) {
      console.error("[v0] Error:", error);
      toast.error("Failed to seed applications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Samabyathi Applications Demo Seed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Applications
              </label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 500)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the number of sample applications to create (default: 500)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleSeed(false)}
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Applications
              </Button>
              <Button
                onClick={() => handleSeed(true)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clear & Create New
              </Button>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900">Success!</h3>
                <p className="text-green-700 mt-2">{result.message}</p>
                <p className="text-sm text-green-600 mt-1">
                  Total applications: {result.count}
                </p>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <h3 className="font-semibold text-blue-900">API Usage</h3>
              <p className="text-sm text-blue-700">
                You can also call the API directly:
              </p>
              <pre className="bg-blue-100 p-3 rounded text-xs overflow-auto">
                {`POST /api/seed/applications
{
  "count": 500,
  "clear": false
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
