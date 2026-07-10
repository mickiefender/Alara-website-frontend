"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { gradesAPI, academicsAPI, usersAPI } from "@/lib/api"

interface Grade {
  id: number
  student: number
  subject: number
  subject_name?: string
  assessment_type: string
  score: number
  max_score: number
  percentage?: number
  grade: string
  recorded_date: string
}

export default function StudentGradesDetail() {
  const params = useParams()
  const router = useRouter()
  const studentId = parseInt(params.studentId as string)
  
  const [grades, setGrades] = React.useState<Grade[]>([])
  const [studentName, setStudentName] = React.useState("")
  const [subjects, setSubjects] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [gradesRes, studentsRes, subjectsRes] = await Promise.all([
          gradesAPI.list({ student: studentId }),
          usersAPI.students(),
          academicsAPI.subjects(),
        ])

        // Server-side filtered grades (safety net: client filter too)
        let studentGrades = gradesRes.data.results || gradesRes.data || []
        
        // Double-check client-side filter if backend doesn't filter properly
        studentGrades = studentGrades.filter((g: any) => g.student === studentId)
        setGrades(studentGrades)
        
        // Robust student lookup with full optional chaining
        const studentsList = studentsRes.data?.results || studentsRes.data || []
        const student = studentsList.find((s: any) => {
          const studentIdField = s.id || s.user?.id || s.user_data?.id
          return studentIdField === studentId
        })
        
        setStudentName(student 
          ? `${student.first_name || student.user_data?.first_name || student.user?.first_name || ''} ${student.last_name || student.user_data?.last_name || student.user?.last_name || ''}`.trim() 
          : `Student ${studentId}`)

        setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      } catch (error) {
        console.error("Failed to fetch student grades:", error)
        // Don't crash on error - show generic student name
        setStudentName(`Student ${studentId}`)
        setGrades([])
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: any) => s.id === subjectId)
    return subject?.name || `Subject ${subjectId}`
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    }
    return colors[grade] || colors.default
  }

  const avgPercentage = grades.length > 0 
    ? grades.reduce((sum, g) => sum + (g.percentage || (g.score / g.max_score * 100)), 0) / grades.length 
    : 0

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Grades
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{studentName}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                  Overall: {avgPercentage.toFixed(1)}% 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(
                    avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'F'
                  )}`}>
                    {(avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'F')}
                  </span>
                </Badge>
                <Badge variant="outline">{grades.length} Assessments</Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No grades recorded for this student yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Score</th>
                    <th className="text-left py-3 px-4 font-medium">Percentage</th>
                    <th className="text-left py-3 px-4 font-medium">Grade</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{grade.subject_name || getSubjectName(grade.subject)}</td>
                      <td className="py-3 px-4 capitalize">{grade.assessment_type}</td>
                      <td className="py-3 px-4 font-mono">{grade.score}/{grade.max_score}</td>
                      <td className="py-3 px-4 font-bold">{(grade.percentage || (grade.score / grade.max_score * 100)).toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <Badge className={`font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(grade.recorded_date).toLocaleDateString()}</td>
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

