export interface TeamApplication {
  id: string
  name: string
  email: string
  phone?: string
  positions: string[]
  cover_letter?: string
  status: 'pending' | 'reviewed' | 'contacted' | 'hired' | 'rejected'
  viewed: boolean
  created_at: string
}

export interface NewTeamApplication {
  name: string
  email: string
  phone?: string
  positions: string[]
  cover_letter?: string
}

// Available positions
export const TEAM_POSITIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Social Media Manager',
  'UI/UX Designer',
  'Product Manager',
  'Content Creator',
  'School Ambassador',
  'Sales Representative',
  'Customer Support',
  'Marketing',
  'Event/Launch Coordinator',
  'PR & Outreach',
  'Data Analyst',
  'Product Tester (QA)',
  'Other'
] as const;
