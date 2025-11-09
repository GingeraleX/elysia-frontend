# FullScreenLoader - Modular Loading Component

## Overview
Professional, reusable loading component with multiple variations and custom messages. Perfect for replacing all generic loading states throughout the app.

---

## Usage

### 1. **Full-Screen Loader with Custom Message**
```tsx
import { FullScreenLoader } from "@/app/components/loading/FullScreenLoader";

// Default spinner
<FullScreenLoader message="Loading your data..." />

// With icon animation
<FullScreenLoader 
  message="Loading your config..." 
  icon="config"  // ⚙️ rotating gear
/>

<FullScreenLoader 
  message="Importing data..." 
  icon="import"  // 📥 pulsing up arrow
/>

<FullScreenLoader 
  message="Fetching collections..." 
  icon="data"    // 📊 scaling chart
/>
```

### 2. **Compact Inline Loader**
```tsx
import { CompactLoader } from "@/app/components/loading/FullScreenLoader";

// In a section
<div className="flex-1">
  {isLoading ? (
    <CompactLoader message="Loading..." size="medium" />
  ) : (
    <Content />
  )}
</div>

// Different sizes
<CompactLoader message="Small" size="small" />
<CompactLoader message="Medium" size="medium" />
<CompactLoader message="Large" size="large" />
```

---

## Icon Types

### Available Icons
1. **`"default"`** - Neon spinning ring (tech aesthetic)
2. **`"config"`** - ⚙️ Rotating gear (settings/config)
3. **`"import"`** - 📥 Pulsing upload arrow (data import)
4. **`"data"`** - 📊 Scaling chart (data loading)

---

## Component Features

### FullScreenLoader
- ✅ Full-screen overlay with backdrop blur
- ✅ Smooth fade-in animation
- ✅ Animated spinner or icon
- ✅ Branding ("Enterprise AI")
- ✅ Custom message with pulse animation
- ✅ Animated loading dots
- ✅ Subtle "Please wait..." text
- ✅ Elysia color system integration

### CompactLoader
- ✅ Inline loading indicator
- ✅ Three size options
- ✅ Optional message
- ✅ Neon accent colors
- ✅ Pulsing animation
- ✅ Lightweight

---

## Examples

### Example 1: Initial App Loading
```tsx
// In page.tsx
if (isLoading) {
  return <FullScreenLoader message="Loading your config..." icon="config" />;
}
```

### Example 2: Import Data Flow
```tsx
// In ImportDataPage.tsx
{isImporting && (
  <FullScreenLoader message="Importing data..." icon="import" />
)}
```

### Example 3: Collections Loading
```tsx
// In DataPage.tsx
{loadingCollections ? (
  <FullScreenLoader message="Fetching collections..." icon="data" />
) : (
  <CollectionsList />
)}
```

### Example 4: In-Page Compact Loading
```tsx
// In SettingsPage.tsx
{loadingConfig ? (
  <div className="flex items-center justify-center h-64">
    <CompactLoader message="Loading configuration..." size="large" />
  </div>
) : (
  <ConfigContent />
)}
```

---

## Animation Details

### FullScreenLoader Animations
- **Container**: Fade-in (0-1s)
- **Icon**: Varies by type:
  - Config: Rotation (3s continuous)
  - Import: Vertical bounce (1.5s continuous)
  - Data: Scale pulse (1.5s continuous)
  - Default: Spinner rotation (smooth)
- **Message**: Opacity pulse (2s continuous)
- **Dots**: Staggered scale + opacity (1s per dot, 0.2s offset)
- **Footer**: Fade-in delayed (0.3s)

### CompactLoader Animations
- **Container**: Fade-in (0-1s)
- **Spinner**: Rotation (continuous)
- **Message**: Opacity pulse (1.5s continuous)

---

## Styling

All components use Elysia's CSS variable system:
- **Background**: `bg-background/90`
- **Backdrop**: `backdrop-blur-md`
- **Text**: `text-primary`, `text-secondary`
- **Accent**: `border-accent`
- **Animation**: Smooth curves with Framer Motion

---

## Color Breakdown

### Visual Hierarchy
1. **Primary Text**: "Enterprise AI" - `text-primary` (white)
2. **Secondary Text**: Message - `text-secondary` (gray)
3. **Accent**: Spinner ring, dots - `border-accent`, `bg-accent` (neon teal)
4. **Background**: Overlay - `bg-background/90` with blur
5. **Border**: Ring - `border-border` (dark gray)

---

## Best Practices

1. **Choose the Right Icon**
   - ✅ `"config"` for settings/initialization
   - ✅ `"import"` for data import
   - ✅ `"data"` for fetching collections
   - ✅ `"default"` for generic loading

2. **Message Selection**
   - Be specific: "Loading your config..." not just "Loading..."
   - Keep it short: 1-2 sentences max
   - Use sentence case

3. **Placement**
   - Use `FullScreenLoader` for app-level operations (auth, init)
   - Use `CompactLoader` for in-page operations
   - Never overlap multiple loaders

4. **Transition**
   - Loaders auto fade-out when hidden
   - Smooth transition to actual content
   - No jarring layout shifts

---

## Migration Guide

### Old Way ❌
```tsx
<div className="flex items-center justify-center h-screen">
  <div className="h-16 w-16 border-4 border-border border-t-accent animate-spin" />
  <p className="text-secondary">Loading...</p>
</div>
```

### New Way ✅
```tsx
<FullScreenLoader message="Loading..." icon="config" />
```

---

## Files

- **Component**: `app/components/loading/FullScreenLoader.tsx`
- **Import**: `import { FullScreenLoader, CompactLoader } from "@/app/components/loading/FullScreenLoader"`

---

## Future Enhancements

Possible additions:
- [ ] Progress percentage display (0-100%)
- [ ] Cancel button for long operations
- [ ] Error state overlay
- [ ] Custom icon/emoji support
- [ ] Sound effects option
- [ ] Tooltip hints

---

**Professional, elegant, reusable. One component for all loading states! 🚀**

