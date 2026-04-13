"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { gradesAPI } from "@/lib/api"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ResultsPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const res = await gradesAPI.list()
        setGrades(res.data.results || res.data || [])
      } catch (err: any) {
        setError("Failed to load results")
        console.error("[v0] Failed to fetch results:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800"
      case "B": return "bg-blue-100 text-blue-800"
      case "C": return "bg-yellow-100 text-yellow-800"
      case "D": return "bg-orange-100 text-orange-800"
      case "E": return "bg-pink-100 text-pink-800"
      case "F": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Results</h1>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>My Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold">Assessment Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Score</th>
                      <th className="text-left py-3 px-4 font-semibold">Percentage</th>
                      <th className="text-left py-3 px-4 font-semibold">Grade</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{grade.subject_name || grade.subject}</td>
                        <td className="py-3 px-4 capitalize">{grade.assessment_type}</td>
                        <td className="py-3 px-4">{grade.score}/{grade.max_score}</td>
                        <td className="py-3 px-4">{grade.percentage?.toFixed(1) || 0}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(grade.recorded_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No grades available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
