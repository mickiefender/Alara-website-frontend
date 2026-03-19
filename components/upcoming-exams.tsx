"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, BookOpen, MapPin, Users } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: number
  title: string
  subject_name: string
  class_name: string
  exam_date: string
  exam_time: string
  venue?: string
  duration_minutes: number
  total_marks: number
}

interface UpcomingExamsProps {
  exams: Exam[]
}

export function UpcomingExams({ exams }: UpcomingExamsProps) {
  const getDaysUntil = (dateStr: string): number => {
    const examDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    examDate.setHours(0, 0, 0, 0)
    const diffTime = examDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Upcoming Exams
          </CardTitle>
          <CardDescription>No upcoming exams scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Check back later for exam schedules. Your teachers will schedule exams soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Upcoming Exams ({exams.length})
        </CardTitle>
        <CardDescription>
          Prepare for your next exams. Good luck!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.slice(0, 6).map((exam) => {
            const daysUntil = getDaysUntil(exam.exam_date)
            const isToday = daysUntil === 0
            const badgeVariant = isToday ? "destructive" : daysUntil <= 3 ? "default" : "secondary"

            return (
              <div key={exam.id} className="group hover:shadow-lg transition-all border rounded-xl p-4 bg-gradient-to-br from-white to-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h3>
                  <Badge variant={badgeVariant} className="ml-2 shrink-0">
                    {isToday ? "TODAY" : daysUntil <= 3 ? `${daysUntil}d` : `${daysUntil} days`}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{exam.subject_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{exam.class_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exam.exam_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(exam.exam_time)}</span>
                  </div>
                  {exam.venue && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{exam.venue}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{exam.duration_minutes} min • {exam.total_marks} marks</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/student/exams/${exam.id}`}>
                      Details
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        {exams.length > 6 && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/student/exams">
                View All Exams ({exams.length})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

