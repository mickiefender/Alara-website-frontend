"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { assignmentAPI } from "@/lib/api"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import AssignmentSubmissionModal from "@/components/AssignmentSubmissionModal"
import { ClipboardList, ClipboardCheck } from "lucide-react"

interface AssignmentData {
  id?: string
  title?: string
  description?: string
  due_date?: string
  teacher_name?: string
  subject_name?: string
  class_name?: string
  assignment?: {
    id: string
    title: string
    description: string
    due_date: string
    teacher_name?: string
    subject_name?: string
  }
  submission?: {
    status: string
    score?: number
    feedback?: string
  } | null
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<(AssignmentData & { id: string; title: string }) | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await assignmentAPI.list()  // Use flattened list for now, backend returns flat
      console.log('Assignments response:', res.data)
      const data = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setAssignments(data)
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err)
      setError(err?.response?.data?.detail || err.message || "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const handleOpenModal = (assignment: AssignmentData) => {
    const selectedAssign = assignment.assignment || assignment
    if (selectedAssign.id && selectedAssign.title) {
      setSelectedAssignment(selectedAssign as AssignmentData & { id: string; title: string })
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setSelectedAssignment(null)
    setIsModalOpen(false)
    fetchAssignments() // Refresh after close
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button onClick={fetchAssignments} className="mt-4">Try Again</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {assignments.length > 0 ? (
            assignments.map((item, idx) => {
              const assignment = item.assignment || item
              const submission = item.submission || null
              const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded'
              const dueDate = new Date(assignment.due_date || 0)
              const isOverdue = dueDate < new Date() && !isSubmitted

              return (
                <Card key={assignment.id || idx} className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-xl">{assignment.title || "Untitled Assignment"}</CardTitle>
                        {assignment.subject_name && (
                          <p className="text-sm text-muted-foreground">{assignment.subject_name}</p>
                        )}
                      </div>
                      <Badge variant={isSubmitted ? "default" : "secondary"} className={isOverdue ? "bg-red-500" : ""}>
                        {submission?.status === 'graded' ? `Graded (${submission.score || 0})` : 
                         isSubmitted ? 'Submitted' : 
                         isOverdue ? 'Overdue' : 'Not Submitted'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-sm leading-relaxed">{assignment.description || "No description provided"}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Teacher</p>
                      <p className="font-medium">
                          {assignment.teacher_name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className={isOverdue ? "font-semibold text-red-600" : "font-semibold"}>
                          {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {submission?.score !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-semibold">{submission.score}</p>
                        </div>
                      )}
                      {submission?.feedback && (
                        <div className="md:col-span-3">
                          <p className="text-muted-foreground">Feedback</p>
                          <p className="font-medium bg-muted/50 p-2 rounded">{submission.feedback}</p>
                        </div>
                      )}
                    </div>

                    {!isSubmitted && (
                      <Button 
                        onClick={() => handleOpenModal(item)}
                        className="w-full mt-4"
                      >
                        {isOverdue ? 'Submit Late Assignment' : 'Submit Assignment'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : !loading && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-6">Check back later for new assignments from your teachers.</p>
                <Button variant="outline" onClick={fetchAssignments}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <AssignmentSubmissionModal
          assignment={selectedAssignment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </ProtectedRoute>
  )
}

