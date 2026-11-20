"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, ArrowDownToLine, BadgeDollarSign, Banknote, CalendarDays, CheckCircle2, CircleAlert, FileText, Plus, RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataStateEmpty, DataStateError, DataStateLoading } from "@/components/data-state"
import { useAuthContext } from "@/lib/auth-context"
import { payrollAPI } from "@/lib/api"

type PayrollSection =
  | "overview"
  | "employees"
  | "structures"
  | "processing"
  | "payslips"
  | "payments"
  | "loans"
  | "reports"
  | "settings"

type Person = {
  id: number
  user?: number
  user_name?: string
  name?: string
  employee_number: string
  department: string
  job_title?: string
  start_date?: string
  end_date?: string | null
  is_active?: boolean
  role?: string
}

type SalaryComponent = { name: string; amount: string }

type Structure = {
  id: number
  name: string
  grade: string
  currency: string
  basic_salary: string
  allowances: SalaryComponent[]
  deductions: SalaryComponent[]
  effective_from: string
  effective_to?: string | null
  is_active: boolean
}

type PayrollLine = {
  id: number
  employee_id: number
  employee_name: string
  employee_number: string
  department: string
  currency: string
  basic_salary: string
  gross_pay: string
  total_deductions: string
  net_pay: string
  amount_paid: string
  payment_status: string
}

type Period = {
  id: number
  year: number
  month: number
  month_name: string
  status: string
  starts_on: string
  ends_on: string
  totals: { employees: number; gross: string; net: string; deductions: string }
  employees?: PayrollLine[]
}

type Dashboard = {
  employees: number
  gross_pay: string
  net_pay: string
  pending_approvals: number
  unpaid_salaries: number
  trends: { period: string; gross: string; net: string; status: string }[]
  department_expenses: { department: string; gross: string; net: string; employees: number }[]
  alerts: { level: string; message: string }[]
  latest_period: Period | null
}

type PayrollPayment = {
  id: number
  employee_name: string
  employee_number: string
  period: string
  currency: string
  amount: string
  method: string
  status: string
  reference: string
  recorded_by_name: string
  failure_reason: string
  line: number
  paid_at: string | null
  created_at: string
}

type Loan = {
  id: number
  employee_id: number
  employee_name: string
  kind: string
  principal: string
  currency: string
  starts_on: string
  status: string
  notes: string
  schedule: { id: number; due_on: string; amount: string; status: string }[]
}

const PAYROLL_LINKS: { key: PayrollSection; label: string; href: string }[] = [
  { key: "overview", label: "Overview", href: "/dashboard/school-admin/payroll" },
  { key: "employees", label: "Employees", href: "/dashboard/school-admin/payroll/employees" },
  { key: "structures", label: "Salary structures", href: "/dashboard/school-admin/payroll/structures" },
  { key: "processing", label: "Processing", href: "/dashboard/school-admin/payroll/processing" },
  { key: "payslips", label: "Payslips", href: "/dashboard/school-admin/payroll/payslips" },
  { key: "payments", label: "Disbursements", href: "/dashboard/school-admin/payroll/payments" },
  { key: "loans", label: "Loans & advances", href: "/dashboard/school-admin/payroll/loans" },
  { key: "reports", label: "Reports", href: "/dashboard/school-admin/payroll/reports" },
  { key: "settings", label: "Settings", href: "/dashboard/school-admin/payroll/settings" },
]

const TITLES: Record<PayrollSection, { title: string; description: string }> = {
  overview: { title: "Payroll overview", description: "A secure, clear view of school payroll and salary obligations." },
  employees: { title: "Employee payroll", description: "Link existing Alara staff accounts to payroll and assign effective-dated pay." },
  structures: { title: "Salary structures", description: "Set grades, base pay, recurring allowances, and deductions." },
  processing: { title: "Payroll processing", description: "Calculate monthly pay, submit it for review, and record approval." },
  payslips: { title: "Payslips", description: "View approved salary statements and download a personal PDF copy." },
  payments: { title: "Salary disbursements", description: "Record externally made salary payments and review their history." },
  loans: { title: "Loans & advances", description: "Manage staff loans and scheduled payroll repayments." },
  reports: { title: "Payroll reports", description: "Export approved payroll details as CSV, Excel, or PDF." },
  settings: { title: "Payroll settings", description: "Configure currency, school policy, and effective-dated statutory rules." },
}

function messageFrom(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data
    if (typeof data === "string" && data.trim()) return data
    if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data)
      const detail = entries.find(([field]) => field === "detail")?.[1]
      if (typeof detail === "string" && detail.trim()) return detail

      const fieldErrors = entries.flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value]
        return messages
          .filter((message): message is string => typeof message === "string" && Boolean(message.trim()))
          .map((message) => `${field}: ${message}`)
      })
      if (fieldErrors.length) return fieldErrors.join(" ")
    }
  }
  return error instanceof Error ? error.message : "The request could not be completed."
}

function displayAmount(value?: string | null, currency = "GHS") {
  const amount = Number(value || 0)
  return `${currency} ${Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`
}

