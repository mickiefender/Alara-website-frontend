"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Search, Plus, Library, PackageCheck, PackageX, Users2, CalendarClock, Pencil, Trash2 } from "lucide-react"
import { getErrorMessage, libraryAPI, usersAPI } from "@/lib/api"
import { getDueStatus, getStockStatus, type LibraryBook, type LibraryCategory, type LibraryLoan, type LibraryStudent } from "@/lib/library"

type BookForm = { title: string; author: string; isbn: string; category: string; total_copies: string }
const EMPTY_BOOK_FORM: BookForm = { title: "", author: "", isbn: "", category: "", total_copies: "1" }

function records<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) return data.results as T[]
  return []
}

function localDateAfter(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function LibraryBooksPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <LibraryBooksContent />
    </ProtectedRoute>
  )
}

function LibraryBooksContent() {
  const { toast } = useToast()
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [categories, setCategories] = useState<LibraryCategory[]>([])
  const [loans, setLoans] = useState<LibraryLoan[]>([])
  const [students, setStudents] = useState<LibraryStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null)
  const [bookForm, setBookForm] = useState<BookForm>(EMPTY_BOOK_FORM)
  const [issueBook, setIssueBook] = useState<LibraryBook | null>(null)
  const [studentId, setStudentId] = useState("")
  const [dueDate, setDueDate] = useState(localDateAfter(14))

  async function loadData() {
    setError("")
    try {
      const [bookResponse, categoryResponse, loanResponse] = await Promise.all([
        libraryAPI.books(),
        libraryAPI.categories(),
        libraryAPI.loans(),
      ])
      setBooks(records<LibraryBook>(bookResponse.data))
      setCategories(records<LibraryCategory>(categoryResponse.data))
      setLoans(records<LibraryLoan>(loanResponse.data))
    } catch (err) {
      setError(getErrorMessage(err, "Could not load library data. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const refreshTimer = window.setInterval(() => void loadData(), 30_000)
    return () => window.clearInterval(refreshTimer)
  }, [])

  const filteredBooks = useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    return books.filter((book) => {
      const matchesSearch = !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === "all" || String(book.category ?? "") === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [books, searchTerm, categoryFilter])

  const totalCopies = books.reduce((sum, book) => sum + book.total_copies, 0)
  const availableCopies = books.reduce((sum, book) => sum + book.available_copies, 0)

  function openBookDialog(book?: LibraryBook) {
    setEditingBook(book ?? null)
    setBookForm(book ? {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category ? String(book.category) : "",
      total_copies: String(book.total_copies),
    } : EMPTY_BOOK_FORM)
    setBookDialogOpen(true)
  }

  async function saveBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const payload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      isbn: bookForm.isbn.trim(),
      category: bookForm.category ? Number(bookForm.category) : null,
      total_copies: Number(bookForm.total_copies),
    }
    try {
      if (editingBook) await libraryAPI.updateBook(editingBook.id, payload)
      else await libraryAPI.createBook(payload)
      setBookDialogOpen(false)
      toast({ title: editingBook ? "Book updated" : "Book added", description: `"${payload.title}" saved to the catalog.` })
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the book."))
    } finally {
      setBusy(false)
    }
  }

  async function deleteBook(book: LibraryBook) {
    if (!window.confirm(`Delete "${book.title}" from the catalog?`)) return
    setError("")
    try {
      await libraryAPI.deleteBook(book.id)
      toast({ title: "Book deleted", description: `"${book.title}" was removed from the catalog.` })
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the book."))
    }
  }

  async function loadStudents() {
    if (students.length || studentsLoading) return
    setStudentsLoading(true)
    try {
      const allStudents: LibraryStudent[] = []
      let page = 1
      let hasNext = true
      while (hasNext) {
        const response = await usersAPI.students({ page, page_size: 100 })
        const data = response.data
        allStudents.push(...records<LibraryStudent>(data))
        hasNext = Boolean(data && typeof data === "object" && "next" in data && data.next)
        page += 1
      }
      setStudents(allStudents)
    } catch (err) {
      setError(getErrorMessage(err, "Could not load students."))
    } finally {
      setStudentsLoading(false)
    }
  }

  function openIssueDialog(book: LibraryBook) {
    setIssueBook(book)
    setStudentId("")
    setDueDate(localDateAfter(14))
    void loadStudents()
  }

  async function submitIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!issueBook || !studentId) return
    setBusy(true)
    setError("")
    try {
      await libraryAPI.issueBook(issueBook.id, { student_id: Number(studentId), due_date: dueDate })
      setIssueBook(null)
      toast({ title: "Book issued", description: `"${issueBook.title}" has been checked out.` })
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, "Could not issue the book."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Library — Books</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your school&apos;s catalog and checked-out copies</p>
        </div>
        <Button onClick={() => openBookDialog()} size="lg"><Plus className="mr-2 h-5 w-5" />Add Book</Button>
      </div>

      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-5"><Library className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{books.length}</p><p className="text-sm text-muted-foreground">Titles in Catalog</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><PackageCheck className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{availableCopies}</p><p className="text-sm text-muted-foreground">Copies Available</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><PackageX className="h-6 w-6 text-muted-foreground" /><div><p className="text-2xl font-bold">{totalCopies - availableCopies}</p><p className="text-sm text-muted-foreground">Copies Issued</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><Users2 className="h-6 w-6 text-muted-foreground" /><div><p className="text-2xl font-bold">{new Set(loans.map((loan) => loan.student_id)).size}</p><p className="text-sm text-muted-foreground">Active Borrowers</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Book Catalog</CardTitle><CardDescription>Search and filter your school&apos;s live library collection</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by title, author, or ISBN..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading books…</p> : filteredBooks.length === 0 ? (
            <div className="py-12 text-center"><BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground" /><h3 className="font-semibold">No books found</h3><p className="mt-1 text-sm text-muted-foreground">{books.length ? "Try changing your search or category filter." : "Add a book to start your library catalog."}</p></div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="px-3 py-2">Title</th><th className="px-3 py-2">Author</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">ISBN</th><th className="px-3 py-2">Copies</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
              <tbody>{filteredBooks.map((book) => {
                const stock = getStockStatus(book)
                return <tr key={book.id} className="border-b hover:bg-muted/40">
                  <td className="px-3 py-2.5 font-medium">{book.title}</td><td className="px-3 py-2.5 text-muted-foreground">{book.author || "—"}</td>
                  <td className="px-3 py-2.5"><Badge variant="outline">{book.category_name || "Uncategorized"}</Badge></td><td className="px-3 py-2.5 text-muted-foreground">{book.isbn || "—"}</td>
                  <td className="px-3 py-2.5">{book.available_copies} / {book.total_copies}</td><td className="px-3 py-2.5"><Badge variant={stock.variant}>{stock.label}</Badge></td>
                  <td className="px-3 py-2.5"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={!book.available_copies} onClick={() => openIssueDialog(book)}>Issue</Button><Button size="icon" variant="ghost" aria-label={`Edit ${book.title}`} onClick={() => openBookDialog(book)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${book.title}`} onClick={() => void deleteBook(book)}><Trash2 className="h-4 w-4" /></Button></div></td>
                </tr>
              })}</tbody>
            </table></div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" />Currently Issued</CardTitle><CardDescription>Live list of books checked out by students</CardDescription></CardHeader>
        <CardContent>
          {loans.length === 0 ? <p className="py-8 text-center text-muted-foreground">No books are currently issued.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="px-3 py-2">Book</th><th className="px-3 py-2">Borrower</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Issued</th><th className="px-3 py-2">Due</th><th className="px-3 py-2">Status</th></tr></thead><tbody>
              {loans.slice(0, 8).map((loan) => { const due = getDueStatus(loan.due_date); return <tr key={loan.id} className="border-b"><td className="px-3 py-2.5 font-medium">{loan.book_title}</td><td className="px-3 py-2.5">{loan.borrower}</td><td className="px-3 py-2.5 text-muted-foreground">{loan.class_name || "—"}</td><td className="px-3 py-2.5 text-muted-foreground">{loan.issued_at}</td><td className="px-3 py-2.5 text-muted-foreground">{loan.due_date}</td><td className="px-3 py-2.5"><Badge variant={due.variant}>{due.label}</Badge></td></tr> })}</tbody></table></div>
          )}
        </CardContent>
      </Card>

      <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingBook ? "Edit Book" : "Add Book"}</DialogTitle><DialogDescription>Book records are stored in your school&apos;s library catalog.</DialogDescription></DialogHeader>
          <form onSubmit={saveBook} className="space-y-4">
            <div><Label htmlFor="book-title">Title</Label><Input id="book-title" required value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} /></div>
            <div><Label htmlFor="book-author">Author</Label><Input id="book-author" value={bookForm.author} onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })} /></div>
            <div><Label htmlFor="book-isbn">ISBN</Label><Input id="book-isbn" value={bookForm.isbn} onChange={(event) => setBookForm({ ...bookForm, isbn: event.target.value })} /></div>
            <div><Label>Category</Label><Select value={bookForm.category || "none"} onValueChange={(value) => setBookForm({ ...bookForm, category: value === "none" ? "" : value })}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent><SelectItem value="none">Uncategorized</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="book-copies">Total copies</Label><Input id="book-copies" type="number" min={0} step={1} required value={bookForm.total_copies} onChange={(event) => setBookForm({ ...bookForm, total_copies: event.target.value })} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setBookDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : editingBook ? "Save changes" : "Add book"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(issueBook)} onOpenChange={(open) => !open && setIssueBook(null)}>
        <DialogContent><DialogHeader><DialogTitle>Issue book</DialogTitle><DialogDescription>{issueBook?.title}</DialogDescription></DialogHeader>
          <form onSubmit={submitIssue} className="space-y-4">
            <div><Label>Student</Label><Select value={studentId} onValueChange={setStudentId} disabled={studentsLoading}><SelectTrigger><SelectValue placeholder={studentsLoading ? "Loading students…" : "Select a student"} /></SelectTrigger><SelectContent>{students.map((student) => <SelectItem key={student.user_id} value={String(student.user_id)}>{student.user_name || `${student.first_name} ${student.last_name}`} · {student.student_id}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="book-due-date">Due date</Label><Input id="book-due-date" type="date" required min={localDateAfter(0)} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIssueBook(null)}>Cancel</Button><Button type="submit" disabled={busy || studentsLoading || !studentId}>{busy ? "Issuing…" : "Issue book"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
