"use client"

import { useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Search, Plus, Library, PackageCheck, PackageX, Users2, CalendarClock } from "lucide-react"
import { type Book, DUMMY_BOOKS, DUMMY_ISSUED, getDueStatus, getStockStatus } from "@/lib/dummy-library-data"

export default function LibraryBooksPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <LibraryBooksContent />
    </ProtectedRoute>
  )
}

function LibraryBooksContent() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = useMemo(
    () => Array.from(new Set(DUMMY_BOOKS.map((b) => b.category))).sort(),
    [],
  )

  const filteredBooks = useMemo(() => {
    return DUMMY_BOOKS.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      const matchesCategory = categoryFilter === "all" || book.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, categoryFilter])

  const totalCopies = DUMMY_BOOKS.reduce((sum, b) => sum + b.totalCopies, 0)
  const availableCopies = DUMMY_BOOKS.reduce((sum, b) => sum + b.availableCopies, 0)
  const issuedCopies = totalCopies - availableCopies

  const handleAddBook = () => {
    toast({ title: "Coming soon", description: "Adding new books will be available once the library backend is connected." })
  }

  const handleIssue = (book: Book) => {
    toast({ title: "Coming soon", description: `Issuing "${book.title}" will be available once the library backend is connected.` })
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Library — Books</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage your school&apos;s book catalog and track issued copies</p>
        </div>
        <Button onClick={handleAddBook} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{DUMMY_BOOKS.length}</p>
              <p className="text-sm text-muted-foreground">Titles in Catalog</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableCopies}</p>
              <p className="text-sm text-muted-foreground">Copies Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <PackageX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{issuedCopies}</p>
              <p className="text-sm text-muted-foreground">Copies Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{DUMMY_ISSUED.length}</p>
              <p className="text-sm text-muted-foreground">Active Borrowers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Book Catalog</CardTitle>
          <CardDescription>Search and filter your school&apos;s library collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Title</th>
                    <th className="text-left py-2 px-3">Author</th>
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-left py-2 px-3">ISBN</th>
                    <th className="text-left py-2 px-3">Copies</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => {
                    const stock = getStockStatus(book)
                    return (
                      <tr key={book.id} className="border-b hover:bg-muted/50">
                        <td className="py-2.5 px-3 font-medium">{book.title}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{book.author}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline">{book.category}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{book.isbn}</td>
                        <td className="py-2.5 px-3">
                          {book.availableCopies} / {book.totalCopies}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={stock.variant}>{stock.label}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={book.availableCopies === 0}
                            onClick={() => handleIssue(book)}
                          >
                            Issue
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently Issued */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            Currently Issued
          </CardTitle>
          <CardDescription>Books currently checked out by students</CardDescription>
        </CardHeader>
        <CardContent>
          {DUMMY_ISSUED.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No books are currently issued.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Book</th>
                    <th className="text-left py-2 px-3">Borrower</th>
                    <th className="text-left py-2 px-3">Class</th>
                    <th className="text-left py-2 px-3">Issued</th>
                    <th className="text-left py-2 px-3">Due</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DUMMY_ISSUED.map((record) => {
                    const due = getDueStatus(record.dueDate)
                    return (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2.5 px-3 font-medium">{record.bookTitle}</td>
                        <td className="py-2.5 px-3">{record.borrower}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{record.className}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{record.issueDate}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{record.dueDate}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={due.variant}>{due.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
