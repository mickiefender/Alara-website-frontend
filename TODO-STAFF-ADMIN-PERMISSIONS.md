# Staff Admin Permissions Implementation
## Status: ✅ In Progress

## Breakdown of Approved Plan:

### Phase 1: Core Sidebar Fixes ✅ Started
- [x] Create TODO.md with plan steps
- [x] 1. Update `frontend/lib/permissions.ts` - Add `NAV_HREF_TO_PERMISSION` mapping for exact matches ✅
- [ ] 2. Fix `frontend/components/sidebar-nav.tsx` filtering:
  | Use exact href-permission mapping
  | Remove unreliable heuristic
  | Ensure Dashboard always visible
  | Hide empty sections properly
  | Add debug logging
- [ ] Test sidebar with sample permissions

### Phase 2: Mobile Sync
- [ ] 3. Update `frontend/components/mobile-bottom-nav.tsx` to use same logic

### Phase 3: Route Protection
- [ ] 4. Add guards to `frontend/app/dashboard/layout.tsx`

### Phase 4: Cleanup
- [ ] 5. Remove/update TODO files:
  | TODO-STAF-ADMIN-PERMISSIONS-SIDEBAR.md
  | TODO-NAV-PERMISSIONS.md  
  | TODO-ADMIN-STAF-PERMISSIONS-FIX.md
  | Others

### Testing
- [ ] Create test staff admin accounts via manage-admin-staff
- [ ] Verify school admin unaffected
- [ ] Test all 29 permissions
- [ ] Mobile testing

**Next Step:** Update permissions.ts with href mapping

