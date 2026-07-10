# Fix SchoolThemeProvider useCallback Error (45:24)

## Status: In Progress

## Steps:

### 1. ✅ Plan approved
### 2. ✅ Create this TODO.md
### 3. ✅ Update school-theme-provider.tsx: Remove useCallback from fetchSchoolTheme, fix useEffect deps
### 4. ✅ Test: cd frontend && pnpm dev → No React hook warnings
### 5. ✅ COMPLETED

**Verification Command:**
```bash
cd frontend && pnpm dev
```

**Expected Result:** No ESLint/React warnings for async useCallback, school theme loads correctly (check CSS vars --school-primary etc.)

