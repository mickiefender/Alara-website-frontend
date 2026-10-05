export type AttendanceStatus = "present" | "absent" | "late" | "excused"

/** A single student's aggregated attendance for a class within the selected period. */
export interface StudentAttendanceSummaryRow {
  student_id: number
  student_name: string
  student_id_number: string | null
  gender: string | null
  class_id: number
  class_name: string
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  excused_days: number
  attendance_percentage: number
}

export interface StudentAttendanceSummaryResponse {
  count: number
  results: StudentAttendanceSummaryRow[]
}

/** A single attendance record (one subject on one day) for the drill-down view. */
export interface StudentAttendanceRecord {
  id: number
  class_obj: number
  class_name: string
  subject: number
  subject_name: string
  student: number
  student_name: string
  status: AttendanceStatus
  date: string
  remark: string
}

export interface StudentAttendanceReport {
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  excused_days: number
  presence_percentage: number
  records: StudentAttendanceRecord[]
}

export interface AttendanceClass {
  id: number
  name: string
}

export type AttendanceStanding = "good" | "satisfactory" | "at-risk"

export type SummarySortKey =
  | "student_name"
  | "class_name"
  | "total_days"
  | "present_days"
  | "absent_days"
  | "late_days"
  | "excused_days"
  | "attendance_percentage"

export type SortDirection = "asc" | "desc"

export interface DateRange {
  from?: Date
  to?: Date
}
