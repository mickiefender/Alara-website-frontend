export interface Book {
  id: number
  title: string
  author: string
  category: string
  isbn: string
  totalCopies: number
  availableCopies: number
}

export interface IssuedRecord {
  id: number
  bookTitle: string
  borrower: string
  className: string
  issueDate: string
  dueDate: string
}

export interface Category {
  id: number
  name: string
  description: string
}

export const TODAY = new Date("2026-07-03")

export const DUMMY_BOOKS: Book[] = [
  { id: 1, title: "Introduction to Algebra", author: "R. K. Mensah", category: "Mathematics", isbn: "978-1-2345-6789-0", totalCopies: 12, availableCopies: 4 },
  { id: 2, title: "Basic Physics for Schools", author: "A. Owusu", category: "Science", isbn: "978-1-2345-6789-1", totalCopies: 10, availableCopies: 2 },
  { id: 3, title: "English Grammar in Use", author: "Raymond Murphy", category: "Languages", isbn: "978-1-2345-6789-2", totalCopies: 15, availableCopies: 9 },
  { id: 4, title: "West African History", author: "K. Boateng", category: "Social Studies", isbn: "978-1-2345-6789-3", totalCopies: 8, availableCopies: 0 },
  { id: 5, title: "Introductory Chemistry", author: "J. Adjei", category: "Science", isbn: "978-1-2345-6789-4", totalCopies: 10, availableCopies: 6 },
  { id: 6, title: "Literature in English", author: "Chinua Achebe", category: "Languages", isbn: "978-1-2345-6789-5", totalCopies: 6, availableCopies: 1 },
  { id: 7, title: "Geography of Ghana", author: "S. Asante", category: "Social Studies", isbn: "978-1-2345-6789-6", totalCopies: 7, availableCopies: 5 },
  { id: 8, title: "Computing for Beginners", author: "M. Darko", category: "ICT", isbn: "978-1-2345-6789-7", totalCopies: 9, availableCopies: 3 },
  { id: 9, title: "Further Mathematics", author: "R. K. Mensah", category: "Mathematics", isbn: "978-1-2345-6789-8", totalCopies: 6, availableCopies: 0 },
  { id: 10, title: "Biology for Senior High", author: "P. Nkrumah", category: "Science", isbn: "978-1-2345-6789-9", totalCopies: 11, availableCopies: 7 },
]

export const DUMMY_ISSUED: IssuedRecord[] = [
  { id: 1, bookTitle: "West African History", borrower: "Kojo Antwi", className: "Form 2A", issueDate: "2026-06-20", dueDate: "2026-07-04" },
  { id: 2, bookTitle: "Further Mathematics", borrower: "Ama Serwaa", className: "Form 3B", issueDate: "2026-06-18", dueDate: "2026-07-02" },
  { id: 3, bookTitle: "Introduction to Algebra", borrower: "Kwesi Appiah", className: "Form 1C", issueDate: "2026-06-25", dueDate: "2026-07-09" },
  { id: 4, bookTitle: "Basic Physics for Schools", borrower: "Efua Mensah", className: "Form 2B", issueDate: "2026-06-15", dueDate: "2026-06-29" },
  { id: 5, bookTitle: "Literature in English", borrower: "Yaw Boadi", className: "Form 3A", issueDate: "2026-06-27", dueDate: "2026-07-11" },
  { id: 6, bookTitle: "Introduction to Algebra", borrower: "Abena Osei", className: "Form 1A", issueDate: "2026-06-22", dueDate: "2026-07-06" },
  { id: 7, bookTitle: "West African History", borrower: "Nana Yaa", className: "Form 2A", issueDate: "2026-06-10", dueDate: "2026-06-24" },
  { id: 8, bookTitle: "Computing for Beginners", borrower: "Kofi Owusu", className: "Form 3C", issueDate: "2026-06-28", dueDate: "2026-07-12" },
]

export const DUMMY_CATEGORIES: Category[] = [
  { id: 1, name: "Mathematics", description: "Textbooks and workbooks covering algebra, geometry, and further mathematics." },
  { id: 2, name: "Science", description: "Physics, chemistry, and biology resources for junior and senior high." },
  { id: 3, name: "Languages", description: "English language, grammar, and literature titles." },
  { id: 4, name: "Social Studies", description: "History, geography, and civics resources." },
  { id: 5, name: "ICT", description: "Computing, coding, and digital literacy materials." },
]

export function getDueStatus(dueDate: string): { label: string; variant: "secondary" | "destructive" | "outline" } {
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: "Overdue", variant: "destructive" }
  if (diffDays <= 2) return { label: "Due Soon", variant: "outline" }
  return { label: "On Time", variant: "secondary" }
}

export function getStockStatus(book: Book): { label: string; variant: "secondary" | "destructive" | "default" } {
  if (book.availableCopies === 0) return { label: "All Issued", variant: "destructive" }
  if (book.availableCopies <= 2) return { label: "Low Stock", variant: "default" }
  return { label: "Available", variant: "secondary" }
}
