# Fix API 401 Redirect on Landing Page (Unauthorized /api/schools/schools/)

**Status**: 🔄 In Progress

## Root Cause
SchoolThemeProvider unconditionally calls `schoolsAPI.list()` on app mount → 401 on public pages → auth redirect

## Implementation Steps

- [ ] **1. Create/update this TODO** ✅
- ✅ **2. Edit `frontend/components/school-theme-provider.tsx`** ✅
- ✅ **3. Edit `frontend/lib/auth-context.tsx`** ✅
- ✅ **4. Test landing page** ✅
  - ✅ Loads without API call/redirect (confirmed: SchoolThemeProvider skips fetch on !isAuthenticated)
  - ✅ Dashboard shows theme when logged in
- ✅ **5. Verify no regressions** (auth flow intact, theme applies correctly)
- ✅ **6. Complete!** 🎉

**Summary**: Landing page now public. School theme loads only post-auth with graceful defaults.

**Expected Result**: Landing page fully public, theme fetches only post-auth

