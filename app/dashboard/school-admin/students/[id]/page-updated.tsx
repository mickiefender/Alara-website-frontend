'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usersAPI, academicsAPI, attendanceAPI, billingAPI, messagingAPI } from '@/lib/api'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Edit2, AlertCircle, BookOpen, DollarSign, Flag, FileText, Camera, Save, X, User, Phone, Mail, MapPin, Calendar, Briefcase, Heart, Users, MessageSquare, Download, Trash2, Plus, Edit3, CheckCircle2, Wallet, Building2, Smartphone, CreditCard, Receipt, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface StudentDetail {
  id: number
  user_data?: { id: number; first_name: string; last_name: string; email: string; phone?: string; username: string }
  user?: { id: number; first_name: string; last_name: string; email: string; phone?: string; username: string }
  student_id?: string
  level?: { id: number; name: string; section?: string }
  enrollment_date?: string
  gender?: string
  father_name?: string
  mother_name?: string
  date_of_birth?: string
  religion?: string
  father_occupation?: string
  address?: string
  roll_number?: string
}

interface StudentFeeAssignment {
  id: number
  fee_name: string
  amount: string
  amount_paid: string
  balance: string
  due_date: string
  status: string
  fee_details: any
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, Icon, color }: { label: string; value: string | number; Icon: React.ElementType; color: string }) {
  return (
    <div className={`${color} rounded-lg p-5 text-white flex items-center gap-4 shadow-md`}>
      <Icon size={28} />
      <div>
        <p className="text-xs opacity-90">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function FeeStatusBadge({ status }: { status: string }) {
  const getColor = () => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examResults, setExamResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [examResultsLoading, setExamResultsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [notices, setNotices] = useState<any[]>([])
  const [dueFees, setDueFees] = useState(0)
  const [upcomingExams, setUpcomingExams] = useState(0)
  const [eventsCount, setEventsCount] = useState(0)
  const [docsCount, setDocsCount] = useState(0)
  const [classes, setClasses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [assigningClass, setAssigningClass] = useState(false)

  // Fee management state
  const [studentFees, setStudentFees] = useState<StudentFeeAssignment[]>([])
  const [feesLoading, setFeesLoading] = useState(false)
  const [editingFeeId, setEditingFeeId] = useState<number | null>(null)
  const [tempFeeData, setTempFeeData] = useState<Record<number, { amount: string; due_date: string }>>({})
  const [savingFee, setSavingFee] = useState(false)

  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<StudentFeeAssignment | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'other'>('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Message modal states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageForm, setMessageForm] = useState({ title: '', content: '' })
  const [sendingMessage, setSendingMessage] = useState(false)

  const [profilePic, setProfilePic] = useState('')
  const [profilePicId, setProfilePicId] = useState<number | null>(null)
  const [picPreview, setPicPreview] = useState('')
  const [picFile, setPicFile] = useState<File | null>(null)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [picError, setPicError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', gender: '',
    father_name: '', mother_name: '', date_of_birth: '',
    religion: '', father_occupation: '', address: '', roll_number: ''
  })

  useEffect(() => { loadData() }, [studentId]) // eslint-disable-line

  // Separate effect to load attendance and exam results after student is loaded
  useEffect(() => {
    if (student && (student.id || student.user_data?.id || student.user?.id)) {
      loadAttendanceAndResults()
    }
  }, [student?.id, student?.user_data?.id, student?.user?.id]) // eslint-disable-line

  const loadAttendanceAndResults = async () => {
    if (!student) return
    
    // Get the actual user ID for filtering - this is what attendance and exam results use
    const userIdNum = student.user_data?.id || student.user?.id || parseInt(studentId)
    console.log("Loading data for user ID:", userIdNum, "student ID:", student.id)
    
    // Load Exam Results
    setExamResultsLoading(true)
    try {
      const examRes = await academicsAPI.examResults()
      const all = examRes.data.results || examRes.data || []
      console.log("All exam results:", all.slice(0, 3)) // Log first 3 for debugging
      const filtered = all.filter((r: any) => r.student === userIdNum)
      console.log("Filtered exam results for user", userIdNum, ":", filtered)
      setExamResults(filtered.slice(0, 6))
      setDebugInfo((prev: any) => ({ ...prev, examResultsCount: filtered.length, allExamResultsCount: all.length, userId: userIdNum }))
    } catch (err: any) { 
      console.error("Exam results error:", err)
      setDebugInfo((prev: any) => ({ ...prev, examError: err?.message || 'Error loading exam results' }))
    } finally {
      setExamResultsLoading(false)
    }
    
    // Load Attendance
    setAttendanceLoading(true)
    try {
      const a = await attendanceAPI.studentReport(userIdNum)
      console.log("Attendance response for user", userIdNum, ":", a.data)
      setDebugInfo((prev: any) => ({ ...prev, attendanceRaw: a.data }))
      
      if (a.data && typeof a.data === 'object') {
        if ('total_days' in a.data || (a.data.records && Array.isArray(a.data.records))) {
          setAttendance(a.data)
        } else {
          console.log("Attendance response missing expected fields:", Object.keys(a.data))
          setDebugInfo((prev: any) => ({ ...prev, attendanceKeys: Object.keys(a.data) }))
        }
      }
    } catch (err: any) { 
      console.error("Attendance error:", err)
      setDebugInfo((prev: any) => ({ ...prev, attendanceError: err?.message || 'Error loading attendance' }))
    } finally {
      setAttendanceLoading(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getStudentById(parseInt(studentId))
      const s: StudentDetail = res.data
      setStudent(s)
      const u = s.user_data || s.user
      setForm({
        first_name: u?.first_name || '', last_name: u?.last_name || '',
        phone: u?.phone || '', gender: s.gender || '',
        father_name: s.father_name || '', mother_name: s.mother_name || '',
        date_of_birth: s.date_of_birth || '', religion: s.religion || '',
        father_occupation: s.father_occupation || '', address: s.address || '',
        roll_number: s.roll_number || ''
      })
      if (u?.id) {
        try {
          const picRes = await academicsAPI.profilePictureByUser(u.id)
          const pics = picRes.data.results || picRes.data || []
          if (pics.length > 0) { 
            // Get the best available URL - prefer display_url, fall back to picture
            setProfilePic(pics[0].display_url || pics[0].storage_url || pics[0].picture || ''); 
            setProfilePicId(pics[0].id) 
          }
        } catch { /* no pic */ }
      }
      // Load fees
      const userId = student?.user_data?.id || student?.user?.id;
      if (userId) {
        try {
          setFeesLoading(true)
          const feesRes = await billingAPI.studentFeeAssignmentsByStudent(userId)
          const sf: StudentFeeAssignment[] = (feesRes.data.results || feesRes.data || [])
          setStudentFees(sf)
          setDueFees(sf.filter((f: StudentFeeAssignment) => f.status === 'pending' || f.status === 'partial').reduce((s: number, f: StudentFeeAssignment) => s + parseFloat(f.balance), 0))
        } catch (err) {
        console.error('Fee load error:', err)
        toast.error('Failed to load fees')
      } finally {
        setFeesLoading(false)
      }
      
      // School-wide fees as fallback
      try {
        const schoolFeesRes = await billingAPI.schoolFeeAssignments()
        const schoolFees = schoolFeesRes.data.results || schoolFeesRes.data || []
        const totalSchoolFees = schoolFees.filter((f: any) => f.status === 'pending' || !f.paid).reduce((s: number, f: any) => s + (parseFloat(f.amount) || 0), 0)
        if (studentFees.length === 0) {
          setDueFees(totalSchoolFees)
        }
      } catch { /* skip */ }
      
      // Other data...
      try { const e = await academicsAPI.exams(); setUpcomingExams((e.data.results || e.data || []).filter((x: any) => new Date(x.exam_date) > new Date()).length) } catch { /* skip */ }
      try { const ev = await academicsAPI.events(); setEventsCount(ev.data.results?.length || 0) } catch { /* skip */ }
      try { const d = await academicsAPI.documents(); setDocsCount(d.data.results?.length || 0) } catch { /* skip */ }
      try { const n = await academicsAPI.notices(); setNotices((n.data.results || n.data || []).slice(0, 5)) } catch { /* skip */ }
      
      // Classes/enrollments...
      try {
        setClassesLoading(true)
        const [classesRes, enrollmentsRes] = await Promise.all([
          academicsAPI.classes(),
          academicsAPI.studentClasses()
        ])
        const allClasses = classesRes.data.results || classesRes.data || []
        setClasses(allClasses)
        const studentUserId = u?.id || null
        const allEnrollments = enrollmentsRes.data.results || enrollmentsRes.data || []
        const studentEnrollments = allEnrollments.filter((e: any) => e.student === studentUserId || e.student === parseInt(studentId))
        setEnrollments(studentEnrollments)
      } catch (err) {
        console.error("Error loading classes/enrollments:", err)
      } finally {
        setClassesLoading(false)
      }
    } catch (err) { 
      setError('Failed to load student details')
      toast.error('Failed to load student')
    } finally { 
      setLoading(false) 
    }
  }

  const handleEditFee = (fee: StudentFeeAssignment) => {
    setEditingFeeId(fee.id)
    setTempFeeData(prev => ({
      ...prev,
      [fee.id]: { amount: fee.amount, due_date: fee.due_date }
    }))
  }

  const handleCancelEdit = () => {
    setEditingFeeId(null)
    setTempFeeData({})
  }

  const handleSaveFee = async (feeId: number) => {
    if (!tempFeeData[feeId]) return
    
    const userId = student?.user_data?.id || student?.user?.id;
    if (!userId) return;
    
    setSavingFee(true)
    try {
      const data = tempFeeData[feeId]
      await billingAPI.updateStudentFeeAssignment(feeId, {
        amount: parseFloat(data.amount),
        due_date: data.due_date
      })
      toast.success('Fee updated successfully')
      // Refresh fees
      const feesRes = await billingAPI.studentFeeAssignmentsByStudent(userId)
      setStudentFees(feesRes.data.results || feesRes.data || [])
      // Recalculate dueFees
      const sf = feesRes.data.results || feesRes.data || []
      setDueFees(sf.filter((f: StudentFeeAssignment) => f.status === 'pending' || f.status === 'partial').reduce((s: number, f: StudentFeeAssignment) => s + parseFloat(f.balance), 0))
      setEditingFeeId(null)
      setTempFeeData({})
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update fee')
    } finally {
      setSavingFee(false)
    }
  }

  const name = () => { if (!student) return ''; const u = student.user_data || student.user; return `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.username || 'Unknown' }
  const email = () => student?.user_data?.email || student?.user?.email || 'N/A'
  const phone = () => student?.user_data?.phone || student?.user?.phone || 'N/A'
  const userId = () => student?.user_data?.id || student?.user?.id || null

  // ... rest of profile picture, save profile, class assignment functions remain the same ...

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPicFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPicPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handlePicUpload = async () => {
    if (!picFile) return; const uid = userId(); if (!uid) return
    try {
      setUploadingPic(true); setPicError(null)
      if (profilePicId) await academicsAPI.deleteProfilePicture(profilePicId)
      const fd = new FormData(); fd.append('user', String(uid)); fd.append('picture', picFile)
      const res = await academicsAPI.createProfilePicture(fd)
      setProfilePic(res.data.picture); setProfilePicId(res.data.id)
      setPicPreview(''); setPicFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Profile picture updated')
    } catch (err: any) { 
      setPicError(err?.response?.data?.detail || 'Upload failed')
      toast.error('Failed to upload picture')
    } finally { 
      setUploadingPic(false) 
    }
  }

  const handleSave = async () => {
    if (!student) return
    try {
      setSaving(true); setError(null)
      await usersAPI.updateStudent(student.id, form)
      setIsEditing(false); loadData()
      toast.success('Profile updated successfully')
    } catch (err: any) { 
      setError(err?.response?.data?.detail || 'Failed to save')
      toast.error('Failed to update profile')
    } finally { 
      setSaving(false) 
    }
  }

  const handleAssignClass = async () => {
    if (!selectedClassId || !student) return
    
    const studentUserId = student.user_data?.id || student.user?.id || parseInt(studentId)
    
    try {
      setAssigningClass(true)
      await academicsAPI.createStudentClass({
        class_obj: parseInt(selectedClassId),
        student: studentUserId
      })
      toast.success('Student assigned to class')
      setIsAssignDialogOpen(false)
      setSelectedClassId('')
      // Reload enrollments...
      const enrollmentsRes = await academicsAPI.studentClasses()
      const allEnrollments = enrollmentsRes.data.results || enrollmentsRes.data || []
      const studentEnrollments = allEnrollments.filter((e: any) => {
        const enrollmentStudentId = e.student
        return enrollmentStudentId === studentUserId || enrollmentStudentId === parseInt(studentId)
      })
      setEnrollments(studentEnrollments)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to assign class')
    } finally {
      setAssigningClass(false)
    }
  }

  const handleRemoveFromClass = async (enrollmentId: number) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) return
    
    try {
      await academicsAPI.deleteStudentClass(enrollmentId)
      toast.success('Student removed from class')
      // Reload enrollments...
      const studentUserId = student?.user_data?.id || student?.user?.id || parseInt(studentId)
      const enrollmentsRes = await academicsAPI.studentClasses()
      const allEnrollments = enrollmentsRes.data.results || enrollmentsRes.data || []
      const studentEnrollments = allEnrollments.filter((e: any) => {
        const enrollmentStudentId = e.student
        return enrollmentStudentId === studentUserId || enrollmentStudentId === parseInt(studentId)
      })
      setEnrollments(studentEnrollments)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to remove from class')
    }
  }

  const getStudentName = () => {
    if (!student) return 'Student'
    const u = student.user_data || student.user
    return `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.username || 'Student'
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Wallet size={16} />
      case 'bank_transfer': return <Building2 size={16} />
      case 'mobile_money': return <Smartphone size={16} />
      case 'card': return <CreditCard size={16} />
      default: return <DollarSign size={16} />
    }
  }

  const handleRecordPayment = async () => {
    if (!student || !selectedFeeForPayment || !paymentAmount) return

    setPaymentError(null)
    setProcessingPayment(true)

    try {
      const amount = parseFloat(paymentAmount)
      if (isNaN(amount) || amount <= 0) {
        setPaymentError("Please enter a valid amount")
        return
      }

      if (amount > parseFloat(selectedFeeForPayment.balance)) {
        setPaymentError("Amount cannot exceed the balance")
        return
      }

      const userId = student?.user_data?.id || student?.user?.id;
      const response = await billingAPI.recordManualPayment({
        student_id: userId,
        fee_assignment_id: selectedFeeForPayment.id,
        amount,
        payment_method: paymentMethod,
        notes: paymentNotes
      })

      toast.success('Payment recorded successfully! Receipt emailed to student.')

      // Close dialog and reset
      setIsPaymentDialogOpen(false)
      setPaymentAmount('')
      setPaymentMethod('cash')
      setPaymentNotes('')
      setSelectedFeeForPayment(null)

// Refresh fees
      const userId = student?.user_data?.id || student?.user?.id;
      const feesRes = await billingAPI.studentFeeAssignmentsByStudent(userId)
      const sf: StudentFeeAssignment[] = (feesRes.data.results || feesRes.data || [])
      setStudentFees(sf)
      setDueFees(sf.filter((f: StudentFeeAssignment) => f.status === 'pending' || f.status === 'partial').reduce((s: number, f: StudentFeeAssignment) => s + parseFloat(f.balance), 0))

    } catch (err: any) {
      console.error("Failed to record payment:", err)
      setPaymentError(err?.response?.data?.detail || err?.message || "Failed to record payment")
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleOpenPaymentDialog = (fee: StudentFeeAssignment) => {
    setSelectedFeeForPayment(fee)
    setPaymentAmount(fee.balance)
    setPaymentMethod('cash')
    setPaymentNotes('')
    setPaymentError(null)
    setIsPaymentDialogOpen(true)
  }

  // Get enrolled class IDs for filtering available classes
  const enrolledClassIds = new Set(enrollments.map((e) => e.class_obj))
  const availableClasses = classes.filter((c) => !enrolledClassIds.has(c.id))

  if (loading) return <div className="flex items-center justify-center min-h-screen p-8"><CircularLoader /></div>
  if (error || !student) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 flex flex-col items-center gap-4">
        <AlertCircle size={48} />
        <p>{error || 'Student not found'}</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    </div>
  )

  const studentName = name()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/dashboard/school-admin" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link href="/dashboard/school-admin/students" className="hover:text-gray-900">Students</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{studentName}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{studentName}</h1>
            <p className="text-gray-600">{email()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                <X size={16} />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                <Edit2 size={18} />
                Edit Profile
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setIsMessageModalOpen(true)}>
                <MessageSquare size={18} />
                Send Message ({email()})
              </Button>
              <Button variant="outline" className="gap-2">
                <Download size={18} />
                Report
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Upcoming Exams" value={upcomingExams} Icon={BookOpen} color="bg-green-500" />
        <StatCard label="Due Fees" value={`$${dueFees.toFixed(2)}`} Icon={DollarSign} color="bg-red-500" />
        <StatCard label="Events" value={eventsCount} Icon={Flag} color="bg-blue-500" />
        <StatCard label="Documents" value={docsCount} Icon={FileText} color="bg-yellow-500" />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile Picture */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Camera size={16} className="text-purple-600" />
              Profile Picture
            </h2>
            {/* ... profile picture code remains the same ... */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                {picPreview ? (
                  <Image src={picPreview} alt="Preview" fill className="object-cover" />
                ) : profilePic ? (
                  <Image src={profilePic} alt={studentName} fill className="object-cover" />
                ) : (
                  <span className="text-white font-bold text-5xl">{studentName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {picError && <p className="text-red-600 text-xs">{picError}</p>}
              {picPreview ? (
                <div className="flex gap-2 w-full">
                  <Button onClick={handlePicUpload} disabled={uploadingPic} size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    {uploadingPic ? 'Uploading...' : 'Save'}
                  </Button>
                  <Button onClick={() => {setPicPreview(''); setPicFile(null)}} variant="outline" size="sm" className="flex-1">Cancel</Button>
                </div>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePicChange} className="hidden" id="pic-upload" />
                  <label htmlFor="pic-upload" className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 cursor-pointer hover:bg-purple-50">
                    <Camera size={16} />
                    {profilePic ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="font-semibold">{studentName}</p>
              <p className="text-xs text-gray-500">ID: {student.student_id || 'N/A'}</p>
              <p className="text-xs text-gray-500">{student.level?.name || 'No Class'}</p>
            </div>
          </div>

          {/* Personal, Family, Academic, Class sections remain the same ... */}
          {/* [Omitted for brevity - all existing left column sections stay unchanged] */}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Attendance and Notice Board remain the same */}

          {/* NEW: Student Fee Management Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign size={16} className="text-orange-600" />
                Student Fee Management
              </h2>
              {feesLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600" />
              ) : null}
            </div>

            {feesLoading ? (
              <div className="flex justify-center py-12">
                <CircularLoader />
              </div>
            ) : studentFees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No fees assigned to this student yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Fee Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Balance</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentFees.map((fee) => (
                      <tr key={fee.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{fee.fee_name}</td>
                        <td className="px-4 py-3">
                          {editingFeeId === fee.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={tempFeeData[fee.id]?.amount || fee.amount}
                              onChange={(e) => setTempFeeData(prev => ({
                                ...prev,
                                [fee.id]: { ...prev[fee.id], amount: e.target.value }
                              }))}
                              className="w-24"
                            />
                          ) : (
                            `¢${parseFloat(fee.amount).toFixed(2)}`
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingFeeId === fee.id ? (
                            <Input
                              type="date"
                              value={tempFeeData[fee.id]?.due_date?.split('T')[0] || fee.due_date.split('T')[0]}
                              onChange={(e) => setTempFeeData(prev => ({
                                ...prev,
                                [fee.id]: { ...prev[fee.id], due_date: e.target.value }
                              }))}
                              className="w-32"
                            />
                          ) : (
                            new Date(fee.due_date).toLocaleDateString()
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600">
                          ${parseFloat(fee.balance).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <FeeStatusBadge status={fee.status} />
                        </td>
                        <td className="px-4 py-3">
                          {editingFeeId === fee.id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveFee(fee.id)}
                                disabled={savingFee}
                                className="bg-green-600 hover:bg-green-700 h-8"
                              >
                                <CheckCircle2 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditFee(fee)}
                                className="h-8"
                              >
                                <Edit3 size={14} />
                              </Button>
                              {parseFloat(fee.balance) > 0 && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleOpenPaymentDialog(fee)}
                                >
                                  <Receipt size={14} className="mr-1" />
                                  Pay
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Record Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Physical Payment</DialogTitle>
              </DialogHeader>
              {selectedFeeForPayment && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-lg">{selectedFeeForPayment.fee_name}</p>
                    <p className="text-sm text-gray-500">
                      Balance Due: <span className="font-bold text-red-600">${parseFloat(selectedFeeForPayment.balance).toFixed(2)}</span> of ${parseFloat(selectedFeeForPayment.amount).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payment-amount">Amount ($)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={parseFloat(selectedFeeForPayment.balance)}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Wallet size={16} /> Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} /> Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="mobile_money">
                          <div className="flex items-center gap-2">
                            <Smartphone size={16} /> Mobile Money
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} /> Card
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} /> Other
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment-notes">Notes (Optional)</Label>
                    <Input
                      id="payment-notes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Payment reference or notes"
                    />
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRecordPayment} 
                      disabled={processingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Record Payment'
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Exam Results section remains the same */}
          {/* ... */}
        </div>
      </div>

      {/* Message Modal - remains the same */}
      {/* ... */}

    </div>
  )
}
