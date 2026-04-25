"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  financialYear: string;
  financialYears: string[];
  work: any; // Consider replacing 'any' with a proper type
};

const APAreportClient: React.FC<Props> = ({
  financialYear,
  financialYears,
  work,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFy = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("fy", newFy);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          APA Report for Financial Year: {financialYear}
        </h1>

        <div className="flex items-center gap-2">
          <label htmlFor="fy-select" className="font-medium text-gray-700">
            Select FY:
          </label>
          <div className="relative">
            <select
              id="fy-select"
              name="fy"
              value={financialYear}
              onChange={handleChange}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
        <p className="font-semibold text-blue-800">Report Criteria:</p>
        <ul className="list-disc pl-5 mt-1 text-blue-700">
          <li>Works awarded in {financialYear} (April-March)</li>
          <li>With payments made in April-June quarter</li>
        </ul>
      </div>

      {/* Fixed typo and added conditional rendering */}
      <div className="mt-4">
        <p className="font-medium">
          {Array.isArray(work) ? work.length : 0} works meet the criteria
        </p>
      </div>
    </>
  );
};

export default APAreportClient;
