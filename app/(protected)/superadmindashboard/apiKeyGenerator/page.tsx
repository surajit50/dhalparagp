"use client";

import { useState } from "react";

export default function MaintenanceToggle() {
  const [loading, setLoading] = useState(false);

  const toggle = async (status: boolean) => {
    setLoading(true);

    await fetch("/api/system/maintenance", {
      method: "POST",
      body: JSON.stringify({ status: status ? "true" : "false" }),
    });

    setLoading(false);
    alert("Maintenance Updated");
  };

  return (
    <div className="p-4 border rounded-lg">
      <button
        onClick={() => toggle(true)}
        className="bg-red-600 text-white px-4 py-2 mr-2"
      >
        Enable Maintenance
      </button>

      <button
        onClick={() => toggle(false)}
        className="bg-green-600 text-white px-4 py-2"
      >
        Disable Maintenance
      </button>
    </div>
  );
}
