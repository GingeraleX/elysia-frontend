# Elysia Design System Guide (ACTUAL)

## Overview
This document describes the **actual** Elysia frontend design system using CSS variables for a cohesive, themeable color system.

---

## Color System (CSS Variables)

Elysia uses **CSS custom properties** for all colors, enabling easy theme changes:

### Background Colors
- **`--background`**: `0 0% 9%` (dark background, #171717)
- **`--background_alt`**: `0 0% 14%` (lighter background, #242424)
- **`--foreground`**: `0 0% 18%` (card/container background, #2D2D2D)
- **`--foreground_alt`**: `0 0% 20%` (slightly lighter container, #333333)

### Text & Primary
- **`--primary`**: `0 0% 95%` (text color, nearly white, #F2F2F2)
- **`--secondary`**: `0 0% 50%` (medium gray, #808080)

### Accents (Neon Colors)
- **`--accent`**: `151 46% 51%` (bright teal/cyan, #4DD9D4) - PRIMARY ACCENT
- **`--background_accent`**: `151 52% 28%` (darker teal, #15917B) - accent backgrounds
- **`--accent-foreground`**: `134 80% 32%` (darker green, #0FB849) - foreground on accent
- **`--highlight`**: `202 54% 59%` (bright cyan/blue, #4FBAFF) - secondary highlight
- **`--alt_color_a`**: `172 83% 55%` (bright cyan, #5AF2E0)
- **`--alt_color_b`**: `71 61% 64%` (bright green, #B3FF5C)

### Error & Warning
- **`--error`**: `353 49% 44%` (red, #E23B7C)
- **`--background_error`**: `340 52% 25%` (dark red, #7F1B47)
- **`--warning`**: `18 72% 49%` (orange, #FF9934)

### Border & UI
- **`--border`**: `0 0% 31%` (gray border, #4F4F4F)
- **`--radius`**: `0.5rem` (default border radius, 8px)

---

## Component Patterns

### Page Wrapper
```tsx
<div className="bg-background text-primary min-h-screen">
  {/* Content */}
</div>
```

### Cards
```tsx
<Card className="bg-foreground border-border">
  {/* Card content */}
</Card>
```

### Form Inputs
```tsx
<Input
  className="bg-background_alt border-border text-primary placeholder:text-secondary"
  placeholder="your text"
/>
```

### Buttons
```tsx
// Primary Button (accent)
<Button className="bg-accent text-background hover:bg-highlight">
  Button Text
</Button>

// Secondary/Outline
<Button
  variant="outline"
  className="border-border text-primary hover:bg-foreground_alt"
>
  Button Text
</Button>
```

### Navigation
```tsx
<nav className="bg-background_alt border-b border-border">
  {/* Nav content */}
</nav>
```

### Containers & Sections
```tsx
<div className="bg-foreground border border-border p-4 rounded-lg">
  {/* Section content */}
</div>
```

---

## Animation System

### Fade-in Animation
- **CSS Class:** `.fade-in`
- **Duration:** 0.5s
- **Easing:** ease-in-out

```tsx
<div className="fade-in">
  {/* Content fades in on mount */}
</div>
```

### Chat Animation (Drop & Bounce)
```tsx
<div className="chat-animation">
  {/* Drops down with bounce effect */}
</div>
```

### Shine Effect
```tsx
<span className="shine">Shiny Text</span>
```

### Pulsing Effects
```tsx
<div className="pulsing">Pulse with gray/white</div>
<div className="pulsing_color">Pulse with green/cyan</div>
```

### Button Interactions
- **Default:** Uses Tailwind's `hover:` and `active:` states
- **Scale animations:** `hover:scale-105 active:scale-95`
- **Transitions:** `transition-all duration-300`

---

## Typography

### Sizes (from tailwind.config)
- **`text-xs`**: 0.75rem (12px)
- **`text-sm`**: 0.875rem (14px)
- **`text-base`**: 1rem (16px) - default body
- **`text-lg`**: 1.125rem (18px)
- **`text-xl`**: 1.25rem (20px)
- **`text-2xl`**: 1.5rem (24px)
- **`text-3xl`**: 1.875rem (30px) - section headers
- **`text-4xl`**: 2.25rem (36px)
- **`text-5xl`**: 3rem (48px) - page title
- **`text-6xl`**: 3.75rem (60px)

### Colors
- **Headings:** `text-primary` (white)
- **Body text:** `text-primary` (white)
- **Secondary text:** `text-secondary` (gray)
- **Accent text:** `text-accent` (teal)

### Font Families
- **Text:** `var(--font-text)` (system font)
- **Heading:** `var(--font-heading)` (system font)

---

## Button Classes (from globals.css)

### `.btn` - Main Button
```
flex items-center cursor-pointer gap-2 
hover:bg-foreground_alt hover:text-primary 
hover:scale-105 active:scale-95 
transition-all duration-300 p-3 rounded-lg
```

### `.btn-static` - Static Button (no scale)
```
flex items-center cursor-pointer gap-2 
hover:bg-foreground_alt hover:text-primary 
transition-all duration-300 p-2 rounded-lg
```

### `.btn-round` - Circular Button
```
flex items-center cursor-pointer justify-start gap-2 
hover:bg-foreground_alt hover:text-primary 
hover:scale-105 active:scale-95 
transition-all duration-300 p-2 rounded-full
```

---

## Spacing & Layout

### Standard Padding
- **Small:** `p-2` (8px)
- **Medium:** `p-3` (12px), `p-4` (16px)
- **Large:** `p-6` (24px)

### Standard Gaps
- **Grid:** `gap-4` or `gap-6`
- **Flex:** `gap-2` or `gap-3`

### Responsive Breakpoints
- **Mobile:** default (no breakpoint)
- **Tablet:** `md:` (768px)
- **Desktop:** `lg:` (1024px)

---

## Icons & Graphics

### Icon Library
- **Primary:** `react-icons` (MdChatBubbleOutline, etc.)
- **Lucide:** `lucide-react` (for radix UI components)

### Common Icon Sizing
- **Standard:** `text-lg` or `h-6 w-6`
- **Small:** `text-sm` or `h-4 w-4`
- **Large:** `text-2xl` or `h-8 w-8`

### Icon Colors
- **Default:** `text-primary` (white)
- **Accent:** `text-accent` (teal)
- **Secondary:** `text-secondary` (gray)
- **Error:** `text-error` (red)
- **Warning:** `text-warning` (orange)

---

## State Indicators

### Loading States
- Button text changes: "Loading...", "Saving..."
- Button disabled: `disabled={isLoading}`
- Consider using opacity: `opacity-50` on disabled

### Error States
- Background: `bg-background_error`
- Text: `text-error`
- Border: `border-error`
- Use ToastContext for error toasts

### Success States
- Text: `text-accent` (teal)
- Use ToastContext for success toasts

### Hover States
- Background: `hover:bg-foreground_alt`
- Border: `hover:border-border` or colored
- Scale: `hover:scale-105`
- Transition: `transition-all duration-300`

---

## Loading States & Spinners

Elysia uses a professional loading system with neon accents matching the design system.

### Components

#### 1. `LoadingSpinner` (Main Spinner)
```tsx
import { LoadingSpinner } from "@/app/components/loading/LoadingSpinner";

// Page-level loading
<LoadingSpinner size="large" />

// Inline loading
<LoadingSpinner size="small" />

// Full-screen overlay
<LoadingSpinner size="medium" fullScreen />
```

**Sizes:**
- `small`: h-6 w-6 (inline, inline buttons)
- `medium`: h-10 w-10 (default, page transitions)
- `large`: h-16 w-16 (full-screen, major operations)

**Features:**
- ✅ Neon accent border (`border-t-accent border-r-accent`)
- ✅ Gray border (`border-border`) for subtle base
- ✅ Pulsing dot in center
- ✅ Uses CSS variables (themed)
- ✅ Smooth `animate-spin` from Tailwind

#### 2. `PageLoader` (Dynamic Import Loading)
```tsx
// Automatically shown when pages load dynamically
const ChatPage = dynamic(() => import("./pages/ChatPage"), {
  loading: () => <PageLoader />
});
```

Displays loading spinner with proper height for page transitions.

#### 3. `LoadingDots` (Button/Inline Loading)
```tsx
import { LoadingDots } from "@/app/components/loading/LoadingSpinner";

<button>
  {isLoading ? (
    <>
      Saving <LoadingDots />
    </>
  ) : (
    "Save"
  )}
</button>
```

Three pulsing dots with staggered animation.

#### 4. `SkeletonLoader` (Content Placeholder)
```tsx
import { SkeletonLoader } from "@/app/components/loading/LoadingSpinner";

// While loading content
<SkeletonLoader className="h-12 w-full mb-4" />
<SkeletonLoader className="h-8 w-3/4" />
```

Animated placeholder that matches card background.

### Animation Keyframes

All animations are defined in `globals.css`:

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes pulsing {
  0% { scale: 0.2; color: #4e4e4e; }
  50% { scale: 0.4; color: #fff; }
  100% { scale: 0.2; color: #4e4e4e; }
}

@keyframes pulsing_color {
  0% { scale: 0.2; color: #a5ff90; }
  50% { scale: 0.4; color: #74d7ff; }
  100% { scale: 0.2; color: #a5ff90; }
}
```

### CSS Classes

- **`.fade-in`**: Smooth opacity transition (0.5s)
- **`.fade-out`**: Fade out animation (0.5s)
- **`.pulsing`**: Gray/white pulse effect (5s loop)
- **`.pulsing_color`**: Green/cyan pulse effect (5s loop)
- **`.chat-animation`**: Drop and bounce effect (0.6s)
- **`.animate-spin`**: Built-in Tailwind spin (default 1s)

### Best Practices

1. **Use LoadingSpinner for page-level loading**
   ```tsx
   if (isLoading) return <LoadingSpinner size="large" />;
   ```

2. **Use LoadingDots for button operations**
   ```tsx
   <button>{isLoading ? <LoadingDots /> : "Save"}</button>
   ```

3. **Use SkeletonLoader for content placeholders**
   ```tsx
   {isLoading ? <SkeletonLoader /> : <ActualContent />}
   ```

4. **Always provide context**
   ```tsx
   <div className="text-center">
     <LoadingSpinner size="medium" />
     <p className="text-secondary mt-2">Saving your data...</p>
   </div>
   ```

5. **Never hardcode colors**
   ```tsx
   // ❌ WRONG
   <div className="border-b-2 border-blue-500 animate-spin" />
   
   // ✅ RIGHT
   <div className="border-t-accent border-r-accent animate-spin" />
   ```

### Color System for Spinners

- **Spinner ring:** `border-border` (gray) + `border-t-accent` + `border-r-accent` (neon teal/cyan)
- **Pulsing dot:** `bg-accent` (neon teal)
- **Text:** `text-secondary` (gray)

### Examples

**Page Transition Loading:**
```tsx
const ChatPage = dynamic(() => import("./pages/ChatPage"), {
  loading: () => <PageLoader />
});
```

**Full-Screen Loading (during auth):**
```tsx
if (isLoading) {
  return <LoadingSpinner fullScreen size="medium" />;
}
```

**Button with Loading State:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? <>Saving <LoadingDots /></> : "Save"}
</Button>
```

**Content Placeholder:**
```tsx
{isLoading ? (
  <div className="space-y-4">
    <SkeletonLoader className="h-12 w-full" />
    <SkeletonLoader className="h-8 w-3/4" />
  </div>
) : (
  <ActualContent />
)}
```

