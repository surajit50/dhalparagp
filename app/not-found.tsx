import Link from "next/link"
import { ArrowLeft, Home, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-2xl">

        {/* Glow Background */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" />

        {/* Card */}
        <div className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl p-10 md:p-14 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-50">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          {/* 404 */}
          <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
            404
          </h1>

          {/* Title */}
          <h2 className="mt-4 text-3xl font-bold text-gray-800">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          {/* Divider */}
          <div className="mt-8 h-1 w-24 mx-auto bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />

          {/* Actions */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-7 py-3 font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-orange-600 text-white shadow hover:scale-105 transition"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>

            <button
             
              className="flex items-center justify-center gap-2 px-7 py-3 font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

          </div>

          {/* Footer note */}
          <p className="mt-10 text-sm text-gray-400">
            If the problem persists, please contact system administrator.
          </p>

        </div>
      </div>
    </main>
  )
}
