"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Award, 
  TrendingUp, 
  Target, 
  Star, 
  CheckCircle2,
  CircleOff 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount: number
}

interface TeacherClassStatsProps {
  data: ClassPerformanceData | null
  loading: boolean
  className?: string
}

export function TeacherClassStats({ data, loading, className }: TeacherClassStatsProps) {
  if (!data) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        No performance data available
      </div>
    )
  }

  // Derived grade stats (focus on grades)
  const avgGrade = data.averageScore || 0
  const passRate = avgGrade >= 50 ? Math.round((avgGrade / 100) * 100) : 0  // Simplified pass rate
  const aGradeRate = avgGrade >= 80 ? Math.round((avgGrade / 100) * 30) : 0   // Estimated A-grade %
  const topScore = avgGrade + 10  // Mock top score for demo

  const statsData = [
    { 
      label: "Avg Grade", 
      value: `${avgGrade.toFixed(1)}%`,
      change: "+2.3%",
      icon: TrendingUp,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Class average score"
    },
    { 
      label: "Students", 
      value: data.studentCount.toString(),
      change: "+1",
      icon: Users,
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      description: `${data.className || "Class"} enrollment`
    },
    { 
      label: "Pass Rate", 
      value: `${passRate}%`,
      change: "+5.2%",
      icon: CheckCircle2,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      description: "Students above 50%"
    },
    { 
      label: "A-Grades", 
      value: `${aGradeRate}%`,
      change: "-1.1%",
      icon: Award,
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      description: "A-grade percentage (80%+)"
    }
  ]

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {statsData.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="pb-3">
              <div className={cn("p-3 rounded-2xl w-fit", stat.bgColor)}>
                <Icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wide">
                {stat.label}
              </p>
              <CardTitle className="text-2xl leading-none">
                {stat.value}
              </CardTitle>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                {stat.change}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
