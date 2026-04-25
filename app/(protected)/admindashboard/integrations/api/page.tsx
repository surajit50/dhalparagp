import React from "react";

export default function IntegrationsApiPage() {
  return (
    <div className="flex flex-col items-center py-8 px-2 min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          API Integrations
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="rounded-lg border shadow-sm bg-white p-6 flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-600 mb-2">
              Integration 1
            </span>
            <span className="text-3xl font-bold text-blue-700">
              Coming Soon
            </span>
          </div>
          <div className="rounded-lg border shadow-sm bg-white p-6 flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-600 mb-2">
              Integration 2
            </span>
            <span className="text-3xl font-bold text-green-600">
              Coming Soon
            </span>
          </div>
          <div className="rounded-lg border shadow-sm bg-white p-6 flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-600 mb-2">
              Integration 3
            </span>
            <span className="text-3xl font-bold text-orange-500">
              Coming Soon
            </span>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-500">
          <p>
            This page will display statistics and controls for various API
            integrations in the future.
          </p>
        </div>
      </div>
    </div>
  );
}
