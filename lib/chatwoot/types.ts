export interface ChatwootIdentity {
  name: string
  email?: string | null
  userId?: string | number | null
  schoolId?: string | number | null
  schoolName?: string | null
  role?: string | null
}

export interface ChatwootPageContext {
  path: string
  section: string
}
