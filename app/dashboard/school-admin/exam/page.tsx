"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, BookOpen, Users, Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import { academicsAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"

interface Exam {
  id: number
  subject: number
  subject_name: string
  class_obj: number
  class_name: string
  title: string
  description: string
  exam_date: string
  exam_time: string
  duration_minutes: number
  venue: string
  total_marks: number
  created_by: number
  teacher_name: string
  created_at: string
}

interface Subject {
  id: number
  name: string
  code: string
}

interface Class {
  id: number
  name: string
}

export default function ExamManagementPage() {
  const { user } = useAuthContext()
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterDate, setFilterDate] = useState("all")

  const [formData, setFormData] = useState({
    subject: "",
    class_obj: "",
    title: "",
    description: "",
    exam_date: "",
    exam_time: "09:00",
    duration_minutes: "60",
    venue: "",
    total_marks: "100",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [examsRes, subjectsRes, classesRes] = await Promise.all([
        academicsAPI.exams(),
        academicsAPI.subjects(),
        academicsAPI.classes(),
      ])

      setExams(examsRes.data.results || examsRes.data || [])
      setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      setClasses(classesRes.data.results || classesRes.data || [])
    } catch (error) {
      console.error("Error fetching exam data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        subject: parseInt(formData.subject),
        class_obj: parseInt(formData.class_obj),
        title: formData.title,
        description: formData.description,
        exam_date: formData.exam_date,
        exam_time: formData.exam_time,
        duration_minutes: parseInt(formData.duration_minutes),
        venue: formData.venue,
        total_marks: parseInt(formData.total_marks),
      }

      if (editingExam) {
        await academicsAPI.updateExam(editingExam.id, payload)
      } else {
        await academicsAPI.createExam(payload)
      }

      setIsDialogOpen(false)
      setEditingExam(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving exam:", error)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      subject: exam.subject.toString(),
      class_obj: exam.class_obj.toString(),
      title: exam.title,
      description: exam.description || "",
      exam_date: exam.exam_date,
      exam_time: exam.exam_time,
      duration_minutes: exam.duration_minutes.toString(),
      venue: exam.venue || "",
      total_marks: exam.total_marks.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await academicsAPI.deleteExam(id)
        fetchData()
      } catch (error) {
        console.error("Error deleting exam:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      subject: "",
      class_obj: "",
      title: "",
      description: "",
      exam_date: "",
      exam_time: "09:00",
      duration_minutes: "60",
      venue: "",
      total_marks: "100",
    })
  }

  const openNewExamDialog = () => {
    setEditingExam(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.class_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass = filterClass === "all" || exam.class_obj.toString() === filterClass

    const matchesDate = filterDate === "all" || 
      (filterDate === "upcoming" && new Date(exam.exam_date) >= new Date()) ||
      (filterDate === "past" && new Date(exam.exam_date) < new Date())

    return matchesSearch && matchesClass && matchesDate
  })

  const upcomingExams = exams.filter((exam) => new Date(exam.exam_date) >= new Date())
  const pastExams = exams.filter((exam) => new Date(exam.exam_date) < new Date())

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    examDate.setHours(0, 0, 0, 0)
    const diffTime = examDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage exams for your school</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewExamDialog} className="bg-secondary hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExam ? "Edit Exam" : "Schedule New Exam"}</DialogTitle>
              <DialogDescription>
                {editingExam ? "Update exam details" : "Fill in the exam details to schedule a new exam"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First Term Mathematics Exam"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class">Class *</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam_date">Exam Date *</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="exam_time">Start Time *</Label>
                  <Input
                    id="exam_time"
                    type="time"
                    value={formData.exam_time}
                    onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    min="15"
                    max="180"
                  />
                </div>

                <div>
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    min="10"
                    max="200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue / Location</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Exam Hall A"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional exam details"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-secondary">
                  {editingExam ? "Update Exam" : "Schedule Exam"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold">{exams.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Exams</p>
                <p className="text-3xl font-bold text-green-600">{upcomingExams.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Past Exams</p>
                <p className="text-3xl font-bold text-gray-600">{pastExams.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Exams</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by class" />
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
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No exams found</p>
              <Button onClick={openNewExamDialog} className="mt-4 bg-blue-600">
                Schedule First Exam
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam) => {
                const daysUntil = getDaysUntil(exam.exam_date)
                const isPast = daysUntil < 0

                return (
                  <div
                    key={exam.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      isPast ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{exam.title}</h3>
                          <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "" : "bg-green-600"}>
                            {isPast ? "Completed" : daysUntil === 0 ? "Today" : `${daysUntil} days`}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{exam.subject_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{exam.class_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(exam.exam_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(exam.exam_time)}</span>
                          </div>
                          {exam.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{exam.venue}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{exam.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{exam.total_marks} marks</span>
                          </div>
                        </div>
                        {exam.description && (
                          <p className="text-sm text-gray-500 mt-2">{exam.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

