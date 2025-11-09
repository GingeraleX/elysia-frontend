# Loading States & Spinners - Best Practices Guide

## Overview
This guide explains how to properly implement loading states throughout Enterprai using Elysia's professional loading system.

**Core Principle:** Loading states should ALWAYS be visible and provide user feedback. Never hide loading - make it professional and on-brand!

---

## Loading Components

### 1. **LoadingSpinner** - Main Spinner Component
Use this for all major loading operations.

```tsx
import { LoadingSpinner } from "@/app/components/loading/LoadingSpinner";

// Medium (default page transitions)
<LoadingSpinner size="medium" />

// Large (full-screen or major operations)
<LoadingSpinner size="large" />

// Small (inline with text)
<LoadingSpinner size="small" />

// Full-screen overlay
<LoadingSpinner size="medium" fullScreen />
```

**When to use:**
- ✅ Page transitions (dynamic imports)
- ✅ Loading collections from database
- ✅ Importing data
- ✅ Processing large operations
- ✅ Major UI state changes

**Styling:**
- Neon accent borders (teal/cyan from Elysia theme)
- Pulsing center dot
- Uses CSS variables (fully themed)
- Smooth `animate-spin` animation

---

### 2. **LoadingDots** - Inline/Button Loading
Use for button operations and inline status.

```tsx
import { LoadingDots } from "@/app/components/loading/LoadingSpinner";

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      Saving <LoadingDots />
    </>
  ) : (
    "Save"
  )}
</Button>
```

**When to use:**
- ✅ Form submission
- ✅ Configuration saving
- ✅ Quick operations
- ✅ Inline status updates

---

### 3. **SkeletonLoader** - Content Placeholder
Use when you need to show the shape of content while loading.

```tsx
import { SkeletonLoader } from "@/app/components/loading/LoadingSpinner";

<div className="space-y-4">
  <SkeletonLoader className="h-12 w-full" />
  <SkeletonLoader className="h-8 w-3/4" />
  <SkeletonLoader className="h-8 w-full" />
</div>
```

**When to use:**
- ✅ Content grids
- ✅ Lists before data loads
- ✅ Card placeholders
- ✅ Table rows

---

## Implementation Pattern

### Pattern 1: Full-Page Loading
```tsx
const { isLoading, data } = useContext(SomeContext);

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size="medium" />
    </div>
  );
}

return <YourContent data={data} />;
```

### Pattern 2: Conditional Display
```tsx
const { loadingCollections, collections } = useContext(CollectionContext);

return (
  <div className="flex-1">
    {loadingCollections ? (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoadingSpinner size="medium" />
        <p className="text-secondary text-sm">Loading collections...</p>
      </div>
    ) : (
      <CollectionsList collections={collections} />
    )}
  </div>
);
```

### Pattern 3: Loading with Context Text
```tsx
{loading && (
  <div className="flex flex-col items-center justify-center gap-4 p-12 rounded-lg border-2 border-dashed border-accent bg-accent/5">
    <LoadingSpinner size="medium" />
    <p className="text-secondary text-sm">Parsing file...</p>
  </div>
)}
```

### Pattern 4: Progress State
```tsx
{progress.status === "processing" && (
  <div className="space-y-4">
    <LoadingSpinner size="medium" />
    <div className="w-full h-2 rounded-full bg-foreground_alt overflow-hidden">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
      />
    </div>
    <p className="text-center text-secondary">{progressText}</p>
  </div>
)}
```

---

## Current Implementation Status

### ✅ Already Using Professional Loading
- **DataDashboard** - Shows LoadingSpinner while loading collections
- **ImportDataPage** - Shows LoadingSpinner while initializing
- **FileUploadSection** - Shows LoadingSpinner while parsing files
- **ImportProgressSection** - Shows LoadingSpinner during import

### 🔄 Contexts with Loading States
These contexts have `loading` states available:

1. **AuthContext**
   - `isLoading` - During auth checks
   - Use: Initial auth verification

2. **CollectionContext**
   - `loadingCollections` - While fetching collections
   - Use: Collections list display

3. **ConversationContext**
   - `loadingConversations` - While loading chat history
   - `loadingConversation` - While loading single conversation
   - Use: Chat history, current conversation

4. **SessionContext**
   - `loadingConfig` - While loading user config
   - `loadingConfigs` - While loading config list
   - Use: Settings panel, config selection

---

## CSS Variable Integration

All loading components use Elysia's CSS variables:

