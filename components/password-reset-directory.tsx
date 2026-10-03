"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ChevronLeft, ChevronRight, KeyRound, Users } from "lucide-react"
import { toast } from "sonner"
import { usersAPI, getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PAGE_SIZE = 10

type DirectoryRole = "student" | "teacher"

interface DirectoryUser {
  id: number
  username?: string
  user_name?: string
  email?: string
  user_email?: string
  first_name?: string
  last_name?: string
  student_id?: string
  employee_id?: string
  user?: {
    username?: string
    email?: string
    first_name?: string
    last_name?: string
  }
  user_data?: {
    username?: string
    email?: string
    first_name?: string
    last_name?: string
  }
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function getDisplayName(record: DirectoryUser) {
  const user = record.user_data || record.user
  const fullName = `${record.first_name || user?.first_name || ""} ${record.last_name || user?.last_name || ""}`.trim()
  return fullName || record.user_name || record.username || user?.username || "Unnamed account"
}

function getEmail(record: DirectoryUser) {
  return record.email || record.user_email || record.user_data?.email || record.user?.email || "No email"
}

export function PasswordResetDirectory({ role }: { role: DirectoryRole }) {
  const [records, setRecords] = useState<DirectoryUser[]>([])
  const [count, setCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<DirectoryUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const title = role === "student" ? "student" : "teacher"
  const displayId = role === "student" ? "student_id" : "employee_id"

  useEffect(() => {
    let active = true

    const loadPage = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = role === "student"
          ? await usersAPI.students({ page, page_size: PAGE_SIZE })
          : await usersAPI.teachers({ page, page_size: PAGE_SIZE })
        const data = response.data as Partial<PaginatedResponse<DirectoryUser>>

        if (!Array.isArray(data?.results) || typeof data.count !== "number") {
          throw new Error(`The ${role} list response did not include pagination data.`)
        }

        if (active) {
          setRecords(data.results)
          setCount(data.count)
          setHasNext(Boolean(data.next))
          setHasPrevious(Boolean(data.previous))
        }
      } catch (loadError) {
        const message = getErrorMessage(loadError, `Unable to load ${role}s.`)
        if (active) {
          setError(message)
          setRecords([])
          setCount(0)
          setHasNext(false)
          setHasPrevious(false)
          toast.error(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPage()
    return () => {
      active = false
    }
  }, [page, reloadKey, role])

  const resetPassword = async () => {
    if (!selectedRecord) return

    setResetting(true)
    try {
      if (role === "student") {
        await usersAPI.updateStudent(selectedRecord.id, { password: newPassword })
      } else {
        await usersAPI.updateTeacher(selectedRecord.id, { password: newPassword })
      }
      toast.success(`${title.charAt(0).toUpperCase()}${title.slice(1)} password reset successfully.`)
      setConfirmOpen(false)
      setSelectedRecord(null)
      setNewPassword("")
    } catch (resetError) {
      toast.error(getErrorMessage(resetError, `Unable to reset the ${title} password.`))
    } finally {
      setResetting(false)
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)
  const firstItem = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastItem = Math.min(page * PAGE_SIZE, count)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">
                {role === "student" ? "Student ID" : "Employee ID"}
              </th>
              <th className="px-2 py-2 text-right font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-border">
                  <td className="px-2 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-2 py-3"><Skeleton className="ml-auto h-8 w-28" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8">
                  <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
                      Try again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Users className="h-8 w-8 opacity-50" />
                    <p className="font-medium">No {role}s found</p>
                    <p className="text-sm">There are no {role} accounts available to reset.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 font-medium text-foreground">{getDisplayName(record)}</td>
                  <td className="px-2 py-3 text-muted-foreground">{getEmail(record)}</td>
                  <td className="px-2 py-3 text-muted-foreground">{record[displayId] || "—"}</td>
                  <td className="px-2 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record)
                        setNewPassword("")
                      }}
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset password
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!error && count > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {firstItem}–{lastItem} of {count} {role}s
          </p>
          <div className="flex items-center justify-end gap-2">
            <span className="mr-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !hasPrevious}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !hasNext}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(selectedRecord)}
        onOpenChange={(open) => {
          if (!open && !resetting) {
            setSelectedRecord(null)
            setNewPassword("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset {title} password</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${role}-new-password`}>
              New password for {selectedRecord ? getDisplayName(selectedRecord) : title}
            </Label>
            <Input
              id={`${role}-new-password`}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter a new password (minimum 8 characters)"
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={resetting}
              onClick={() => setSelectedRecord(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={newPassword.length < 8 || resetting}
              onClick={() => setConfirmOpen(true)}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !resetting && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm password reset</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately changes the password for {selectedRecord ? getDisplayName(selectedRecord) : `this ${title}`}.
              The account holder will need to use the new password to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Go back</AlertDialogCancel>
            <AlertDialogAction
              disabled={resetting}
              onClick={(event) => {
                event.preventDefault()
                void resetPassword()
              }}
            >
              {resetting ? "Resetting…" : "Confirm reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
