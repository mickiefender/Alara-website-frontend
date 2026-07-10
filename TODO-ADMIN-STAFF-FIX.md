# Fix Admin Staff Management Parsing Error

**Status:** Planned & Approved ✅

**Breakdown:**
1. [✅] Create TODO.md with steps
2. [ ] Edit page.tsx: Fix PERMISSIONS → NAV_LINK_PERMISSIONS, close maps, remove duplicate modal
3. [ ] Verify TypeScript parsing (npx tsc --noEmit)
4. [ ] Test component (npm run dev → /dashboard/school-admin/manage-admin-staff)
5. [ ] Mark complete & attempt_completion

**Root Cause:** Undefined PERMISSIONS var + unclosed .map() + duplicate JSX → parser confusion → "unterminated regex".