function responseData<T>(response: { data: T }) {
  return response.data
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

function getMonthDates(value: string) {
  const [year, month] = value.split("-").map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return {
    year,
    month,
    starts_on: `${year}-${String(month).padStart(2, "0")}-01`,
    ends_on: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  }
}

function createRepaymentSchedule(principalValue: string, count: number, firstDue: string) {
  const cents = Math.round(Number(principalValue) * 100)
  if (!Number.isSafeInteger(cents) || cents <= 0 || count < 1 || !firstDue) {
    throw new Error("Enter a valid principal, number of installments, and first due date.")
  }
  const base = Math.floor(cents / count)
  let remainder = cents - base * count
  const [year, month, day] = firstDue.split("-").map(Number)
  return Array.from({ length: count }, (_, index) => {
    const due = new Date(year, month - 1 + index, Math.min(day, new Date(year, month + index, 0).getDate()))
    const installment = base + (remainder > 0 ? 1 : 0)
    remainder = Math.max(0, remainder - 1)
    return {
      due_on: `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`,
      amount: (installment / 100).toFixed(2),
    }
  })
}

function StatCard({ title, value, note, icon: Icon }: {
  title: string
  value: string
  note?: string
  icon: typeof Users
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
        </div>
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></span>
      </CardContent>
    </Card>
  )
}

function SalaryComponentEditor({
  title,
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string
  rows: SalaryComponent[]
  onChange: (index: number, field: keyof SalaryComponent, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div role="group" aria-label={title} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add {title.toLowerCase().replace(/s$/, "")}
        </Button>
      </div>
      {rows.map((row, index) => (
        <div key={`${title}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            aria-label={`${title} ${index + 1} name`}
            value={row.name}
            onChange={(event) => onChange(index, "name", event.target.value)}
            placeholder="Name"
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />
          <input
            aria-label={`${title} ${index + 1} amount`}
            type="number"
            min="0"
            step="0.01"
            value={row.amount}
            onChange={(event) => onChange(index, "amount", event.target.value)}
            placeholder="Monthly amount"
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />
          <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(index)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  )
}

export function PayrollWorkspace({ section }: { section: PayrollSection }) {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [profiles, setProfiles] = useState<Person[]>([])
  const [available, setAvailable] = useState<Person[]>([])
  const [structures, setStructures] = useState<Structure[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null)
  const [periodDetail, setPeriodDetail] = useState<Period | null>(null)
  const [payslips, setPayslips] = useState<(PayrollLine & { period: string })[]>([])
  const [payments, setPayments] = useState<PayrollPayment[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [settings, setSettings] = useState<{ currency: string; statutory_rules: unknown[]; policy: Record<string, unknown>; effective_from: string } | null>(null)
  const [assignmentStructures, setAssignmentStructures] = useState<Record<number, string>>({})
  const [allowanceRows, setAllowanceRows] = useState<SalaryComponent[]>([])
  const [deductionRows, setDeductionRows] = useState<SalaryComponent[]>([])
  const [reportFormat, setReportFormat] = useState<"csv" | "xlsx" | "pdf">("csv")
  const [newPeriod, setNewPeriod] = useState(new Date().toISOString().slice(0, 7))

  const can = useCallback((permission: string) =>
    user?.role === "school_admin" || (user?.permissions || []).includes(permission),
  [user?.permissions, user?.role])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      if (section === "overview") {
        const [dashboardResponse] = await Promise.all([payrollAPI.dashboard()])
        setDashboard(responseData<Dashboard>(dashboardResponse))
      } else if (section === "employees") {
        const [profileResponse, availableResponse, structureResponse] = await Promise.all([
          payrollAPI.employees(), payrollAPI.availableEmployees(), payrollAPI.structures(),
        ])
        setProfiles(responseData<Person[]>(profileResponse))
        setAvailable(responseData<Person[]>(availableResponse))
        setStructures(responseData<Structure[]>(structureResponse))
      } else if (section === "structures") {
        const response = await payrollAPI.structures()
        setStructures(responseData<Structure[]>(response))
      } else if (section === "processing") {
        const [periodResponse, profileResponse] = await Promise.all([
          payrollAPI.periods(),
          payrollAPI.employees(),
        ])
        const loadedPeriods = responseData<Period[]>(periodResponse)
        setPeriods(loadedPeriods)
        setProfiles(responseData<Person[]>(profileResponse))
        const periodId = selectedPeriodId || loadedPeriods[0]?.id
        if (periodId) {
          setSelectedPeriodId(periodId)
          const detail = await payrollAPI.period(periodId)
          setPeriodDetail(responseData<Period>(detail))
        } else {
          setPeriodDetail(null)
        }
      } else if (section === "reports") {
        const response = await payrollAPI.periods()
        const loadedPeriods = responseData<Period[]>(response)
        setPeriods(loadedPeriods)
        const periodId = selectedPeriodId || loadedPeriods[0]?.id
        if (periodId) {
          setSelectedPeriodId(periodId)
          const detail = await payrollAPI.period(periodId)
          setPeriodDetail(responseData<Period>(detail))
        } else {
          setPeriodDetail(null)
        }
      } else if (section === "payslips") {
        const response = await payrollAPI.payslips()
        setPayslips(responseData<(PayrollLine & { period: string })[]>(response))
      } else if (section === "payments") {
        const response = await payrollAPI.payments()
        setPayments(responseData<PayrollPayment[]>(response))
        const periodResponse = await payrollAPI.periods()
        const approved = responseData<Period[]>(periodResponse).filter((period) =>
          ["approved", "payment_processing", "partially_paid"].includes(period.status),
        )
        if (approved.length) {
          const detail = await payrollAPI.period(approved[0].id)
          setPeriodDetail(responseData<Period>(detail))
          setSelectedPeriodId(approved[0].id)
        }
      } else if (section === "loans") {
        const [loanResponse, profileResponse] = await Promise.all([payrollAPI.loans(), payrollAPI.employees()])
        setLoans(responseData<Loan[]>(loanResponse))
        setProfiles(responseData<Person[]>(profileResponse))
      } else if (section === "settings") {
        const response = await payrollAPI.settings()
        setSettings(responseData<typeof settings>(response))
      }
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setLoading(false)
    }
  }, [section, selectedPeriodId])

  useEffect(() => {
    void load()
  }, [load])

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await action()
      setSuccess(successMessage)
      await load()
      return true
    } catch (actionError) {
      setError(messageFrom(actionError))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    await runAction(() => payrollAPI.createEmployee({
      user: Number(form.get("user")),
      employee_number: String(form.get("employee_number") || ""),
      department: String(form.get("department") || ""),
      job_title: String(form.get("job_title") || ""),
      start_date: String(form.get("start_date") || ""),
      payment_method: String(form.get("payment_method") || "bank_transfer"),
      is_active: true,
    }), "Employee payroll profile added.")
    formElement.reset()
  }

  async function submitStructure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      name: String(form.get("name") || ""),
      grade: String(form.get("grade") || ""),
      currency: String(form.get("currency") || "GHS").toUpperCase(),
      basic_salary: String(form.get("basic_salary") || ""),
      allowances: allowanceRows.map(({ name, amount }) => ({ name: name.trim(), amount })),
      deductions: deductionRows.map(({ name, amount }) => ({ name: name.trim(), amount })),
      effective_from: String(form.get("effective_from") || ""),
    }
    if (await runAction(() => payrollAPI.createStructure(payload), "Salary structure created.")) {
      formElement.reset()
      setAllowanceRows([])
      setDeductionRows([])
    }
  }

  async function submitPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dates = getMonthDates(newPeriod)
    await runAction(() => payrollAPI.createPeriod({ ...dates }), "Payroll period created.")
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      line: Number(form.get("line")),
      amount: String(form.get("amount") || ""),
      method: String(form.get("method") || "bank_transfer"),
      status: String(form.get("status") || "paid"),
      reference: String(form.get("reference") || ""),
      proof_url: String(form.get("proof_url") || ""),
      failure_reason: String(form.get("failure_reason") || ""),
    }
    await runAction(() => payrollAPI.recordPayment(payload), "Salary disbursement recorded.")
    formElement.reset()
  }

  async function submitLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const principal = String(form.get("principal") || "")
      const schedule = createRepaymentSchedule(
        principal,
        Number(form.get("installments")),
        String(form.get("first_due") || ""),
      )
      await runAction(() => payrollAPI.createLoan({
        profile: Number(form.get("profile")),
        kind: String(form.get("kind") || "loan"),
        principal,
        currency: "GHS",
        starts_on: String(form.get("starts_on") || ""),
        notes: String(form.get("notes") || ""),
        schedule,
      }), "Loan and repayment schedule created.")
      formElement.reset()
    } catch (parseError) {
      setError(messageFrom(parseError))
    }
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const statutoryRules = JSON.parse(String(form.get("statutory_rules") || "[]")) as unknown
      const policy = JSON.parse(String(form.get("policy") || "{}")) as unknown
      if (!Array.isArray(statutoryRules) || typeof policy !== "object" || policy === null || Array.isArray(policy)) {
        throw new Error("Statutory rules must be a JSON list and policy must be a JSON object.")
      }
      await runAction(() => payrollAPI.saveSettings({
        currency: String(form.get("currency") || "GHS").toUpperCase(),
        statutory_rules: statutoryRules,
        policy,
        effective_from: String(form.get("effective_from") || ""),
      }), "Payroll settings saved.")
    } catch (parseError) {
      setError(messageFrom(parseError))
    }
  }

  async function assignStructure(profile: Person) {
    const structureId = assignmentStructures[profile.id]
    if (!structureId) {
      setError(`Choose a salary structure for ${profile.user_name || profile.name || "this employee"}.`)
      return
    }
    await runAction(() => payrollAPI.assignStructure({
      profile: profile.id,
      structure: Number(structureId),
      effective_from: new Date().toISOString().slice(0, 10),
    }), "Salary structure assigned.")
  }

  async function downloadPayslip(id: number) {
    setError("")
    try {
      const response = await payrollAPI.payslipPdf(id)
      downloadBlob(response.data as Blob, `payslip-${id}.pdf`)
    } catch (requestError) {
      setError(messageFrom(requestError))
    }
  }

  async function downloadReport() {
    if (!selectedPeriodId) return
    setError("")
    try {
      const response = await payrollAPI.report(selectedPeriodId, reportFormat)
      downloadBlob(response.data as Blob, `payroll-${selectedPeriodId}.${reportFormat}`)
    } catch (requestError) {
      setError(messageFrom(requestError))
    }
  }

  async function saveReview(action: "submit" | "approve" | "return" | "reject" | "close") {
    if (!selectedPeriodId) return
    const note = action === "return" || action === "reject"
      ? window.prompt("Enter the reason to return or reject this payroll:") || ""
      : ""
    if ((action === "return" || action === "reject") && !note.trim()) return
    await runAction(() => payrollAPI.workflow(selectedPeriodId, action, note), `Payroll ${action.replace("_", " ")} successful.`)
  }

  const latestPeriod = dashboard?.latest_period
  const currentTitle = TITLES[section]
  const trendMax = useMemo(() => Math.max(1, ...(dashboard?.trends.map((row) => Number(row.gross)) || [1])), [dashboard?.trends])
  const activePeriod = periodDetail
  const processingProfiles = profiles.filter((profile) =>
    profile.is_active !== false &&
    (!activePeriod || (!profile.start_date || profile.start_date <= activePeriod.ends_on) &&
      (!profile.end_date || profile.end_date >= activePeriod.starts_on)),
  )
  const ownPayslips = section === "payslips" && !can("view_payroll") && !can("manage_payroll")

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><BadgeDollarSign className="h-4 w-4" /> Alara Finance</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{currentTitle.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{currentTitle.description}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      {section !== "payslips" && (
        <nav className="flex gap-2 overflow-x-auto border-b pb-2" aria-label="Payroll navigation">
          {PAYROLL_LINKS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {error && <DataStateError message={error} onRetry={() => void load()} />}
      {success && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" />{success}</div>}
      {loading ? <DataStateLoading message="Loading payroll data…" /> : (
        <>
          {section === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Active employees" value={String(dashboard?.employees || 0)} note="Linked staff accounts" icon={Users} />
                <StatCard title="Gross payroll" value={displayAmount(dashboard?.gross_pay)} note={latestPeriod ? `${latestPeriod.year}-${String(latestPeriod.month).padStart(2, "0")}` : "Latest period"} icon={BadgeDollarSign} />
                <StatCard title="Net payroll" value={displayAmount(dashboard?.net_pay)} note="After configured deductions" icon={Banknote} />
                <StatCard title="Awaiting review" value={String(dashboard?.pending_approvals || 0)} note={`${dashboard?.unpaid_salaries || 0} unpaid or partial`} icon={CalendarDays} />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                  <CardHeader><CardTitle>Payroll trend</CardTitle><CardDescription>Gross pay by processed month</CardDescription></CardHeader>
                  <CardContent>
                    {dashboard?.trends.length ? (
                      <div className="flex h-56 items-end gap-3 border-b pb-2">
                        {dashboard.trends.map((item) => (
                          <div key={item.period} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                            <span className="max-w-full truncate text-[10px] text-muted-foreground">{displayAmount(item.gross)}</span>
                            <div
                              className="min-h-1 w-full rounded-t-md bg-primary/75"
                              style={{ height: `${Math.max(3, (Number(item.gross) / trendMax) * 70)}%` }}
                              title={`${item.period}: ${displayAmount(item.gross)}`}
                            />
                            <span className="text-xs text-muted-foreground">{item.period.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    ) : <DataStateEmpty title="No payroll trend yet" description="Processed payroll totals will appear after the first calculation." icon={Activity} />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Alerts</CardTitle><CardDescription>Items that may need attention</CardDescription></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard?.alerts.length ? dashboard.alerts.map((alert, index) => (
                      <div key={`${alert.message}-${index}`} className="flex gap-3 rounded-lg border p-3 text-sm">
                        <CircleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${alert.level === "warning" ? "text-amber-600" : "text-blue-600"}`} />
                        <span>{alert.message}</span>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No payroll alerts.</p>}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Department expenses</CardTitle><CardDescription>Gross payroll distribution for the latest period</CardDescription></CardHeader>
                <CardContent>
                  {dashboard?.department_expenses.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead><tr className="border-b text-muted-foreground"><th className="py-3 font-medium">Department</th><th className="py-3 font-medium">Employees</th><th className="py-3 font-medium">Gross</th><th className="py-3 font-medium">Net</th></tr></thead>
                        <tbody>{dashboard.department_expenses.map((row) => <tr key={row.department} className="border-b last:border-0"><td className="py-3 font-medium">{row.department}</td><td className="py-3">{row.employees}</td><td className="py-3">{displayAmount(row.gross)}</td><td className="py-3">{displayAmount(row.net)}</td></tr>)}</tbody>
                      </table>
                    </div>
                  ) : <DataStateEmpty title="No department data" description="Department totals appear when payroll is calculated." />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "employees" && (
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <Card>
                <CardHeader><CardTitle>Link an existing staff member</CardTitle><CardDescription>This does not create or duplicate an Alara user account.</CardDescription></CardHeader>
                <CardContent>
                  {can("manage_payroll") ? (
                    <form className="space-y-4" onSubmit={(event) => void submitProfile(event)}>
                      <label className="block space-y-1.5 text-sm"><span>Existing staff user</span><select name="user" required className="h-10 w-full rounded-md border bg-background px-3"><option value="">Select a staff member</option>{available.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1.5 text-sm"><span>Employee number</span><input name="employee_number" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                        <label className="space-y-1.5 text-sm"><span>Department</span><input name="department" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                      </div>
                      <label className="block space-y-1.5 text-sm"><span>Job title</span><input name="job_title" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1.5 text-sm"><span>Start date</span><input name="start_date" type="date" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                        <label className="space-y-1.5 text-sm"><span>Default payment method</span><select name="payment_method" className="h-10 w-full rounded-md border bg-background px-3"><option value="bank_transfer">Bank transfer</option><option value="mobile_money">Mobile Money</option><option value="cash">Cash</option><option value="cheque">Cheque</option></select></label>
                      </div>
                      <Button type="submit" disabled={saving || available.length === 0}><Plus className="mr-2 h-4 w-4" /> Add payroll profile</Button>
                      {available.length === 0 && <p className="text-xs text-muted-foreground">All existing staff accounts already have payroll profiles.</p>}
                    </form>
                  ) : <p className="text-sm text-muted-foreground">You have view-only payroll access.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Employee payroll profiles</CardTitle><CardDescription>Assign a salary structure with an effective date.</CardDescription></CardHeader>
                <CardContent>
                  {profiles.length ? <div className="space-y-3">
                    {profiles.map((person) => (
                      <div key={person.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="font-medium">{person.user_name}</p><p className="text-sm text-muted-foreground">{person.employee_number || "No employee number"} · {person.department || "Unassigned department"}</p></div>
                        {can("manage_payroll") && <div className="flex gap-2">
                          <select
                            aria-label={`Salary structure for ${person.user_name}`}
                            className="h-10 max-w-56 rounded-md border bg-background px-3 text-sm"
                            value={assignmentStructures[person.id] || ""}
                            onChange={(event) => setAssignmentStructures((values) => ({ ...values, [person.id]: event.target.value }))}
                          >
                            <option value="">Select structure</option>
                            {structures.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name} · {displayAmount(item.basic_salary, item.currency)}</option>)}
                          </select>
                          <Button variant="outline" onClick={() => void assignStructure(person)} disabled={saving}>Assign</Button>
                        </div>}
                      </div>
                    ))}
                  </div> : <DataStateEmpty title="No payroll profiles" description="Link an existing staff account to get started." icon={Users} />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "structures" && (
            <div className="grid items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <Card>
                <CardHeader><CardTitle>Create salary structure</CardTitle><CardDescription>New structures are effective-dated versions; prior payroll stays unchanged.</CardDescription></CardHeader>
                <CardContent>
                  {can("manage_payroll") ? <form className="space-y-4" onSubmit={(event) => void submitStructure(event)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm"><span>Name</span><input name="name" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                      <label className="space-y-1.5 text-sm"><span>Grade</span><input name="grade" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm"><span>Currency</span><input name="currency" defaultValue="GHS" maxLength={3} required className="h-10 w-full rounded-md border bg-background px-3 uppercase" /></label>
                      <label className="space-y-1.5 text-sm"><span>Basic salary</span><input name="basic_salary" type="number" min="0" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    </div>
                    <SalaryComponentEditor
                      title="Allowances"
                      rows={allowanceRows}
                      onChange={(index, field, value) => setAllowanceRows((rows) =>
                        rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
                      )}
                      onAdd={() => setAllowanceRows((rows) => [...rows, { name: "", amount: "" }])}
                      onRemove={(index) => setAllowanceRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                    />
                    <SalaryComponentEditor
                      title="Recurring deductions"
                      rows={deductionRows}
                      onChange={(index, field, value) => setDeductionRows((rows) =>
                        rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
                      )}
                      onAdd={() => setDeductionRows((rows) => [...rows, { name: "", amount: "" }])}
                      onRemove={(index) => setDeductionRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                    />
                    <label className="block space-y-1.5 text-sm"><span>Effective from</span><input name="effective_from" type="date" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    <Button disabled={saving} type="submit"><Plus className="mr-2 h-4 w-4" /> Create structure</Button>
                  </form> : <p className="text-sm text-muted-foreground">You have view-only payroll access.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Salary structures</CardTitle><CardDescription>Structures remain visible for historical payroll records.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {structures.length ? structures.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="font-medium">{item.name}{item.grade ? ` · ${item.grade}` : ""}</p><p className="text-sm text-muted-foreground">Effective {item.effective_from}{item.effective_to ? ` to ${item.effective_to}` : ""}</p></div>
                        <p className="font-semibold">{displayAmount(item.basic_salary, item.currency)}</p>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{item.allowances.length} allowance(s) · {item.deductions.length} configured deduction(s)</p>
                    </div>
                  )) : <DataStateEmpty title="No salary structures" description="Create an effective-dated structure before assigning employee pay." />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "processing" && (
            <div className="space-y-6">
              {can("manage_payroll") && <Card>
                <CardHeader><CardTitle>Start a monthly payroll</CardTitle><CardDescription>Recalculate a draft or calculated period to include new eligible staff and current salary assignments.</CardDescription></CardHeader>
                <CardContent><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => void submitPeriod(event)}>
                  <label className="space-y-1.5 text-sm"><span>Payroll month</span><input type="month" value={newPeriod} onChange={(event) => setNewPeriod(event.target.value)} required className="h-10 rounded-md border bg-background px-3" /></label>
                  <Button type="submit" disabled={saving}><Plus className="mr-2 h-4 w-4" /> Create period</Button>
                </form></CardContent>
              </Card>}
              <Card>
                <CardHeader><CardTitle>Payroll periods</CardTitle><CardDescription>Draft → Calculated → Submitted for Review → Approved → Payments → Closed</CardDescription></CardHeader>
                <CardContent>
                  {periods.length ? <div className="space-y-5">
                    <label className="block max-w-sm space-y-1.5 text-sm"><span>Selected payroll period</span><select className="h-10 w-full rounded-md border bg-background px-3" value={selectedPeriodId || ""} onChange={(event) => setSelectedPeriodId(Number(event.target.value))}>{periods.map((period) => <option key={period.id} value={period.id}>{period.year}-{String(period.month).padStart(2, "0")} · {period.status}</option>)}</select></label>
                    {activePeriod && <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Employees" value={String(activePeriod.totals.employees)} icon={Users} />
                        <StatCard title="Gross" value={displayAmount(activePeriod.totals.gross)} icon={BadgeDollarSign} />
                        <StatCard title="Deductions" value={displayAmount(activePeriod.totals.deductions)} icon={Activity} />
                        <StatCard title="Net" value={displayAmount(activePeriod.totals.net)} icon={Banknote} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {can("manage_payroll") && ["draft", "returned", "rejected"].includes(activePeriod.status) && <Button disabled={saving} onClick={() => void runAction(() => payrollAPI.calculate(activePeriod.id), "Payroll calculated.")}>Calculate payroll</Button>}
                        {can("manage_payroll") && activePeriod.status === "calculated" && <Button variant="outline" disabled={saving} onClick={() => {
                          if (window.confirm("Recalculate this payroll using current active employee profiles and salary assignments? Existing calculated lines will be replaced.")) {
                            void runAction(() => payrollAPI.calculate(activePeriod.id), "Payroll recalculated.")
                          }
                        }}>Recalculate payroll</Button>}
                        {can("manage_payroll") && activePeriod.status === "calculated" && <Button disabled={saving} onClick={() => void saveReview("submit")}>Submit for review</Button>}
                        {can("approve_payroll") && activePeriod.status === "submitted_for_review" && <><Button disabled={saving} onClick={() => void saveReview("approve")}>Approve payroll</Button><Button variant="outline" disabled={saving} onClick={() => void saveReview("return")}>Return for correction</Button><Button variant="destructive" disabled={saving} onClick={() => void saveReview("reject")}>Reject</Button></>}
                        {can("manage_payroll") && activePeriod.status === "paid" && <Button variant="outline" disabled={saving} onClick={() => void saveReview("close")}>Close period</Button>}
                      </div>
                      {activePeriod.employees?.length ? <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full min-w-[740px] text-left text-sm">
                          <thead className="bg-muted/50"><tr>{["Employee", "Department", "Gross", "Deductions", "Net", "Paid", "Status"].map((label) => <th key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead>
                          <tbody>{activePeriod.employees.map((line) => <tr key={line.id} className="border-t"><td className="px-3 py-3 font-medium">{line.employee_name}</td><td className="px-3 py-3">{line.department || "—"}</td><td className="px-3 py-3">{displayAmount(line.gross_pay, line.currency)}</td><td className="px-3 py-3">{displayAmount(line.total_deductions, line.currency)}</td><td className="px-3 py-3 font-medium">{displayAmount(line.net_pay, line.currency)}</td><td className="px-3 py-3">{displayAmount(line.amount_paid, line.currency)}</td><td className="px-3 py-3 capitalize">{line.payment_status.replace("_", " ")}</td></tr>)}</tbody>
                        </table>
                      </div> : <DataStateEmpty title="No payroll entries" description="Calculate payroll after employee profiles have active salary assignments." />}
                    </div>}
                  </div> : <DataStateEmpty title="No payroll periods" description="Create a period for the month you want to process." />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Eligible staff profiles</CardTitle>
                  <CardDescription>Active payroll profiles appear here. Assign each employee an effective salary structure before calculating the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                  {processingProfiles.length ? <div className="space-y-3">
                    {processingProfiles.map((person) => (
                      <div key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{person.user_name || person.name}</p>
                          <p className="text-sm text-muted-foreground">{person.employee_number || "No employee number"} · {person.department || "Unassigned department"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Active payroll profile</span>
                      </div>
                    ))}
                  </div> : <DataStateEmpty title="No eligible staff profiles" description="Create an active employee payroll profile to include staff here." icon={Users} />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "payslips" && (
            <Card>
              <CardHeader><CardTitle>{ownPayslips ? "My salary history" : "Employee payslips"}</CardTitle><CardDescription>Only approved payroll is available as a payslip.</CardDescription></CardHeader>
              <CardContent>
                {payslips.length ? <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead><tr className="border-b text-muted-foreground"><th className="py-3 font-medium">Period</th>{!ownPayslips && <th className="py-3 font-medium">Employee</th>}<th className="py-3 font-medium">Gross</th><th className="py-3 font-medium">Deductions</th><th className="py-3 font-medium">Net pay</th><th className="py-3 font-medium">Payslip</th></tr></thead>
                    <tbody>{payslips.map((slip) => <tr key={slip.id} className="border-b last:border-0"><td className="py-3">{slip.period}</td>{!ownPayslips && <td className="py-3 font-medium">{slip.employee_name}</td>}<td className="py-3">{displayAmount(slip.gross_pay, slip.currency)}</td><td className="py-3">{displayAmount(slip.total_deductions, slip.currency)}</td><td className="py-3 font-semibold">{displayAmount(slip.net_pay, slip.currency)}</td><td className="py-3"><Button size="sm" variant="outline" onClick={() => void downloadPayslip(slip.id)}><ArrowDownToLine className="mr-2 h-4 w-4" />PDF</Button></td></tr>)}</tbody>
                  </table>
                </div> : <DataStateEmpty title="No payslips available" description="Approved payslips will appear here. If you expect a payslip, contact your payroll administrator." icon={FileText} />}
              </CardContent>
            </Card>
          )}

          {section === "payments" && (
            <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card>
                <CardHeader><CardTitle>Record a salary disbursement</CardTitle><CardDescription>Record a payment made outside Alara. This does not initiate a bank or mobile-money transfer.</CardDescription></CardHeader>
                <CardContent>
                  {can("pay_payroll") && activePeriod?.employees?.length ? <form className="space-y-4" onSubmit={(event) => void submitPayment(event)}>
                    <label className="block space-y-1.5 text-sm"><span>Employee / payroll line</span><select name="line" required className="h-10 w-full rounded-md border bg-background px-3">{activePeriod.employees.filter((line) => line.payment_status !== "paid").map((line) => <option key={line.id} value={line.id}>{line.employee_name} · balance {displayAmount(String(Number(line.net_pay) - Number(line.amount_paid)), line.currency)}</option>)}</select></label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm"><span>Amount</span><input name="amount" type="number" min="0.01" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                      <label className="space-y-1.5 text-sm"><span>Method</span><select name="method" className="h-10 w-full rounded-md border bg-background px-3"><option value="bank_transfer">Bank transfer</option><option value="mobile_money">Mobile Money</option><option value="cash">Cash</option><option value="cheque">Cheque</option></select></label>
                    </div>
                    <label className="block space-y-1.5 text-sm"><span>Status</span><select name="status" className="h-10 w-full rounded-md border bg-background px-3"><option value="paid">Paid</option><option value="processing">Processing</option><option value="failed">Failed</option></select></label>
                    <label className="block space-y-1.5 text-sm"><span>Payment reference</span><input name="reference" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    <label className="block space-y-1.5 text-sm"><span>Proof of payment URL</span><input name="proof_url" type="url" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    <label className="block space-y-1.5 text-sm"><span>Failure reason (required if failed)</span><input name="failure_reason" className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    <Button type="submit" disabled={saving}>Record disbursement</Button>
                  </form> : <p className="text-sm text-muted-foreground">{can("pay_payroll") ? "Select an approved payroll period with outstanding salaries." : "You do not have salary payment permission."}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Disbursement history</CardTitle><CardDescription>Employee, payroll period, payment method, reference, and status for each recorded disbursement.</CardDescription></CardHeader>
                <CardContent>
                  {payments.length ? <div className="space-y-3">{payments.map((payment) => <div key={payment.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{payment.employee_name} · {payment.period}</p><p className="text-sm">{displayAmount(payment.amount, payment.currency)} · {payment.method.replace("_", " ")}</p><p className="text-xs text-muted-foreground">{payment.reference || `Payment ${payment.id}`} · {new Date(payment.paid_at || payment.created_at).toLocaleDateString()} · Recorded by {payment.recorded_by_name}</p>{payment.failure_reason && <p className="mt-1 text-xs text-destructive">{payment.failure_reason}</p>}</div><span className={`w-fit rounded-full px-2.5 py-1 text-xs capitalize ${payment.status === "paid" ? "bg-emerald-100 text-emerald-800" : payment.status === "failed" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{payment.status}</span></div>)}</div> : <DataStateEmpty title="No disbursements recorded" description="Recorded salary disbursements will appear here." icon={Banknote} />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "loans" && (
            <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card>
                <CardHeader><CardTitle>Issue a loan or advance</CardTitle><CardDescription>Installments are allocated in cents and deducted when due.</CardDescription></CardHeader>
                <CardContent>
                  {can("manage_payroll") ? <form className="space-y-4" onSubmit={(event) => void submitLoan(event)}>
                    <label className="block space-y-1.5 text-sm"><span>Employee</span><select name="profile" required className="h-10 w-full rounded-md border bg-background px-3"><option value="">Select employee</option>{profiles.map((person) => <option key={person.id} value={person.id}>{person.user_name}</option>)}</select></label>
                    <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>Type</span><select name="kind" className="h-10 w-full rounded-md border bg-background px-3"><option value="loan">Loan</option><option value="advance">Salary advance</option></select></label><label className="space-y-1.5 text-sm"><span>Principal (GHS)</span><input name="principal" type="number" min="0.01" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3" /></label></div>
                    <label className="block space-y-1.5 text-sm"><span>Issue date</span><input name="starts_on" type="date" required className="h-10 w-full rounded-md border bg-background px-3" /></label>
                    <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>Number of installments</span><input name="installments" type="number" min="1" max="60" defaultValue="1" required className="h-10 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1.5 text-sm"><span>First due date</span><input name="first_due" type="date" required className="h-10 w-full rounded-md border bg-background px-3" /></label></div>
                    <label className="block space-y-1.5 text-sm"><span>Notes</span><textarea name="notes" rows={2} className="w-full rounded-md border bg-background p-3" /></label>
                    <Button type="submit" disabled={saving || profiles.length === 0}>Create repayment schedule</Button>
                  </form> : <p className="text-sm text-muted-foreground">You have view-only payroll access.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Loans & advances</CardTitle><CardDescription>Scheduled installments move to payroll deductions when a period is calculated.</CardDescription></CardHeader>
                <CardContent>
                  {loans.length ? <div className="space-y-4">{loans.map((loan) => <div key={loan.id} className="rounded-lg border p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-medium">{loan.employee_name} · {loan.kind}</p><p className="text-sm text-muted-foreground">Started {loan.starts_on} · {loan.status}</p></div><p className="font-semibold">{displayAmount(loan.principal, loan.currency)}</p></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{loan.schedule.map((installment) => <div key={installment.id} className="flex justify-between rounded bg-muted/50 px-3 py-2 text-sm"><span>{installment.due_on}</span><span>{displayAmount(installment.amount, loan.currency)} · {installment.status}</span></div>)}</div></div>)}</div> : <DataStateEmpty title="No staff loans" description="Created repayment schedules will appear here." />}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "reports" && (
            <Card>
              <CardHeader><CardTitle>Export payroll report</CardTitle><CardDescription>Exports are permission checked and audited by the server.</CardDescription></CardHeader>
              <CardContent className="space-y-5">
                {periods.length ? <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <label className="w-full max-w-sm space-y-1.5 text-sm"><span>Payroll period</span><select value={selectedPeriodId || ""} onChange={(event) => setSelectedPeriodId(Number(event.target.value))} className="h-10 w-full rounded-md border bg-background px-3">{periods.map((period) => <option key={period.id} value={period.id}>{period.year}-{String(period.month).padStart(2, "0")} · {period.status}</option>)}</select></label>
                  <label className="space-y-1.5 text-sm"><span>Format</span><select value={reportFormat} onChange={(event) => setReportFormat(event.target.value as typeof reportFormat)} className="h-10 rounded-md border bg-background px-3"><option value="csv">CSV</option><option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF</option></select></label>
                  <Button onClick={() => void downloadReport()}><ArrowDownToLine className="mr-2 h-4 w-4" /> Download report</Button>
                </div> : <DataStateEmpty title="No payroll data to export" description="Create and calculate a payroll period first." />}
                {activePeriod && <div className="rounded-lg border p-4 text-sm text-muted-foreground">Selected period: {activePeriod.year}-{String(activePeriod.month).padStart(2, "0")} · {activePeriod.totals.employees} employees · net {displayAmount(activePeriod.totals.net)}</div>}
              </CardContent>
            </Card>
          )}

          {section === "settings" && settings && (
            <Card>
              <CardHeader><CardTitle>School payroll policy</CardTitle><CardDescription>Configure rules to reflect current legislation; no Ghana PAYE or SSNIT rate is hardcoded.</CardDescription></CardHeader>
              <CardContent>
                {can("manage_payroll") ? <form className="max-w-3xl space-y-4" onSubmit={(event) => void submitSettings(event)}>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>Currency</span><input name="currency" defaultValue={settings.currency} maxLength={3} required className="h-10 w-full rounded-md border bg-background px-3 uppercase" /></label><label className="space-y-1.5 text-sm"><span>Effective from</span><input name="effective_from" type="date" defaultValue={settings.effective_from} required className="h-10 w-full rounded-md border bg-background px-3" /></label></div>
                  <label className="block space-y-1.5 text-sm"><span>Statutory rules (JSON)</span><textarea name="statutory_rules" defaultValue={JSON.stringify(settings.statutory_rules, null, 2)} rows={10} className="w-full rounded-md border bg-background p-3 font-mono text-xs" /></label>
                  <p className="text-xs text-muted-foreground">Rule shape: name, enabled, basis (gross/basic), calculation (percentage/progressive/fixed), effective_from/effective_to, and the matching rate/brackets/amount. Keep statutory values current and verify with a qualified payroll adviser.</p>
                  <label className="block space-y-1.5 text-sm"><span>School policy (JSON)</span><textarea name="policy" defaultValue={JSON.stringify(settings.policy, null, 2)} rows={5} className="w-full rounded-md border bg-background p-3 font-mono text-xs" /></label>
                  <Button type="submit" disabled={saving}>Save payroll settings</Button>
                </form> : <p className="text-sm text-muted-foreground">You have view-only payroll access.</p>}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  )
}
