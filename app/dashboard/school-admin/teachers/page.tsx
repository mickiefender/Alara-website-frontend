"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usersAPI, getErrorMessage } from "@/lib/api"
import { DataStateTableRow } from "@/components/data-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  AlertCircle,
  AtSign,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  Filter,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Search,
  Square,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

interface Teacher {
  id: number
  user?: { id: number; first_name: string; last_name: string; email: string; username: string }
  user_data?: { id: number; first_name: string; last_name: string; email: string; username: string }
  first_name?: string
  last_name?: string
  email?: string
  username?: string
  user_email?: string
  phone?: string
  address?: string
  employee_id?: string
  qualification?: string
  experience_years?: number
  experience?: number
  is_active?: boolean
  profile_picture_url?: string | null
  created_at?: string | null
}

type TeacherSortField = "index" | "name" | "registered"
type SortDirection = "asc" | "desc"

const emptyForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  phone: "",
  address: "",
  employee_id: "",
  qualification: "",
  experience_years: "",
}

function TeachersPageContent() {
  const { user } = useAuthContext()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState(emptyForm)
  const [exportLoading, setExportLoading] = useState(false)
  const [sortField, setSortField] = useState<TeacherSortField>("index")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const itemsPerPage = 10

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersAPI.teachers()
      const data = response.data.results || response.data || []
      setTeachers(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to load teachers. Please try again.")
      setError(message)
      setTeachers([])
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTeachers()
  }, [])

  const getTeacherName = (teacher: Teacher) => {
    const firstName = teacher.first_name || teacher.user_data?.first_name || teacher.user?.first_name || ""
    const lastName = teacher.last_name || teacher.user_data?.last_name || teacher.user?.last_name || ""
    return `${firstName} ${lastName}`.trim() || teacher.username || teacher.user_data?.username || teacher.user?.username || "N/A"
  }

  const getTeacherEmail = (teacher: Teacher) =>
    teacher.email || teacher.user_email || teacher.user_data?.email || teacher.user?.email || "N/A"

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!editingTeacher) {
      if (!user?.school_id) {
        const message = "No school associated with your account"
        setError(message)
        toast.error(message)
        return
      }
      setConfirmCreateOpen(true)
      return
    }
    void saveTeacher()
  }

  const saveTeacher = async () => {
    setIsSubmitting(true)
    try {
      if (editingTeacher) {
        await usersAPI.updateTeacher(editingTeacher.id, {
          ...formData,
          experience_years: Number(formData.experience_years) || 0,
        })
        toast.success("Teacher information updated successfully.")
      } else {
        if (!user?.school_id) {
          const message = "No school associated with your account"
          setError(message)
          toast.error(message)
          return
        }
        await usersAPI.createTeacher({
          ...formData,
          username: formData.username.trim().replace(/\s+/g, ""),
          experience_years: Number(formData.experience_years) || 0,
          school_id: user.school_id,
        })
        toast.success("Teacher added successfully.")
      }
      setIsOpen(false)
      setConfirmCreateOpen(false)
      setEditingTeacher(null)
      setFormData(emptyForm)
      void fetchTeachers()
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to save teacher. Please check the details and try again.")
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      username: teacher.username || teacher.user_data?.username || teacher.user?.username || "",
      email: teacher.email || teacher.user_email || teacher.user_data?.email || teacher.user?.email || "",
      first_name: teacher.first_name || teacher.user_data?.first_name || teacher.user?.first_name || "",
      last_name: teacher.last_name || teacher.user_data?.last_name || teacher.user?.last_name || "",
      password: "",
      phone: teacher.phone || "",
      address: teacher.address || "",
      employee_id: teacher.employee_id || "",
      qualification: teacher.qualification || "",
      experience_years: String(teacher.experience_years ?? teacher.experience ?? ""),
    })
    setError(null)
    setIsOpen(true)
  }

  const handleDelete = async () => {
    if (!teacherToDelete) return
    setIsDeleting(true)
    try {
      await usersAPI.deleteTeacher(teacherToDelete.id)
      setSelectedIds((previous) => {
        const next = new Set(previous)
        next.delete(teacherToDelete.id)
        return next
      })
      toast.success(`${getTeacherName(teacherToDelete)} was removed.`)
      setTeacherToDelete(null)
      void fetchTeachers()
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to delete teacher.")
      setError(message)
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase()
    return getTeacherName(teacher).toLowerCase().includes(term)
      || getTeacherEmail(teacher).toLowerCase().includes(term)
      || (teacher.employee_id || "").toLowerCase().includes(term)
      || (teacher.qualification || "").toLowerCase().includes(term)
  }).sort((a, b) => {
    let comparison: number
    if (sortField === "index") {
      comparison = a.id - b.id
    } else if (sortField === "name") {
      comparison = getTeacherName(a).localeCompare(getTeacherName(b), undefined, {
        sensitivity: "base",
        numeric: true,
      })
    } else {
      const parsedA = a.created_at ? new Date(a.created_at).getTime() : Number.NaN
      const parsedB = b.created_at ? new Date(b.created_at).getTime() : Number.NaN
      const aDate = Number.isNaN(parsedA) ? null : parsedA
      const bDate = Number.isNaN(parsedB) ? null : parsedB
      if (aDate === null && bDate !== null) return 1
      if (bDate === null && aDate !== null) return -1
      if (aDate === null && bDate === null) {
        comparison = a.id - b.id
        return sortDirection === "asc" ? comparison : -comparison
      }
      comparison = (aDate ?? 0) - (bDate ?? 0)
    }

    if (comparison === 0) comparison = a.id - b.id
    return sortDirection === "asc" ? comparison : -comparison
  })

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage)
  const isAllSelected = paginatedTeachers.length > 0 && paginatedTeachers.every((teacher) => selectedIds.has(teacher.id))
  const activeCount = teachers.filter((teacher) => teacher.is_active !== false).length
  const handleSort = (field: TeacherSortField) => {
    setCurrentPage(1)
    if (sortField === field) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }
  const setSortFieldFromControl = (field: TeacherSortField) => {
    setSortField(field)
    setSortDirection("asc")
    setCurrentPage(1)
  }
  const sortIcon = (field: TeacherSortField) => {
    if (sortField !== field) return <ArrowUpDown size={13} aria-hidden="true" />
    return sortDirection === "asc"
      ? <ArrowUp size={13} aria-hidden="true" />
      : <ArrowDown size={13} aria-hidden="true" />
  }
  const formatRegistrationDate = (value?: string | null) => {
    if (!value) return "—"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
  }

  const toggleSelectAll = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (isAllSelected) paginatedTeachers.forEach((teacher) => next.delete(teacher.id))
      else paginatedTeachers.forEach((teacher) => next.add(teacher.id))
      return next
    })
  }

  const handleExport = async (format: "csv" | "excel") => {
    const source = selectedIds.size > 0
      ? filteredTeachers.filter((teacher) => selectedIds.has(teacher.id))
      : filteredTeachers
    if (source.length === 0) return
    setExportLoading(true)
    try {
      const headers = ["Name", "Email", "Employee ID", "Phone", "Qualification", "Experience", "Address", "Status"]
      const rows = source.map((teacher) => [
        getTeacherName(teacher),
        getTeacherEmail(teacher),
        teacher.employee_id || "",
        teacher.phone || "",
        teacher.qualification || "",
        String(teacher.experience_years ?? teacher.experience ?? ""),
        teacher.address || "",
        teacher.is_active === false ? "Inactive" : "Active",
      ])
      const date = new Date().toISOString().slice(0, 10)
      if (format === "csv") exportToCSV(`teachers-${date}.csv`, headers, rows)
      else await exportToExcel(`teachers-${date}.xlsx`, "Teachers", headers, rows)
      toast.success("Teacher list exported.")
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to export teacher list.")
      setError(message)
      toast.error(message)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard/school-admin" className="transition-colors hover:text-primary">Dashboard</Link>
            <span>/</span>
            <span className="font-medium text-foreground">Teachers</span>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">Teacher Registry</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage and monitor all teachers at your school</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={exportLoading || filteredTeachers.length === 0}>
                <Download size={15} />
                {exportLoading ? "Exporting…" : selectedIds.size > 0 ? `Export (${selectedIds.size})` : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleExport("excel")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setEditingTeacher(null)
                  setFormData(emptyForm)
                  setError(null)
                }}
              >
                <UserPlus size={16} />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
              <div className="border-b border-border px-6 py-5">
                <DialogHeader className="space-y-0">
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                  </DialogTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {editingTeacher
                      ? "Update the teacher's information below."
                      : "Fill in the details below to register a new teacher. Fields marked * are required."}
                  </p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-5">
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <fieldset className="space-y-4">
                    <legend className="mb-3 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="h-px w-6 bg-border" />Personal Information<span className="h-px flex-1 bg-border" />
                    </legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(["first_name", "last_name"] as const).map((field) => (
                        <div key={field} className="space-y-1.5">
                          <Label htmlFor={field} className="text-sm font-medium capitalize text-foreground">
                            {field.replace("_", " ")} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input id={field} required placeholder={field === "first_name" ? "e.g. Ama" : "e.g. Mensah"}
                              className="bg-background pl-9" value={formData[field]}
                              onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-sm font-medium text-foreground">Username <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <AtSign size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="username" required placeholder="e.g. amensah" className="bg-background pl-9"
                            value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="email" type="email" required placeholder="teacher@school.edu" className="bg-background pl-9"
                            value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="mb-3 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="h-px w-6 bg-border" />Contact Information<span className="h-px flex-1 bg-border" />
                    </legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                        <div className="relative">
                          <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="phone" placeholder="+233 XX XXX XXXX" className="bg-background pl-9"
                            value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-sm font-medium text-foreground">Address</Label>
                        <Input id="address" placeholder="City, Region" className="bg-background"
                          value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="mb-3 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="h-px w-6 bg-border" />Professional Information<span className="h-px flex-1 bg-border" />
                    </legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="employee_id" className="text-sm font-medium text-foreground">Employee ID</Label>
                        <Input id="employee_id" placeholder="Auto-generated if blank" className="bg-background"
                          value={formData.employee_id} onChange={(event) => setFormData({ ...formData, employee_id: event.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="qualification" className="text-sm font-medium text-foreground">Qualification</Label>
                        <Input id="qualification" placeholder="e.g. B.Ed. Mathematics" className="bg-background"
                          value={formData.qualification} onChange={(event) => setFormData({ ...formData, qualification: event.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="experience_years" className="text-sm font-medium text-foreground">Experience (Years)</Label>
                      <Input id="experience_years" type="number" min="0" className="bg-background"
                        value={formData.experience_years} onChange={(event) => setFormData({ ...formData, experience_years: event.target.value })} />
                    </div>
                  </fieldset>

                  {!editingTeacher && (
                    <fieldset className="space-y-4">
                      <legend className="mb-3 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="h-px w-6 bg-border" />Account Security<span className="h-px flex-1 bg-border" />
                      </legend>
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="password" type="password" required minLength={8} placeholder="Min. 8 characters" className="bg-background pl-9"
                            value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} />
                        </div>
                        <p className="text-xs text-muted-foreground">The teacher will use this password to sign in.</p>
                      </div>
                    </fieldset>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => { setIsOpen(false); setError(null) }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[150px] gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus size={15} />
                    {isSubmitting ? "Saving..." : editingTeacher ? "Save Changes" : "Add Teacher"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialog open={confirmCreateOpen} onOpenChange={setConfirmCreateOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm teacher account</AlertDialogTitle>
                <AlertDialogDescription>
                  Add {formData.first_name} {formData.last_name} as a teacher at your school?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Review details</AlertDialogCancel>
                <AlertDialogAction disabled={isSubmitting} onClick={() => void saveTeacher()}>
                  Confirm and add teacher
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Toaster position="top-right" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Teachers", value: teachers.length, icon: Users, color: "red" },
          { label: "Active Teachers", value: activeCount, icon: GraduationCap, color: "blue" },
          { label: "Search Results", value: filteredTeachers.length, icon: Filter, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-4 rounded-md border border-${color}-500/20 bg-${color}-500/10 p-5 shadow-sm`}>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by name, email, employee ID or qualification…"
            value={searchTerm}
            onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1) }}
            className="bg-background pl-9 pr-9"
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); setCurrentPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <label htmlFor="teacher-sort-field" className="text-sm text-muted-foreground">Sort by</label>
          <select
            id="teacher-sort-field"
            value={sortField}
            onChange={(event) => setSortFieldFromControl(event.target.value as TeacherSortField)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="index">Index number</option>
            <option value="name">Teacher name</option>
            <option value="registered">Date registered</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            onClick={() => setSortDirection((direction) => direction === "asc" ? "desc" : "asc")}
            className="min-w-24 gap-1.5"
          >
            {sortDirection === "asc"
              ? <><ArrowUp size={14} /> Ascending</>
              : <><ArrowDown size={14} /> Descending</>}
          </Button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <CheckSquare size={15} />
            {selectedIds.size} selected
            <button onClick={() => setSelectedIds(new Set())} className="ml-1 transition-opacity hover:opacity-70"><X size={13} /></button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} aria-label={isAllSelected ? "Deselect all teachers" : "Select all teachers"}
                    className="text-muted-foreground transition-colors hover:text-foreground">
                    {isAllSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                  </button>
                </th>
                <th aria-sort={sortField === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Teacher {sortIcon("name")}
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Employee ID</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qualification</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">Contact</th>
                <th aria-sort={sortField === "registered" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  <button type="button" onClick={() => handleSort("registered")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Date Registered {sortIcon("registered")}
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && paginatedTeachers.length === 0 ? (
                <DataStateTableRow colSpan={8} loading={loading} emptyMessage="Loading teachers…" />
              ) : error && teachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <AlertCircle size={24} className="text-destructive" />
                      <p className="font-medium text-foreground">Unable to load teachers</p>
                      <p className="text-sm">{error}</p>
                      <Button size="sm" variant="outline" onClick={() => void fetchTeachers()}>Try Again</Button>
                    </div>
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60"><GraduationCap size={24} className="opacity-50" /></div>
                      <div>
                        <p className="font-medium text-foreground">No teachers found</p>
                        <p className="mt-0.5 text-sm">{searchTerm ? `No results for "${searchTerm}". Try a different search.` : "Get started by adding your first teacher."}</p>
                      </div>
                      {!searchTerm && <Button size="sm" className="mt-1 gap-2" onClick={() => setIsOpen(true)}><UserPlus size={14} />Add First Teacher</Button>}
                    </div>
                  </td>
                </tr>
              ) : paginatedTeachers.map((teacher) => {
                const isSelected = selectedIds.has(teacher.id)
                const isActive = teacher.is_active !== false
                return (
                  <tr key={teacher.id} className={`group transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/5" : ""}`}>
                    <td className="w-10 px-4 py-3.5">
                      <button onClick={() => setSelectedIds((previous) => {
                        const next = new Set(previous)
                        if (next.has(teacher.id)) next.delete(teacher.id)
                        else next.add(teacher.id)
                        return next
                      })} aria-label={`${isSelected ? "Deselect" : "Select"} ${getTeacherName(teacher)}`}
                        className="text-muted-foreground transition-colors hover:text-foreground">
                        {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/school-admin/teachers/${teacher.id}`}>
                        <div className="flex cursor-pointer items-center gap-3">
                          <ProfileAvatar src={teacher.profile_picture_url} userId={teacher.user?.id || teacher.user_data?.id || teacher.id} alt={getTeacherName(teacher)} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">{getTeacherName(teacher)}</p>
                            <p className="truncate text-xs text-muted-foreground">{getTeacherEmail(teacher)}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      {teacher.employee_id
                        ? <span className="inline-flex rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-medium text-foreground">{teacher.employee_id}</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-muted-foreground lg:table-cell">{teacher.qualification || "—"}</td>
                    <td className="hidden px-4 py-3.5 text-sm text-muted-foreground xl:table-cell">{teacher.phone || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">{formatRegistrationDate(teacher.created_at)}</td>
                    <td className="hidden px-4 py-3.5 text-center sm:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/school-admin/teachers/${teacher.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="View Profile"><Eye size={15} /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEdit(teacher)} title="Edit Teacher"><Edit2 size={15} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" onClick={() => setTeacherToDelete(teacher)} title="Delete Teacher"><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredTeachers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredTeachers.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filteredTeachers.length}</span> teacher{filteredTeachers.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft size={14} />
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .reduce<(number | "…")[]>((pages, page, index, visiblePages) => {
                  if (index > 0 && page - visiblePages[index - 1] > 1) pages.push("…")
                  pages.push(page)
                  return pages
                }, [])
                .map((page, index) => page === "…"
                  ? <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">…</span>
                  : <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm"
                      onClick={() => setCurrentPage(page)} className={`h-8 w-8 p-0 text-xs ${currentPage === page ? "border-primary bg-primary text-primary-foreground" : ""}`}>{page}</Button>)}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(teacherToDelete)} onOpenChange={(open) => !open && !isDeleting && setTeacherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {teacherToDelete ? getTeacherName(teacherToDelete) : "this teacher"} from your school.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={(event) => { event.preventDefault(); void handleDelete() }}>
              {isDeleting ? "Deleting…" : "Delete teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function TeachersPage() {
  return <TeachersPageContent />
}
