"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthContext } from "@/lib/auth-context"
import { attendanceAPI, usersAPI, academicsAPI } from "@/lib/api"
import { 
  Users, Search, CheckCircle, XCircle, Clock, 
  UserCheck, Download, Filter, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Loader from "@/components/loader"

type Tab = 'mark' | 'summary'

function AttendanceContent() {
  const searchParams = useSearchParams()
  const initialClass = searchParams.get('class') || ''
  
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<Tab>('mark')
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState(initialClass)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  
  const [students, setStudents] = useState<any[]>([])
const [studentNames, setStudentNames] = useState<Record<number, string>>({})
  const [studentAvatars, setStudentAvatars] = useState<Record<number, string>>({})
  const [attendance, setAttendance] = useState<Record<number, string>>({})
  
  const [summaryData, setSummaryData] = useState<any[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const res = await usersAPI.teacherClasses()
        setClasses(res.data.results || res.data || [])
      } catch (error) {
        console.error("Failed to fetch classes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  // Fetch subjects for selected class
  useEffect(() => {
    const fetchClassSubjects = async () => {
      if (!selectedClass) {
        setSubjects([])
        return
      }
      try {
        const res = await academicsAPI.get("/class-subjects/", { class_obj: selectedClass })
        const classSubjects = res.data.results || res.data || []
        const subjectIds = classSubjects.map((cs: any) => cs.subject)

        const subjectsRes = await academicsAPI.get("/subjects/", { id__in: subjectIds.join(",") })
        setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
      }
    }
    fetchClassSubjects()
  }, [selectedClass])

// Fetch students for selected class using StudentClass (all students in class)
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([])
        return
      }
      try {
        const res = await academicsAPI.get("/student-classes/", { class_obj: selectedClass })
        const classEnrollments = res.data.results || res.data || []
        setStudents(classEnrollments)

        // Initialize attendance state
        const newAttendance: Record<number, string> = {}
        classEnrollments.forEach((entry: any) => {
          newAttendance[entry.student] = "present"
        })
        setAttendance(newAttendance)

        // Fetch student names and profile pictures
        const newStudentNames: Record<number, string> = {}
        const newStudentAvatars: Record<number, string> = {}
        for (const entry of classEnrollments) {
          try {
            const userRes = await usersAPI.getById(entry.student)
            const userData = userRes.data
            newStudentNames[entry.student] = `${userData.first_name} ${userData.last_name}`

            // Fetch profile picture
            try {
              const picRes = await academicsAPI.profilePictureByUser(entry.student)
              const pics = picRes.data.results || picRes.data || []
              if (pics.length > 0) {
                newStudentAvatars[entry.student] = pics[0].display_url || pics[0].storage_url || pics[0].picture || ''
              }
            } catch (picError) {
              // No profile picture available
              console.log(`No profile pic for student ${entry.student}`)
            }
          } catch (error) {
            newStudentNames[entry.student] = `Student ${entry.student}`
          }
        }
        setStudentNames(newStudentNames)
        setStudentAvatars(newStudentAvatars)
      } catch (error) {
        console.error("Failed to fetch class students:", error)
      }
    }
    fetchStudents()
  }, [selectedClass])

  // Fetch attendance summary
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const res = await attendanceAPI.myStudentsSummary(
        selectedClass ? parseInt(selectedClass) : undefined,
        startDate || undefined,
        endDate || undefined
      )
      setSummaryData(res.data.results || [])
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchSummary()
    }
  }, [activeTab, selectedClass, startDate, endDate])

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) {
      alert("Please select class, subject, and date")
      return
    }

    setSubmitting(true)
    try {
      const attendances = students.map((enrollment: any) => ({
        class_obj: Number.parseInt(selectedClass),
        subject: Number.parseInt(selectedSubject),
        student: enrollment.student,
        status: attendance[enrollment.student] || "present",
        date: selectedDate,
        teacher: user?.id,
      }))

      await attendanceAPI.bulkCreate({ attendances })
      alert("Attendance marked successfully!")
      setAttendance({})
      if (selectedClass) {
        setSelectedClass("")
      }
      setSelectedSubject("")
    } catch (error: any) {
      console.error("Failed to submit attendance:", error)
      alert(error?.response?.data?.detail || "Failed to mark attendance")
    } finally {
      setSubmitting(false)
    }
  }

  const markAllPresent = () => {
    const newAttendance: Record<number, string> = {}
    students.forEach((enrollment: any) => {
      newAttendance[enrollment.student] = "present"
    })
    setAttendance(newAttendance)
  }

  const markAllAbsent = () => {
    const newAttendance: Record<number, string> = {}
    students.forEach((enrollment: any) => {
      newAttendance[enrollment.student] = "absent"
    })
    setAttendance(newAttendance)
  }

  const filteredStudents = students.filter((enrollment: any) => {
    const name = studentNames[enrollment.student] || ""
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 }
    students.forEach((enrollment: any) => {
      const status = attendance[enrollment.student] || "present"
      if (counts[status as keyof typeof counts] !== undefined) {
        counts[status as keyof typeof counts]++
      }
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="md" color="#f5c607" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student attendance for your classes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('mark')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'mark'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline-block mr-2" />
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Attendance Summary
        </button>
      </div>

      {/* Mark Attendance Tab */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Class/Subject/Date Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Select Class & Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Choose a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.student_count} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Select Subject</Label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary disabled:opacity-50"
                    disabled={!selectedClass}
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedClass && students.length > 0 && (
            <>
              {/* Quick Actions & Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllPresent}
                    className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />All Present
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAbsent}
                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />All Absent
                  </Button>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-lg font-bold text-green-700">{statusCounts.present}</p>
                  <p className="text-xs text-green-600">Present</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <XCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
                  <p className="text-lg font-bold text-red-700">{statusCounts.absent}</p>
                  <p className="text-xs text-red-600">Absent</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-lg font-bold text-yellow-700">{statusCounts.late}</p>
                  <p className="text-xs text-yellow-600">Late</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <UserCheck className="h-5 w-5 mx-auto text-gray-600 mb-1" />
                  <p className="text-lg font-bold text-gray-700">{students.length}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>

              {/* Students List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStudents.map((enrollment: any) => (
                  <div 
                    key={enrollment.id} 
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white"
                  >
                    <div className="flex items-center gap-3">
                      {studentAvatars[enrollment.student] ? (
                        <img 
                          src={studentAvatars[enrollment.student]} 
                          alt={studentNames[enrollment.student] || ''}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 hover:ring-secondary"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-medium text-sm">
                          {(studentNames[enrollment.student] || "S").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {studentNames[enrollment.student] || `Student ${enrollment.student}`}
                      </span>
                    </div>
                    <select
                      value={attendance[enrollment.student] || "present"}
                      onChange={(e) =>
                        setAttendance({
                          ...attendance,
                          [enrollment.student]: e.target.value,
                        })
                      }
                      className={`px-3 py-1.5 border rounded-lg text-sm font-medium ${
                        attendance[enrollment.student] === 'present' ? 'bg-green-50 border-green-200 text-green-700' :
                        attendance[enrollment.student] === 'absent' ? 'bg-red-50 border-red-200 text-red-700' :
                        attendance[enrollment.student] === 'late' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                disabled={submitting} 
                className="w-full gap-2 bg-secondary hover:bg-primary"
                size="lg"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Attendance
                  </>
                )}
              </Button>
            </>
          )}

          {selectedClass && students.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No students enrolled in this class</p>
              </CardContent>
            </Card>
          )}

          {!selectedClass && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a class to mark attendance</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={fetchSummary} className="bg-secondary hover:bg-primary">
                  Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setStartDate(""); setEndDate(""); setSelectedClass("") }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Student Attendance Summary</CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size="md" color="#f5c607" />
                </div>
              ) : summaryData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium">Student</th>
                        <th className="text-left py-3 px-4 font-medium">Class</th>
                        <th className="text-center py-3 px-4 font-medium">Present</th>
                        <th className="text-center py-3 px-4 font-medium">Absent</th>
                        <th className="text-center py-3 px-4 font-medium">Late</th>
                        <th className="text-center py-3 px-4 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.map((student) => (
                        <tr key={student.student_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{student.student_name}</p>
                              <p className="text-sm text-gray-500">{student.student_id_number || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{student.class_name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-green-600 font-medium">{student.present_days}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-600 font-medium">{student.absent_days}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-yellow-600 font-medium">{student.late_days}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${
                              student.attendance_percentage >= 75 ? 'text-green-600' :
                              student.attendance_percentage >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {student.attendance_percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No attendance data found</p>
                  <p className="text-sm">Try adjusting your filters or mark some attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AttendanceContent />
    </Suspense>
  )
}

