import React from "react";

type ComingSoonRouteProps = {
  title: string;
  path: string;
};

export default function ComingSoonRoute({ title, path }: ComingSoonRouteProps) {
  return (
    <div className="w-full">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              This page is not implemented yet.
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">
            Coming soon
          </div>
        </div>

        <div className="mt-6 rounded-md border bg-gray-50 px-4 py-3">
          <div className="text-xs font-semibold tracking-wide text-gray-500">
            Route
          </div>
          <div className="mt-1 break-all font-mono text-sm text-gray-800">
            {path}
          </div>
        </div>
      </div>
    </div>
  );
}

