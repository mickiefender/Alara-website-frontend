import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/"

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return ""
  const trimmed = String(url).trim()
  if (!trimmed) return ""

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${base}${normalizedPath}`
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === 'development') {
    console.log('[API Request]', config.method?.toUpperCase(), config.url)
  }
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const details = error.response?.data
    
    if (status === 401) {
      console.error('[API 401] Auth failed:', { url, details })
      // Let auth-context handle cleanup and redirect to avoid double-handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authError'))
      }
      const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
      if (!currentPath.startsWith("/auth/") && !currentPath.startsWith("/dashboard/")) {
        console.warn('[API] Clearing invalid token, redirecting to login')
        sessionStorage.removeItem("authToken")
        sessionStorage.removeItem("user")
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login"
        }
      }
    } else if (status >= 500) {
      console.error('[API Error]', { status, url, details })
    }
    
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (credentials: { email?: string; student_id?: string; password: string }) => apiClient.post("/users/auth/login/", credentials),
  register: (data: any) => apiClient.post("/users/auth/register/", data),
  logout: () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("user")
  },
  me: () => apiClient.get("/users/me/"),
}

export const schoolsAPI = {
  list: () => apiClient.get("/schools/schools/"),
  create: (data: any) => apiClient.post("/schools/schools/", data),
  update: (id: number, data: any) => apiClient.put(`/schools/schools/${id}/`, data),
  suspend: (id: number) => apiClient.post(`/schools/schools/${id}/suspend/`),
  activate: (id: number) => apiClient.post(`/schools/schools/${id}/activate/`),
  uploadLogo: (formData: FormData) => 
    apiClient.post("/schools/schools/upload_logo/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getDashboardStats: () => apiClient.get("/schools/schools/dashboard_stats/"),
  invalidateCache: () => apiClient.post("/schools/schools/invalidate_cache/"),
}

export const academicsAPI = {
  get: (endpoint: string, params?: any) => apiClient.get(`/academics${endpoint}`, { params }),
  post: (endpoint: string, data: any, config?: any) => apiClient.post(`/academics${endpoint}`, data, config),
  put: (endpoint: string, data: any, config?: any) => apiClient.put(`/academics${endpoint}`, data, config),
  delete: (endpoint: string) => apiClient.delete(`/academics${endpoint}`),

  faculties: () => apiClient.get("/academics/faculties/"),
  departments: () => apiClient.get("/academics/departments/"),
  classes: () => apiClient.get("/academics/classes/"),
  subjects: () => apiClient.get("/academics/subjects/"),
  enrollments: () => apiClient.get("/academics/enrollments/"),
  timetables: () => apiClient.get("/academics/timetables/"),
  createTimetable: (data: any) => apiClient.post("/academics/timetables/", data),
  updateTimetable: (id: number, data: any) => apiClient.put(`/academics/timetables/${id}/`, data),
  deleteTimetable: (id: number) => apiClient.delete(`/academics/timetables/${id}/`),
  
  classTeachers: () => apiClient.get("/academics/class-teachers/"),
  createClassTeacher: (data: any) => apiClient.post("/academics/class-teachers/", data),
  updateClassTeacher: (id: number, data: any) => apiClient.put(`/academics/class-teachers/${id}/`, data),
  deleteClassTeacher: (id: number) => apiClient.delete(`/academics/class-teachers/${id}/`),
  
  studentClasses: () => apiClient.get("/academics/student-classes/"),
  createStudentClass: (data: any) => apiClient.post("/academics/student-classes/", data),
  updateStudentClass: (id: number, data: any) => apiClient.put(`/academics/student-classes/${id}/`, data),
  deleteStudentClass: (id: number) => apiClient.delete(`/academics/student-classes/${id}/`),
  
  classSubjectTeachers: () => apiClient.get("/academics/class-subject-teachers/"),
  createClassSubjectTeacher: (data: any) => apiClient.post("/academics/class-subject-teachers/", data),
  updateClassSubjectTeacher: (id: number, data: any) => apiClient.put(`/academics/class-subject-teachers/${id}/`, data),
  deleteClassSubjectTeacher: (id: number) => apiClient.delete(`/academics/class-subject-teachers/${id}/`),
  
  classSubjects: () => apiClient.get("/academics/class-subjects/"),
  getTeacherClassSubjects: (classId: number) => apiClient.get(`/academics/classes/my_class_subjects/?class_obj=${classId}`),
  createClassSubject: (data: any) => apiClient.post("/academics/class-subjects/", data),

  updateClassSubject: (id: number, data: any) => apiClient.put(`/academics/class-subjects/${id}/`, data),
  deleteClassSubject: (id: number) => apiClient.delete(`/academics/class-subjects/${id}/`),
  createSubject: (data: any) => apiClient.post("/academics/subjects/", data),
  createFaculty: (data: any) => apiClient.post("/academics/faculties/", data),
  createDepartment: (data: any) => apiClient.post("/academics/departments/", data),
  createClass: (data: any) => apiClient.post("/academics/classes/", data),
  createEnrollment: (data: any) => apiClient.post("/academics/enrollments/", data),
  updateEnrollment: (id: number, data: any) => apiClient.put(`/academics/enrollments/${id}/`, data),
  deleteEnrollment: (id: number) => apiClient.delete(`/academics/enrollments/${id}/`),
  updateClass: (id: number, data: any) => apiClient.put(`/academics/classes/${id}/`, data),
  updateSubject: (id: number, data: any) => apiClient.put(`/academics/subjects/${id}/`, data),
  updateFaculty: (id: number, data: any) => apiClient.put(`/academics/faculties/${id}/`, data),
  updateDepartment: (id: number, data: any) => apiClient.put(`/academics/departments/${id}/`, data),
  deleteClass: (id: number) => apiClient.delete(`/academics/classes/${id}/`),
  deleteSubject: (id: number) => apiClient.delete(`/academics/subjects/${id}/`),
  classPerformance: () => apiClient.get("/academics/classes/performance-detail/"),
  classPerformanceWithAttendance: () => apiClient.get("/academics/classes/performance/"),
  calendarEvents: () => apiClient.get("/academics/calendar-events/"),
  createCalendarEvent: (data: any) => apiClient.post("/academics/calendar-events/", data),
  updateCalendarEvent: (id: number, data: any) => apiClient.put(`/academics/calendar-events/${id}/`, data),
  deleteCalendarEvent: (id: number) => apiClient.delete(`/academics/calendar-events/${id}/`),
  levels: () => apiClient.get("/academics/levels/"),
  createLevel: (data: any) => apiClient.post("/academics/levels/", data),
  updateLevel: (id: number, data: any) => apiClient.put(`/academics/levels/${id}/`, data),
  deleteLevel: (id: number) => apiClient.delete(`/academics/levels/${id}/`),
  exams: () => apiClient.get("/academics/exams/"),
  createExam: (data: any) => apiClient.post("/academics/exams/", data),
  updateExam: (id: number, data: any) => apiClient.put(`/academics/exams/${id}/`, data),
  deleteExam: (id: number) => apiClient.delete(`/academics/exams/${id}/`),
  examResults: () => apiClient.get("/academics/exam-results/"),
  createExamResult: (data: any) => apiClient.post("/academics/exam-results/", data),
  updateExamResult: (id: number, data: any) => apiClient.put(`/academics/exam-results/${id}/`, data),
  deleteExamResult: (id: number) => apiClient.delete(`/academics/exam-results/${id}/`),
  schoolFees: () => apiClient.get("/academics/school-fees/"),
  createSchoolFee: (data: any) => apiClient.post("/academics/school-fees/", data),
  updateSchoolFee: (id: number, data: any) => apiClient.put(`/academics/school-fees/${id}/`, data),
  deleteSchoolFee: (id: number) => apiClient.delete(`/academics/school-fees/${id}/`),
  events: () => apiClient.get("/academics/events/"),
  createEvent: (data: any) => apiClient.post("/academics/events/", data),
  updateEvent: (id: number, data: any) => apiClient.put(`/academics/events/${id}/`, data),
  deleteEvent: (id: number) => apiClient.delete(`/academics/events/${id}/`),
  documentFolders: (params?: any) => apiClient.get("/academics/document-folders/", { params }),
  createDocumentFolder: (data: any) => apiClient.post("/academics/document-folders/", data),
  updateDocumentFolder: (id: number, data: any) => apiClient.put(`/academics/document-folders/${id}/`, data),
  deleteDocumentFolder: (id: number) => apiClient.delete(`/academics/document-folders/${id}/`),
  getFolderChildren: (id: number) => apiClient.get(`/academics/document-folders/${id}/children/`),
  getFolderBreadcrumb: (id: number) => apiClient.get(`/academics/document-folders/${id}/breadcrumb/`),
  documents: (params?: any) => apiClient.get("/academics/documents/", { params }),
  uploadDocument: (data: FormData) => apiClient.post("/academics/documents/", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateDocument: (id: number, data: FormData) => apiClient.put(`/academics/documents/${id}/`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteDocument: (id: number) => apiClient.delete(`/academics/documents/${id}/`),
  moveDocumentToFolder: (id: number, folderId: number | null) => apiClient.patch(`/academics/documents/${id}/move_to_folder/`, { folder_id: folderId }),
  shareDocumentWithClasses: (id: number, classIds: number[]) => apiClient.post(`/academics/documents/${id}/share_with_classes/`, { class_ids: classIds }),
  getDocumentSharedClasses: (id: number) => apiClient.get(`/academics/documents/${id}/shared_classes/`),
  searchDocuments: (query: string) => apiClient.get(`/academics/documents/search/?q=${query}`),
  bulkDeleteDocuments: (documentIds: number[]) => apiClient.post("/academics/documents/bulk_delete/", { document_ids: documentIds }),
  generateQuestionsFromDocument: (docId: number, settings: any) => apiClient.post(`/academics/documents/${docId}/generate_questions/`, settings),
  generateSummaryFromDocument: (docId: number, settings: any) => apiClient.post(`/academics/documents/${docId}/generate_summary/`, settings),
  generateQuestionsFromTopic: (payload: any) => apiClient.post("/academics/documents/generate_questions_from_topic/", payload),
  notices: () => apiClient.get("/academics/notices/"),
  createNotice: (data: any) => apiClient.post("/academics/notices/", data),
  updateNotice: (id: number, data: any) => apiClient.put(`/academics/notices/${id}/`, data),
  deleteNotice: (id: number) => apiClient.delete(`/academics/notices/${id}/`),
  profilePictures: () => apiClient.get("/academics/profile-pictures/"),
  profilePictureByUser: (userId: number) => apiClient.get(`/academics/profile-pictures/?user=${userId}`),
  createProfilePicture: (data: FormData) => apiClient.post("/academics/profile-pictures/", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateProfilePicture: (id: number, data: FormData) => apiClient.put(`/academics/profile-pictures/${id}/`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteProfilePicture: (id: number) => apiClient.delete(`/academics/profile-pictures/${id}/`),
  academicSessions: () => apiClient.get("/academics/academic-sessions/"),
  academicSessionsCurrent: () => apiClient.get("/academics/academic-sessions/current/"),
  createAcademicSession: (data: any) => apiClient.post("/academics/academic-sessions/", data),
  updateAcademicSession: (id: number, data: any) => apiClient.put(`/academics/academic-sessions/${id}/`, data),
  deleteAcademicSession: (id: number) => apiClient.delete(`/academics/academic-sessions/${id}/`),
  gradingPolicies: (params?: any) => apiClient.get("/academics/grading-policies/", { params }),
  gradingPoliciesBySession: (sessionId: number) => apiClient.get(`/academics/grading-policies/by_session/?session_id=${sessionId}`),
  createGradingPolicy: (data: any) => apiClient.post("/academics/grading-policies/", data),
  updateGradingPolicy: (id: number, data: any) => apiClient.put(`/academics/grading-policies/${id}/`, data),
  deleteGradingPolicy: (id: number) => apiClient.delete(`/academics/grading-policies/${id}/`),
  bulkCreateGradingPolicies: (data: any) => apiClient.post("/academics/grading-policies/bulk_create/", data),
  terminalReportTemplates: () => apiClient.get("/academics/terminal-report-templates/"),
  templatePreview: (templateId: number, data: any) => apiClient.post(`/academics/terminal-report-templates/${templateId}/preview_render/`, data),
  templatePdf: (templateId: number, data: any) => apiClient.post(`/academics/terminal-report-templates/${templateId}/generate_pdf/`, data, { responseType: 'blob' }),
  createTerminalReportTemplate: (data: any) => apiClient.post("/academics/terminal-report-templates/", data),
  updateTerminalReportTemplate: (id: number, data: any) => apiClient.put(`/academics/terminal-report-templates/${id}/`, data),
  deleteTerminalReportTemplate: (id: number) => apiClient.delete(`/academics/terminal-report-templates/${id}/`),
  setTemplateDefault: (id: number) => apiClient.post(`/academics/terminal-report-templates/${id}/set_default/`),
  terminalReports: (params?: any) => apiClient.get("/academics/terminal-reports/", { params }),
  terminalReportDetail: (id: number) => apiClient.get(`/academics/terminal-reports/${id}/`),
  generateTerminalReport: (data: any) => apiClient.post("/academics/terminal-reports/generate_report/", data),
  calculatePositions: (data: any) => apiClient.post("/academics/terminal-reports/calculate_positions/", data),
  publishTerminalReport: (id: number) => apiClient.post(`/academics/terminal-reports/${id}/publish/`),
  addTerminalReportRemarks: (id: number, data: any) => apiClient.post(`/academics/terminal-reports/${id}/add_remarks/`, data),
}

export const announcementsAPI = {
  list: () => apiClient.get("/schools/announcements/"),
  create: (data: any) => apiClient.post("/schools/announcements/", data),
  update: (id: number, data: any) => apiClient.put(`/schools/announcements/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/schools/announcements/${id}/`),
}

export const attendanceAPI = {
  list: () => apiClient.get("/attendance/"),
  create: (data: any) => apiClient.post("/attendance/", data),
  bulkCreate: (data: any) => apiClient.post("/attendance/bulk_mark/", data),
  studentReport: (studentId: number) => apiClient.get(`/attendance/student_report/?student_id=${studentId}`),
  studentReportByDateRange: (studentId: number, startDate: string, endDate: string) => apiClient.get(`/attendance/student_report/?student_id=${studentId}&start_date=${startDate}&end_date=${endDate}`),
  classAttendance: (classId: number, date: string) => apiClient.get(`/attendance/?class_obj=${classId}&date=${date}`),
  classReport: (classId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/attendance/class_report/?${params.toString()}`)
  },
  overallReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/attendance/overall_report/?${params.toString()}`)
  },
  subjectReport: (classId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/attendance/subject_report/?${params.toString()}`)
  },
  myStudentsSummary: (classId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/attendance/my_students_summary/?${params.toString()}`)
  },
  exportMyStudentsSummaryExcel: (classId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/attendance/export_my_students_summary/?${params.toString()}`, { 
      responseType: 'blob' 
    })
  },
}

