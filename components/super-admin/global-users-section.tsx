"use client"

import type { AnyObj, UserFilters } from "./types"

type Props = {
  users: AnyObj[]
  userFilters: UserFilters
  setUserFilters: React.Dispatch<React.SetStateAction<UserFilters>>
  resetPasswordState: { [k: number]: string }
  setResetPasswordState: React.Dispatch<React.SetStateAction<{ [k: number]: string }>>
  onFilterUsers: () => Promise<void>
  onBan: (id: number) => Promise<void>
  onSuspend: (id: number) => Promise<void>
  onResetPassword: (id: number) => Promise<void>
  onAssignRole: (id: number, role: string) => Promise<void>
}

export default function GlobalUsersSection({
  users,
  userFilters,
  setUserFilters,
  resetPasswordState,
  setResetPasswordState,
  onFilterUsers,
  onBan,
  onSuspend,
  onResetPassword,
  onAssignRole,
}: Props) {
  return (
    <section id="global-users">
      <h2 className="text-xl font-semibold mb-2">Manage All Users</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          className="border rounded px-2 py-1"
          placeholder="Filter school_id"
          value={userFilters.school_id}
          onChange={(e) => setUserFilters((s) => ({ ...s, school_id: e.target.value }))}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Filter role"
          value={userFilters.role}
          onChange={(e) => setUserFilters((s) => ({ ...s, role: e.target.value }))}
        />
        <button className="border rounded px-3 py-1" onClick={onFilterUsers}>
          Apply Filters
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">School</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: AnyObj) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.first_name} {u.last_name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.school_id || "-"}</td>
                <td className="p-2">{String(u.is_active_user)}</td>
                <td className="p-2 space-x-2">
                  <button className="border rounded px-2 py-1" onClick={() => onBan(u.id)}>Ban</button>
                  <button className="border rounded px-2 py-1" onClick={() => onSuspend(u.id)}>Suspend</button>
                  <select className="border rounded px-2 py-1" onChange={(e) => onAssignRole(u.id, e.target.value)} defaultValue="">
                    <option value="" disabled>Assign role</option>
                    <option value="ct_admin_support">support staff</option>
                    <option value="academic_admin">moderator (academic)</option>
                    <option value="exam_officer">moderator (exam)</option>
                    <option value="finance_officer">moderator (finance)</option>
                  </select>
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="new password"
                    value={resetPasswordState[u.id] || ""}
                    onChange={(e) => setResetPasswordState((s) => ({ ...s, [u.id]: e.target.value }))}
                  />
                  <button className="border rounded px-2 py-1" onClick={() => onResetPassword(u.id)}>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
