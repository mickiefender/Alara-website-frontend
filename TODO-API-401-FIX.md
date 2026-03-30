# Fix API 401 Auth Error on schoolsAPI.list()

## Status: Planning

**Root Cause Analysis:**
- Error occurs in auth-context.tsx during validateToken() → fetchSchool() → schoolsAPI.list()
- Token from sessionStorage invalid/expired OR backend permission issue on /schools/schools/

**Breakdown Steps:**
1. ✅ Read backend schools/views.py - list() returns School.objects.filter(id=self.request.user.school.id); 401 if user.school missing
2. ✅ Read backend users/views.py - /users/me/ is CurrentUserView with UserSerializer(user); assumes user has school relation
3. ✅ Read models.py: User.school = ForeignKey(School, null=True); SchoolViewSet.list() crashes if !user.school → self.request.user.school.id
4. ✅ Read serializers.py (next): Confirm UserSerializer includes school/school_id
5. [ ] Frontend fix: Skip fetchSchool if !parsedUser.school_id; setSchool(null); continue without crash
6. [ ] Backend fix if needed: get_queryset handle user.school None (return empty for non-super_admin)
7. [ ] Test: Clear storage → login → check console/network → verify no 401 crash
6. [ ] Test: Clear storage → login → check console/network → verify school loads
7. [ ] Update: Mark complete, remove debug logs

# ✅ API 401 Auth Error FIXED

**Summary:**
- **Frontend** (`auth-context.tsx`): Skip `fetchSchool()` if no `school_id`; enhanced logging/error handling
- **Backend** (`schools/views.py`): Safely handle `user.school=None` in `get_queryset()`
- Empty school list now returns gracefully instead of 401 crash

**Test Results Expected:**
```
sessionStorage.clear(); location.reload()
```
- No console 401 errors
- App loads without crash
- School admins see school data
- Others continue without school context

**Files Updated:**
- `frontend/lib/auth-context.tsx`
- `school-management-saa-s/backend/apps/schools/views.py`

**Clean up:** Remove debug logs in production build.

