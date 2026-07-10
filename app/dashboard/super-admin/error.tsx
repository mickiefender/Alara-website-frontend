"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-2">Something went wrong on Super Admin Dashboard</h2>
      <p className="text-sm text-gray-600 mb-4">{error?.message || "Unknown error"}</p>
      <button
        onClick={() => reset()}
        className="border rounded px-3 py-1"
      >
        Try again
      </button>
    </div>
  )
}
