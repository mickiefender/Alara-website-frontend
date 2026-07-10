"use client"

import { useAuthContext } from '@/lib/auth-context'
import { NAV_LINK_PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, MessageSquare, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function AdminStaffPermissions() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)

  const userPerms = user?.permissions || []
  const permissions = NAV_LINK_PERMISSIONS.filter(p => userPerms.includes(p.id))

  const categoryGroups = permissions.reduce((acc: Record<string, any[]>, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  const handleRequestMore = () => {
    // Could integrate with messaging system
    alert('Request sent to school administrator for additional permissions review')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Permissions</h1>
          <p className="text-muted-foreground">Manage and review your access rights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRequestMore} className="gap-2">
            <MessageSquare size={18} />
            Request More Permissions
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Assigned Permissions ({userPerms.length})
          </CardTitle>
          <CardDescription>
            These permissions were assigned by your school administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No permissions assigned</h3>
              <p className="text-muted-foreground mb-6">
                Contact your school administrator to grant access to specific features.
              </p>
              <Button onClick={handleRequestMore} className="gap-2">
                <MessageSquare size={18} />
                Request Access
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categoryGroups).map(([category, perms]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {category} ({perms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium">{perm.label}</p>
                          <p className="text-sm text-muted-foreground">{perm.href}</p>
                        </div>
                        <div className="w-2 h-8 bg-green-400 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

