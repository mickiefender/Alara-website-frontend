"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useAuthContext } from "@/lib/auth-context"

interface RevenueData {
  month: string
  collections: number
  fees: number
  expenses: number
}

export function FeesChart() {
  const { user } = useAuthContext()
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState<"bar" | "area">("bar")

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const schoolId = user?.school_id || "default"
        const response = await fetch(`/api/revenue?school_id=${schoolId}`)
        const result = await response.json()
        
        if (result.status && result.data?.monthly_data) {
          setData(result.data.monthly_data)
        } else {
          // Fallback to mock data if no API data
          setData([
            { month: "Jan", collections: 185000, fees: 150000, expenses: 85000 },
            { month: "Feb", collections: 210000, fees: 175000, expenses: 92000 },
            { month: "Mar", collections: 195000, fees: 160000, expenses: 78000 },
            { month: "Apr", collections: 240000, fees: 200000, expenses: 110000 },
            { month: "May", collections: 225000, fees: 185000, expenses: 95000 },
            { month: "Jun", collections: 280000, fees: 230000, expenses: 125000 },
          ])
        }
      } catch (error) {
        // Use fallback data
        setData([
          { month: "Jan", collections: 185000, fees: 150000, expenses: 85000 },
          { month: "Feb", collections: 210000, fees: 175000, expenses: 92000 },
          { month: "Mar", collections: 195000, fees: 160000, expenses: 78000 },
          { month: "Apr", collections: 240000, fees: 200000, expenses: 110000 },
          { month: "May", collections: 225000, fees: 185000, expenses: 95000 },
          { month: "Jun", collections: 280000, fees: 230000, expenses: 125000 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [user?.school_id])

  const totalCollections = data.reduce((sum, item) => sum + item.collections, 0)
  const totalFees = data.reduce((sum, item) => sum + item.fees, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const netRevenue = totalCollections - totalExpenses

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 dark:text-slate-300">
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ¢{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Collections</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">¢{(totalCollections / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Fees</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">¢{(totalFees / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Net Revenue</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">¢{(netRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveMetric("bar")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeMetric === "bar"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setActiveMetric("area")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeMetric === "area"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Trend View
        </button>
      </div>

      {/* Chart */}
      <div className="h-[240px] -mx-2">
        {activeMetric === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `¢${value / 1000}K`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar 
                dataKey="collections" 
                name="Collections"
                fill="url(#emeraldGradient)" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
              <Bar 
                dataKey="fees" 
                name="Fees"
                fill="url(#blueGradient)" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `¢${value / 1000}K`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="collections" 
                name="Collections"
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCollections)" 
              />
              <Area 
                type="monotone" 
                dataKey="fees" 
                name="Fees"
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorFees)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Collections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Fees</span>
        </div>
      </div>
    </div>
  )
}

