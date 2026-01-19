---
name: design-system
description: Maintains visual consistency across TripVega components. Use when creating new UI elements, styling components, implementing themes, or ensuring design coherence. Provides color palette, spacing system, component patterns, and dark/light mode guidelines.
---

# TripVega Design System Skill

This skill ensures all UI elements are visually consistent, professional, and follow TripVega's premium aesthetic.

## Brand Identity

**TripVega** is a premium travel experiences platform. The design should feel:
- **Premium** - High-end, luxurious travel aesthetic
- **Modern** - Clean, contemporary UI patterns
- **Trustworthy** - Clear, reliable, professional
- **Adventurous** - Exciting, inspiring, dynamic

## Color Palette

### Primary Colors

| Name | Value | Usage |
|------|-------|-------|
| Primary | `#2B8CEE` | CTAs, links, accents |
| Primary Hover | `#1a7ad8` | Button hover states |
| Primary Light | `rgba(43, 140, 238, 0.1)` | Backgrounds, badges |

### Neutral Colors (Dark Theme)

| Name | Value | Usage |
|------|-------|-------|
| Background | `#0a0a0f` | Page background |
| Surface | `#12121a` | Base card/container background |
| Surface Elevated | `#1c2127` | Hovered cards, inputs, dropdowns |
| Border | `rgba(255, 255, 255, 0.08)` | Dividers, card borders |
| Text Primary | `#ffffff` | Headlines, important text |
| Text Secondary | `rgba(255, 255, 255, 0.7)` | Body text |
| Text Muted | `rgba(255, 255, 255, 0.5)` | Captions, hints |

### Neutral Colors (Light Theme)

| Name | Value | Usage |
|------|-------|-------|
| Background | `#f8fafc` | Page background |
| Surface | `#ffffff` | Cards, modals |
| Surface Elevated | `#f1f5f9` | Dropdowns, popovers |
| Border | `rgba(0, 0, 0, 0.1)` | Dividers, card borders |
| Text Primary | `#0f172a` | Headlines, important text |
| Text Secondary | `rgba(15, 23, 42, 0.7)` | Body text |
| Text Muted | `rgba(15, 23, 42, 0.5)` | Captions, hints |

### Semantic Colors

| Name | Value | Usage |
|------|-------|-------|
| Success | `#22c55e` | Confirmations, available |
| Warning | `#f59e0b` | Alerts, limited availability |
| Error | `#ef4444` | Errors, unavailable |
| Info | `#3b82f6` | Information notices |

### Gradients

```css
/* Hero gradient overlay */
.hero-gradient {
  background: linear-gradient(
    180deg,
    rgba(10, 10, 15, 0) 0%,
    rgba(10, 10, 15, 0.8) 100%
  );
}

/* AI Feature Gradient */
.gradient-ai {
  background: linear-gradient(to right, #2B8CEE, #06b6d4); /* Primary to Cyan-500 */
}

/* Primary button glow */
.primary-glow {
  box-shadow: 0 0 20px rgba(43, 140, 238, 0.4);
}

/* AI Feature Glow */
.ai-glow {
  box-shadow: 0 0 30px rgba(43, 140, 238, 0.25);
}

/* Card hover effect */
.card-glow {
  box-shadow: 0 0 30px rgba(43, 140, 238, 0.15);
}
```

## Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Inter', sans-serif;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 4rem (64px) | 700 | 1.1 | Hero headlines |
| H1 | 2.5rem (40px) | 700 | 1.2 | Page titles |
| H2 | 2rem (32px) | 600 | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 600 | 1.4 | Card titles |
| H4 | 1.25rem (20px) | 600 | 1.4 | Subheadings |
| Body | 1rem (16px) | 400 | 1.6 | Paragraphs |
| Small | 0.875rem (14px) | 400 | 1.5 | Captions, labels |
| XSmall | 0.75rem (12px) | 500 | 1.4 | Badges, meta |

## Spacing System

Use consistent spacing based on 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon gaps |
| `space-3` | 12px | Small padding |
| `space-4` | 16px | Standard padding |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section spacing |
| `space-12` | 48px | Large gaps |
| `space-16` | 64px | Section margins |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Buttons, inputs |
| `rounded` | 8px | Small cards |
| `rounded-lg` | 12px | Cards, modals |
| `rounded-xl` | 16px | Large containers |
| `rounded-2xl` | 24px | Hero cards |
| `rounded-full` | 9999px | Pills, avatars |

## Component Patterns

### Buttons

```tsx
// Primary Button (CTA)
<button className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,140,238,0.4)] hover:scale-105 active:scale-95">
  Book Now
</button>

// Secondary Button
<button className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full border border-white/10 transition-all duration-300">
  Learn More
</button>

// Ghost Button
<button className="h-10 px-4 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
  Cancel
</button>

// Icon Button
<button className="h-10 w-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
  <span className="material-symbols-outlined">search</span>
</button>
```

### Cards

```tsx
// Activity Card
<div className="group relative bg-card-dark rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(43,140,238,0.15)]">
  {/* Image with overlay */}
  <div className="relative aspect-[4/3] overflow-hidden">
    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="text-white/60 text-sm mt-2">{description}</p>
  </div>
</div>
```

