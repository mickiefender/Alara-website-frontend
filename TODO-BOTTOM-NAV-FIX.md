# Fix Bottom Nav Bar (Teacher/Student Portals) - Only 1 link showing instead of 4

## Status: ✅ COMPLETED

**Problem:** Mobile bottom nav shows only 1 link instead of 4 for teacher/student roles due to overzealous permission filtering.

**Root Cause:** 
- `mobile-bottom-nav.tsx` filters nav items by `user.permissions`
- Teacher/student roles lack required permissions like `manage_attendance`, `manage_grades`
- `MOBILE_NAV_PERMISSION_MAP` maps labels to admin permissions teachers don't have
- `.slice(0,4)` on heavily filtered array leaves only Dashboard

**Solution Implemented:**
1. ✅ Updated `filterMobileItem` logic in `mobile-bottom-nav.tsx`:
   - Bypass permission check for `teacher` and `student` roles (always show core 4 items)
   - Keep permission filtering for `admin_staff` roles
   - Ensure exactly 4 items display via `.slice(0,4)`
2. ✅ Preserved "More" menu access via `isMenu` flag

**Files Modified:**
- `frontend/components/mobile-bottom-nav.tsx`

**Testing:**
```
cd frontend
npm run dev
```
- Login as teacher/student
- Check mobile view (resize < 768px or device)
- Verify 4 bottom nav icons: Dashboard, Classes/Attendance/Grades etc + More

**Result:** Bottom nav now displays all 4 intended links for teacher/student portals.

**Next Steps:** None - Fixed ✅
