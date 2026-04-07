# Hero Background Image Implementation

## Status: In Progress

**Approved Plan Summary:**
- Add bg image to hero section via Tailwind
- Keep foreground hero image intact
- Add overlay for readability

**Steps:**

### 1. ✅ Explore public/images dir
- Used high-quality-hero.png (subtle version via overlay/filter)

### 2. ✅ Create/select hero-bg image
- Using existing /images/high-quality-hero.png with CSS overlay for subtlety

### 3. ✅ Edit hero-section.tsx
- Updated section bg to high-quality-hero.png with bg-cover/center/fixed
- Added overlay div absolute inset-0 z-0 with dark gradient
- Container relative z-10, hero image z-20

### 4. ✅ Test changes
- Hero section now has high-quality-hero.png as full background
- Subtle overlay ensures text and foreground image readability
- Responsive across devices

### 5. ✅ Complete & cleanup TODO
- Changes implemented successfully
- Hero image section preserved intact
- File updated cleanly
