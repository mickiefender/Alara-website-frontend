"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp } from "lucide-react"
import { academicsAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { ProtectedRoute } from "@/lib/protected-route"
import { TeacherClassStats } from "@/components/teacher-class-stats"

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount: number
}

interface ClassTeacher {
  id: number
  class_name: string
}

export default function PerformancePage() {
  const { user } = useAuthContext()
  const [classesPerformance, setClassesPerformance] = useState<ClassPerformanceData[]>([])
  const [teacherClasses, setTeacherClasses] = useState<ClassTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassPerf, setSelectedClassPerf] = useState<ClassPerformanceData | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const [teacherClassesRes, perfRes] = await Promise.all([
          academicsAPI.classTeachers(),
          academicsAPI.classPerformanceWithAttendance()
        ])
        const teacherClassIds = teacherClassesRes.data.results?.map((ct: ClassTeacher) => ct.id) || []
        const allPerf = perfRes.data.results || perfRes.data || []
        const teacherPerf = allPerf.filter((p: ClassPerformanceData) => teacherClassIds.includes(p.classId))
        setClassesPerformance(teacherPerf)
        setTeacherClasses(teacherClassesRes.data.results || [])
        if (teacherPerf.length > 0) {
          setSelectedClassPerf(teacherPerf[0])
        }
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformance()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">My Classes Performance</h1>
          <p className="text-muted-foreground">Analytics for your assigned classes ({teacherClasses.length})</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classesPerformance.map((perf) => (
                <div 
                  key={perf.classId}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                    selectedClassPerf?.classId === perf.classId ? "border-primary bg-primary/5 shadow-md" : ""
                  }`}
                  onClick={() => setSelectedClassPerf(perf)}
                >
                  <h3 className="font-semibold">{perf.className}</h3>
                  <p className="text-2xl font-bold text-primary">{perf.averageScore.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{perf.studentCount} students</p>
                </div>
              ))}
              {classesPerformance.length === 0 && (
                <div className="col-span-full p-12 text-center border-2 border-dashed border-muted rounded-lg">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Classes Assigned</h3>
                  <p className="text-muted-foreground">Performance data will appear here when you are assigned to classes.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedClassPerf && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {selectedClassPerf.className} Grade Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TeacherClassStats data={selectedClassPerf} loading={false} />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">
              <Users className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="grades">
              <TrendingUp className="w-4 h-4 mr-2" />
              Grades Distribution
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comparison chart across your classes coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Grade Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed grade distribution and top performers coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

