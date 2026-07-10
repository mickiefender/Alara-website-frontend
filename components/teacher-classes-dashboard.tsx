"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, FileText, Clock, Hash, BarChart3 } from "lucide-react"
import { academicsAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { TeacherClassStats } from "./teacher-class-stats"

interface ClassTeacher {
  id: number
  class_name: string
  class_code?: string
  teacher_name: string
  is_form_tutor: boolean
  student_count?: number
}

interface StudentInClass {
  id: number
  student_name: string
  student_email: string
  is_active: boolean
}

interface ClassSubject {
  id: number
  subject_name: string
  subject_code: string
}

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount: number
}

export function TeacherClassesDashboard() {
  const { user } = useAuthContext()
  const [managedClasses, setManagedClasses] = useState<ClassTeacher[]>([])
  const [studentsInClass, setStudentsInClass] = useState<StudentInClass[]>([])
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([])
  const [performanceData, setPerformanceData] = useState<ClassPerformanceData | null>(null)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassTeacher | null>(null)

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true)
      const classesRes = await academicsAPI.classTeachers()
      const allClasses = classesRes.data.results || classesRes.data
      const teacherClasses = Array.isArray(allClasses)
        ? allClasses.filter((ct: any) => ct.teacher === user?.id)
        : []

      // Calculate student counts and normalize data
      let classesWithDetails = teacherClasses
      try {
        const studentsRes = await academicsAPI.studentClasses()
        const allStudents = studentsRes.data.results || studentsRes.data
        
        if (Array.isArray(allStudents)) {
          classesWithDetails = teacherClasses.map((tc: any) => ({
            ...tc,
            student_count: allStudents.filter((s: any) => s.class_obj === tc.id).length,
            class_code: tc.class_code || tc.code // Try 'code' if 'class_code' is missing
          }))
        }
      } catch (err) {
        console.error("Failed to calculate student counts", err)
      }

      setManagedClasses(classesWithDetails)

      if (classesWithDetails.length > 0) {
        setSelectedClass(classesWithDetails[0])
        await loadClassDetails(classesWithDetails[0])
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load classes")
    } finally {
      setLoading(false)
    }
  }

  const loadClassDetails = async (classTeacher: ClassTeacher) => {
    try {
      // Get students in class
      const studentsRes = await academicsAPI.studentClasses()
      const allStudents = studentsRes.data.results || studentsRes.data
      const classStudents = Array.isArray(allStudents)
        ? allStudents.filter((s: any) => s.class_obj === classTeacher.id)
        : []
      setStudentsInClass(classStudents)

      // Get subjects in class
      const subjectsRes = await academicsAPI.classSubjects()
      const allSubjects = subjectsRes.data.results || subjectsRes.data
      const subjects = Array.isArray(allSubjects) ? allSubjects.filter((s: any) => s.class_obj === classTeacher.id) : []
      setClassSubjects(subjects)

      // Get performance stats for this class
      setPerformanceLoading(true)
      try {
        const perfRes = await academicsAPI.classPerformanceWithAttendance()
        const allPerf = perfRes.data.results || perfRes.data || []
        // Filter to selected class (backend returns school-wide top 10)
        const classPerf = allPerf.find((p: any) => p.classId === classTeacher.id)
        setPerformanceData(classPerf || null)
      } catch (perfErr) {
        console.error("Performance data fetch failed:", perfErr)
        setPerformanceData(null)
      } finally {
        setPerformanceLoading(false)
      }
    } catch (err: any) {
      setError("Failed to load class details")
    }
  }

  useEffect(() => {
    fetchTeacherClasses()
  }, [user?.id])

  if (loading) return <div className="text-center py-8">Loading your classes...</div>
  if (error) return <div className="text-red-500 py-8">{error}</div>
  if (managedClasses.length === 0)
    return <div className="text-center py-8 text-muted-foreground">You are not assigned to any classes</div>

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managedClasses.map((classTeacher) => (
              <div
                key={classTeacher.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedClass?.id === classTeacher.id ? "bg-primary text-white" : "hover:bg-muted"
                }`}
                onClick={async () => {
                  setSelectedClass(classTeacher)
                  await loadClassDetails(classTeacher)
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{classTeacher.class_name}</div>
                    <div className="text-sm opacity-75">
                      {classTeacher.is_form_tutor ? "Form Tutor" : "Subject Teacher"}
                    </div>
                  </div>
                  {classTeacher.class_code && (
                    <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {classTeacher.class_code}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm opacity-90">
                  <Users className="w-4 h-4" />
                  <span>{classTeacher.student_count || 0} Students</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

{selectedClass && (
        <>
          {/* Performance Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {selectedClass.class_name} Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TeacherClassStats 
                data={performanceData} 
                loading={performanceLoading}
                className="mb-6"
              />
            </CardContent>
          </Card>

<Tabs defaultValue="stats" className="w-full">
            <TabsList>
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Students ({studentsInClass.length})
              </TabsTrigger>
              <TabsTrigger value="subjects" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Subjects ({classSubjects.length})
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Stats ({performanceData?.studentCount || 0})
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <FileText className="w-4 h-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="grades" className="gap-2">
                <Clock className="w-4 h-4" />
                Grades
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      )}


          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students in {selectedClass.class_name}</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsInClass.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled in this class</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsInClass.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>{student.student_email}</TableCell>
                            <TableCell>
                              <Badge variant={student.is_active ? "default" : "secondary"}>
                                {student.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                {classSubjects.length === 0 ? (
                  <p className="text-muted-foreground">No subjects assigned to this class</p>
                ) : (
                  <div className="space-y-2">
                    {classSubjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{subject.subject_name}</p>
                          <p className="text-sm text-muted-foreground">{subject.subject_code}</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>{selectedClass?.class_name} Grade Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Key Metrics</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Average Grade:</span>
                            <Badge variant="default">{performanceData.averageScore.toFixed(1)}%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Pass Rate:</span>
                            <Badge variant="outline">{Math.round(performanceData.averageScore / 1.2).toFixed(0)}%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Performance Score:</span>
                            <Badge variant="secondary">{performanceData.performanceScore.toFixed(1)}%</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Class Size</h3>
                        <div className="text-3xl font-bold">{performanceData.studentCount}</div>
                        <p className="text-sm text-muted-foreground">Active students</p>
                      </div>
                    </div>
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Detailed grade distribution chart coming soon...</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Performance data loading...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Attendance tracking feature coming soon...</p>
                <Button className="mt-4">Open Attendance Tracker</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Record Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Grade entry interface coming soon...</p>
                <Button className="mt-4">Open Grade Entry</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
