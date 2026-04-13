"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Grid3X3, 
  List,
  Building2,
  User,
  MapPin,
  BookOpen,
  Filter,
  X,
  Download
} from "lucide-react"
import { academicsAPI, usersAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { CardLoader } from "@/components/circular-loader"
import html2pdf from "html2pdf.js"

// Days configuration
const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday", short: "MON" },
  { value: "tuesday", label: "Tuesday", short: "TUE" },
  { value: "wednesday", label: "Wednesday", short: "WED" },
  { value: "thursday", label: "Thursday", short: "THU" },
  { value: "friday", label: "Friday", short: "FRI" },
  { value: "saturday", label: "Saturday", short: "SAT" },
  { value: "sunday", label: "Sunday", short: "SUN" },
]

// Time slots
const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", 
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
]

// Professional subject colors palette
const SUBJECT_COLORS = [
  { bg: "#e0f2fe", border: "#7dd3fc", text: "#0369a1", ring: "#0ea5e9" },
  { bg: "#dbeafe", border: "#93c5fd", text: "#1d4ed8", ring: "#3b82f6" },
  { bg: "#cffafe", border: "#99f6e4", text: "#0891b2", ring: "#06b6d4" },
  { bg: "#d1fae5", border: "#87f5c5", text: "#047857", ring: "#10b981" },
  { bg: "#ecfdf5", border: "#bbf7d0", text: "#16a34a", ring: "#22c55e" },
  { bg: "#f0fdf4", border: "#86efac", text: "#15803d", ring: "#16a34a" },
  { bg: "#fefce8", border: "#fef08a", text: "#ca8a04", ring: "#eab308" },
  { bg: "#fef3c7", border: "#fcd34d", text: "#a16207", ring: "#f59e0b" },
  { bg: "#fed7aa", border: "#fdba74", text: "#c2410c", ring: "#f97316" },
  { bg: "#fee2e2", border: "#fca5a5", text: "#b91c1c", ring: "#ef4444" },
  { bg: "#fce7f3", border: "#f9a8d4", text: "#be185d", ring: "#f472b6" },
  { bg: "#fae8ff", border: "#e879f9", text: "#7c3aed", ring: "#a855f7" },
  { bg: "#fdf4ff", border: "#f3e8ff", text: "#7e22ce", ring: "#9333ea" },
  { bg: "#f8fafc", border: "#cbd5e1", text: "#1e293b", ring: "#475569" }
]

// Day header colors
const DAY_COLORS: { [key: string]: { bg: string; text: string } } = {
  monday: { bg: "#eff6ff", text: "#1e40af" },
  tuesday: { bg: "#eff6ff", text: "#1d4ed8" },
  wednesday: { bg: "#ecfdf5", text: "#059669" },
  thursday: { bg: "#ecfdf5", text: "#047857" },
  friday: { bg: "#fef3c7", text: "#d97706" },
  saturday: { bg: "#fef3c7", text: "#b45309" },
  sunday: { bg: "#fee2e2", text: "#dc2626" },
}

interface TimetableEntry {
  id: number
  class_obj: number | { id: number; name: string }
  class_name?: string
  subject: number | { id: number; name: string; code?: string }
  subject_name?: string
  subject_code?: string
  teacher: number | { 
    id: number; 
    user?: { first_name: string; last_name: string }; 
    first_name?: string; 
    last_name?: string;
    user_data?: {
      id: number
      email: string
      first_name: string
      last_name: string
      username: string
      phone: string
      role: string
    }
    username?: string
  }
  teacher_name?: string
  day: string
  start_time: string
  end_time: string
  venue?: string
}

interface ClassData {
  id: number
  name: string
}

interface SubjectData {
  id: number
  name: string
  code?: string
}

interface TeacherData {
  id: number
  first_name?: string
  last_name?: string
  user?: { first_name: string; last_name: string }
  user_data?: {
    id: number
    email: string
    first_name: string
    last_name: string
    username: string
    phone: string
    role: string
  }
  username?: string
}

