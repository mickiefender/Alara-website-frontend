"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, UserCheck, Users, Search, X, AlertCircle, GraduationCap, Mail } from "lucide-react"
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

interface StudentClass {
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
  username: string
  email: string
  first_name: string
  last_name: string
  user_name?: string
  user_email?: string
  user?: number
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

/** Two-letter initials for the avatar circle. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function EnrollStudentsInClass({ classId, className }: { classId: number; className: string }) {
  const { user } = useAuthContext()
  const [enrollments, setEnrollments] = useState<StudentClass[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmEnrollOpen, setConfirmEnrollOpen] = useState(false)
  const [enrollmentToRemove, setEnrollmentToRemove] = useState<StudentClass | null>(null)
  const [removing, setRemoving] = useState(false)
  const [formData, setFormData] = useState({ student: "" })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [enrollmentsRes, studentsRes] = await Promise.all([
        academicsAPI.studentClasses(),
        usersAPI.students(),
      ])

      const enrollmentsList = enrollmentsRes.data.results || enrollmentsRes.data || []
      const filteredEnrollments = enrollmentsList.filter(
        (e: StudentClass) => e.class_obj === classId
      )

      const allStudents = studentsRes.data.results || studentsRes.data || []
      setEnrollments(filteredEnrollments)
      setStudents(allStudents)
    } catch (err: any) {
      console.error("[v0] Error fetching data:", err)
      const message = getErrorMessage(err, "Failed to load enrollment data.")
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [classId])

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.student) return
    setConfirmEnrollOpen(true)
  }

  const confirmEnrollStudent = async () => {
    try {
      setSubmitting(true)
      await academicsAPI.createStudentClass({
        class_obj: classId,
        student: formData.student,
      })
      setFormData({ student: "" })
      setIsOpen(false)
      setError(null)
      setConfirmEnrollOpen(false)
      toast.success("Student enrolled in class.")
      void fetchData()
    } catch (err: any) {
      console.error("[v0] Enrollment error:", err)
      const errorMsg = getErrorMessage(err, "Failed to enroll student.")
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveStudent = async () => {
    if (!enrollmentToRemove) return
    try {
      setRemoving(true)
      await academicsAPI.deleteStudentClass(enrollmentToRemove.id)
      toast.success(`${enrollmentToRemove.student_name} was removed from ${className}.`)
      setEnrollmentToRemove(null)
      void fetchData()
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to remove student from class.")
      setError(message)
      toast.error(message)
    } finally {
      setRemoving(false)
    }
  }

  const enrolledStudentIds = useMemo(() => new Set(enrollments.map((e) => e.student)), [enrollments])
  const availableStudents = useMemo(
    () =>
      students.filter((s) => {
        const userId = s.user_data?.id || s.user
        return userId ? !enrolledStudentIds.has(userId) : false
      }),
    [students, enrolledStudentIds],
  )

  const filteredEnrollments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return enrollments
    return enrollments.filter(
      (e) => e.student_name.toLowerCase().includes(q) || e.student_email.toLowerCase().includes(q),
    )
  }, [enrollments, searchTerm])

  const activeCount = enrollments.filter((e) => e.is_active).length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-medium text-secondary">
            <Users size={14} />
            {enrollments.length} enrolled
            {activeCount !== enrollments.length && (
              <span className="text-xs text-muted-foreground font-normal">
                ({activeCount} active)
              </span>
            )}
          </div>
        </div>

        {user?.role === "school_admin" && (
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setError(null) }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-secondary hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" /> Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-border px-5 py-4">
                <DialogHeader className="space-y-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 ring-1 ring-secondary/20 flex items-center justify-center flex-shrink-0">
                      <UserCheck size={18} className="text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-base font-bold text-foreground">
                        Enroll Student
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        Add a student to <span className="font-medium text-foreground">{className}</span>
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Body */}
              <form onSubmit={handleEnrollStudent}>
                <div className="px-5 py-5 space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3.5 py-3 rounded-lg text-sm">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ) : error ? (
                    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      <span>{error}</span>
                      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => void fetchData()}>Try again</Button>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3.5 rounded-lg">
                      <GraduationCap size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <div>
                        <p className="font-semibold text-sm">No students available</p>
                        <p className="text-sm text-blue-700 mt-0.5">
                          {students.length === 0
                            ? "No students found in the system. Create students first in the Students section."
                            : "All existing students are already enrolled in this class."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Select Student <span className="text-destructive">*</span>
                      </label>
                      <Select value={formData.student} onValueChange={(value) => setFormData({ student: value })}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Choose a student to enroll" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStudents.map((student) => (
                            <SelectItem key={student.id} value={String(student.user_data?.id ?? student.user ?? "")}>
                              {student.first_name} {student.last_name} ({student.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {availableStudents.length} student{availableStudents.length !== 1 ? "s" : ""} available to enroll
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-5 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2 bg-secondary hover:bg-blue-700 text-white min-w-[140px]"
                    disabled={availableStudents.length === 0 || submitting}
                  >
                    <UserCheck size={15} />
                    {submitting ? "Enrolling…" : "Enroll Student"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Error banner (list-level) */}
      {error && !isOpen && enrollments.length > 0 && (
        <div className="flex items-start gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3.5 py-3 rounded-lg text-sm">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={() => void fetchData()}>Try again</Button>
        </div>
      )}

      {/* Search */}
      {enrollments.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder="Search enrolled students by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Enrolled list */}
      {loading ? (
        <div className="space-y-3 py-4" role="status" aria-label="Loading student enrollments">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : error && enrollments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center" role="alert">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-medium text-foreground">Unable to load class enrollments</p>
          <p className="max-w-lg text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void fetchData()}>Try again</Button>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <div className="w-14 h-14 mx-auto mb-3 bg-muted/60 rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground">No students enrolled yet</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Use the “Enroll Student” button above to add students to {className}.
          </p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-xl">
          <p className="font-medium text-foreground">No results for “{searchTerm}”</p>
          <p className="text-sm text-muted-foreground mt-0.5">Try a different search term.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4">Student</TableHead>
                <TableHead className="hidden sm:table-cell">Enrolled Date</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === "school_admin" && <TableHead className="text-right pr-4">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id} className="group">
                  <TableCell className="px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(enrollment.student_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
                          {enrollment.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail size={10} className="shrink-0" />
                          {enrollment.student_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(enrollment.assigned_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        enrollment.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${enrollment.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {enrollment.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  {user?.role === "school_admin" && (
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEnrollmentToRemove(enrollment)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remove from class"
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

      <AlertDialog open={confirmEnrollOpen} onOpenChange={(open) => !submitting && setConfirmEnrollOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm student enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Enroll {students.find((student) => String(student.user_data?.id ?? student.user) === formData.student)?.first_name || "this student"} in {className}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review selection</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={(event) => { event.preventDefault(); void confirmEnrollStudent() }}>
              {submitting ? "Enrolling…" : "Confirm enrollment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(enrollmentToRemove)} onOpenChange={(open) => !open && !removing && setEnrollmentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove student from class?</AlertDialogTitle>
            <AlertDialogDescription>
              {enrollmentToRemove?.student_name} will be removed from {className}. This does not delete the student account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={removing} onClick={(event) => { event.preventDefault(); void handleRemoveStudent() }}>
              {removing ? "Removing…" : "Remove student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
