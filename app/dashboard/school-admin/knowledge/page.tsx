"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, ChevronDown, Plus, Search, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KnowledgeArticle, KnowledgeCategory, DEFAULT_KNOWLEDGE_ARTICLES, DEFAULT_KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES_KEY, KNOWLEDGE_CATEGORIES_KEY, readKnowledge, writeKnowledge } from "@/lib/knowledge-base"

export default function KnowledgePage() {
  return <ProtectedRoute allowedRoles={["school_admin"]}><KnowledgeContent /></ProtectedRoute>
}

function KnowledgeContent() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    const load = () => {
      setArticles(readKnowledge(KNOWLEDGE_ARTICLES_KEY, DEFAULT_KNOWLEDGE_ARTICLES))
      setCategories(readKnowledge(KNOWLEDGE_CATEGORIES_KEY, DEFAULT_KNOWLEDGE_CATEGORIES))
    }
    load()
    window.addEventListener("knowledge-base-updated", load)
    return () => window.removeEventListener("knowledge-base-updated", load)
  }, [])

  const filtered = useMemo(() => articles.filter((article) => {
    const matchesQuery = `${article.title} ${article.description} ${article.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === "all" || article.status === status)
  }), [articles, query, status])

  const removeArticle = (id: string) => {
    const next = articles.map((article) => article.id === id ? { ...article, status: "trash" as const } : article)
    setArticles(next)
    writeKnowledge(KNOWLEDGE_ARTICLES_KEY, next)
  }

  const categoryNames = (article: KnowledgeArticle) => article.categoryIds.map((id) => categories.find((category) => category.id === id)?.name).filter(Boolean).join(", ") || "Uncategorized"
  const count = (value: string) => articles.filter((article) => value === "all" ? article.status !== "trash" : article.status === value).length

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1><p className="mt-1 text-muted-foreground">Create and manage helpful articles for your school community.</p></div>
        <Button asChild><Link href="/dashboard/school-admin/knowledge/add"><Plus className="mr-2 h-4 w-4" />Add Knowledge</Link></Button>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {["all", "active", "inactive", "trash"].map((item) => <button key={item} onClick={() => setStatus(item)} className={status === item ? "border-b-2 border-primary pb-2 font-semibold" : "pb-2 text-muted-foreground"}>{item[0].toUpperCase() + item.slice(1)} ({count(item)})</button>)}
        <div className="ml-auto flex w-full gap-2 sm:w-auto"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9 sm:w-64" placeholder="Search knowledge..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{["all", "active", "inactive", "trash"].map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm font-medium"><span>{filtered.length} item{filtered.length === 1 ? "" : "s"}</span><ChevronDown className="h-4 w-4" /></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b"><tr><th className="px-4 py-4 text-left">Title</th><th className="px-4 py-4 text-left">Categories</th><th className="px-4 py-4 text-left">Status</th><th className="px-4 py-4 text-left">Created At</th><th className="px-4 py-4 text-right">Action</th></tr></thead><tbody>
          {filtered.map((article) => <tr key={article.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-4 py-4"><div className="flex min-w-64 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div><div><p className="font-medium">{article.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{article.description}</p><div className="mt-1 flex gap-2"><Link className="text-xs text-primary hover:underline" href={`/dashboard/school-admin/knowledge/add?id=${article.id}`}>Edit</Link><button className="text-xs text-destructive hover:underline" onClick={() => removeArticle(article.id)}>{article.status === "trash" ? "Delete" : "Move to Trash"}</button></div></div></div></td><td className="px-4 py-4 text-muted-foreground">{categoryNames(article)}</td><td className="px-4 py-4"><Badge variant={article.status === "active" ? "secondary" : "outline"}>{article.status}</Badge></td><td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{new Date(article.createdAt).toLocaleString()}</td><td className="px-4 py-4 text-right"><Button variant="ghost" size="icon" onClick={() => removeArticle(article.id)} aria-label={`Move ${article.title} to trash`}><Trash2 className="h-4 w-4 text-destructive" /></Button></td></tr>)}
          {!filtered.length && <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">No knowledge articles found.</td></tr>}
        </tbody></table></div>
      </div>
    </div>
  )
}

