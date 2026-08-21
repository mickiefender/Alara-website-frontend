"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { academicsAPI, usersAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Users,
  UserCheck,
  ArrowRight,
  AlertCircle,
  School,
  ClipboardList,
} from "lucide-react"
import { EnrollStudentsInClass } from "@/components/enroll-students-in-class"
import { PageLoadingState } from "@/components/page-loading-state"

interface Class {
  id: number
  name: string
  code: string
  level?: string
  capacity?: number
}

interface StudentClassRecord {
  id: number
  class_obj: number
  class_name: string
  student: number
  student_name: string
  student_email: string
  is_active: boolean
  assigned_date: string
}

interface Student {
  id: number
  email: string
  first_name: string
  last_name: string
  user?: number
  user_data?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
}

interface StatCard {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
}

export default function StudentAssignmentsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [enrollments, setEnrollments] = useState<StudentClassRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClassName, setSelectedClassName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchClasses()
    fetchStats()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicsAPI.classes()
      setClasses(response.data.results || response.data || [])
    } catch (err: any) {
      console.error("[v0] Error fetching classes:", err)
      setError("Failed to load classes")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [enrollmentsRes, studentsRes] = await Promise.all([
        academicsAPI.studentClasses(),
        usersAPI.students(),
      ])
      setEnrollments(enrollmentsRes.data.results || enrollmentsRes.data || [])
      setStudents(studentsRes.data.results || studentsRes.data || [])
    } catch (err) {
      // Stats are non-critical; the class list still renders.
      console.error("[v0] Error fetching enrollment stats:", err)
    }
  }

  const enrollmentCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const enrollment of enrollments) {
      counts.set(enrollment.class_obj, (counts.get(enrollment.class_obj) || 0) + 1)
    }
    return counts
  }, [enrollments])

  const enrolledUserIds = useMemo(() => {
    return new Set(enrollments.map((enrollment) => enrollment.student))
  }, [enrollments])

  const unassignedCount = useMemo(() => {
    return students.filter((student) => {
      const userId = student.user_data?.id || student.user
      return userId ? !enrolledUserIds.has(userId) : false
    }).length
  }, [students, enrolledUserIds])

  const stats: StatCard[] = [
    { label: "Total Classes", value: classes.length, icon: School, iconBg: "bg-blue-50 text-blue-600" },
    { label: "Total Students", value: students.length, icon: Users, iconBg: "bg-emerald-50 text-emerald-600" },
    { label: "Class Enrollments", value: enrollments.length, icon: UserCheck, iconBg: "bg-violet-50 text-violet-600" },
    { label: "Unassigned Students", value: unassignedCount, icon: ClipboardList, iconBg: "bg-amber-50 text-amber-600" },
  ]

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectClass = (classItem: Class) => {
    setSelectedClassId(classItem.id)
    setSelectedClassName(classItem.name)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <PageLoadingState message="Loading classes..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/25 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Enrollment</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage student assignments to classes</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-slate-900 leading-tight">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Search classes by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 border-slate-200 bg-white shadow-sm focus-visible:ring-secondary/40"
        />
      </div>

      {/* Classes List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredClasses.length === 0 ? (
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No classes found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm ? "Try adjusting your search criteria" : "Create classes first"}
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="px-5">Class</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((classItem) => {
                const enrolledCount = enrollmentCounts.get(classItem.id) || 0
                const pct = classItem.capacity
                  ? Math.min(Math.round((enrolledCount / classItem.capacity) * 100), 100)
                  : null
                const isFull = classItem.capacity !== undefined && enrolledCount >= classItem.capacity

                return (
                  <TableRow key={classItem.id} className="group">
                    <TableCell className="px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-semibold text-sm shrink-0">
                          {classItem.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{classItem.name}</p>
                          <p className="text-xs text-slate-500">{classItem.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{classItem.level || "—"}</TableCell>
                    <TableCell>
                      {classItem.capacity ? (
                        <div className="w-28">
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${pct !== null && pct >= 90 ? "bg-red-500" : pct !== null && pct >= 60 ? "bg-amber-500" : "bg-secondary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{classItem.capacity} seats</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">{enrolledCount}</span>
                      <span className="text-slate-400 text-sm"> students</span>
                    </TableCell>
                    <TableCell>
                      {classItem.capacity !== undefined && enrolledCount > 0 ? (
                        <Badge variant={isFull ? "destructive" : "secondary"}>
                          {isFull ? "Full" : "Open"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Empty</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Dialog
                        open={dialogOpen && selectedClassId === classItem.id}
                        onOpenChange={setDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleSelectClass(classItem)}
                            className="bg-secondary hover:bg-blue-700 text-white gap-2 group-hover:shadow-md transition-shadow"
                          >
                            Manage Students
                            <ArrowRight size={15} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-6xl w-[95vw] p-0 gap-0 overflow-hidden">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border px-6 py-4">
                            <DialogHeader className="space-y-0">
                              <div className="flex items-start gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-secondary/15 ring-1 ring-secondary/20 flex items-center justify-center flex-shrink-0">
                                  <Users size={20} className="text-secondary" />
                                </div>
                                <div className="min-w-0">
                                  <DialogTitle className="text-lg font-bold text-foreground">
                                    Manage Students
                                  </DialogTitle>
                                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                    Enrolled students in{" "}
                                    <span className="font-medium text-foreground">{selectedClassName}</span>
                                  </p>
                                </div>
                              </div>
                            </DialogHeader>
                          </div>

                          {/* Body */}
                          <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                            {selectedClassId && (
                              <EnrollStudentsInClass classId={selectedClassId} className={selectedClassName} />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
