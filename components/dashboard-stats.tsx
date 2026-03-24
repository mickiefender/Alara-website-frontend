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
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K'
    }
    return num.toString()
  }

  const statsData = [
    { 
      label: "Students", 
      value: stats.students, 
      icon: Users,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-secondary dark:text-purple-400"
    },
    { 
      label: "Teachers", 
      value: stats.teachers, 
      icon: UserCheck,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-secondary dark:text-blue-400"
    },
    { 
      label: "Awards", 
      value: stats.parents, 
      icon: Users2,
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-secondary dark:text-orange-400"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statsData.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className={`${stat.bgColor} rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.loading ? <CircularLoader size="sm" /> : formatNumber(stat.value)}
                </p>
              </div>
              <Icon className={`w-12 h-12 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

