 "use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { academicsAPI } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { RefreshCw, Play, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClassPerformanceData {
  className: string
  assignmentsGiven: number
  assignmentsMarked: number
  exercisesCompleted: number
  averageScore: number
  participationRate: number
}

export function ClassPerformanceAnalytics() {
  const [data, setData] = useState<ClassPerformanceData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await academicsAPI.classPerformance()
      setData(response.data.results || [])
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPerformanceData()
  }, [fetchPerformanceData])

  const chartData = data.map((item) => ({
    name: item.className,
    "Assignments": item.assignmentsGiven,
    "Marked": item.assignmentsMarked,
    "Exercises": item.exercisesCompleted,
    "Avg Score": item.averageScore,
  }))

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3 pb-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl backdrop-blur-sm border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Class Performance Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Live data across {data.length} classes
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPerformanceData}
            className="gap-2 border-dashed hover:bg-primary/5"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-muted-foreground/80">
          Monitor activities across all classes - assignments, exercises, and student engagement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Charts and content go here - conditional loading handled above */}
          {/* Main Bar Chart */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Assignments" fill={colors[0]} radius={[8, 8, 0, 0]} />
                <Bar dataKey="Marked" fill={colors[1]} radius={[8, 8, 0, 0]} />
                <Bar dataKey="Exercises" fill={colors[2]} radius={[8, 8, 0, 0]} />
                <Bar dataKey="Avg Score" fill={colors[3]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((classData: ClassPerformanceData, index: number) => (
              <div
                key={classData.className}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{classData.className}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Assignments</p>
                      <p className="text-lg font-bold text-blue-600">{classData.assignmentsGiven}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Marked</p>
                      <p className="text-lg font-bold text-purple-600">{classData.assignmentsMarked}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Exercises</p>
                      <p className="text-lg font-bold text-pink-600">{classData.exercisesCompleted}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Participation</p>
                      <p className="text-lg font-bold text-amber-600">{classData.participationRate}%</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Avg Score: <span className="text-blue-600 dark:text-blue-400">{classData.averageScore}%</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Assignments</p>
              <p className="text-2xl font-bold text-blue-600">{data.reduce((sum, c) => sum + c.assignmentsGiven, 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Marked</p>
              <p className="text-2xl font-bold text-purple-600">{data.reduce((sum, c) => sum + c.assignmentsMarked, 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Exercises</p>
              <p className="text-2xl font-bold text-pink-600">{data.reduce((sum, c) => sum + c.exercisesCompleted, 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Participation</p>
              <p className="text-2xl font-bold text-amber-600">
                {data.length > 0 ? Math.round(data.reduce((sum, c) => sum + c.participationRate, 0) / data.length) : 0}%
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
