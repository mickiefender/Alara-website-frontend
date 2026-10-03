"use client"

import { KeyRound, ShieldCheck } from "lucide-react"
import { ProtectedRoute } from "@/lib/protected-route"
import { PasswordResetDirectory } from "@/components/password-reset-directory"
import { Toaster } from "@/components/ui/sonner"

export default function SchoolAdminPasswordResetPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <Toaster position="top-right" />
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account security</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Password Reset Center</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Securely reset passwords for students and teachers. Choose an account below and set a new password immediately.
                  </p>
                </div>
              </div>
              <div className="hidden rounded-xl border border-primary/15 bg-background/70 px-4 py-3 text-right sm:block">
                <KeyRound className="ml-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-xs font-medium text-muted-foreground">Minimum length</p>
                <p className="text-sm font-bold text-foreground">8 characters</p>
              </div>
            </div>
          </div>
        </div>

        <div className="stagger grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="mb-2 text-xl font-semibold text-foreground">Student Passwords</h2>
            <p className="mb-6 text-sm text-muted-foreground">Find a student account and reset its login password.</p>
            <PasswordResetDirectory role="student" />
          </div>
          <div className="glass-card p-6">
            <h2 className="mb-2 text-xl font-semibold text-foreground">Teacher Passwords</h2>
            <p className="mb-6 text-sm text-muted-foreground">Find a teacher account and reset its login password.</p>
            <PasswordResetDirectory role="teacher" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
