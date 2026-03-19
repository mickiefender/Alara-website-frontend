"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuthContext } from "@/lib/auth-context"
import { usersAPI, academicsAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, FileText, Clock, Calendar, BookMarked, Star } from "lucide-react"
import Loader from '@/components/loader'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="md" color="#f5c607" />
      </div>
    )
  }
  
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Classes</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No classes assigned yet</p>
            <p className="text-sm mt-2">Classes assigned to you will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  {cls.is_form_tutor && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Star className="w-3 h-3 mr-1" /> Form Tutor
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookMarked size={18} />
                  <span>Code: {cls.class_code || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users size={18} />
                  <span>{cls.student_count || 0} Students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={18} />
                  <span>Level: {cls.level || 'N/A'}</span>
                </div>
                
                {cls.subjects_taught && cls.subjects_taught.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects_taught.map((subject: any) => (
                        <span 
                          key={subject.id} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/teacher/attendance?class=${cls.id}`} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                      Take Attendance
                    </Button>
                  </Link>
                  <Link href={`/dashboard/teacher/grades?class=${cls.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Grades
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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

