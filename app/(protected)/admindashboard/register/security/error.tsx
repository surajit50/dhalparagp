'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto p-8 text-red-600">
      <h2 className="text-2xl font-bold mb-4">Deposit Error: {error.message}</h2>
      <p className="mb-4">Digest: {error.digest}</p>
      <button
        onClick={reset}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  )
}
