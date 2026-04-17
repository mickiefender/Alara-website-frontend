"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { usersAPI } from "@/lib/api"
import { Users, User } from "lucide-react"

interface GenderData {
  name: string
  value: number
}

const GENDER_CONFIG = {
  Male: {
    color: "#6366f1",
    gradientFrom: "#6366f1",
    gradientTo: "#818cf8",
    lightBg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-100 dark:border-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    icon: User,
    gradientId: "maleGradient",
  },
  Female: {
    color: "#ec4899",
    gradientFrom: "#ec4899",
    gradientTo: "#f472b6",
    lightBg: "bg-pink-50 dark:bg-pink-500/10",
    border: "border-pink-100 dark:border-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
    icon: User,
    gradientId: "femaleGradient",
  },
}

export function GenderDistributionChart() {
  const [data, setData] = useState<GenderData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await usersAPI.students()
        const students = res.data.results || []

        const male = students.filter((s: any) => s.gender === "male").length
        const female = students.filter((s: any) => s.gender === "female").length

        setData([
          { name: "Male", value: male },
          { name: "Female", value: female },
        ])
      } catch {
        // fallback demo data
        setData([
          { name: "Male", value: 45 },
          { name: "Female", value: 55 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const total = data.reduce((a, b) => a + b.value, 0)

  const getPercentage = (name: string) => {
    const val = data.find((d) => d.name === name)?.value || 0
    return total ? Math.round((val / total) * 100) : 0
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const name = payload[0].name as keyof typeof GENDER_CONFIG
    const config = GENDER_CONFIG[name]
    const percent = getPercentage(name)

    return (
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-xl p-3 border text-sm">
        <p className="font-semibold">{name}</p>
        <p className="text-xl font-bold" style={{ color: config.color }}>
          {percent}%
        </p>
        <p className="text-xs text-slate-400">
          {payload[0].value} students
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">
            Students Gender Distribution
          </span>
        </div>
        <span className="text-sm font-bold text-slate-700">
          {total}
        </span>
      </div>

      {/* Chart */}
      <div className="h-[220px]">
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <linearGradient id="maleGradient">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="femaleGradient">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>

            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, i) => {
                const config = GENDER_CONFIG[entry.name as keyof typeof GENDER_CONFIG]
                return (
                  <Cell
                    key={i}
                    fill={`url(#${config.gradientId})`}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                  />
                )
              })}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((item) => {
          const config = GENDER_CONFIG[item.name as keyof typeof GENDER_CONFIG]
          const Icon = config.icon
          const percent = getPercentage(item.name)

          return (
            <div
              key={item.name}
              className={`p-4 rounded-xl border ${config.lightBg} ${config.border}`}
            >
              <div className="flex justify-between mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-xs font-bold" style={{ color: config.color }}>
                  {percent}%
                </span>
              </div>

              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs text-slate-500">{item.name}</p>

              <div className="mt-2 h-1 bg-gray-200 rounded">
                <div
                  className="h-1 rounded"
                  style={{
                    width: `${percent}%`,
                    background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Ratio Bar */}
      <div className="h-2 flex rounded overflow-hidden">
        <div
          style={{ width: `${getPercentage("Male")}%` }}
          className="bg-indigo-500"
        />
        <div
          style={{ width: `${getPercentage("Female")}%` }}
          className="bg-pink-500"
        />
      </div>
    </div>
  )
}