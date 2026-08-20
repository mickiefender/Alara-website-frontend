"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { academicsAPI } from "@/lib/api"
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
import { Search, Users, UserCheck, BookOpen, ArrowRight, AlertCircle, School, ClipboardList } from "lucide-react"
import { AssignTeachersToClass } from "@/components/assign-teachers-to-class"
import { AssignSubjectTeachers } from "@/components/assign-subject-teachers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLoadingState } from "@/components/page-loading-state"

interface Class {
  id: number
  name: string
  code: string
  level?: string
  capacity?: number
}

interface ClassTeacherRecord {
  id: number
  class_obj: number
  class_name: string
  teacher: number
  teacher_name: string
  is_form_tutor: boolean
}

interface SubjectTeacherRecord {
  id: number
  class_obj: number
  class_name: string
  subject: number
  subject_name: string
  teacher: number
  teacher_name: string
  is_active: boolean
}

interface StatCard {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
}

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [classTeachers, setClassTeachers] = useState<ClassTeacherRecord[]>([])
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacherRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClassName, setSelectedClassName] = useState<string>("")
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
      const [classTeachersRes, subjectTeachersRes] = await Promise.all([
        academicsAPI.classTeachers(),
        academicsAPI.classSubjectTeachers(),
      ])
      setClassTeachers(classTeachersRes.data.results || classTeachersRes.data || [])
      setSubjectTeachers(subjectTeachersRes.data.results || subjectTeachersRes.data || [])
    } catch (err) {
      // Stats are non-critical; the class list still renders.
      console.error("[v0] Error fetching teacher assignment stats:", err)
    }
  }

  const classTeacherCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const record of classTeachers) {
      counts.set(record.class_obj, (counts.get(record.class_obj) || 0) + 1)
    }
    return counts
  }, [classTeachers])

  const subjectTeacherCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const record of subjectTeachers) {
      counts.set(record.class_obj, (counts.get(record.class_obj) || 0) + 1)
    }
    return counts
  }, [subjectTeachers])

  const stats: StatCard[] = [
    { label: "Total Classes", value: classes.length, icon: School, iconBg: "bg-blue-50 text-blue-600" },
    { label: "Class Teacher Assignments", value: classTeachers.length, icon: Users, iconBg: "bg-emerald-50 text-emerald-600" },
    { label: "Subject Teacher Assignments", value: subjectTeachers.length, icon: UserCheck, iconBg: "bg-violet-50 text-violet-600" },
    { label: "Classes With Teachers", value: classTeacherCounts.size, icon: ClipboardList, iconBg: "bg-amber-50 text-amber-600" },
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
            <h1 className="text-2xl font-bold text-slate-900">Teacher Assignments</h1>
            <p className="text-slate-500 text-sm mt-0.5">Assign teachers to classes and subjects</p>
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
        <CardContent className="p-0">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No classes found</p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm ? "Try adjusting your search criteria" : "Create classes first"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="px-5">Class</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Class Teachers</TableHead>
                  <TableHead>Subject Teachers</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => {
                  const classTeacherCount = classTeacherCounts.get(classItem.id) || 0
                  const subjectTeacherCount = subjectTeacherCounts.get(classItem.id) || 0

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
                        <Badge variant="secondary" className="gap-1.5">
                          <Users className="w-3 h-3" />
                          {classTeacherCount} assigned
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1.5">
                          <BookOpen className="w-3 h-3" />
                          {subjectTeacherCount} assigned
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{classItem.capacity || "—"}</TableCell>
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
                              Manage Teachers
                              <ArrowRight size={15} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                Teacher Management for <span className="text-secondary">{selectedClassName}</span>
                              </DialogTitle>
                            </DialogHeader>
                            {selectedClassId && (
                              <Tabs defaultValue="class-teachers" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                  <TabsTrigger value="class-teachers">Class Teachers</TabsTrigger>
                                  <TabsTrigger value="subject-teachers">Subject Teachers</TabsTrigger>
                                </TabsList>
                                <TabsContent value="class-teachers" className="space-y-4">
                                  <div className="text-sm text-slate-500 mb-4">
                                    Assign main teachers who manage the entire class
                                  </div>
                                  <AssignTeachersToClass classId={selectedClassId} className={selectedClassName} />
                                </TabsContent>
                                <TabsContent value="subject-teachers" className="space-y-4">
                                  <div className="text-sm text-slate-500 mb-4">
                                    Assign teachers to specific subjects within this class
                                  </div>
                                  <AssignSubjectTeachers classId={selectedClassId} className={selectedClassName} />
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
