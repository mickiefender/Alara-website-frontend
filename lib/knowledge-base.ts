export type KnowledgeStatus = "active" | "inactive" | "trash"

export interface KnowledgeCategory {
  id: string
  name: string
  slug: string
  description: string
  parentId?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  description: string
  content: string
  categoryIds: string[]
  tags: string[]
  thumbnailUrl?: string
  metaTitle: string
  metaDescription: string
  status: KnowledgeStatus
  createdAt: string
  updatedAt: string
}

export const KNOWLEDGE_CATEGORIES_KEY = "alara:knowledge-categories"
export const KNOWLEDGE_ARTICLES_KEY = "alara:knowledge-articles"

export const DEFAULT_KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  { id: "getting-started", name: "Getting Started", slug: "getting-started", description: "Helpful guides for getting started.", status: "active", createdAt: "2026-01-25T16:46:23.000Z" },
  { id: "school-management", name: "School Management", slug: "school-management", description: "Guides for managing your school.", status: "active", createdAt: "2026-01-25T16:46:23.000Z" },
  { id: "billing", name: "Billing & Payments", slug: "billing-payments", description: "Payments, fees, and subscription guidance.", status: "active", createdAt: "2026-01-25T16:46:23.000Z" },
]

export const DEFAULT_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "driver-registration",
    title: "How do I register a new student?",
    slug: "how-do-i-register-a-new-student",
    description: "A step-by-step guide to adding a student to your school.",
    content: "Open Students from the sidebar, select Add Student, complete the required fields, and save the record.",
    categoryIds: ["getting-started"],
    tags: ["students", "getting started"],
    metaTitle: "How to register a new student",
    metaDescription: "Learn how to register a new student in Alara.",
    status: "active",
    createdAt: "2026-01-25T16:46:23.000Z",
    updatedAt: "2026-01-25T16:46:23.000Z",
  },
]

export function readKnowledge<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeKnowledge<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent("knowledge-base-updated"))
}

export function createSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

