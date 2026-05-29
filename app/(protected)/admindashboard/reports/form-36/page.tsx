import React from "react";
import Form36Client from "./form-36-client";

export default function Form36Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Form-36 Budget Entry</h2>
      </div>
      <Form36Client />
    </div>
  );
}
