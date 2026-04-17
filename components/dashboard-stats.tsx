"use client"

import { Users, UserCheck, Users2, DollarSign } from "lucide-react"
import Link from "next/link"
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (num: number) => `GH₵${formatNumber(num)}`

  const statsData = [
    { 
      label: "Students", 
      value: stats.students, 
      icon: Users,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    { 
      label: "Teachers", 
      value: stats.teachers, 
      icon: UserCheck,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Parents", 
      value: stats.parents, 
      icon: Users2,
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    { 
      label: "Fee Collected", 
      value: stats.earnings, 
      icon: DollarSign,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
  ];

  const getHref = (label: string): string => {
    switch(label) {
      case 'Students': return '/dashboard/school-admin/students';
      case 'Teachers': return '/dashboard/school-admin/teachers';
      case 'Parents': return '/dashboard/school-admin/parents';
      case 'Fee Collected': return '/dashboard/school-admin/fees';
      default: return '/';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Link key={idx} href={getHref(stat.label)} className="block h-full">
            <div 
              className={`h-full relative ${stat.bgColor} rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-white to-slate-700 dark:to-slate-200 bg-clip-text text-transparent">
                    {stats.loading ? <CircularLoader size="sm" /> : stat.label === "Fee Collected" ? formatCurrency(stat.value) : formatNumber(stat.value)}
                  </p>
                </div>
                <Icon className={`w-12 h-12 ${stat.iconColor} drop-shadow-lg`} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
