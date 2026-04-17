"use client"

import { useState, useEffect } from "react"
import { academicsAPI } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  
} from "recharts"
import { BookOpen, Users, TrendingUp, Award, BarChart3, Sparkles } from "lucide-react"

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount?: number
}

const METRIC_CONFIG = {
  performance: {
    key: "Performance Score",
    color: "#6366f1",
    gradientFrom: "#6366f1",
    gradientTo: "#a5b4fc",
    label: "Overall",
    icon: TrendingUp,
    gradientId: "performanceGradient",
  },
  grades: {
    key: "Grades",
    color: "#22c55e",
    gradientFrom: "#22c55e",
    gradientTo: "#86efac",
    label: "Grades",
    icon: BookOpen,
    gradientId: "gradesGradient",
  },
  attendance: {
    key: "Attendance",
    color: "#f59e0b",
    gradientFrom: "#f59e0b",
    gradientTo: "#fcd34d",
    label: "Attendance",
    icon: Users,
    gradientId: "attendanceGradient",
  },
}

export function BestPerformingClass() {
  const [classData, setClassData] = useState<ClassPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeMetric, setActiveMetric] = useState<"performance" | "grades" | "attendance">("performance")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true)
        const response = await academicsAPI.classPerformanceWithAttendance()
        const classes = response.data.results || []

        const processedData = [...classes].sort(
          (a, b) => (b.performanceScore || 0) - (a.performanceScore || 0)
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
  const config = METRIC_CONFIG[activeMetric]

  const chartData = classData.map((cls) => ({
    name: cls.className,
    "Performance Score": cls.performanceScore || 0,
    Grades: cls.averageScore || 0,
    Attendance: cls.attendancePercentage || 0,
  }))

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; dataKey: string }>
    label?: string
  }) => {
    if (active && payload && payload.length && label) {
      const value = payload[0]?.value ?? 0
      return (
        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl p-4 min-w-[160px]">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <div className="flex items-end gap-1">
            <span
              className="text-3xl font-bold"
              style={{ color: config.color }}
            >
              {value.toFixed(1)}
            </span>
            <span className="text-slate-400 text-sm mb-1">%</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${value}%`,
                background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`,
              }}
            />
          </div>
        </div>
      )
    }
    return null
  }

  const CustomDot = (props: {
    cx?: number
    cy?: number
    index?: number
    payload?: { name: string }
  }) => {
    const { cx, cy, index } = props
    const isHovered = hoveredIndex === index
    return (
      <g>
        {isHovered && (
          <circle
            cx={cx}
            cy={cy}
            r={12}
            fill={config.color}
            opacity={0.15}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 6 : 4}
          fill={config.color}
          stroke="white"
          strokeWidth={2}
          style={{ transition: "r 0.2s ease" }}
        />
      </g>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-400 animate-pulse">Loading performance data...</p>
        </div>
      </div>
    )
  }

  const rankColors = [
    { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-600 dark:text-amber-400", bar: "#f59e0b" },
    { bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-500 dark:text-slate-400", bar: "#94a3b8" },
    { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400", bar: "#f97316" },
    { bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-500 dark:text-slate-400", bar: "#94a3b8" },
    { bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-500 dark:text-slate-400", bar: "#94a3b8" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${config.gradientFrom}20, ${config.gradientTo}40)` }}
          >
            <BarChart3 className="h-5 w-5" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Class Performance
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Performance metrics across all classes
            </p>
          </div>
        </div>
        {bestClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {bestClass.className}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <p className="text-xs text-amber-600 dark:text-amber-400">{error} — showing demo data</p>
        </div>
      )}

      {/* Metric Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
        {(Object.keys(METRIC_CONFIG) as Array<keyof typeof METRIC_CONFIG>).map((metric) => {
          const m = METRIC_CONFIG[metric]
          const Icon = m.icon
          const isActive = activeMetric === metric
          return (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={isActive ? { color: m.color } : {}}
              />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <div className="h-[260px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activeTooltipIndex !== undefined) {
                setHoveredIndex(e.activeTooltipIndex)
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.gradientFrom} stopOpacity={0.3} />
                <stop offset="100%" stopColor={config.gradientTo} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              angle={-20}
              textAnchor="end"
              height={55}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: config.color,
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
                strokeOpacity: 0.5,
              }}
            />
            <Area
              key={activeMetric}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2.5}
              fill={`url(#${config.gradientId})`}
              dot={<CustomDot />}
              activeDot={{ r: 7, fill: config.color, stroke: "white", strokeWidth: 2.5 }}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 mb-5">
        {chartData.length > 0 && (() => {
          const values = chartData.map((d) => d[config.key as keyof typeof d] as number)
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const max = Math.max(...values)
          const min = Math.min(...values)
          return (
            <>
              {[
                { label: "Average", value: avg },
                { label: "Highest", value: max },
                { label: "Lowest", value: min },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: `linear-gradient(135deg, ${config.gradientFrom}10, ${config.gradientTo}20)` }}
                >
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                  <p className="text-lg font-bold" style={{ color: config.color }}>
                    {value.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">%</span>
                  </p>
                </div>
              ))}
            </>
          )
        })()}
      </div>

    </div>  
  )
} 

export default BestPerformingClass  
