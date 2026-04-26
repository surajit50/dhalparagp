"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SeedHolidayPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const runSeed = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/admin/seed-holidays", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(`✅ ${data.message} (${data.count} records)`);
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-4">
        West Bengal Holiday Seeder
      </h1>

      <Button onClick={runSeed} disabled={loading}>
        {loading ? "Seeding..." : "Run Seed"}
      </Button>

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