export const gradesAPI = {
  list: (params?: any) => apiClient.get("/students/grades/", { params }),
  create: (data: any) => apiClient.post("/students/grades/", data),
  update: (id: number, data: any) => apiClient.put(`/students/grades/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/students/grades/${id}/`),
  lock: (id: number) => apiClient.post(`/students/grades/${id}/lock/`),
  unlock: (id: number) => apiClient.post(`/students/grades/${id}/unlock/`),
  lock_by_class: (data: any) => apiClient.post("/students/grades/lock_by_class/", data),
  unlock_by_class: (data: any) => apiClient.post("/students/grades/unlock_by_class/", data),
  gradeEntryData: (classId: number) => apiClient.get(`/students/grades/grade_entry_data/?class_id=${classId}`),
  validateGradeAccess: (data: any) => apiClient.post("/students/grades/validate-grade-access/", data),
}

export const messagingAPI = {
  messages: () => apiClient.get("/messaging/messages/"),
  sentMessages: () => apiClient.get("/messaging/messages/sent/"),
  createMessage: (data: any) => apiClient.post("/messaging/messages/", data),
  markMessageAsRead: (id: number) => apiClient.post(`/messaging/messages/${id}/mark_as_read/`),
  announcements: () => apiClient.get("/messaging/announcements/"),
  getAnnouncement: (id: number) => apiClient.get(`/messaging/announcements/${id}/`),
  createAnnouncement: (data: any) => apiClient.post("/messaging/announcements/", data),
  updateAnnouncement: (id: number, data: any) => apiClient.post(`/messaging/announcements/${id}/publish/`),
  deleteAnnouncement: (id: number) => apiClient.delete(`/messaging/announcements/${id}/`),
  markAnnouncementAsRead: (id: number) => apiClient.post(`/messaging/announcements/${id}/mark_as_read/`),
  getAnnouncementReadBy: (id: number) => apiClient.get(`/messaging/announcements/${id}/read_by/`),
  notices: () => apiClient.get("/messaging/notices/"),
  getNotice: (id: number) => apiClient.get(`/messaging/notices/${id}/`),
  createNotice: (data: any) => apiClient.post("/messaging/notices/", data),
  updateNotice: (id: number, data: any) => apiClient.put(`/messaging/notices/${id}/`, data),
  deleteNotice: (id: number) => apiClient.delete(`/messaging/notices/${id}/`),
  pinNotice: (id: number) => apiClient.post(`/messaging/notices/${id}/pin/`),  
  sendPersonalNotice: (studentId: number, data: { title: string; content: string }) => apiClient.post("/messaging/notices/send_personal_notice/", { student_id: studentId, ...data }),  
  personalNotices: () => apiClient.get("/messaging/notices/my_personal_notices/"),  
}