export function ModernTimetable() {
  const { user } = useAuthContext()
  const [timetables, setTimetables] = useState<TimetableEntry[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedDay, setSelectedDay] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const timetableRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    class_obj: "",
    subject: "",
    teacher: "",
    day: "",
    start_time: "",
    end_time: "",
    venue: "",
  })

  const isAdmin = user?.role === "school_admin"

  const fetchData = async () => {
    try {
      setLoading(true)
      const [timetablesRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        academicsAPI.timetables(),
        academicsAPI.classes(),
        academicsAPI.subjects(),
        usersAPI.teachers(),
      ])

      setTimetables(timetablesRes.data.results || timetablesRes.data || [])
      setClasses(classesRes.data.results || classesRes.data || [])
      setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      setTeachers(teachersRes.data.results || teachersRes.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter timetables
  const filteredTimetables = timetables.filter((entry) => {
    const classId = typeof entry.class_obj === 'object' ? entry.class_obj?.id : entry.class_obj
    const matchesClass = selectedClass === "all" || classId?.toString() === selectedClass
    const matchesDay = selectedDay === "all" || entry.day.toLowerCase() === selectedDay
    const subjectName = entry.subject_name || (typeof entry.subject === 'object' ? entry.subject?.name : '')
    const teacherName = entry.teacher_name || (typeof entry.teacher === 'object' ? `${entry.teacher?.user?.first_name || entry.teacher?.first_name || ''} ${entry.teacher?.user?.last_name || entry.teacher?.last_name || ''}` : '')
    const matchesSearch = !searchTerm || 
      subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.venue || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesClass && matchesDay && matchesSearch
  })

  // Get unique time slots from filtered data
  const getTimeSlots = () => {
    const times = new Set<string>()
    filteredTimetables.forEach(entry => {
      if (entry.start_time && entry.end_time) {
        times.add(entry.start_time.substring(0, 5))
      }
    })
    return Array.from(times).sort()
  }

  // Get class at specific day and time
  const getClassAtTime = (day: string, time: string) => {
    const timeHour = time.split(":")[0]
    return filteredTimetables.find(entry => {
      const entryDay = entry.day.toLowerCase()
      const entryTime = entry.start_time.substring(0, 5)
      return entryDay === day.toLowerCase() && entryTime.startsWith(timeHour.split(":")[0])
    })
  }

  // Get subject color
  const getSubjectColor = (subjectId: number): { bg: string; border: string; text: string; ring: string } => {
    const colorIndex = Math.abs(subjectId) % SUBJECT_COLORS.length
    return {
      bg: SUBJECT_COLORS[colorIndex].bg as string,
      border: SUBJECT_COLORS[colorIndex].border as string,
      text: SUBJECT_COLORS[colorIndex].text as string,
      ring: SUBJECT_COLORS[colorIndex].ring as string
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      class_obj: formData.class_obj ? parseInt(formData.class_obj) : null,
      subject: formData.subject ? parseInt(formData.subject) : null,
      teacher: formData.teacher ? parseInt(formData.teacher) : null,
      day: formData.day,
      start_time: formData.start_time,
      end_time: formData.end_time,
      venue: formData.venue,
    }

    try {
      if (editingEntry) {
        await academicsAPI.updateTimetable(editingEntry.id, payload)
      } else {
        await academicsAPI.createTimetable(payload)
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save timetable entry")
    }
  }

  // Handle edit
  const handleEdit = (entry: TimetableEntry) => {
    const classId = typeof entry.class_obj === 'object' ? entry.class_obj?.id : entry.class_obj
    const subjectId = typeof entry.subject === 'object' ? entry.subject?.id : entry.subject
    const teacherId = typeof entry.teacher === 'object' ? entry.teacher?.id : entry.teacher
    
    setFormData({
      class_obj: classId?.toString() || "",
      subject: subjectId?.toString() || "",
      teacher: teacherId?.toString() || "",
      day: entry.day.toLowerCase(),
      start_time: entry.start_time,
      end_time: entry.end_time,
      venue: entry.venue || "",
    })
    setEditingEntry(entry)
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this timetable entry?")) return
    try {
      await academicsAPI.deleteTimetable(id)
      fetchData()
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete entry")
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      class_obj: "",
      subject: "",
      teacher: "",
      day: "",
      start_time: "",
      end_time: "",
      venue: "",
    })
    setEditingEntry(null)
  }

  // Get display name helpers
  const getClassName = (entry: TimetableEntry) => {
    if (entry.class_name) return entry.class_name
    if (typeof entry.class_obj === 'object') return entry.class_obj?.name
    return classes.find(c => c.id === entry.class_obj)?.name || `Class ${entry.class_obj}`
  }

  const getSubjectName = (entry: TimetableEntry) => {
    if (entry.subject_name) return entry.subject_name
    if (typeof entry.subject === 'object') return entry.subject?.name
    return subjects.find(s => s.id === entry.subject)?.name || `Subject ${entry.subject}`
  }

  const getTeacherName = (entry: TimetableEntry) => {
    if (entry.teacher_name) return entry.teacher_name
    if (typeof entry.teacher === 'object') {
      const t = entry.teacher
      let name = '';
      if (t?.user?.first_name && t.user.last_name) {
        name = `${t.user.first_name} ${t.user.last_name}`.trim();
      } else if (t?.first_name || t?.last_name) {
        name = `${t.first_name || ''} ${t.last_name || ''}`.trim();
      }
      if (name) return name;
    }
    const teacher = teachers.find(t => t.id === entry.teacher)
    if (teacher) {
      let name = '';
      if (teacher.user && teacher.user.first_name && teacher.user.last_name) {
        name = `${teacher.user.first_name} ${teacher.user.last_name}`.trim();
      } else if (teacher.first_name || teacher.last_name) {
        name = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
      } else if (teacher.username) {
        name = teacher.username;
      }
      if (name) return name;
    }
    return `Teacher ${entry.teacher}`;
  }

  const getSubjectId = (entry: TimetableEntry) => {
    if (typeof entry.subject === 'object') return entry.subject?.id
    return entry.subject
  }

  const downloadCsvFile = (fileName: string, rows: string[][]) => {
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const safe = (cell ?? "").toString().replace(/"/g, '""')
            return `"${safe}"`
          })
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadExcel = async () => {
    try {
      setExcelLoading(true)
      const classFilter = selectedClass === "all" ? "All-Classes" : (classes.find((c) => c.id.toString() === selectedClass)?.name || "Class")
      const rows: string[][] = [
        ["Day", "Start Time", "End Time", "Class", "Subject", "Teacher", "Venue"]
      ]

      filteredTimetables
        .slice()
        .sort((a, b) => {
          const dayOrderA = DAYS_OF_WEEK.findIndex((d) => d.value === a.day.toLowerCase())
          const dayOrderB = DAYS_OF_WEEK.findIndex((d) => d.value === b.day.toLowerCase())
          if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB
          return (a.start_time || "").localeCompare(b.start_time || "")
        })
        .forEach((entry) => {
          rows.push([
            entry.day,
            entry.start_time?.substring(0, 5) || "",
            entry.end_time?.substring(0, 5) || "",
            getClassName(entry),
            getSubjectName(entry),
            getTeacherName(entry),
            entry.venue || "",
          ])
        })

      downloadCsvFile(
        `School-Timetable-${classFilter}-${new Date().toISOString().split("T")[0]}.csv`,
        rows
      )
    } catch (err) {
      console.error("Excel export error:", err)
      setError("Excel export failed. Please try again.")
    } finally {
      setExcelLoading(false)
    }
  }

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    if (!timetableRef.current) return
    
    try {
      setDownloadLoading(true)
      
      // Clone element to avoid UI blocking
      const clonedElement = timetableRef.current.cloneNode(true) as HTMLElement
      clonedElement.style.position = 'absolute'
      clonedElement.style.left = '-9999px'
      clonedElement.style.top = '-9999px'
      clonedElement.style.width = timetableRef.current.offsetWidth + 'px'
      clonedElement.style.height = timetableRef.current.offsetHeight + 'px'
      document.body.appendChild(clonedElement)
      
      const element = clonedElement
      const classFilter = selectedClass === 'all' ? 'All Classes' : classes.find(c => c.id.toString() === selectedClass)?.name || 'All Classes'
      const opt = {
        margin: [15, 10, 10, 10],
        filename: `School-Timetable-${classFilter}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.offsetWidth,
          height: element.offsetHeight,
          logging: false,
          ignoreElements: (el: Element) => el.classList.contains('no-print')
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }
      
      const pdf = html2pdf(element, opt)
      pdf.save()
      
      // Cleanup
      document.body.removeChild(clonedElement)
      
    } catch (err) {
      console.error('PDF generation error:', err)
      setError("PDF generation failed. Try with fewer timetable entries or refresh the page.")
    } finally {
      setDownloadLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
      <CardHeader className="bg-secondary text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timetable Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CardLoader />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-cyan-600 text-white pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6" />
              Timetable Management
            </CardTitle>
            <CardDescription className="text-indigo-100 mt-1">
              Manage class schedules and weekly timetables
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={downloadLoading || filteredTimetables.length === 0}
              className="bg-white text-cyan-600 hover:bg-indigo-50 gap-2 print:no-print"
            >
              <Download className="w-4 h-4" />
              {downloadLoading ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              onClick={handleDownloadExcel}
              disabled={excelLoading || filteredTimetables.length === 0}
              className="bg-white text-cyan-600 hover:bg-indigo-50 gap-2 print:no-print"
            >
              <Download className="w-4 h-4" />
              {excelLoading ? "Preparing..." : "Download Excel"}
            </Button>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? "Edit Timetable Entry" : "Create Timetable Entry"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Select 
                          value={formData.class_obj} 
                          onValueChange={(value) => setFormData({ ...formData, class_obj: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select 
                          value={formData.subject} 
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subj) => (
                              <SelectItem key={subj.id} value={subj.id.toString()}>
                                {subj.code ? `${subj.code} - ` : ""}{subj.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher">Teacher</Label>
                        <Select 
                          value={formData.teacher} 
                          onValueChange={(value) => setFormData({ ...formData, teacher: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
{teachers.map((t) => {
  let displayName = '';
  if (t.user && t.user.first_name && t.user.last_name) {
    displayName = `${t.user.first_name} ${t.user.last_name}`.trim();
  } else if (t.first_name || t.last_name) {
    displayName = `${t.first_name || ''} ${t.last_name || ''}`.trim();
  } else if (t.user_data && t.user_data.first_name && t.user_data.last_name) {
    displayName = `${t.user_data.first_name} ${t.user_data.last_name}`.trim();
  } else if (t.username) {
    displayName = t.username;
  }
  return (
    <SelectItem key={t.id} value={t.id.toString()}>
      {displayName || `Teacher ${t.id}`}
    </SelectItem>
  );
})}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="day">Day</Label>
                        <Select 
                          value={formData.day} 
                          onValueChange={(value) => setFormData({ ...formData, day: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Select 
                          value={formData.start_time} 
                          onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Select 
                          value={formData.end_time} 
                          onValueChange={(value) => setFormData({ ...formData, end_time: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="venue">Venue / Room</Label>
                        <Input
                          id="venue"
                          placeholder="e.g., Room 101, Lab A"
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        {editingEntry ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <CardContent className="p-3 md:p-4 bg-slate-50 border-b">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search subjects, teachers, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white w-full"
              autoComplete="off"
            />
          </div>

          {/* Row 2: Filters & View Toggle - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {/* Class Filter */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full bg-white text-sm md:text-base">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day Filter */}
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full bg-white text-sm md:text-base">
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-lg bg-white p-1 border col-span-2 md:col-span-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 p-2 rounded-md transition-colors text-xs md:text-sm ${viewMode === "grid" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Grid3X3 className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 p-2 rounded-md transition-colors text-xs md:text-sm ${viewMode === "list" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-700 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4">
        {filteredTimetables.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No timetable entries found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters or add new entries</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
<div ref={timetableRef} className="overflow-x-auto -mx-4 md:mx-0 print:no-print">
            <div className="inline-block min-w-[760px] w-full p-4 md:p-0 print:no-print">
              {/* Grid Header */}
              <div className="grid gap-0.5 md:gap-1" style={{ gridTemplateColumns: "72px repeat(7, minmax(96px, 1fr))" }}>
                <div className="p-1 md:p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 rounded-tl-lg">
                  Time
                </div>
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.value}
                    className={`p-1 md:p-2 text-center text-xs font-semibold uppercase tracking-wider rounded-t-lg ${DAY_COLORS[day.value]?.bg || 'bg-slate-100'} ${DAY_COLORS[day.value]?.text || 'text-slate-600'}`}
                  >
                    <span className="md:hidden">{day.short}</span>
                    <span className="hidden md:inline">{day.label}</span>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {getTimeSlots().map((time) => (
                <div key={time} className="grid gap-0.5 md:gap-1" style={{ gridTemplateColumns: "72px repeat(7, minmax(96px, 1fr))" }}>
                  <div className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-slate-600 bg-slate-50 border-t">
                    {time}
                  </div>
                  {DAYS_OF_WEEK.map((day) => {
                    const entry = getClassAtTime(day.value, time)
                    if (entry) {
                      const color = getSubjectColor(getSubjectId(entry))
                      return (
                        <div
                          key={`${day.value}-${time}`}
                          className={`p-1 md:p-2 rounded-lg border text-xs md:text-sm ${color.bg} ${color.border} ${color.text}`}
                        >
                          <div className="font-semibold truncate">{getSubjectName(entry)}</div>
                          <div className="flex items-center gap-1 mt-0.5 md:mt-1 opacity-80 text-xs md:text-xs">
                            <Clock className="w-2 h-2 md:w-3 md:h-3 flex-shrink-0" />
                            <span className="truncate">{entry.start_time?.substring(0, 5)}-{entry.end_time?.substring(0, 5)}</span>
                          </div>
                          {entry.venue && (
                            <div className="flex items-center gap-1 mt-0.5 md:mt-1 opacity-80 text-xs md:text-xs hidden md:flex">
                              <MapPin className="w-2 h-2 md:w-3 md:h-3 flex-shrink-0" />
                              <span className="truncate">{entry.venue}</span>
                            </div>
                          )}
                          {isAdmin && (
                            <div className="flex gap-1 mt-1 md:mt-2">
                              <button
                                onClick={() => handleEdit(entry)}
                                className="p-0.5 md:p-1 rounded hover:bg-white/50 flex-shrink-0"
                              >
                                <Edit2 className="w-3 h-3 md:w-3 md:h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-0.5 md:p-1 rounded hover:bg-white/50 flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3 md:w-3 md:h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    }
                    return (
                      <div
                        key={`${day.value}-${time}`}
                        className="p-1 md:p-2 border border-dashed border-slate-200 bg-slate-50/50 min-h-[60px] md:min-h-[80px]"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
<div ref={timetableRef} className="space-y-2 md:space-y-3 print:no-print">
            {filteredTimetables
              .sort((a, b) => {
                const dayOrder = DAYS_OF_WEEK.findIndex(d => d.value === a.day.toLowerCase())
                const dayOrderB = DAYS_OF_WEEK.findIndex(d => d.value === b.day.toLowerCase())
                if (dayOrder !== dayOrderB) return dayOrder - dayOrderB
                return a.start_time.localeCompare(b.start_time)
              })
              .map((entry) => {
                const color = getSubjectColor(getSubjectId(entry))
                return (
                  <div
                    key={entry.id}
                    className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-2 md:p-4 rounded-xl border ${color.bg} ${color.border} ${color.text}`}
                  >
                    {/* Day Badge */}
                    <div className="flex-shrink-0 w-16 md:w-20 text-center">
                      <div className="text-base md:text-lg font-bold capitalize">{entry.day.substring(0, 3)}</div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base">
                        {entry.start_time?.substring(0, 5)} - {entry.end_time?.substring(0, 5)}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold truncate text-sm md:text-base">{getSubjectName(entry)}</span>
                    </div>

                    {/* Class */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-sm md:text-base">{getClassName(entry)}</span>
                    </div>

                    {/* Teacher - Hidden on mobile */}
                    <div className="flex items-center gap-2 flex-shrink-0 hidden lg:flex">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-sm md:text-base">{getTeacherName(entry)}</span>
                    </div>

                    {/* Venue - Hidden on mobile */}
                    {entry.venue && (
                      <div className="flex items-center gap-2 flex-shrink-0 hidden sm:flex">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-sm md:text-base">{entry.venue}</span>
                      </div>
                    )}

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex gap-1 flex-shrink-0 md:ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="h-8 w-8 p-0 hover:bg-white/50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 p-0 hover:bg-white/50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredTimetables.length > 0 && (
          <div className="mt-4 md:mt-6 pt-4 border-t flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-indigo-500"></div>
              <span>{filteredTimetables.length} entries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
              <span>{classes.length} classes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyan-500"></div>
              <span>{subjects.length} subjects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-teal-500"></div>
              <span>{teachers.length} teachers</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ModernTimetable
