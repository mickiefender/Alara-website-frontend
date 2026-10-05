"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Users } from "lucide-react"
import { academicsAPI, usersAPI, getErrorMessage, SCHOOL_ADMIN_PAGE_CACHE } from "@/lib/api"
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

interface ClassTeacher {
  id: number
  class_obj: number
  class_name: string
  teacher: number
  teacher_name: string
  is_form_tutor: boolean
}

interface Teacher {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
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

export function AssignTeachersToClass({ classId, className }: { classId: number; className: string }) {
  const { user } = useAuthContext()
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ teacher: "", is_form_tutor: false })
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false)
  const [teacherToRemove, setTeacherToRemove] = useState<ClassTeacher | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [classTeachersRes, teachersRes] = await Promise.all([
        academicsAPI.classTeachers(),
        usersAPI.teachers(undefined, SCHOOL_ADMIN_PAGE_CACHE),
      ])

      const allClassTeachers = classTeachersRes.data.results || classTeachersRes.data || []
      const filteredTeachers = allClassTeachers.filter(
        (ct: ClassTeacher) => ct.class_obj === classId
      )
      const allTeachers = teachersRes.data.results || teachersRes.data || []
      
      setClassTeachers(filteredTeachers)
      setTeachers(allTeachers)
    } catch (err: any) {
      console.error("[v0] Error fetching data:", err)
      const message = getErrorMessage(err, "Failed to load teacher assignments.")
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [classId])

  const handleAssignTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teacher) return
    setConfirmAssignOpen(true)
  }

  const confirmAssignTeacher = async () => {
    try {
      setSubmitting(true)
      const teacherProfile = teachers.find(t => t.id.toString() === formData.teacher)
      if (!teacherProfile) {
        const message = "The selected teacher could not be found. Please select a teacher again."
        setError(message)
        toast.error(message)
        return
      }

      // Use the actual User ID from user_data, not the Profile ID
      const userId = teacherProfile.user_data?.id || teacherProfile.user
      if (!userId) {
        const message = "The selected teacher does not have a valid user account."
        setError(message)
        toast.error(message)
        return
      }

      await academicsAPI.createClassTeacher({
        class_obj: classId,
        teacher: userId,
        is_form_tutor: formData.is_form_tutor,
      })
      setFormData({ teacher: "", is_form_tutor: false })
      setIsOpen(false)
      setError(null)
      setConfirmAssignOpen(false)
      toast.success(`${teacherProfile.first_name} ${teacherProfile.last_name} assigned to ${className}.`)
      void fetchData()
    } catch (err: any) {
      console.error("[v0] Assign teacher error:", err)
      const errorMsg = getErrorMessage(err, "Failed to assign teacher to class.")
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveTeacher = async () => {
    if (!teacherToRemove) return
    try {
      setRemoving(true)
      await academicsAPI.deleteClassTeacher(teacherToRemove.id)
      toast.success(`${teacherToRemove.teacher_name} was removed from ${className}.`)
      setTeacherToRemove(null)
      void fetchData()
    } catch (err: any) {
      const message = getErrorMessage(err, "Failed to remove teacher from class.")
      setError(message)
      toast.error(message)
    } finally {
      setRemoving(false)
    }
  }

  const assignedTeacherIds = new Set(classTeachers.map((ct) => ct.teacher))
  const availableTeachers = teachers.filter((t) => {
    const userId = t.user_data?.id || t.user
    return Boolean(userId) && !assignedTeacherIds.has(userId)
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Class Teachers
          </CardTitle>
          {user?.role === "school_admin" && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Assign Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher to Class</DialogTitle>
                </DialogHeader>
                {error && (
                  <div role="alert" className="mb-4 flex items-start gap-2 rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive">
                    <span className="flex-1 text-sm">{error}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => void fetchData()}>Retry</Button>
                  </div>
                )}
                <form onSubmit={handleAssignTeacher} className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ) : error ? (
                    <div role="alert" className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                      <Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => void fetchData()}>Try again</Button>
                    </div>
                  ) : availableTeachers.length === 0 ? (
                    <div className="rounded border border-border bg-muted/30 px-4 py-3">
                      <p className="font-semibold">No teachers available</p>
                      <p className="text-sm text-muted-foreground">
                        {teachers.length === 0
                          ? "No teachers are available in your school yet. Add a teacher before assigning one."
                          : "All teachers are already assigned to this class."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="teacher">Select Teacher</Label>
                        <Select value={formData.teacher} onValueChange={(value) => setFormData({ ...formData, teacher: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.first_name} {teacher.last_name} ({teacher.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="form_tutor"
                          checked={formData.is_form_tutor}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_form_tutor: checked === true })
                          }
                        />
                        <Label htmlFor="form_tutor">Assign as Form Tutor (Class Manager)</Label>
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full" disabled={availableTeachers.length === 0 || submitting || loading}>
                    {submitting ? "Assigning…" : "Assign Teacher"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-4" role="status" aria-label="Loading class teachers">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 border-b border-border py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : error && classTeachers.length === 0 ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void fetchData()}>Try again</Button>
          </div>
        ) : (
          <>
        {error && <div role="alert" className="mb-4 flex items-center gap-3 text-sm text-destructive">{error}<Button size="sm" variant="outline" onClick={() => void fetchData()}>Retry</Button></div>}
        {classTeachers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium">No teachers assigned to this class yet</p>
            <p className="text-sm text-muted-foreground">Use “Assign Teacher” to add the first teacher.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {user?.role === "school_admin" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classTeachers.map((classTeacher) => (
                  <TableRow key={classTeacher.id}>
                    <TableCell className="font-medium">{classTeacher.teacher_name}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant={classTeacher.is_form_tutor ? "default" : "secondary"}>
                        {classTeacher.is_form_tutor ? "Form Tutor" : "Teacher"}
                      </Badge>
                    </TableCell>
                    {user?.role === "school_admin" && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTeacherToRemove(classTeacher)}
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
            <AlertDialogTitle>Confirm teacher assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Assign {teachers.find((teacher) => teacher.id.toString() === formData.teacher)?.first_name}{" "}
              {teachers.find((teacher) => teacher.id.toString() === formData.teacher)?.last_name} to {className}
              {formData.is_form_tutor ? " as the form tutor" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review selection</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={(event) => { event.preventDefault(); void confirmAssignTeacher() }}>
              {submitting ? "Assigning…" : "Confirm assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={Boolean(teacherToRemove)} onOpenChange={(open) => !open && !removing && setTeacherToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove teacher from class?</AlertDialogTitle>
            <AlertDialogDescription>
              {teacherToRemove?.teacher_name} will no longer be assigned to {className}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={removing} onClick={(event) => { event.preventDefault(); void handleRemoveTeacher() }}>
              {removing ? "Removing…" : "Remove teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
