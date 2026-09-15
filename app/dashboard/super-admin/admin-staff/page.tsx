"use client"

import type React from "react"
import { useState } from "react"
import { KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage, platformAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  platform_role: "",
}

export default function SuperAdminStaffPage() {
  const staff = useFetch<AnyObj[]>(
    () => platformAPI.platformStaff().then((response) => response.data || []),
    [],
  )
  const roles = useFetch<AnyObj[]>(
    () => platformAPI.roles().then((response) => response.data?.results || response.data || []),
    [],
  )
  const [form, setForm] = useState(EMPTY_FORM)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AnyObj | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setMessage("")
    setOpen(true)
  }

  function openEdit(member: AnyObj) {
    setEditing(member)
    setForm({ ...EMPTY_FORM, platform_role: String(member.platform_roles?.[0]?.id || "") })
    setMessage("")
    setOpen(true)
  }

  async function saveStaff(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    try {
      if (editing) {
        await platformAPI.updatePlatformStaffRole(Number(editing.id), Number(form.platform_role))
        setMessage("Platform staff role updated.")
      } else {
        await platformAPI.createPlatformStaff({
          ...form,
          platform_role: Number(form.platform_role),
        })
        setMessage("Staff admin account created successfully.")
      }
      setOpen(false)
      await staff.reload()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to save staff admin."))
    } finally {
      setBusy(false)
    }
  }

  async function removeStaff(member: AnyObj) {
    if (!window.confirm(`Delete ${member.first_name || member.username}'s staff account?`)) return
    setBusy(true)
    setMessage("")
    try {
      await platformAPI.deletePlatformStaff(Number(member.id))
      await staff.reload()
      setMessage("Staff account deleted.")
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to delete staff account."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Staff Administrators"
        description="Create internal platform staff accounts and assign the school-management tasks they can perform."
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create staff admin</Button>}
      />
      {message && <p className="rounded-lg bg-muted p-3 text-sm">{message}</p>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Staff accounts ({staff.data?.length || 0})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {staff.loading && <p className="text-sm text-muted-foreground">Loading staff accounts...</p>}
          {!staff.loading && !staff.data?.length && <p className="text-sm text-muted-foreground">No staff administrators created yet.</p>}
          {staff.data?.map((member) => (
            <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{`${member.first_name || ""} ${member.last_name || ""}`.trim() || member.username}</p>
                <p className="text-sm text-muted-foreground">{member.email} · {member.platform_roles?.[0]?.display_name || "Unassigned platform role"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Platform-wide · {(member.platform_permissions || []).length} permissions</p>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(member)} disabled={busy}>View role</Button>
                <Button variant="ghost" size="icon" onClick={() => removeStaff(member)} disabled={busy} aria-label={`Delete ${member.username}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Manage staff permissions" : "Create staff administrator"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update the tasks assigned to ${editing.username}.` : "Create an account for a trusted platform staff member."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveStaff} className="space-y-6">
            {!editing && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" required><Input required value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></Field>
                  <Field label="Last name" required><Input required value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></Field>
                  <Field label="Username" required><Input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></Field>
                  <Field label="Email" required><Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
                  <Field label="Phone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
                  <Field label="Password" required><Input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
                </div>
              </>
            )}
            <Field label="Platform role" required><select required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.platform_role} onChange={(event) => setForm({ ...form, platform_role: event.target.value })}><option value="">Select role</option>{roles.data?.map((role) => <option key={role.id} value={role.id}>{role.display_name}</option>)}</select></Field>
            <div>
              <h3 className="mb-1 text-sm font-semibold">Assigned permissions</h3>
              <p className="mb-3 text-xs text-muted-foreground">Select the areas this staff member can access. Permissions are enforced by the API and dashboard navigation.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(roles.data?.find((role) => String(role.id) === String(form.platform_role))?.permissions || []).map((permission: string) => (
                  <div key={permission} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span><span className="block text-sm font-medium">{permission}</span><span className="text-xs text-muted-foreground">Granted by selected platform role</span></span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy || (!editing && (!form.platform_role || !form.password))}><KeyRound className="mr-2 h-4 w-4" />{busy ? "Saving..." : editing ? "Close" : "Create account"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>{children}</div>
}
