"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authAPI, attendanceAPI } from "@/lib/api"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const userRes = await authAPI.me()
        const userId = userRes.data.id
        const res = await attendanceAPI.studentReport(userId)
        setAttendance(res.data)
      } catch (err: any) {
        setError("Failed to load attendance")
        if (process.env.NODE_ENV === 'development') { console.error("[v0] Failed to fetch attendance:", err) }
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Attendance Report</h1>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {attendance && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{attendance.total_days || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{attendance.present_days || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{attendance.absent_days || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">Late</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{attendance.late_days || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{Math.round(attendance?.presence_percentage || 0)}%</p>
                    <p className="text-muted-foreground mt-2">Overall attendance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {attendance.records && attendance.records.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Subject</th>
                          <th className="text-left py-2 px-4">Class</th>
                          <th className="text-left py-2 px-4">Teacher</th>
                          <th className="text-center py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.records.map((record: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{record.date}</td>
                            <td className="py-2 px-4">{record.subject_name || 'N/A'}</td>
                            <td className="py-2 px-4">{record.class_name || 'N/A'}</td>
                            <td className="py-2 px-4">{record.teacher_name || 'N/A'}</td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                                  record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
