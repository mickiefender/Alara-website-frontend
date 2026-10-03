"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, BookOpen } from "lucide-react"
import { academicsAPI, usersAPI, getErrorMessage } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ClassSubjectTeacher {
  id: number
  class_obj: number
  class_name: string
  subject: number
  subject_name: string
  subject_code: string
  teacher: number
  teacher_name: string
  teacher_email: string
  is_active: boolean
}

interface ClassSubject {
  id: number
  subject: number
  subject_name: string
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
  user?: number | { id: number }
  user_data?: {
    id: number
    email: string
    first_name: string
    last_name: string
    username: string
    phone: string
    role: string
  }
}

function getTeacherUserId(teacher: Teacher) {
  return teacher.user_data?.id
    ?? (typeof teacher.user === "object" ? teacher.user.id : teacher.user)
}

export function AssignSubjectTeachers({ classId, className }: { classId: number; className: string }) {
  const { user } = useAuthContext()
  const [subjectTeachers, setSubjectTeachers] = useState<ClassSubjectTeacher[]>([])
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ subject: "", teacher: "" })
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false)
  const [assignmentToRemove, setAssignmentToRemove] = useState<ClassSubjectTeacher | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get class subjects
      const classSubjectsRes = await academicsAPI.classSubjects()
      const allClassSubjects = classSubjectsRes.data.results || classSubjectsRes.data
      const classSubjectsFiltered = Array.isArray(allClassSubjects)
        ? allClassSubjects.filter((cs: any) => cs.class_obj === classId)
        : []
      setClassSubjects(classSubjectsFiltered)

      // Get class subject teachers
      const subjectTeachersRes = await academicsAPI.classSubjectTeachers()
      const allSubjectTeachers = subjectTeachersRes.data.results || subjectTeachersRes.data
      const filtered = Array.isArray(allSubjectTeachers)
        ? allSubjectTeachers.filter((st: any) => st.class_obj === classId)
        : []
      setSubjectTeachers(filtered)

      // Get all teachers in the school
      const teachersRes = await usersAPI.teachers()
      const allTeachers = teachersRes.data.results || teachersRes.data || []
      setTeachers(allTeachers)
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to load subject assignment data.")
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [classId])

  const handleAssignSubjectTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.teacher) return
    setConfirmAssignOpen(true)
  }

  const confirmAssignSubjectTeacher = async () => {
    try {
      setSubmitting(true)
      const subjectId = parseInt(formData.subject, 10)
      const teacherUserId = Number(formData.teacher)
      
      if (isNaN(subjectId)) {
        const message = "Select a valid subject."
        setError(message)
        toast.error(message)
        return
      }

      if (!Number.isInteger(teacherUserId) || !availableTeachers.some((teacher) => getTeacherUserId(teacher) === teacherUserId)) {
        const message = "Select a valid teacher account."
        setError(message)
        toast.error(message)
        return
      }

      await academicsAPI.createClassSubjectTeacher({
        class_obj: classId,
        subject: subjectId,
        teacher: teacherUserId,
      })
      setFormData({ subject: "", teacher: "" })
      setIsOpen(false)
      setError(null)
      setConfirmAssignOpen(false)
      toast.success("Teacher assigned to subject.")
      void fetchData()
    } catch (err: any) {
      console.error("[v0] Assign subject teacher error:", err)
      const errorMsg = getErrorMessage(err, "Failed to assign teacher to subject.")
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Teachers not yet assigned to any subject in this class
  const assignedTeacherIds = new Set(subjectTeachers.map((st) => st.teacher))
  const availableTeachers = teachers.filter((t) => {
    const userId = getTeacherUserId(t)
    return userId ? !assignedTeacherIds.has(userId) : false
  })

  const handleRemove = async () => {
    if (!assignmentToRemove) return
    try {
      setRemoving(true)
      await academicsAPI.deleteClassSubjectTeacher(assignmentToRemove.id)
      toast.success(`${assignmentToRemove.teacher_name} was removed from ${assignmentToRemove.subject_name}.`)
      setAssignmentToRemove(null)
      void fetchData()
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to remove subject assignment.")
      setError(message)
      toast.error(message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Teachers
          </CardTitle>
          {user?.role === "school_admin" && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Assign Teacher to Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher to Subject</DialogTitle>
                </DialogHeader>
                {error && (
                  <div role="alert" className="flex items-start gap-3 rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <span className="flex-1">{error}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => void fetchData()}>Retry</Button>
                  </div>
                )}
                {loading ? (
                  <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                ) : (
                <form onSubmit={handleAssignSubjectTeacher} className="space-y-4">
                  {classSubjects.length === 0 && (
                    <p className="rounded border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      No subjects are assigned to this class yet.
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Select Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {classSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.subject.toString()}>
                            {subject.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Select Teacher</Label>
                    <Select value={formData.teacher} onValueChange={(value) => setFormData({ ...formData, teacher: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeachers.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No unassigned teachers available
                          </div>
                        ) : (
                          availableTeachers.map((teacher) => {
                            const userId = getTeacherUserId(teacher)
                            if (!userId) return null
                            return (
                              <SelectItem key={teacher.id} value={userId.toString()}>
                                {teacher.first_name} {teacher.last_name} ({teacher.email})
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={availableTeachers.length === 0 || classSubjects.length === 0 || submitting}>
                    {submitting ? "Assigning…" : "Assign Teacher"}
                  </Button>
                </form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-4" role="status" aria-label="Loading subject teachers">
            {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}
          </div>
        ) : error && subjectTeachers.length === 0 ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void fetchData()}>Try again</Button>
          </div>
        ) : (
          <>
        {error && <div role="alert" className="mb-4 flex items-center gap-3 text-sm text-destructive">{error}<Button size="sm" variant="outline" onClick={() => void fetchData()}>Retry</Button></div>}
        {subjectTeachers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium">No subject teachers assigned yet</p>
            <p className="text-sm text-muted-foreground">Use “Assign Teacher to Subject” to add an assignment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  {user?.role === "school_admin" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectTeachers.map((st) => (
                  <TableRow key={st.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{st.subject_name}</p>
                        <p className="text-sm text-muted-foreground">{st.subject_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{st.teacher_name}</TableCell>
                    <TableCell>
                      <Badge variant={st.is_active ? "default" : "secondary"}>
                        {st.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {user?.role === "school_admin" && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssignmentToRemove(st)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
          </>
        )}
      </CardContent>
      <AlertDialog open={confirmAssignOpen} onOpenChange={(open) => !submitting && setConfirmAssignOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm subject teacher assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Assign {teachers.find((teacher) => getTeacherUserId(teacher)?.toString() === formData.teacher)?.first_name}{" "}
              {teachers.find((teacher) => getTeacherUserId(teacher)?.toString() === formData.teacher)?.last_name} to{" "}
              {classSubjects.find((subject) => subject.subject.toString() === formData.subject)?.subject_name} in {className}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review selection</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={(event) => { event.preventDefault(); void confirmAssignSubjectTeacher() }}>
              {submitting ? "Assigning…" : "Confirm assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={Boolean(assignmentToRemove)} onOpenChange={(open) => !open && !removing && setAssignmentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subject teacher assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              {assignmentToRemove?.teacher_name} will no longer teach {assignmentToRemove?.subject_name} in {className}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={removing} onClick={(event) => { event.preventDefault(); void handleRemove() }}>
              {removing ? "Removing…" : "Remove assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
