"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, CalendarClock, AlertTriangle, Clock3, CheckCircle2, RotateCcw } from "lucide-react"
import { getErrorMessage, libraryAPI } from "@/lib/api"
import { getDueStatus, type LibraryLoan } from "@/lib/library"

type StatusFilter = "all" | "On Time" | "Due Soon" | "Overdue"

function getRecords(data: unknown): LibraryLoan[] {
  if (Array.isArray(data)) return data as LibraryLoan[]
  if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) return data.results as LibraryLoan[]
  return []
}

export default function IssuedBooksPage() {
  return <ProtectedRoute allowedRoles={["school_admin"]}><IssuedBooksContent /></ProtectedRoute>
}

function IssuedBooksContent() {
  const { toast } = useToast()
  const [issued, setIssued] = useState<LibraryLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  async function loadLoans() {
    setError("")
    try {
      const response = await libraryAPI.loans()
      setIssued(getRecords(response.data))
    } catch (err) {
      setError(getErrorMessage(err, "Could not load issued books."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLoans()
    const refreshTimer = window.setInterval(() => void loadLoans(), 30_000)
    return () => window.clearInterval(refreshTimer)
  }, [])

  const enriched = useMemo(
    () => issued.map((record) => ({ ...record, status: getDueStatus(record.due_date) })),
    [issued],
  )
  const filtered = useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    return enriched.filter((record) => {
      const matchesSearch = !query ||
        record.book_title.toLowerCase().includes(query) ||
        record.borrower.toLowerCase().includes(query) ||
        record.class_name.toLowerCase().includes(query)
      return matchesSearch && (statusFilter === "all" || record.status.label === statusFilter)
    })
  }, [enriched, searchTerm, statusFilter])
  const overdueCount = enriched.filter((record) => record.status.label === "Overdue").length
  const dueSoonCount = enriched.filter((record) => record.status.label === "Due Soon").length
  const onTimeCount = enriched.filter((record) => record.status.label === "On Time").length

  async function returnBook(record: LibraryLoan) {
    setBusyId(record.id)
    setError("")
    try {
      await libraryAPI.returnBook(record.id)
      toast({ title: "Book returned", description: `"${record.book_title}" returned by ${record.borrower}.` })
      await loadLoans()
    } catch (err) {
      setError(getErrorMessage(err, "Could not mark the book as returned."))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Issued Books</h1><p className="mt-2 text-lg text-muted-foreground">Track active loans and record returns</p></div>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-5"><CalendarClock className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{enriched.length}</p><p className="text-sm text-muted-foreground">Total Issued</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><CheckCircle2 className="h-6 w-6 text-emerald-600" /><div><p className="text-2xl font-bold">{onTimeCount}</p><p className="text-sm text-muted-foreground">On Time</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><Clock3 className="h-6 w-6 text-amber-600" /><div><p className="text-2xl font-bold">{dueSoonCount}</p><p className="text-sm text-muted-foreground">Due Soon</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><AlertTriangle className="h-6 w-6 text-destructive" /><div><p className="text-2xl font-bold">{overdueCount}</p><p className="text-sm text-muted-foreground">Overdue</p></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Checked Out Books</CardTitle><CardDescription>Search active loans and record returned books</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by book, borrower, or class..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" /></div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="On Time">On Time</SelectItem><SelectItem value="Due Soon">Due Soon</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent></Select>
          </div>
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading issued books…</p> : filtered.length === 0 ? (
            <div className="py-12 text-center"><CalendarClock className="mx-auto mb-3 h-12 w-12 text-muted-foreground" /><h3 className="font-semibold">No issued books found</h3><p className="mt-1 text-sm text-muted-foreground">{issued.length ? "Try changing your search or status filter." : "Issued books will appear here."}</p></div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="px-3 py-2">Book</th><th className="px-3 py-2">Borrower</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Issued</th><th className="px-3 py-2">Due</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Action</th></tr></thead><tbody>
              {filtered.map((record) => <tr key={record.id} className="border-b hover:bg-muted/40"><td className="px-3 py-2.5 font-medium">{record.book_title}</td><td className="px-3 py-2.5">{record.borrower}</td><td className="px-3 py-2.5 text-muted-foreground">{record.class_name || "—"}</td><td className="px-3 py-2.5 text-muted-foreground">{record.issued_at}</td><td className="px-3 py-2.5 text-muted-foreground">{record.due_date}</td><td className="px-3 py-2.5"><Badge variant={record.status.variant}>{record.status.label}</Badge></td><td className="px-3 py-2.5 text-right"><Button size="sm" variant="outline" disabled={busyId === record.id} onClick={() => void returnBook(record)}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />{busyId === record.id ? "Returning…" : "Mark Returned"}</Button></td></tr>)}
            </tbody></table></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
