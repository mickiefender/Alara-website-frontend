"use client"

import { Users, UserCheck, Users2, DollarSign } from "lucide-react"
import Link from "next/link"
import { CountUp } from "@/components/ui/count-up"

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
      chipBg: "bg-purple-500/15 dark:bg-purple-400/15",
      iconColor: "text-purple-600 dark:text-purple-400",
      glow: "hover:shadow-purple-500/15",
    },
    {
      label: "Teachers",
      value: stats.teachers,
      icon: UserCheck,
      chipBg: "bg-blue-500/15 dark:bg-blue-400/15",
      iconColor: "text-blue-600 dark:text-blue-400",
      glow: "hover:shadow-blue-500/15",
    },
    {
      label: "Parents",
      value: stats.parents,
      icon: Users2,
      chipBg: "bg-orange-500/15 dark:bg-orange-400/15",
      iconColor: "text-orange-600 dark:text-orange-400",
      glow: "hover:shadow-orange-500/15",
    },
    {
      label: "Fee Collected",
      value: stats.earnings,
      icon: DollarSign,
      chipBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      glow: "hover:shadow-emerald-500/15",
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
    <div className="stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Link key={idx} href={getHref(stat.label)} className="block h-full group">
            <div
              className={`glass-card glass-hover h-full relative p-6 hover:shadow-2xl ${stat.glow}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground tabular-nums">
                    {stats.loading ? (
                      <span className="inline-block h-9 w-20 rounded-lg bg-accent/70 shimmer align-middle" />
                    ) : (
                      <CountUp
                        value={stat.value}
                        format={stat.label === "Fee Collected" ? formatCurrency : formatNumber}
                      />
                    )}
                  </p>
                </div>
                <div className={`shrink-0 w-14 h-14 rounded-2xl ${stat.chipBg} border border-white/30 dark:border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
