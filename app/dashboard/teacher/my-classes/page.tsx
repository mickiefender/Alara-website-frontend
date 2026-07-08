"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuthContext } from "@/lib/auth-context"
import { usersAPI, academicsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, FileText, Clock, Calendar, BookMarked, Star, ChevronRight } from "lucide-react"
import Link from "next/link"

function MyClassesContent() {
  const { user } = useAuthContext()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        setError(null)
        // Use the new teacherClasses API to get only assigned classes
        const res = await usersAPI.teacherClasses()
        console.log("Teacher classes response:", res)
        const classesData = res.data.results || res.data || []
        setClasses(Array.isArray(classesData) ? classesData : [])
      } catch (err: any) {
        console.error("Failed to fetch classes:", err)
        // More detailed error logging
        if (err.response) {
          console.error("Response status:", err.response.status)
          console.error("Response data:", err.response.data)
          setError(err.response.data?.detail || err.response.data?.message || "Failed to load classes")
        } else if (err.request) {
          console.error("No response received - network error:", err.request)
          setError("Network error. Please check your connection.")
        } else {
          console.error("Error message:", err.message)
          setError("Failed to load classes")
        }
        setClasses([])
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  if (error) return <div className="text-red-600 text-center py-8">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Classes</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg py-12 px-4 text-center bg-gray-50 dark:bg-gray-900">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">No classes assigned yet</p>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Classes assigned to you will appear here</p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-950">
          {classes.map((cls) => (
            <article 
              key={cls.id} 
              className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-l-4 border-l-secondary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {cls.name}
                    </h3>
                    {cls.is_form_tutor && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200 w-fit">
                        <Star className="w-3 h-3 mr-1" /> Form Tutor
                      </span>
                    )}
                  </div>

                  {/* Class Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <BookMarked size={18} className="flex-shrink-0" />
                      <span>Code: <span className="font-medium text-gray-900 dark:text-white">{cls.class_code || 'N/A'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users size={18} className="flex-shrink-0" />
                      <span><span className="font-medium text-gray-900 dark:text-white">{cls.student_count || 0}</span> Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={18} className="flex-shrink-0" />
                      <span>Level: <span className="font-medium text-gray-900 dark:text-white">{cls.level || 'N/A'}</span></span>
                    </div>
                  </div>

                  {/* Subjects */}
                  {cls.subjects_taught && cls.subjects_taught.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {cls.subjects_taught.map((subject: any) => (
                          <span 
                            key={subject.id} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-gray-900 dark:bg-secondary/30 dark:text-gray-100"
                          >
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-col gap-2 sm:w-auto">
                  <Link href={`/dashboard/teacher/attendance?class=${cls.id}`}>
                    <Button className="w-full sm:w-auto bg-secondary hover:bg-primary text-white" size="sm">
                      Take Attendance
                    </Button>
                  </Link>
                  <Link href={`/dashboard/teacher/grades?class=${cls.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto" size="sm">
                      Grades
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyClassesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyClassesContent />
    </Suspense>
  )
}