export const usersAPI = {
  list: () => apiClient.get("/users/users/"),
  listGlobal: (params?: any) => apiClient.get("/users/users/", { params }),
  banUser: (id: number) => apiClient.post(`/users/users/${id}/ban_user/`),
  suspendUser: (id: number) => apiClient.post(`/users/users/${id}/suspend_user/`),
  resetPassword: (id: number, new_password: string) => apiClient.post(`/users/users/${id}/reset_password/`, { new_password }),
  assignGlobalRole: (id: number, role: string) => apiClient.post(`/users/users/${id}/assign_global_role/`, { role }),
  globalStats: () => apiClient.get("/users/users/global_stats/"),
  getById: (id: number) => apiClient.get(`/users/users/${id}/`),
  teachers: () => apiClient.get("/users/teachers/"),
  getTeacherById: (id: number) => apiClient.get(`/users/teachers/${id}/`),
  students: (params?: any) => apiClient.get("/users/students/", { params }),
  getStudentById: (id: number) => apiClient.get(`/users/students/${id}/`),
  myStudents: () => apiClient.get("/users/students/my_students/"),
  teacherClasses: () => apiClient.get("/users/students/my_classes/"),
  create: (data: any) => apiClient.post("/users/users/", data),
  createTeacher: async (data: any) => {
    try {
      const userData = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password2: data.password,
        role: "teacher",
        phone: data.phone || "",
        school: data.school_id,
      }
      console.log("[v0] Creating teacher user with data:", JSON.stringify(userData, null, 2))
      const userResponse = await apiClient.post("/users/auth/register/", userData)
      console.log("[v0] Teacher user created:", userResponse.data)
      const userId = userResponse.data.user?.id
      if (!userId) throw new Error("User creation succeeded but no user ID returned")
      const profileData = {
        user: userId,
        employee_id: data.employee_id || `EMP${userId}`,
        qualification: data.qualification || "",
        experience_years: data.experience_years || 0,
        department: data.department || null,
        bio: data.bio || "",
      }
      console.log("[v0] Creating teacher profile with data:", JSON.stringify(profileData, null, 2))
      const profileResponse = await apiClient.post("/users/teachers/", profileData)
      console.log("[v0] Teacher profile created:", profileResponse.data)
      return profileResponse
    } catch (error: any) {
      console.error("[v0] Teacher creation error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      })
      throw error
    }
  },
  createStudent: async (data: any) => {
    try {
      const userData = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password2: data.password,
        role: "student",
        phone: data.phone || "",
        school: data.school_id,
      }
      console.log("[v0] Creating student user with data:", JSON.stringify(userData, null, 2))
      const userResponse = await apiClient.post("/users/auth/register/", userData)
      console.log("[v0] Student user created:", userResponse.data)
      const userId = userResponse.data.user?.id
      if (!userId) throw new Error("User creation succeeded but no user ID returned")
      const profileData = {
        user: userId,
        level: data.level || null,
        department: data.department || null,
      }
      console.log("[v0] Creating student profile with data:", JSON.stringify(profileData, null, 2))
      const profileResponse = await apiClient.post("/users/students/", profileData)
      console.log("[v0] Student profile created:", profileResponse.data)
      return profileResponse
    } catch (error: any) {
      console.error("[v0] Student creation error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      })
      throw error
    }
  },
  update: (id: number, data: any) => apiClient.put(`/users/users/${id}/`, data),
  updateTeacher: (id: number, data: any) => apiClient.put(`/users/teachers/${id}/`, data),
  updateStudent: (id: number, data: any) => apiClient.put(`/users/students/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/users/users/${id}/`),
  deleteTeacher: (id: number) => apiClient.delete(`/users/teachers/${id}/`),
  deleteStudent: (id: number) => apiClient.delete(`/users/students/${id}/`),  
  adminStaff: {
    list: () => apiClient.get("/users/admin-staff/"),
    create: (data: any) => apiClient.post("/users/admin-staff/", data),
    updatePermissions: (id: number, permissions: string[]) => apiClient.put(`/users/admin-staff/${id}/permissions/`, { permissions }),
    delete: (id: number) => apiClient.delete(`/users/admin-staff/${id}/`),
  },
}

