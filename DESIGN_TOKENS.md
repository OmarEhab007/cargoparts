# CargoParts Design System & Brand Identity

## 🇸🇦 Saudi Arabia & Riyadh Inspired Visual Identity

### Core Concept
Our design system is deeply rooted in Saudi Arabian culture and the modern vision of Riyadh, combining traditional elements with contemporary aesthetics to create a unique marketplace identity.

---

## Color Palette

### Primary Colors

#### 🟢 Saudi Green
- **Hex**: `#165d31`
- **CSS Variable**: `var(--saudi-green)`
- **Usage**: Primary CTAs, success states, brand identity
- **Meaning**: National pride, prosperity, Islamic heritage
- **Variants**:
  - Light: `var(--saudi-green-light)` - Secondary buttons, hover states
  - Dark: `var(--saudi-green-dark)` - Text on light backgrounds

#### 🏜️ Desert Gold
- **Hex**: `#D4AF37`
- **CSS Variable**: `var(--desert-gold)`
- **Usage**: Premium features, highlights, badges
- **Meaning**: Luxury, tradition, desert landscape
- **Variants**:
  - Light: `var(--desert-gold-light)` - Backgrounds, subtle accents
  - Dark: `var(--desert-gold-dark)` - Text, strong emphasis

#### 🌤️ Riyadh Sky
- **Hex**: `#87CEEB`
- **CSS Variable**: `var(--riyadh-sky)`
- **Usage**: Information, secondary actions, backgrounds
- **Meaning**: Clear desert skies, modernity, openness
- **Variants**:
  - Light: `var(--riyadh-sky-light)` - Morning sky, light backgrounds
  - Dark: `var(--riyadh-sky-dark)` - Evening sky, emphasis

### Supporting Colors

| Color | Variable | Usage | Cultural Reference |
|-------|----------|-------|-------------------|
| Palm Green | `var(--palm-green)` | Success indicators, eco-friendly | Oasis, palm trees |
| Sand Beige | `var(--sand-beige)` | Backgrounds, cards | Desert landscape |
| Date Brown | `var(--date-brown)` | Tertiary text, borders | Traditional dates |
| Pearl White | `var(--pearl-white)` | Primary backgrounds | Arabian Gulf pearls |
| Oasis Teal | `var(--oasis-teal)` | Accents, links | Desert oasis water |

### Semantic Colors

```css
/* Status Colors */
--success: var(--palm-green);       /* Successful operations */
--warning: var(--desert-gold);      /* Warnings, attention needed */
--error: oklch(0.577 0.245 27.325); /* Errors, destructive actions */
--info: var(--riyadh-sky);          /* Information, tips */
```

---

## Typography

### Font Families

#### Arabic (Primary)
```css
font-family: var(--font-cairo), "Segoe UI Arabic", "Arial", sans-serif;
```
- **Cairo**: Modern Arabic font with excellent readability
- **Font Weights**: 400 (Regular), 600 (Semibold), 700 (Bold), 900 (Black)
- **Line Height**: 2.0 for body text, 1.6-2.2 for headings

#### English (Secondary)
```css
font-family: var(--font-inter), system-ui, sans-serif;
```
- **Inter**: Clean, modern sans-serif
- **Font Weights**: 400, 500, 600, 700, 800
- **Line Height**: 1.7 for body text, 1.3-1.5 for headings

### Type Scale

| Element | Arabic Size | English Size | Weight | Line Height |
|---------|------------|--------------|--------|-------------|
| Hero Title | 3.5rem | 3rem | 900 | 2.2 / 1.3 |
| H1 | 2.5rem | 2.25rem | 900 / 800 | 1.6 / 1.3 |
| H2 | 2rem | 1.875rem | 800 / 700 | 1.7 / 1.3 |
| H3 | 1.5rem | 1.5rem | 700 / 600 | 1.8 / 1.4 |
| Body | 1rem | 1rem | 400 | 2.1 / 1.7 |
| Small | 0.875rem | 0.875rem | 400 | 1.6 / 1.5 |

---

## Spacing System

Based on an 8px grid for consistency:

```css
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
--space-3xl: 4rem;    /* 64px */
```

---

## Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - Subtle rounding */
--radius-md: 0.625rem;  /* 10px - Default */
--radius-lg: 0.875rem;  /* 14px - Cards */
--radius-xl: 1.25rem;   /* 20px - Modals */
--radius-full: 9999px;  /* Pills, badges */
```

---

## Shadows

Soft shadows inspired by desert light:

```css
--shadow-sm: 0 1px 3px 0 oklch(0.15 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px oklch(0.15 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px oklch(0.15 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px oklch(0.15 0 0 / 0.1);
```

---

## Component Classes

### Cards
- `.card-saudi` - Standard card with Saudi green accent
- `.card-saudi-premium` - Premium card with gold gradient
- `.glass-saudi` - Glass morphism with Saudi theme

### Buttons
- `.btn-saudi` - Primary Saudi green button
- `.btn-gold` - Premium gold button
- `.hover-saudi` - Saudi green hover effect
- `.hover-gold` - Gold hover effect

### Badges
- `.badge-saudi` - Saudi green badge
- `.badge-gold` - Gold badge for premium
- `.badge-premium` - Gradient premium badge

### Text Styles
- `.text-gradient-saudi` - Saudi green gradient text
- `.text-gradient-gold` - Gold gradient text
- `.text-price` - Price display typography

### Special Effects
- `.shimmer-saudi` - Saudi green shimmer animation
- `.shimmer-gold` - Gold shimmer animation
- `.pattern-saudi` - Geometric pattern overlay
- `.status-active` - Pulsing green indicator

### Gradients
- `.bg-gradient-saudi` - Saudi green gradient
- `.bg-gradient-desert` - Desert gold gradient
- `.bg-gradient-sky` - Riyadh sky gradient
- `.bg-gradient-oasis` - Oasis teal gradient

---

## Usage Guidelines

### 1. Primary Actions
Use Saudi Green (`var(--saudi-green)`) for:
- Primary CTAs (Add to Cart, Buy Now)
- Success messages
- Active states
- Brand elements

### 2. Premium/Highlight
Use Desert Gold (`var(--desert-gold)`) for:
- Premium listings
- Special offers
- Important badges
- Ratings/reviews

### 3. Information
Use Riyadh Sky (`var(--riyadh-sky)`) for:
- Information panels
- Help text
- Secondary buttons
- Links (in light mode)

### 4. Neutral Elements
Use Sand/Pearl tones for:
- Backgrounds
- Cards
- Borders
- Disabled states

### 5. Dark Mode
- Maintain color meanings but adjust brightness
- Use lighter variants of Saudi Green
- Keep gold prominent for premium elements
- Ensure sufficient contrast for Arabic text

---

## Cultural Considerations

1. **RTL Design**: All components support right-to-left layout
2. **Arabic Typography**: Enhanced line height and letter spacing for readability
3. **Color Symbolism**: Green represents Islamic heritage and national identity
4. **Modern Vision**: Blend traditional elements with Vision 2030's modernity
5. **Desert Aesthetic**: Warm, earthy tones reflecting the natural landscape

---

## Implementation Examples

### Saudi-Themed Card
```html
<div class="card-saudi">
  <div class="icon-saudi">
    <!-- Icon -->
  </div>
  <h3 class="text-gradient-saudi">عنوان البطاقة</h3>
  <p class="text-muted-foreground">وصف المنتج</p>
  <button class="btn-saudi">إضافة للسلة</button>
</div>
```

### Premium Badge
```html
<span class="badge-premium shimmer-gold">
  متميز
</span>
```

### Status Indicator
```html
<div class="flex items-center gap-2">
  <span class="status-active"></span>
  <span>متاح</span>
</div>
```

---

## Accessibility

- **Color Contrast**: All text meets WCAG AA standards
- **Focus States**: Clear visible focus indicators using `var(--ring)`
- **Motion**: Respects `prefers-reduced-motion`
- **Screen Readers**: Proper ARIA labels in both languages

---

## Future Enhancements

1. **Islamic Patterns**: Geometric pattern library for decorative elements
2. **Seasonal Themes**: Ramadan, National Day special themes
3. **Regional Variations**: Color adjustments for different Saudi regions
4. **Animation Library**: Saudi-themed loading and transition animations
5. **Icon Set**: Custom icons reflecting Saudi culture and automotive industry