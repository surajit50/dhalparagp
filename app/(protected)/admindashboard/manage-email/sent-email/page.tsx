"use client";
import { EmailForm } from "@/components/form/EmailForm";

export default function EmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and send emails to your recipients
          </p>
        </div>

        {/* Email Form Container */}
        <div className="transition-all duration-200 ease-in-out">
          <EmailForm />
        </div>

        {/* Optional: Add a back button or additional actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