export const timetableAPI = {
  list: () => apiClient.get("/academics/timetables/"),
  create: (data: any) => apiClient.post("/academics/timetables/", data),
  update: (id: number, data: any) => apiClient.put(`/academics/timetables/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/academics/timetables/${id}/`),
}

export const assignmentAPI = {
  list: () => apiClient.get("/assignments/"),
  create: (data: any) => apiClient.post("/assignments/", data),
  update: (id: number, data: any) => apiClient.put(`/assignments/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/assignments/${id}/`),
  submissions: () => apiClient.get("/assignments/submissions/"),
  submitAssignment: (data: FormData) => apiClient.post("/assignments/submissions/", data, { headers: { "Content-Type": "multipart/form-data" } }),
  gradeSubmission: (id: number, data: any) => apiClient.post(`/assignments/submissions/${id}/grade/`, data),
}

export const billingAPI = {
  fees: () => apiClient.get("/billing/fees/"),
  superAdminOverview: () => apiClient.get("/billing/super-admin/overview/"),
  superAdminRevenueAnalytics: () => apiClient.get("/billing/super-admin/revenue_analytics/"),
  superAdminAssignPlan: (data: { school_id: number; plan_id: number; end_date: string }) =>
    apiClient.post("/billing/super-admin/assign_plan/", data),
  superAdminGatewayConfig: () => apiClient.get("/billing/super-admin/gateway_config/"),
  feeTypes: () => apiClient.get("/billing/fees/"),
  createFee: (data: any) => apiClient.post("/billing/fees/", data),
  createFeeType: (data: any) => apiClient.post("/billing/fees/", data),
  updateFee: (id: number, data: any) => apiClient.put(`/billing/fees/${id}/`, data),
  updateFeeType: (id: number, data: any) => apiClient.put(`/billing/fees/${id}/`, data),
  deleteFee: (id: number) => apiClient.delete(`/billing/fees/${id}/`),
  deleteFeeType: (id: number) => apiClient.delete(`/billing/fees/${id}/`),
  schoolFeeAssignments: () => apiClient.get("/billing/school-fee-assignments/"),
  createSchoolFeeAssignment: (data: any) => apiClient.post("/billing/school-fee-assignments/", data),
  updateSchoolFeeAssignment: (id: number, data: any) => apiClient.put(`/billing/school-fee-assignments/${id}/`, data),
  deleteSchoolFeeAssignment: (id: number) => apiClient.delete(`/billing/school-fee-assignments/${id}/`),
  applySchoolFeeToStudents: (id: number) => apiClient.post(`/billing/school-fee-assignments/${id}/apply_to_students/`),
  classFeeAssignments: () => apiClient.get("/billing/class-fee-assignments/"),
  createClassFeeAssignment: (data: any) => apiClient.post("/billing/class-fee-assignments/", data),
  updateClassFeeAssignment: (id: number, data: any) => apiClient.put(`/billing/class-fee-assignments/${id}/`, data),
  deleteClassFeeAssignment: (id: number) => apiClient.delete(`/billing/class-fee-assignments/${id}/`),
  applyClassFeeToStudents: (id: number) => apiClient.post(`/billing/class-fee-assignments/${id}/apply_to_students/`),
  studentFeeAssignments: () => apiClient.get("/billing/student-fee-assignments/"),
  studentFeeAssignmentsByStudent: (studentId: number) => apiClient.get(`/billing/student-fee-assignments/?student=${studentId}`),
  createStudentFeeAssignment: (data: any) => apiClient.post("/billing/student-fee-assignments/", data),
  updateStudentFeeAssignment: (id: number, data: any) => apiClient.patch(`/billing/student-fee-assignments/${id}/`, data),
  deleteStudentFeeAssignment: (id: number) => apiClient.delete(`/billing/student-fee-assignments/${id}/`),
  myFees: () => apiClient.get("/billing/student-fee-assignments/my_fees/"),
  markFeePaid: (id: number) => apiClient.post(`/billing/student-fee-assignments/${id}/mark_paid/`),
  manualPayments: () => apiClient.get("/billing/manual-payments/"),
  manualPaymentsByStudent: (studentId: number) => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      return Promise.reject(new Error(`Invalid studentId for manualPaymentsByStudent: ${studentId}`))
    }
    return apiClient.get(`/billing/manual-payments/by_student/?student_id=${studentId}`)
  },
  manualPaymentsBySchool: () => apiClient.get("/billing/manual-payments/by_school/"),
  recordManualPayment: (data: any) => apiClient.post("/billing/manual-payments/", data),
  onlinePayments: () => apiClient.get("/billing/online-payments/"),
  onlinePaymentsByStudent: (studentId: number) => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      return Promise.reject(new Error(`Invalid studentId for onlinePaymentsByStudent: ${studentId}`))
    }
    return apiClient.get(`/billing/online-payments/by_student/?student_id=${studentId}`)
  },
  onlinePaymentsBySchool: () => apiClient.get("/billing/online-payments/by_school/"),
  recordOnlinePayment: (data: any) => apiClient.post("/billing/online-payments/", data),
  invoices: () => apiClient.get("/billing/invoices/"),
  createInvoice: (data: any) => apiClient.post("/billing/invoices/", data),
  updateInvoice: (id: number, data: any) => apiClient.put(`/billing/invoices/${id}/`, data),
  deleteInvoice: (id: number) => apiClient.delete(`/billing/invoices/${id}/`),
  payments: () => apiClient.get("/billing/payments/"),
  createPayment: (data: any) => apiClient.post("/billing/payments/", data),
  updatePayment: (id: number, data: any) => apiClient.put(`/billing/payments/${id}/`, data),
  deletePayment: (id: number) => apiClient.delete(`/billing/payments/${id}/`),
  getSchoolFeesStats: async () => {
    try {
      const [assignmentsRes, manualRes, onlineRes] = await Promise.all([
        apiClient.get("/billing/student-fee-assignments/?school=my_school"),
        apiClient.get("/billing/manual-payments/by_school/"),
        apiClient.get("/billing/online-payments/by_school/")
      ]);
      const assignments = assignmentsRes.data?.results || assignmentsRes.data || [];
      const manualPayments = manualRes.data?.results || manualRes.data || [];
      const onlinePayments = onlineRes.data?.results || onlineRes.data || [];
      const totalExpected = assignments.reduce((sum: number, assignment: any) => sum + (parseFloat(assignment.amount) || 0), 0);
      const totalCollected = [...manualPayments, ...onlinePayments].reduce((sum: number, payment: any) => sum + (parseFloat(payment.amount) || 0), 0);
      return {
        total_expected: totalExpected,
        total_collected: totalCollected,
        pending_fees: Math.max(0, totalExpected - totalCollected),
        collection_rate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
      };
    } catch (error) {
      console.error('Failed to fetch fees stats:', error);
      return { total_expected: 0, total_collected: 0, pending_fees: 0, collection_rate: 0 };
    }
  },
}

export const superAdminAPI = {
  usage: () => apiClient.get("/schools/schools/super_admin_usage/"),
  analytics: () => apiClient.get("/schools/schools/super_admin_analytics/"),
}

export default {
  authAPI,
  schoolsAPI,
  academicsAPI,
  announcementsAPI,
  attendanceAPI,
  gradesAPI,
  messagingAPI,
  usersAPI,
  timetableAPI,
  assignmentAPI,
  billingAPI,
  superAdminAPI
}
