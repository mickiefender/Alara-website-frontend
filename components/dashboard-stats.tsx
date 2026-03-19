"use client"

import { Users, UserCheck, Users2, DollarSign } from "lucide-react"
import { CircularLoader } from "@/components/circular-loader"

interface DashboardStatsProps {
  stats: {
    students: number
    teachers: number
    parents: number
    earnings: number
    loading: boolean
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    { label: "Total Students", value: stats.students, icon: Users, color: "bg-cyan-50 dark:bg-cyan-900/20", iconColor: "text-cyan-600 dark:text-cyan-400" },
    { label: "Total Teachers", value: stats.teachers, icon: UserCheck, color: "bg-emerald-50 dark:bg-emerald-900/20", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Total Parents", value: stats.parents, icon: Users2, color: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-600 dark:text-purple-400" },
    { label: "Total Revenue", value: `¢${stats.earnings.toLocaleString()}`, icon: DollarSign, color: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div 
            key={idx} 
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.loading ? <CircularLoader size="sm" /> : stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