```tsx
// ✅ RIGHT - Uses CSS variables
<div className="border-accent border-t-accent border-r-accent animate-spin" />
<p className="text-secondary">Loading...</p>
<div className="bg-accent/10">Loading area</div>

// ❌ WRONG - Hardcoded colors
<div className="border-blue-500 animate-spin" />
<p className="text-gray-400">Loading...</p>
<div className="bg-blue-50">Loading area</div>
```

---

## Common Patterns to Implement

### 1. Loading in Collections List
**File:** `DataDashboard.tsx`
**Status:** ✅ DONE - Uses LoadingSpinner

**Example:**
```tsx
{loadingCollections ? (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <LoadingSpinner size="medium" />
    <p className="text-secondary text-sm">Loading collections...</p>
  </div>
) : (
  <CollectionsList />
)}
```

### 2. Loading in Conversations
**File:** `ChatPage.tsx`
**Status:** TODO - Should use LoadingSpinner

**Pattern:**
```tsx
const { loadingConversations, conversations } = useContext(ConversationContext);

{loadingConversations && <LoadingSpinner size="small" />}
```

### 3. Loading in Settings
**File:** `SettingsPage.tsx`
**Status:** TODO - Should use LoadingSpinner for config

**Pattern:**
```tsx
const { loadingConfig, userConfig } = useContext(SessionContext);

{loadingConfig && <LoadingSpinner size="medium" />}
```

### 4. Loading in Forms
**File:** Any form component
**Status:** TODO - Should use LoadingDots in buttons

**Pattern:**
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>Saving <LoadingDots /></>
  ) : (
    "Save"
  )}
</Button>
```

---

## Animation System

All animations are CSS-based in `globals.css`:

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes pulsing_color {
  0% { scale: 0.2; color: #a5ff90; }
  50% { scale: 0.4; color: #74d7ff; }
  100% { scale: 0.2; color: #a5ff90; }
}

.pulsing_color {
  animation: pulsing_color 5s ease-in-out infinite;
}
```

---

## Color System for Loading

### Elysia Theme Colors
- **Primary accent:** `bg-accent` (teal #4DD9D4)
- **Secondary highlight:** `bg-highlight` (cyan #4FBAFF)
- **Background:** `bg-background` (dark #171717)
- **Foreground:** `bg-foreground` (card bg #2D2D2D)
- **Text:** `text-primary` (white), `text-secondary` (gray)
- **Error:** `bg-error` (red #E23B7C)

### Spinner Colors
```tsx
// Main spinner border
<div className="border-border border-t-accent border-r-accent animate-spin" />

// Loading container background
<div className="bg-accent/5 border-accent">Loading...</div>

// Text
<p className="text-secondary">Loading...</p>
```

---

## Checklist for New Loading States

When implementing loading in a new feature:

- [ ] Identify all loading states (initial, processing, complete, error)
- [ ] Get loading flag from context or component state
- [ ] Choose appropriate loading component (Spinner, Dots, or Skeleton)
- [ ] Add proper UI structure around loading state
- [ ] Use Elysia CSS variables (never hardcode colors)
- [ ] Test loading state by slowing down API/network
- [ ] Add fade-in animation to loading container
- [ ] Provide user context text (e.g., "Loading collections...")
- [ ] Test error state (show error message with LoadingSpinner or message)
- [ ] Ensure loading state is visible and professional

---

## Example: Complete Data Loading Flow

```tsx
import { LoadingSpinner } from "@/app/components/loading/LoadingSpinner";

export function MyComponent() {
  const { data, loading, error, fetchData } = useCustomHook();

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="p-4 rounded-lg bg-background_error/10 border border-error">
          <p className="text-error text-sm">{error}</p>
        </div>
        <Button onClick={fetchData} className="bg-accent hover:bg-highlight">
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoadingSpinner size="medium" />
        <p className="text-secondary text-sm">Loading data...</p>
      </div>
    );
  }

  return <DataContent data={data} />;
}
```

---

## Tips & Tricks

1. **Always provide context** - Don't just show a spinner, tell user what's loading
2. **Use fade-in** - Add `.fade-in` class to loading containers
3. **Match container size** - Loading spinner should fill available space
4. **Error handling** - Always show error messages alongside loading logic
5. **Retry capability** - Allow users to retry if loading fails
6. **Progress feedback** - For long operations, show progress percentage
7. **Disable interactions** - Disable buttons/inputs while loading
8. **Test thoroughly** - Slow down network to test loading states

---

## Resources

- **LoadingSpinner Component:** `@/app/components/loading/LoadingSpinner.tsx`
- **Design System:** `DESIGN_SYSTEM.md`
- **Global Styles:** `app/globals.css`
- **Tailwind Config:** `tailwind.config.ts`

