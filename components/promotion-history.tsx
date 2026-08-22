"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { promotionAPI, getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  History,
  RefreshCw,
  UserMinus,
  Users,
} from "lucide-react"

type Batch = {
  id: number
  source_year_name: string
  destination_year_name: string
  created_by_name: string | null
  total_students: number
  promoted_count: number
  repeated_count: number
  graduated_count: number
  withdrawn_count: number
  transferred_count: number
  failed_count: number
  skipped_count: number
  status: string
  created_at: string
  completed_at: string | null
}

type Record_ = {
  id: number
  student_name: string
  student_number: string
  action: string
  from_class_name: string | null
  to_class_name: string | null
  final_average: number | null
  reason: string
  warning: string
  status: "success" | "skipped" | "failed"
  error_message: string
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  partially_completed: "bg-amber-100 text-amber-800 border-amber-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  in_progress: "bg-sky-100 text-sky-800 border-sky-200",
  pending: "bg-muted text-muted-foreground border-border",
}

const ACTION_LABELS: Record<string, string> = {
  promote: "Promoted",
  repeat: "Repeated",
  graduate: "Graduated",
  withdraw: "Withdrawn",
  transfer: "Transferred",
  manual_review: "Needs Review",
}

const ACTION_COLORS: Record<string, string> = {
  promote: "bg-emerald-100 text-emerald-800 border-emerald-200",
  repeat: "bg-amber-100 text-amber-800 border-amber-200",
  graduate: "bg-sky-100 text-sky-800 border-sky-200",
  withdraw: "bg-rose-100 text-rose-800 border-rose-200",
  transfer: "bg-violet-100 text-violet-800 border-violet-200",
  manual_review: "bg-orange-100 text-orange-800 border-orange-200",
}

export function PromotionHistory({ refreshKey }: { refreshKey?: number }) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Batch | null>(null)
  const [records, setRecords] = useState<Record_[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await promotionAPI.promotionHistory()
      setBatches(res.data.results || res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load promotion history"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const openBatch = async (batch: Batch) => {
    setSelected(batch)
    setLoadingRecords(true)
    try {
      const res = await promotionAPI.promotionBatchDetail(batch.id)
      setRecords(res.data.records || [])
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load batch details"))
      setRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Promotion History
        </h3>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!loading && batches.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No promotions have been run yet. Completed promotions will appear here.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {batches.map((b) => (
          <Card key={b.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => openBatch(b)}>
            <CardContent className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium flex items-center gap-1.5 flex-wrap">
                    {b.source_year_name}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {b.destination_year_name}
                    <Badge variant="outline" className={STATUS_COLORS[b.status] ?? ""}>
                      {b.status.replace("_", " ")}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{b.total_students} students</span>
                    <span>·</span>
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDate(b.created_at)}</span>
                    <span>·</span>
                    <span>by {b.created_by_name || "—"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0 flex-wrap">
                <span className="text-emerald-700">{b.promoted_count} promoted</span>
                <span className="text-amber-700">{b.repeated_count} repeated</span>
                <span className="text-sky-700">{b.graduated_count} graduated</span>
                {b.withdrawn_count > 0 && <span className="text-rose-700">{b.withdrawn_count} withdrawn</span>}
                {b.transferred_count > 0 && <span className="text-violet-700">{b.transferred_count} transferred</span>}
                {b.failed_count > 0 && <span className="text-rose-700">{b.failed_count} failed</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Batch detail dialog ──────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selected?.source_year_name}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              {selected?.destination_year_name}
              {selected && (
                <Badge variant="outline" className={STATUS_COLORS[selected.status] ?? ""}>
                  {selected.status.replace("_", " ")}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selected && `${formatDate(selected.created_at)} · by ${selected.created_by_name || "—"}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <Stat icon={ArrowRight} label="Promoted" value={selected.promoted_count} color="text-emerald-700" />
              <Stat icon={RefreshCw} label="Repeated" value={selected.repeated_count} color="text-amber-700" />
              <Stat icon={GraduationCap} label="Graduated" value={selected.graduated_count} color="text-sky-700" />
              <Stat icon={UserMinus} label="Withdrawn" value={selected.withdrawn_count} color="text-rose-700" />
            </div>
          )}

          {loadingRecords ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading students...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No student records in this batch.</p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{r.student_name}</p>
                        {r.student_number && (
                          <p className="text-xs text-muted-foreground">{r.student_number}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ACTION_COLORS[r.action] ?? ""}>
                          {ACTION_LABELS[r.action] ?? r.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.from_class_name ?? "—"} → {r.to_class_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.final_average != null ? `${r.final_average}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {r.status === "success" ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">OK</Badge>
                        ) : r.status === "skipped" ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Skipped</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200">Failed</Badge>
                        )}
                        {(r.error_message || r.warning) && (
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate" title={r.error_message || r.warning}>
                            {r.error_message || r.warning}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}) {
  return (
    <Card className="py-2">
      <CardContent className="px-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div>
          <p className="font-semibold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
