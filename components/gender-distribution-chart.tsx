"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { usersAPI } from "@/lib/api"
import { Users } from "lucide-react"

interface GenderData {
  name: string
  value: number
}

export function GenderDistributionChart() {
  const [data, setData] = useState<GenderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await usersAPI.students()
        const students = response.data.results
        
        const maleCount = (students as any[]).filter((student: any) => student.gender === "male").length
        const femaleCount = (students as any[]).filter((student: any) => student.gender === "female").length

        const genderData = [
          { name: "Male", value: maleCount },
          { name: "Female", value: femaleCount },
        ]
        
        setData(genderData)
      } catch (error) {
        console.error("Error fetching student data:", error)
        // Fallback to mock data in case of an error
        setData([
          { name: "Male", value: 45 },
          { name: "Female", value: 55 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  const totalStudents = data.reduce((sum, item) => sum + item.value, 0)
  const malePercentage = totalStudents > 0 ? Math.round((data.find(d => d.name === "Male")?.value || 0) / totalStudents * 100) : 0
  const femalePercentage = totalStudents > 0 ? Math.round((data.find(d => d.name === "Female")?.value || 0) / totalStudents * 100) : 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = totalStudents > 0 ? Math.round((payload[0].value || 0) / totalStudents * 100) : 0
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {payload[0].value} students ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total: {totalStudents}</span>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              stroke="none"
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#ec4899" />
              <LabelList
                dataKey="value"
                position="outside"
                formatter={(value: number) => `${value}`}
                style={{ fontSize: '12px', fontWeight: 600, fill: '#64748b' }}
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Male</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{malePercentage}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Female</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{femalePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

