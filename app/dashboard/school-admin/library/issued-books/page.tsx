"use client"

import { useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, CalendarClock, AlertTriangle, Clock3, CheckCircle2, RotateCcw } from "lucide-react"
import { DUMMY_ISSUED, getDueStatus, type IssuedRecord } from "@/lib/dummy-library-data"

type StatusFilter = "all" | "On Time" | "Due Soon" | "Overdue"

export default function IssuedBooksPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <IssuedBooksContent />
    </ProtectedRoute>
  )
}

function IssuedBooksContent() {
  const { toast } = useToast()
  const [issued, setIssued] = useState<IssuedRecord[]>(DUMMY_ISSUED)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const enriched = useMemo(
    () => issued.map((record) => ({ ...record, status: getDueStatus(record.dueDate) })),
    [issued],
  )

  const filtered = useMemo(() => {
    return enriched.filter((record) => {
      const matchesSearch =
        record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.className.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || record.status.label === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [enriched, searchTerm, statusFilter])

  const overdueCount = enriched.filter((r) => r.status.label === "Overdue").length
  const dueSoonCount = enriched.filter((r) => r.status.label === "Due Soon").length
  const onTimeCount = enriched.filter((r) => r.status.label === "On Time").length

  const handleReturn = (record: IssuedRecord) => {
    setIssued((prev) => prev.filter((r) => r.id !== record.id))
    toast({ title: "Book returned", description: `"${record.bookTitle}" marked as returned by ${record.borrower}.` })
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Issued Books</h1>
        <p className="text-muted-foreground text-lg mt-2">Track books currently checked out and manage returns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enriched.length}</p>
              <p className="text-sm text-muted-foreground">Total Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onTimeCount}</p>
              <p className="text-sm text-muted-foreground">On Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dueSoonCount}</p>
              <p className="text-sm text-muted-foreground">Due Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checked Out Books</CardTitle>
          <CardDescription>Search by book, borrower, or class — mark a book returned once it's back</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by book, borrower, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="On Time">On Time</SelectItem>
                <SelectItem value="Due Soon">Due Soon</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <CalendarClock className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No issued books found</h3>
              <p className="text-muted-foreground">Try adjusting your search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Book</th>
                    <th className="text-left py-2 px-3">Borrower</th>
                    <th className="text-left py-2 px-3">Class</th>
                    <th className="text-left py-2 px-3">Issued</th>
                    <th className="text-left py-2 px-3">Due</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-2.5 px-3 font-medium">{record.bookTitle}</td>
                      <td className="py-2.5 px-3">{record.borrower}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{record.className}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{record.issueDate}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{record.dueDate}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={record.status.variant}>{record.status.label}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => handleReturn(record)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Mark Returned
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