### Glass Effect

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-strong {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Input Fields

```tsx
// Standard Input
<input
  type="text"
  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
  placeholder="Enter text..."
/>

// AI Magic Input
<div className="relative p-2 bg-surface-elevated/95 backdrop-blur-xl rounded-[2rem] border border-primary/30 ring-1 ring-primary/20 shadow-2xl">
  <input className="bg-transparent text-white ..." />
</div>
```

### Selection Cards (Interactive Options)

Used for preferences (e.g., Mobility, Budget).

```tsx
<button className={cn(
  "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
  isActive 
    ? "bg-surface-elevated border-primary/50 text-white shadow-lg" 
    : "bg-surface border-white/5 text-muted hover:bg-surface-elevated"
)}>
  <Icon className={cn("w-6 h-6 mb-2", isActive ? "text-primary" : "text-muted")} />
  <span className="font-bold text-sm">{label}</span>
  <span className="text-[10px] text-muted mt-1">{description}</span>
</button>
```

### Dropdowns

```tsx
<div className="absolute top-full right-0 mt-2 w-48 bg-card-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
  {items.map(item => (
    <button
      key={item.id}
      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors"
    >
      {item.label}
    </button>
  ))}
</div>
```

## Animation Guidelines

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro | 150ms | ease-out |
| Normal | 300ms | ease-in-out |
| Emphasis | 500ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Page | 700ms | cubic-bezier(0.4, 0, 0.2, 1) |

### Common Transitions

```css
/* Button hover */
transition: all 0.3s ease;

/* Card hover */
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* Image zoom */
transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);

/* Dropdown fade */
transition: opacity 0.2s ease, transform 0.2s ease;
```

### Hover Effects

1. **Scale Up**: `hover:scale-105` for buttons
2. **Glow**: `hover:shadow-[0_0_20px_rgba(43,140,238,0.4)]` for primary CTAs
3. **Border Highlight**: `hover:border-primary/30` for cards
4. **Image Zoom**: `group-hover:scale-110` for card images

## Dark/Light Mode

### Theme Variables

```css
:root {
  /* Light mode defaults */
  --background: 248 250 252;
  --foreground: 15 23 42;
  --card: 255 255 255;
  --primary: 43 140 238;
}

[data-theme="dark"] {
  --background: 10 10 15;
  --foreground: 255 255 255;
  --card: 18 18 26;
  --primary: 43 140 238;
}
```

### Using Theme Variables

```tsx
// Always use theme-aware classes
<div className="bg-background text-foreground">
  <div className="bg-card border border-white/10 dark:border-white/10 light:border-black/10">
    Content
  </div>
</div>
```

## Icons

Use **Material Symbols Outlined** for all icons:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
```

```tsx
<span className="material-symbols-outlined">search</span>
<span className="material-symbols-outlined">favorite</span>
<span className="material-symbols-outlined">star</span>
```

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| Small | `text-lg` (18px) | Inline with text |
| Default | `text-2xl` (24px) | Buttons, cards |
| Large | `text-3xl` (30px) | Feature icons |

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Single column |
| Tablet | 640px - 1024px | Two columns |
| Desktop | 1024px - 1280px | Three columns |
| Wide | > 1280px | Four columns, max-width |

```tsx
// Responsive grid example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

## Best Practices

### DO:
- ✅ Use CSS variables for colors (theme-aware)
- ✅ Apply hover/focus states to ALL interactive elements
- ✅ Use consistent spacing (multiples of 4px)
- ✅ Add smooth transitions to state changes
- ✅ Test components in both light and dark modes

### DON'T:
- ❌ Use hardcoded colors (use variables)
- ❌ Mix spacing units (stick to rem)
- ❌ Create new shades without documenting
- ❌ Skip hover/focus states on buttons
- ❌ Use instant transitions (always animate)

## Accessibility & Visual Contrast

### Core Principle: The Background-Foreground Contract
**NEVER** assume a background color. **ALWAYS** explicitly define the relationship between text and its container.
- If text is `text-white`, the container **MUST** have a dark background (e.g., `bg-black`, `bg-slate-900`, `bg-primary`) OR a dark overlay.
- If text is `text-black`, the container **MUST** have a light background.

### Contrast Ratios (The Golden Rules)
Adhere to WCAG 2.1 AA standards:
- **Normal Text**: Minimum 4.5:1 contrast ratio.
- **Large Text (18pt+ or bold 14pt+)**: Minimum 3:1 contrast ratio.
- **UI Components (Borders, Icons)**: Minimum 3:1 contrast ratio.

### Dynamic Theme Handling
Avoid hardcoded colors like `text-white` or `bg-white` unless the element is explicitly static (always dark/light regardless of theme).

**✅ Correct Pattern (Semantic Colors)**
Use CSS variables or Tailwind utility classes that adapt to the theme.
```tsx
// Good: Adapts to theme (Dark text on light bg in Light Mode, Light text on dark bg in Dark Mode)
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Content</p>
</div>
```

**❌ Incorrect Pattern (static colors in dynamic context)**
```tsx
// BAD: Text disappears in Light Mode if parent is white/light
<div className="text-white dark:text-white">
  Content
</div>
```

### Text on Images
Text adhering to a background image is the most common cause of readability failures.

**Strategy A: Dark Overlay (Recommended)**
Apply a semi-transparent dark layer over the image to ensure white text pops.
```tsx
<div className="relative rounded-xl overflow-hidden">
  <img src="..." className="w-full h-full object-cover" />
  {/* Overlay essential for contrast */}
  <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors" />
  <div className="absolute bottom-0 left-0 p-4">
    <h3 className="text-white font-bold">Readable Title</h3>
  </div>
</div>
```

**Strategy B: Gradient Overlay**
Fade from transparent to dark at the bottom where text sits.
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
```

### General Checklist
- **Focus indicators**: Always visible, use `ring-2 ring-primary/50`
- **Touch targets**: Minimum 44x44px on mobile
- **Motion**: Respect `prefers-reduced-motion`
- **Light Mode Check**: Is any text forced to white on a potentially light background?
- **Dark Mode Check**: Is any text forced to black on a potentially dark background?
