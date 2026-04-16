"use client"

export default function SuperAdminCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}
