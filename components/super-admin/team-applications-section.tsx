"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamApplication } from '@/types/team-application'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Mail, Calendar, User, Briefcase } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function TeamApplicationsSection() {
  const [applications, setApplications] = useState<TeamApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('team_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    setLoading(false)
    if (fetchError) {
      setError('Failed to load applications')
    } else {
      setApplications(data || [])
    }
  }

  const markViewed = async (id: string) => {
    const { error } = await supabase
      .from('team_applications')
      .update({ viewed: true })
      .eq('id', id)

    if (!error) {
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, viewed: true } : app
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default' as const
      case 'reviewed': return 'secondary' as const
      case 'contacted': return 'secondary' as const
      case 'hired': return 'default' as const
      default: return 'destructive' as const
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>Loading applications...</p>
        </CardContent>
      </Card>
    )
  }

  const pendingCount = applications.filter(app => !app.viewed || app.status === 'pending').length

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Team Applications</CardTitle>
            <CardDescription>
              {pendingCount} new applications{' '}
              <Button variant="ghost" size="sm" onClick={fetchApplications} className="h-6 px-2">
                Refresh
              </Button>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No team applications yet</p>
            <p className="text-sm">Applications from /join-team will appear here</p>
          </div>
        ) : (
          <div className="rounded-md border bg-background/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} className={!app.viewed ? 'bg-accent/20 animate-pulse' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {app.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${app.email}`} className="hover:underline">
                          {app.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {app.positions.slice(0, 2).join(', ')}
                      {app.positions.length > 2 && ` +${app.positions.length - 2}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(app.status)}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markViewed(app.id)}
                        disabled={app.viewed}
                        className="h-8"
                      >
                        <Eye className={`h-4 w-4 mr-1 ${app.viewed ? 'opacity-50' : ''}`} />
                        {app.viewed ? 'Viewed' : 'Mark Viewed'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
