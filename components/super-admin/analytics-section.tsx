"use client"

import type { AnyObj } from "./types"

export default function AnalyticsSection({ analytics }: { analytics: AnyObj | null }) {
  return (
    <section id="analytics">
      <h2 className="text-xl font-semibold mb-2">Growth Charts (Snapshot Data)</h2>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Period</th>
              <th className="text-left p-2">Schools</th>
              <th className="text-left p-2">Users</th>
              <th className="text-left p-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(analytics?.growth_chart || []).map((g: AnyObj, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{g.period}</td>
                <td className="p-2">{g.schools}</td>
                <td className="p-2">{g.users}</td>
                <td className="p-2">{g.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
