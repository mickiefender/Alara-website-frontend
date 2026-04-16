"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { AnyObj } from "./types"

export default function SchoolsUsageSection({ usage }: { usage: AnyObj[] }) {
  const usageTotals = useMemo(() => {
    return usage.reduce(
      (acc, item) => {
        acc.students += Number(item.students || 0)
        acc.teachers += Number(item.teachers || 0)
        acc.storage += Number(item.storage_used_mb || 0)
        return acc
      },
      { students: 0, teachers: 0, storage: 0 }
    )
  }, [usage])

  return (
    <section id="schools-usage">
      <h2 className="text-xl font-semibold mb-2">School Usage (Students, Teachers, Storage)</h2>
      <div className="mb-3 text-sm">
        Totals — Students: {usageTotals.students}, Teachers: {usageTotals.teachers}, Storage: {usageTotals.storage} MB
      </div>
      <Button asChild className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
        <Link href="/dashboard/super-admin/onboarding" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Onboard New School
        </Link>
      </Button>
      <div className="overflow-auto border rounded">  
        <table className="min-w-full text-sm">  
          <thead className="bg-gray-100">  
            <tr>  
              <th className="text-left p-2">School</th>  
              <th className="text-left p-2">Plan</th>  
              <th className="text-left p-2">Students</th>  
              <th className="text-left p-2">Teachers</th>  
              <th className="text-left p-2">Storage (MB)</th>  
              <th className="text-left p-2">Revenue</th>  
              <th className="text-left p-2">Status</th>  
            </tr>  
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u.school_id} className="border-t">
                <td className="p-2">{u.school_name}</td>
                <td className="p-2">{u.plan || "-"}</td>
                <td className="p-2">{u.students}</td>
                <td className="p-2">{u.teachers}</td>
                <td className="p-2">{u.storage_used_mb}</td>
                <td className="p-2">{u.revenue}</td>
                <td className="p-2">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
