import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import ProfilePictureUpload from "@/components/profile-picture-upload"
import { usersAPI } from "@/lib/api"
import Loader from '@/components/loader'

interface SchoolAdminProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  username: string
  employee_id?: string
  picture?: string
  bio?: string
  department?: string
  qualification?: string
  experience_years?: number
}

export default function SchoolAdminProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SchoolAdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<SchoolAdminProfile>>({})
  const [saveLoading, setSaveLoading] = useState(false)
  const { toast } = useToast()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [refreshTrigger])

  const fetchProfile = async () => {
    if (!session?.user?.id) return
    try {
      setLoading(true)
  const res = await usersAPI.getById(session.user.id as number)
      setProfile(res.data)
      setFormData(res.data)
    } catch (err) {
      console.error("Error fetching profile:", err)
      toast({
        title: "Error",
        description: "Could not fetch profile details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    setFormData(profile || {})
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!formData || !profile) return
    try {
      setSaveLoading(true)
      await usersAPI.update(profile.id, formData as any)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
      fetchProfile()
    } catch (err: any) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: err?.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  if (loading) {
    return <Loader />
  }

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile Information</CardTitle>
          <CardDescription>View and manage your school admin profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center gap-4">
              <ProfilePictureUpload
                userId={profile.id}
                userName={`${profile.first_name} ${profile.last_name}`}
                currentPicture={profile.picture}
                onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
                <p className="text-muted-foreground">School Administrator</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 flex-1">
              <div>
                <Label>Username</Label>
                <p className="font-semibold">{profile.username}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-semibold">{profile.email}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="font-semibold">{profile.phone || "Not provided"}</p>
              </div>
              <div>
                <Label>Employee ID</Label>
                <p className="font-semibold">{profile.employee_id || "Not available"}</p>
              </div>
{profile.department && (
                <div className="md:col-span-2">
                  <Label>Department</Label>
                  <p className="font-semibold">{profile.department}</p>
                </div>
              )}
{profile.bio && (
                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <p className="font-semibold">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditClick} variant="outline">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

{isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
{formData.department !== undefined && (
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
