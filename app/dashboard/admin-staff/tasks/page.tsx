"use client"

import { useAuthContext } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function AdminStaffTasksPage() {
  const { user, loading } = useAuthContext()

  const mockTasks = [
    { id: 1, title: "Review attendance records", status: "pending", priority: "high", due: "Today" },
    { id: 2, title: "Grade assignments for Class 10A", status: "in-progress", priority: "medium", due: "Tomorrow" },
    { id: 3, title: "Update exam schedule", status: "completed", priority: "low", due: "Done" },
    { id: 4, title: "Prepare fee receipts", status: "pending", priority: "high", due: "Friday" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 p-3 rounded-xl">
          <ClipboardList className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">Manage your assigned tasks and responsibilities</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Summary</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTasks.filter(t => t.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Completed this week</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Pending</span>
                <Badge variant="secondary">{mockTasks.filter(t => t.status === 'pending').length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>In Progress</span>
                <Badge variant="default">{mockTasks.filter(t => t.status === 'in-progress').length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockTasks
              .filter(task => task.due !== 'Done')
              .sort((a, b) => (a.due === 'Today' ? -1 : 0))
              .slice(0, 3)
              .map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.due}</div>
                  </div>
                  <Badge variant={task.priority === 'high' ? "destructive" : "secondary"}>
                    {task.priority.toUpperCase()}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Recent activity and assigned responsibilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTasks.map(task => (
              <div key={task.id} className="flex items-start gap-4 p-4 border rounded-xl hover:bg-accent hover:shadow-md transition-all">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  task.status === 'completed' ? 'bg-green-500' : 
                  task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground truncate pr-2">{task.title}</h3>
                    <Badge variant={
                      task.status === 'completed' ? 'default' : 
                      task.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Due {task.due}</span>
                    <div className="h-2 bg-muted rounded-full flex-1 ml-4">
                      <div className="h-2 bg-primary rounded-full" style={{width: '60%'}} />
                    </div>
                  </div>
                </div>
                {task.priority === 'high' && (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm py-8 border-t">
        Tasks system will be fully integrated with backend assignment system soon.
      </div>
    </div>
  )
}

