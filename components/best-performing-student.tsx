"use client"

import { useState, useEffect } from "react"
import { academicsAPI, usersAPI } from "@/lib/api"
import { Trophy, Medal, Award, Star, TrendingUp, User, GraduationCap, BookOpen, CheckCircle } from "lucide-react"

interface TerminalReport {
  id: number
  student: number
  student_name?: string
  class_obj: number
  class_name?: string
  academic_session: number
  session_name?: string
  total_marks: number
  average_marks: number
  grade: string
  position: number
  total_students: number
  attendance_percentage?: number
}

interface Student {
  id: number
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  student_id?: string
}

export function BestPerformingStudent() {
  const [topStudents, setTopStudents] = useState<TerminalReport[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [reportsRes, studentsRes, sessionsRes] = await Promise.all([
        academicsAPI.terminalReports(),
        usersAPI.students(),
        academicsAPI.academicSessions(),
      ])

      const reports: TerminalReport[] = reportsRes.data.results || reportsRes.data || []
      const studentsData: Student[] = studentsRes.data.results || studentsRes.data || []
      const sessions = sessionsRes.data.results || sessionsRes.data || []

      setStudents(studentsData)

      const currentSession = sessions.find((s: any) => s.is_current)
      
      let filteredReports = reports
      if (currentSession) {
        filteredReports = reports.filter((r) => r.academic_session === currentSession.id)
      }

      if (filteredReports.length === 0) {
        filteredReports = reports
      }

      // Sort by average marks and get top 5
      const sortedReports = [...filteredReports]
        .sort((a, b) => (b.average_marks || 0) - (a.average_marks || 0))
        .slice(0, 5)

      // Add student names
      const reportsWithNames = sortedReports.map(report => {
        const student = studentsData.find((s) => (s.user?.id || s.id) === report.student)
        return {
          ...report,
          student_name: student 
            ? `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim() 
            : `Student ${report.student}`
        }
      })

      setTopStudents(reportsWithNames)
    } catch (err) {
      console.error("[BestPerformingStudent] Error fetching data:", err)
      setError("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "B": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "C": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "D": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "F": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1: return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Trophy, iconColor: "text-amber-500" }
      case 2: return { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", icon: Medal, iconColor: "text-slate-400" }
      case 3: return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: Award, iconColor: "text-orange-500" }
      default: return { bg: "bg-slate-50 dark:bg-slate-800/50", text: "text-slate-500 dark:text-slate-400", icon: Star, iconColor: "text-slate-300" }
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Top Performing Students</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error && topStudents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Top Performing Students</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">{error}</p>
      </div>
    )
  }

  if (topStudents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Top Performing Students</h3>
        </div>
        <div className="text-center py-8">
          <User className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No student data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Top Performing Students</h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">Top 5</span>
      </div>

      <div className="space-y-3">
        {topStudents.map((student, index) => {
          const positionStyle = getPositionStyle(index + 1)
          const PositionIcon = positionStyle.icon
          
          return (
            <div
              key={student.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Position */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${positionStyle.bg}`}>
                <PositionIcon className={`w-4 h-4 ${positionStyle.iconColor}`} />
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {student.student_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {student.class_name || `Class ${student.class_obj}`}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {student.average_marks?.toFixed(1)}%
                </p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getGradeColor(student.grade)}`}>
                  {student.grade}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Class Average</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {(topStudents.reduce((sum, s) => sum + (s.average_marks || 0), 0) / topStudents.length).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

