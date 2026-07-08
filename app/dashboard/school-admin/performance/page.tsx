"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, School, Activity, FileText } from "lucide-react"
import { academicsAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { ProtectedRoute } from "@/lib/protected-route"
import { TeacherClassStats } from "@/components/teacher-class-stats"
import { ClassPerformanceAnalytics } from "@/components/class-performance-analytics"

interface ClassPerformanceData {
  classId: number
  className: string
  averageScore: number
  attendancePercentage: number
  performanceScore: number
  studentCount: number
}

export default function SchoolAdminPerformancePage() {
  const { user } = useAuthContext()
  const [classesPerformance, setClassesPerformance] = useState<ClassPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassPerf, setSelectedClassPerf] = useState<ClassPerformanceData | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const perfRes = await academicsAPI.classPerformanceWithAttendance()
        const allPerf = perfRes.data.results || perfRes.data || []
        setClassesPerformance(allPerf)
        if (allPerf.length > 0) {
          setSelectedClassPerf(allPerf[0])
        }
      } catch (error) {
        console.error("Failed to fetch school performance data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformance()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="space-y-8 p-4 md:p-6 lg:p-8 bg-background">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-secondary to-primary bg-clip-text text-transparent drop-shadow-lg">
            School Performance Overview
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Comprehensive analytics across all classes, attendance, grades, and overall school performance metrics
          </p>
        </div>

        {/* Performance Analytics Chart */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card/50 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BarChart3 className="w-7 h-7 text-secondary" />
              School-Wide Class Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ClassPerformanceAnalytics />
          </CardContent>
        </Card>

        {/* Class Selector */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <School className="w-7 h-7 text-secondary" />
              Select Class for Detailed Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classesPerformance.map((perf) => (
                <div 
                  key={perf.classId}
                  className={`group p-6 border-2 rounded-2xl cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-1 duration-300 ${
                    selectedClassPerf?.classId === perf.classId 
                      ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl ring-2 ring-primary/30" 
                      : "border-border/50 hover:border-primary/40 bg-gradient-to-br from-muted/30 hover:from-muted"
                  }`}
                  onClick={() => setSelectedClassPerf(perf)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-xl line-clamp-1">{perf.className}</h3>
                      <Badge variant="outline" className="ml-auto px-3 py-1 text-xs font-mono">
                        {perf.studentCount}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Grade</span>
                        <Badge variant="secondary" className="font-mono text-sm">
                          {perf.averageScore.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Attendance</span>
                        <Badge variant="outline" className="font-mono text-sm">
                          {perf.attendancePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">Perf Score</span>
                        <div className="font-bold text-lg text-primary">{perf.performanceScore.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Class Detailed Stats */}
        {selectedClassPerf && (
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Activity className="w-7 h-7 text-secondary" />
                {selectedClassPerf.className} - Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <TeacherClassStats data={selectedClassPerf} loading={false} />
            </CardContent>
          </Card>
        )}

        {/* Tabs for Additional Insights */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gradient-to-r from-muted to-muted-foreground/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="text-lg max-w-2xl mx-auto">
                  School performance overview shows comprehensive metrics across all classes.
                  Use the class selector above to drill down into specific class analytics.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6 pt-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-muted-foreground">Performance trends and historical comparison coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6 pt-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-muted-foreground">Class-to-class performance comparison charts coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6 pt-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-muted-foreground">
                  Export performance reports and generate detailed analytics reports coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

