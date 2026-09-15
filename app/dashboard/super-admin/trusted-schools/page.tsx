"use client"

import { useEffect, useState } from "react"
import { ImagePlus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getErrorMessage, platformAPI } from "@/lib/api"
import { PageHeader } from "@/components/super-admin/page-header"

type Partner = { id: number; name: string; logo: string }
const settingKey = "homepage.trusted_schools"

export default function TrustedSchoolsPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [name, setName] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    platformAPI.settings({ page_size: 500 })
      .then((response) => {
        const settings = response.data?.results || response.data || []
        const setting = settings.find((item: { key: string }) => item.key === settingKey)
        if (setting) {
          setPartners(Array.isArray(setting.value) ? setting.value : [])
        }
      })
      .catch((error) => setMessage(getErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  async function addPartner(event: React.FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || !logo) {
      setMessage("Enter a school name and choose a logo file.")
      return
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(logo.type)) {
      setMessage("Choose a JPEG, PNG, WebP, or SVG image.")
      return
    }
    if (logo.size > 5 * 1024 * 1024) {
      setMessage("Logo files must be 5 MB or smaller.")
      return
    }

    setSaving(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("name", trimmedName)
      formData.append("logo", logo)
      const response = await platformAPI.uploadTrustedSchoolLogo(formData)
      setPartners((current) => [...current, response.data])
      setName("")
      setLogo(null)
      const fileInput = document.getElementById("school-logo") as HTMLInputElement | null
      if (fileInput) fileInput.value = ""
      setMessage("Trusted school added. The logo is now live on the homepage.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function removePartner(partner: Partner) {
    if (!window.confirm(`Remove ${partner.name} from the homepage?`)) return
    setSaving(true)
    setMessage("")
    try {
      await platformAPI.deleteTrustedSchoolLogo(partner.id)
      setPartners((current) => current.filter((item) => item.id !== partner.id))
      setMessage(`${partner.name} was removed from trusted schools.`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading trusted schools...</div>

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Trusted Schools" description="Manage the school logos displayed on the public homepage." />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Add a school logo</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addPartner} className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
            <div className="space-y-2"><Label htmlFor="school-name">School name</Label><Input id="school-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Example Academy" /></div>
            <div className="space-y-2"><Label htmlFor="school-logo">Logo file</Label><Input id="school-logo" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(event) => setLogo(event.target.files?.[0] || null)} /></div>
            <Button type="submit" disabled={saving}><Plus className="mr-2 h-4 w-4" />Add logo</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">JPEG, PNG, WebP, or SVG up to 5 MB. The logo is uploaded securely and shown after saving.</p>
        </CardContent>
      </Card>
      {message && <p className="rounded-lg bg-muted p-3 text-sm">{message}</p>}
      <Card>
        <CardHeader><CardTitle>Published logos ({partners.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {partners.map((partner) => (
            <div key={`${partner.id}-${partner.logo}`} className="flex items-center gap-4 rounded-lg border border-border p-3">
              <img src={partner.logo} alt="" className="h-12 w-16 object-contain" />
              <span className="flex-1 font-medium">{partner.name}</span>
              <Button variant="ghost" size="icon" disabled={saving} aria-label={`Remove ${partner.name}`} onClick={() => removePartner(partner)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!partners.length && <p className="text-sm text-muted-foreground">No custom logos yet. The homepage will use its default logos.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
