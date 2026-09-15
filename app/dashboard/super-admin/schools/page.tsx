"use client"

import { useMemo, useState } from "react"
import { Building2, MoreHorizontal, Plus, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage, platformAPI, schoolsAPI, superAdminAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatCard, StatCardGrid } from "@/components/super-admin/stat-card"
import { DataToolbar } from "@/components/super-admin/data-toolbar"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { ConfirmDialog } from "@/components/super-admin/confirm-dialog"
import { downloadCSV } from "@/components/super-admin/export"

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  website: "",
  primary_color: "#0a0a0a",
  secondary_color: "#008484",
  sidebar_color: "#209090",
  admin_username: "",
  admin_email: "",
  admin_password: "",
  status: "active",
}

export default function SchoolsPage() {
  const list = useFetch<AnyObj[]>(() => schoolsAPI.list().then((r) => r.data?.results || r.data || []), [])
  const usage = useFetch<AnyObj[]>(() => superAdminAPI.usage().then((r) => r.data?.results || r.data || []), [])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [actionError, setActionError] = useState("")
  const [busy, setBusy] = useState(false)

  // dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [detailSchool, setDetailSchool] = useState<AnyObj | null>(null)
  const [editSchool, setEditSchool] = useState<AnyObj | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<AnyObj | null>(null)
  const [impersonateSchool, setImpersonateSchool] = useState<AnyObj | null>(null)
  const [impersonateUserId, setImpersonateUserId] = useState("")
  const [impersonateReason, setImpersonateReason] = useState("")

  const usageBySchool = useMemo(() => {
    const map: Record<string, AnyObj> = {}
    for (const row of usage.data || []) map[String(row.school_id)] = row
    return map
  }, [usage.data])

  const rows = useMemo(() => {
    let out = [...(list.data || [])]
    const q = search.trim().toLowerCase()
    if (q) out = out.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(q))
    if (statusFilter) out = out.filter((s) => String(s.status) === statusFilter)
    if (sortBy === "name") out.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    if (sortBy === "newest") out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === "students") out.sort((a, b) => (usageBySchool[b.id]?.students ?? 0) - (usageBySchool[a.id]?.students ?? 0))
    return out
  }, [list.data, search, statusFilter, sortBy, usageBySchool])

  const counts = useMemo(() => {
    const all = list.data || []
    return {
      total: all.length,
      active: all.filter((s) => s.status === "active").length,
      suspended: all.filter((s) => s.status === "suspended").length,
      trial: all.filter((s) => s.status === "trial").length,
    }
  }, [list.data])

  async function run(fn: () => Promise<unknown>, done?: () => void) {
    setActionError("")
    setBusy(true)
    try {
      await fn()
      done?.()
      await Promise.all([list.reload(), usage.reload()])
    } catch (err) {
      setActionError(getErrorMessage(err, "Action failed."))
    } finally {
      setBusy(false)
    }
  }

  function exportCsv() {
    downloadCSV(
      rows.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone ?? "",
        status: s.status,
        plan: usageBySchool[s.id]?.plan ?? "",
        students: usageBySchool[s.id]?.students ?? 0,
        teachers: usageBySchool[s.id]?.teachers ?? 0,
        storage_mb: usageBySchool[s.id]?.storage_used_mb ?? 0,
        revenue: usageBySchool[s.id]?.revenue ?? 0,
        created_at: s.created_at,
      })),
      "schools",
      [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" },
        { key: "plan", label: "Plan" },
        { key: "students", label: "Students" },
        { key: "teachers", label: "Teachers" },
        { key: "storage_mb", label: "Storage MB" },
        { key: "revenue", label: "Revenue" },
        { key: "created_at", label: "Created" },
      ],
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="School Management"
        description="Create, review and manage every school on the platform."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            <Button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" /> Create school
            </Button>
          </>
        }
      />

      {(actionError || list.error) && (
        <div className="glass-red rounded-xl p-3 text-sm text-red-300">{actionError || list.error}</div>
      )}

      <StatCardGrid>
        <StatCard label="Total Schools" value={counts.total} icon={Building2} />
        <StatCard label="Active" value={counts.active} icon={Building2} tone="success" />
        <StatCard label="Trial" value={counts.trial} icon={Building2} tone="warning" />
        <StatCard label="Suspended" value={counts.suspended} icon={ShieldAlert} tone="danger" />
      </StatCardGrid>

      <DataToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search schools..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "trial", label: "Trial" },
              { value: "suspended", label: "Suspended" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            value: sortBy,
            onChange: setSortBy,
            placeholder: "Sort",
            allLabel: "Default order",
            options: [
              { value: "name", label: "Name A-Z" },
              { value: "newest", label: "Newest first" },
              { value: "students", label: "Most students" },
            ],
          },
        ]}
      />

      <div className="overflow-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Teachers</TableHead>
              <TableHead className="text-right">Storage MB</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.loading &&
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
            {!list.loading && !rows.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No schools match your filters.
                </TableCell>
              </TableRow>
            )}
            {!list.loading &&
              rows.map((s) => {
                const u = usageBySchool[s.id] || {}
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </TableCell>
                    <TableCell>{u.plan ? <span className="capitalize">{String(u.plan)}</span> : "—"}</TableCell>
                    <TableCell className="text-right">{u.students ?? 0}</TableCell>
                    <TableCell className="text-right">{u.teachers ?? 0}</TableCell>
                    <TableCell className="text-right">{u.storage_used_mb ?? 0}</TableCell>
                    <TableCell className="text-right">GH₵ {Number(u.revenue ?? 0).toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailSchool(s)}>View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditSchool(s)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              run(s.status === "suspended" ? () => schoolsAPI.activate(s.id) : () => schoolsAPI.suspend(s.id))
                            }
                          >
                            {s.status === "suspended" ? "Activate" : "Suspend"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => { setImpersonateUserId(""); setImpersonateReason(""); setImpersonateSchool(s) }}
                          >
                            Impersonate admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader>
            <div className="border-b border-border bg-muted/30 px-6 py-5">
              <DialogTitle className="text-xl">Create school</DialogTitle>
              <DialogDescription className="mt-1">
                Register a new school tenant and configure its contact details.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="max-h-[calc(90vh-170px)] space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">School information</h3>
                <p className="mt-1 text-xs text-muted-foreground">Basic contact details for the school tenant.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="School name" required><Input required placeholder="e.g. Alara Academy" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="School email" required><Input required type="email" placeholder="office@school.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Phone number" required><Input required placeholder="+233 20 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Website"><Input type="url" placeholder="https://school.edu" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
              </div>
              <Field label="Street address" required><Textarea required rows={2} placeholder="Building, street, or landmark" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" required><Input required placeholder="Accra" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                <Field label="State / Region" required><Input required placeholder="Greater Accra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
                <Field label="Country" required><Input required placeholder="Ghana" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
                <Field label="Postal code" required><Input required placeholder="GA-123-4567" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></Field>
              </div>
            </section>

            <section className="space-y-4 border-t border-border pt-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Brand colors</h3>
                <p className="mt-1 text-xs text-muted-foreground">Optional colors used to personalize the school experience.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField label="Primary" value={form.primary_color} onChange={(value) => setForm({ ...form, primary_color: value })} />
                <ColorField label="Secondary" value={form.secondary_color} onChange={(value) => setForm({ ...form, secondary_color: value })} />
                <ColorField label="Sidebar" value={form.sidebar_color} onChange={(value) => setForm({ ...form, sidebar_color: value })} />
              </div>
            </section>

            <section className="space-y-4 border-t border-border pt-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">School administrator</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  These credentials are used to create the first school admin account. Leave them blank to use the platform defaults.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Admin username">
                  <Input
                    value={form.admin_username}
                    onChange={(e) => setForm({ ...form, admin_username: e.target.value })}
                    placeholder="e.g. admin_alara"
                  />
                </Field>
                <Field label="Admin email">
                  <Input
                    type="email"
                    value={form.admin_email}
                    onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                    placeholder="admin@school.edu"
                  />
                </Field>
                <Field label="Admin password">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.admin_password}
                    onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                    placeholder="Minimum 8 characters"
                  />
                </Field>
              </div>
            </section>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end gap-2 border-t border-border bg-background px-6 py-4">
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>Cancel</Button>
            <Button
              type="button"
              disabled={busy || !form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.country || !form.postal_code}
              onClick={() =>
                run(
                  () =>
                    schoolsAPI.create({
                      ...form,
                    }),
                  () => setCreateOpen(false),
                )
              }
            >
              {busy ? "Creating..." : "Create school"}
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details */}
      <Dialog open={!!detailSchool} onOpenChange={(o) => !o && setDetailSchool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailSchool?.name}</DialogTitle>
            <DialogDescription>School details and statistics.</DialogDescription>
          </DialogHeader>
          {detailSchool && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="sub">Subscription</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-1.5 text-sm pt-3">
                <Row k="Email" v={detailSchool.email} />
                <Row k="Phone" v={detailSchool.phone} />
                <Row k="Address" v={detailSchool.address} />
                <Row k="Status" v={<StatusBadge status={detailSchool.status} />} />
                <Row k="Created" v={new Date(detailSchool.created_at).toLocaleString()} />
              </TabsContent>
              <TabsContent value="stats" className="pt-3">
                {(() => {
                  const u = usageBySchool[detailSchool.id] || {}
                  return (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <MiniStat label="Students" value={u.students ?? 0} />
                      <MiniStat label="Teachers" value={u.teachers ?? 0} />
                      <MiniStat label="Storage MB" value={u.storage_used_mb ?? 0} />
                      <MiniStat label="Revenue" value={`GH₵ ${Number(u.revenue ?? 0).toLocaleString()}`} />
                    </div>
                  )
                })()}
              </TabsContent>
              <TabsContent value="sub" className="pt-3 space-y-1.5 text-sm">
                <Row k="Plan" v={(usageBySchool[detailSchool.id]?.plan as string) || "—"} />
                <Row k="Status" v={<StatusBadge status={usageBySchool[detailSchool.id]?.status ?? detailSchool.status} />} />
                <Row k="Lifetime revenue" v={`GH₵ ${Number(usageBySchool[detailSchool.id]?.revenue ?? 0).toLocaleString()}`} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editSchool} onOpenChange={(o) => !o && setEditSchool(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit school</DialogTitle></DialogHeader>
          {editSchool && (
            <div className="space-y-3">
              <Field label="Name"><Input value={editSchool.name} onChange={(e) => setEditSchool({ ...editSchool, name: e.target.value })} /></Field>
              <Field label="Email"><Input value={editSchool.email ?? ""} onChange={(e) => setEditSchool({ ...editSchool, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editSchool.phone ?? ""} onChange={(e) => setEditSchool({ ...editSchool, phone: e.target.value })} /></Field>
              <Field label="Address"><Input value={editSchool.address ?? ""} onChange={(e) => setEditSchool({ ...editSchool, address: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSchool(null)} disabled={busy}>Cancel</Button>
            <Button
              disabled={busy}
              onClick={() =>
                editSchool &&
                run(
                  () =>
                    schoolsAPI.update(editSchool.id, {
                      name: editSchool.name,
                      email: editSchool.email,
                      phone: editSchool.phone,
                      address: editSchool.address,
                    }),
                  () => setEditSchool(null),
                )
              }
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonation */}
      <Dialog open={!!impersonateSchool} onOpenChange={(o) => !o && setImpersonateSchool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate school admin</DialogTitle>
            <DialogDescription>
              Start a support session as an admin of {impersonateSchool?.name}. Every action you take is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Admin user ID">
              <Input
                type="number"
                value={impersonateUserId}
                onChange={(e) => setImpersonateUserId(e.target.value)}
                placeholder="e.g. 42"
              />
            </Field>
            <Field label="Reason (required)">
              <Textarea
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                placeholder="Support ticket #123 — investigating login issue"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImpersonateSchool(null)} disabled={busy}>Close</Button>
            <Button
              variant="destructive"
              disabled={busy || !impersonateUserId || !impersonateReason.trim()}
              onClick={() =>
                run(
                  () => platformAPI.startImpersonation(Number(impersonateUserId), impersonateReason.trim()),
                  () => setImpersonateSchool(null),
                )
              }
            >
              Start impersonation
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => run(() => platformAPI.stopImpersonation())}>
              Stop impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-input bg-background p-1"
          aria-label={`${label} brand color`}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
          maxLength={7}
          aria-label={`${label} hex color`}
          className="font-mono uppercase"
        />
      </div>
    </Field>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right truncate">{v || "—"}</span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  )
}
