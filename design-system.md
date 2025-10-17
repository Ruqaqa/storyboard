# Ruqaqa Design System

> **Note:** This design system references styles defined in `/src/app/(frontend)/[locale]/globals.css`

> **Theme update note:** the app is using **dark theme** as the primary and only theme.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Implementation Rules](#implementation-rules)
3. [Design Principle](#design-principle)
4. [Implementation Guidelines](#implementation-guidelines)
   - [Core Principles](#core-implementation-principles)
   - [Best Practices](#best-practices)
   - [Component Implementation](#component-implementation)
   - [Accessibility](#accessibility-implementation)
5. [Color Combination Patterns](#color-combination-patterns)
6. [Responsive Design](#responsive-design)
   - [Core Principles](#core-principles)
   - [Implementation Guidelines](#implementation-guidelines-1)

## Design Tokens

```
@system_design_tokens {
  brand: "ruqaqa"
  version: "1.0"
  
  colors: {
    primary: "#1428a0"
    secondary: "#00a9e0"
    accent: "#20858f"
    green: "#208f5a"
    background: {
      start: "#f6f8fd"
      end: "#ffffff"
    }
  }

  gradients: {
    primary: "linear-gradient(90deg, #1428a0, #00a9e0)"
    hover: "linear-gradient(45deg, #1428a0, #20858f)"
    accent_green: "linear-gradient(45deg, #20858f, #208f5a)"
    background: "linear-gradient(135deg, #f6f8fd, #ffffff)"
  }

  interactions: {
    accent_usage: ["hover", "overlay", "feedback"]
    green_usage: ["success", "environmental", "sustainability", "growth"]
    transitions: {
      duration: "0.3s"
      timing: "ease"
    }
    hover_transform: "translateY(-10px)"
    icon_rotation: "45deg"
  }

  components: {
    card: {
      radius: "20px"
      shadow: "0 2px 4px rgba(0,0,0,0.1)"
      hover_shadow: "0 15px 30px rgba(0,0,0,0.1)"
      structure: ["icon", "title", "description"]
    }
    icon: {
      base_color: "@gradients.primary"
      hover_color: "@gradients.hover"
      animation: "@interactions.icon_rotation"
    }
  }

  hierarchy: {
    primary: "@gradients.primary"
    secondary: "white"
    tertiary: "@colors.accent"
    background: "@gradients.background"
  }

  rules: {
    accent_usage: "enhance_not_dominate"
    primary_dominance: true
    animation_subtlety: true
    whitespace_priority: high
    grid_based: true
  }

  accessibility: {
    contrast_ratio: "WCAG_AAA"
    touch_target: "44px"
    focus_visible: true
    text_scaling: true
  }
}
```

## Implementation Rules

```
@implementation_rules {
  primary_color_usage: "maintain_dominance"
  accent_color_usage: "transition_only"
  gradient_direction: "preserve_specified"
  animation_performance: "transform_opacity_preferred"
  responsive_behavior: "maintain_hierarchy"
}
```

## Design Principle

```
@design_principle: "enhance_not_compete"
```

## Implementation Guidelines

This section outlines the recommended approach for implementing Ruqaqa's design system consistently across components.

### Core Implementation Principles

1. **Consistency First:** Always use design tokens (CSS variables) instead of hardcoded values
2. **Visual Hierarchy:** Maintain proper contrast and readability across all components
3. **Technology Stack:** This project uses Next.js with Tailwind CSS as the primary styling solution, complemented by custom CSS such as `globals.css`

### Best Practices

#### Color Variables

Always prefer using Tailwind classes with CSS variables over hardcoded values:

```tsx
// ❌ Bad - Hardcoded values
<div className="text-[#1428a0]">Primary Text</div>

// ✅ Good - Using Tailwind classes with CSS variables
<div className="text-primary">Primary Text</div>
```

#### Opacity Variants

When you need to apply opacity to a color:

```tsx
// ❌ Bad - Hardcoded color with opacity
<div className="text-[#1428a0] opacity-80">Semi-transparent text</div>

// ✅ Good - Using Tailwind opacity modifier
<div className="text-primary/80">Semi-transparent text</div>
```

#### Gradients

For gradient backgrounds:

```tsx
// ❌ Bad - Hardcoded gradient
<div className="bg-gradient-to-r from-[#00a9e0] to-[#1428a0]">...</div>

// ✅ Good - Using utility class
<div className="gradient-primary">...</div>
```

#### Responsive Design with Tailwind

Leverage Tailwind's responsive prefixes for consistent responsive behavior:

```tsx
// ✅ Good - Using Tailwind responsive prefixes
<div className="w-full md:w-1/2 lg:w-1/3">...</div>

// ✅ Good - For complex layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">...</div>
```

#### Extending Tailwind in globals.css

For design patterns that are used frequently, consider adding custom utilities to `globals.css` or other .css files in the project:

```css
/* In globals.css */
@layer utilities {
  .card-shadow {
    box-shadow: var(--shadow-card);
  }
  
  .hover-lift {
    @apply transition-transform duration-300 ease-in-out hover:translate-y-[-10px];
  }
}

/* Usage in components */
<div className="card-shadow hover-lift">...</div>
```

### Component Implementation

When creating or updating components:

1. Use appropriate color schemes from the design tokens
2. Ensure readability with proper contrast
3. Maintain consistent spacing and layout patterns

### Accessibility Implementation

- Maintain a minimum contrast ratio of 4.5:1 for text
- Use semantic HTML elements
- Ensure interactive elements have sufficient touch targets (44px minimum)
- Test components with keyboard navigation

By following these guidelines, we can maintain a consistent design language across the Ruqaqa website while ensuring flexibility for future updates.

## Color Combination Patterns

The Ruqaqa design system strategically employs color combinations to create visual hierarchy and enhance user experience while maintaining brand coherence. The primary color combination pattern is the blue-green accent mix.

### Blue-Green Accent Mix

While blue remains the dominant brand color, green is strategically used as an accent color to emphasize growth, sustainability, and premium quality. The blue-green mix follows specific implementation patterns:

#### Card Highlighting Pattern

In multi-card layouts (like ValueProposition and MarketsSection blocks), an alternating pattern is recommended:
- Primary cards (typically positioned at 1st and 3rd positions) use green accenting with:
  - Green border with 20% opacity
  - Green shadow effect (shadow-green/10)
  - Green gradient background glow
  - Green icon background with border
  - Green icon color
  - Green heading text
- Secondary cards maintain the blue/white styling for contrast

This creates a balanced visual rhythm without overwhelming the user with too much green.

#### Header Decoration Pattern

Section headers can incorporate this pattern through:
- Decorative gradient divider lines (from-green to-primary and from-primary to-green)
- Subtitle text in green
- Main heading in white/blue
- Text spans in green to emphasize key phrases

```jsx
// Example implementation
<div className="flex items-center justify-center gap-4 mb-4">
  <div className="w-16 h-1 bg-gradient-to-r from-green to-primary rounded-full"></div>
  <p className="text-lg font-medium text-green">{subtitle}</p>
  <div className="w-16 h-1 bg-gradient-to-r from-primary to-green rounded-full"></div>
</div>
```

#### Usage Guidelines

1. **Maintain Blue Dominance**: Blue must remain the dominant color, with green used selectively as an accent.
2. **Contextual Application**: Green should primarily be used for elements related to growth, sustainability, quality, or to create visual hierarchy.
3. **Selective Highlighting**: Limit green highlighting to at most 50% of elements in any given section.
4. **Text Contrast**: Ensure text remains readable when using green, particularly against darker backgrounds.

By following these patterns, components maintain visual interest while preserving brand identity through the consistent dominance of the blue color palette. 

## Responsive Design

### Core Principles

- All components must be fully responsive across desktop, tablet, and mobile devices
- Maintain visual hierarchy and readability at all viewport sizes
- Preserve brand identity and thematic domain characteristics regardless of screen size

### Implementation Guidelines

#### Breakpoints

The design system uses the following standard breakpoints:

```
sm: 640px   (Small devices)
md: 768px   (Medium devices)
lg: 1024px  (Large devices) 
xl: 1280px  (Extra large devices)
2xl: 1536px (Extra extra large devices)
```

#### Responsive Typography

- Font sizes should scale proportionally across breakpoints
- Maintain minimum font sizes for readability (16px for body text, 14px for secondary text)
- Headings should reduce in size on smaller screens while maintaining hierarchy

#### Layout Adjustments

- Card grids should adjust from multi-column to single column on mobile
- Section padding should reduce proportionally on smaller screens
- Interactive elements must maintain minimum touch target size (44px)

#### Testing Requirements

- All components must be tested across standard breakpoints
- Interactive elements should be verified for touch usability
- Performance impact of visual effects should be evaluated on lower-end devices

By following these responsive design principles, the Ruqaqa website will provide a consistent and accessible experience across all devices while preserving the integrity of the design system. 