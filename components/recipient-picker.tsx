"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X, GraduationCap, User } from "lucide-react"
import { messagingAPI } from "@/lib/api"

export interface Recipient {
  id: number
  name: string
  email: string
  role: "student" | "teacher"
}

interface RecipientPickerProps {
  /** Currently selected user ids */
  selected: number[]
  onChange: (selected: number[]) => void
}

/**
 * Searchable multi-select for individually targeting students and/or
 * teachers. Backed by /messaging/notices/recipients/.
 */
export function RecipientPicker({ selected, onChange }: RecipientPickerProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all")

  useEffect(() => {
    let cancelled = false
    const fetchRecipients = async () => {
      try {
        setLoading(true)
        const res = await messagingAPI.recipientsDirectory()
        if (cancelled) return
        const data = res.data.results || res.data || []
        setRecipients(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        if (!cancelled) setError("Failed to load recipients")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchRecipients()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return recipients.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false
      if (!q) return true
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    })
  }, [recipients, search, roleFilter])

  const selectedRecipients = useMemo(
    () => recipients.filter((r) => selected.includes(r.id)),
    [recipients, selected],
  )

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-red-600" role="status" aria-label="Loading recipients" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600 py-2">{error}</p>
  }

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedRecipients.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium"
            >
              {r.role === "student" ? <GraduationCap className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {r.name}
              <button
                type="button"
                onClick={() => toggle(r.id)}
                className="hover:text-red-950"
                aria-label={`Remove ${r.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + role filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
        </select>
      </div>

      {/* List */}
      <div className="border rounded-md max-h-44 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No matching people found</p>
        ) : (
          filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                selected.includes(r.id) ? "bg-red-50" : ""
              }`}
            >
              <input type="checkbox" checked={selected.includes(r.id)} readOnly className="w-4 h-4 pointer-events-none" />
              {r.role === "student" ? (
                <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
              )}
              <span className="flex-1 truncate">{r.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{r.email}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
