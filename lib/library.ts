export interface LibraryBook {
  id: number
  title: string
  author: string
  category: number | null
  category_name: string
  isbn: string
  total_copies: number
  available_copies: number
}

export interface LibraryLoan {
  id: number
  book: number
  book_title: string
  student_id: number
  student_name: string
  borrower: string
  class_name: string
  issued_at: string
  due_date: string
  returned_at: string | null
}

export interface LibraryCategory {
  id: number
  name: string
  description: string
  book_count: number
}

export interface LibraryStudent {
  id: number
  user_id: number
  first_name: string
  last_name: string
  user_name: string
  student_id: string
  level_name?: string | null
}

export function getDueStatus(dueDate: string): {
  label: string
  variant: "secondary" | "destructive" | "outline"
} {
  const due = new Date(`${dueDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: "Overdue", variant: "destructive" }
  if (diffDays <= 2) return { label: "Due Soon", variant: "outline" }
  return { label: "On Time", variant: "secondary" }
}

export function getStockStatus(book: LibraryBook): {
  label: string
  variant: "secondary" | "destructive" | "default"
} {
  if (book.available_copies === 0) return { label: "All Issued", variant: "destructive" }
  if (book.available_copies <= 2) return { label: "Low Stock", variant: "default" }
  return { label: "Available", variant: "secondary" }
}
