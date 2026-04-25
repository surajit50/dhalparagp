"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function NitFilter({
  options,
  selectedNit,
}: {
  options: string[];
  selectedNit?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNit = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newNit) {
      params.set("nit", newNit);
    } else {
      params.delete("nit");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by NIT:
      </label>
      <select
        value={selectedNit || ""}
        onChange={handleChange}
        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All NITs</option>
        {options.map((nit) => (
          <option key={nit} value={nit}>
            {nit}
          </option>
        ))}
      </select>
    </div>
  );
}
