"use client"

import { useAuthContext } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, Edit, Save, Camera } from 'lucide-react'
import { useState } from 'react'
import { CircularLoader } from '@/components/circular-loader'
import { NAV_LINK_PERMISSIONS } from '@/lib/permissions'

export default function AdminStaffProfile() {
  const { user } = useAuthContext()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  if (!user) return <CircularLoader />

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Admin Staff Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-32 h-32 border-4 border-border ring-4 ring-background shadow-lg">
                <AvatarImage src={user.profile_picture || ''} />
                <AvatarFallback className="w-32 h-32 text-3xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button size="sm" variant="outline" className="gap-2">
                  <Camera size={16} />
                  Update Photo
                </Button>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent px-3 py-1 rounded-full">
                <Shield size={14} />
                {user.role?.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" value={user.first_name} disabled={!editing} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" value={user.last_name} disabled={!editing} />
            </div>
          </div>

          {/* Role & Permissions Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield size={18} />
                Role Permissions ({user.permissions?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {user.permissions?.map((perm) => {
                  const permission = NAV_LINK_PERMISSIONS.find(p => p.id === perm)
                  return (
                    <div key={perm} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                      <div className="w-2 h-8 bg-primary/60 rounded" />
                      <div>
                        <p className="font-medium">{permission?.label}</p>
                        <p className="text-xs text-muted-foreground">{permission?.category}</p>
                      </div>
                    </div>
                  )
                }) || <p className="text-muted-foreground italic">No permissions assigned</p>}
              </div>
            </div>
            <div className="space-y-4">
              <Button onClick={() => setEditing(!editing)} className="w-full gap-2">
                <Edit size={18} />
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
              {editing && (
                <Button className="w-full bg-primary gap-2" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

