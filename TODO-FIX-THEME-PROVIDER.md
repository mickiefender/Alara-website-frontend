# Fix ThemeProvider Script Tag Warning

## Status: In Progress

## Steps:

### 1. ✅ Plan approved and TODO created
### 2. ✅ Update theme-provider.tsx - Added themes prop, fixed TS
### 3. ✅ Update ClientProviders.tsx - Added themes prop
### 4. ✅ Update layout.tsx - Dynamic ClientProviders import (ssr: false), cleaned imports
### 5. ✅ Verify school-theme-provider.tsx DOM ops are in useEffect (no change needed)
### 6. Test: pnpm dev, check console for warnings, test theme toggle
### 7. Update status to ✅ COMPLETED

**Status: Awaiting Test**

**Verification Command:**
```bash
cd frontend && pnpm dev
```

**Expected Result:** No \"script tag\" warnings in console, themes work correctly.
