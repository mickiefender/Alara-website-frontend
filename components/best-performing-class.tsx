"use client"

import { useState, useEffect } from "react"
import { academicsAPI } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BookOpen, Users, TrendingUp, Award, BarChart3, Star } from "lucide-react"

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount?: number
}

const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"]

export function BestPerformingClass() {
  const [classData, setClassData] = useState<ClassPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeMetric, setActiveMetric] = useState<"performance" | "grades" | "attendance">("performance")

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true)
        const response = await academicsAPI.classPerformanceWithAttendance()
        const classes = response.data.results || []

        const processedData = [...classes].sort((a, b) => 
          (b.performanceScore || 0) - (a.performanceScore || 0)
        )

        setClassData(processedData)
        setError(null)
      } catch (err) {
        console.error("Error fetching class data:", err)
        setError("Failed to load class performance data")
        setClassData([
          { classId: 1, className: "Grade 10-A", averageScore: 85, attendancePercentage: 92, performanceScore: 88.5, studentCount: 45 },
          { classId: 2, className: "Grade 9-B", averageScore: 78, attendancePercentage: 85, performanceScore: 81.5, studentCount: 42 },
          { classId: 3, className: "Grade 11-A", averageScore: 92, attendancePercentage: 95, performanceScore: 93.5, studentCount: 38 },
          { classId: 4, className: "Grade 8-A", averageScore: 81, attendancePercentage: 88, performanceScore: 84.5, studentCount: 50 },
          { classId: 5, className: "Grade 10-B", averageScore: 88, attendancePercentage: 90, performanceScore: 89, studentCount: 40 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [])

  const bestClass = classData.length > 0 ? classData[0] : null

  const getChartData = () => {
    return classData.map((cls) => ({
      name: cls.className,
      "Performance Score": cls.performanceScore || 0,
      "Grades": cls.averageScore || 0,
      "Attendance": cls.attendancePercentage || 0,
    }))
  }

  const chartData = getChartData()

  const getBarColor = (index: number) => {
    if (index === 0) return "#22c55e"
    return COLORS[index % COLORS.length]
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm text-slate-600 dark:text-slate-300">
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Class Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Performance metrics across all classes
            </p>
          </div>
        </div>
        {bestClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Top: {bestClass.className}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300">{error} (showing demo data)</p>
        </div>
      )}

      {/* Metric Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveMetric("performance")}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeMetric === "performance"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Overall
        </button>
        <button
          onClick={() => setActiveMetric("grades")}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeMetric === "grades"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Grades
        </button>
        <button
          onClick={() => setActiveMetric("attendance")}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeMetric === "attendance"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Attendance
        </button>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-25}
              textAnchor="end"
              height={60}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            
            {activeMetric === "performance" && (
              <Bar dataKey="Performance Score" radius={[6, 6, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            )}
            {activeMetric === "grades" && (
              <Bar dataKey="Grades" radius={[6, 6, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            )}
            {activeMetric === "attendance" && (
              <Bar dataKey="Attendance" radius={[6, 6, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Class Rankings */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Class Rankings</h4>
        <div className="space-y-2">
          {classData.slice(0, 5).map((cls, index) => (
            <div
              key={cls.classId}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" 
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{cls.className}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400">{cls.studentCount || 0} students</span>
                <span className="font-semibold text-slate-900 dark:text-white">{cls.performanceScore?.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

