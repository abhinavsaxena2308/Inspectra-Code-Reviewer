# Inspectra Design System

## Brand Overview
**Product**: Inspectra - Precision Analytics & Observability Platform
**Positioning**: Mystical, ethereal, investigative SaaS for developers
**Aesthetic**: Dark & moody with vibrant cyan/magenta accents

---

## Color Palette

### Primary Colors
- **Background Black**: `#000000` (pure black for void-like atmosphere)
- **Cyan (Primary Accent)**: `#00D1FF` / `#00E5FF` (neon blue, ethereal glow)
- **Magenta (Secondary Accent)**: `#FF00FF` (vibrant, complementary energy)
- **Indigo (Deep)**: `#0A0A2E` (shadow depths in gradient)

### Neutral Colors
- **White (Text)**: `#FFFFFF` (primary text)
- **White/40**: `rgba(255, 255, 255, 0.4)` (secondary text, muted)
- **White/60**: `rgba(255, 255, 255, 0.6)` (tertiary text)

### CSS Variables
```
--void-black: #000000
--neon-blue: #00E5FF
--cyan-glow: 0 0 25px rgba(0, 229, 255, 0.6)
--indigo-deep: #0A0A2E
```

---

## Typography

### Font Families
- **Headings (h1, h2, h3)**: Cabinet Grotesk
  - Weight: 800, 700, 500
  - Letter-spacing: -0.03em
  - Usage: Bold, commanding headlines

- **Body Text**: Satoshi
  - Weight: 500, 400, 300
  - Usage: Descriptive copy, UI text

- **Monospace (Code/Status)**: JetBrains Mono
  - Weight: 500, 400
  - Usage: Technical labels, system status, timestamps

### Type Scale
- **Hero Headline**: text-8xl (md), text-6xl (mobile), font-extrabold, tracking-tighter
- **Subheading**: text-xl/text-lg, font-medium, text-white/40
- **Button/Label**: text-[11px], uppercase, tracking-[0.3em], font-bold
- **Monospace Label**: text-[10px]/text-[9px], uppercase, tracking-widest

---

## Component Patterns

### Navigation Bar (.glass-nav)
```html
<header class="fixed top-0 left-0 right-0 z-50 glass-nav h-20 px-8">
  <nav class="max-w-7xl mx-auto h-full flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full border border-cyan-500/50 flex items-center justify-center p-1">
        <div class="w-full h-full rounded-full bg-cyan-500 animate-pulse"></div>
      </div>
      <span class="text-xl font-bold tracking-tighter uppercase tracking-[0.2em]">Inspectra</span>
    </div>
    <div class="hidden md:flex items-center gap-10">
      <a href="#" class="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Infrastructure</a>
      <a href="#" class="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Observability</a>
      <a href="#" class="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Security</a>
    </div>
    <div class="flex items-center gap-6">
      <a href="#" class="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 hover:text-cyan-400 transition-all">Access_Core</a>
      <button class="px-6 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all">Deploy Now</button>
    </div>
  </nav>
</header>
```

**Styling**:
- `background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.05);`
- Always fixed/sticky for persistent visibility
- Logo includes animated pulse effect on icon

### Primary CTA Button (.ethereal-btn)
```html
<button class="ethereal-btn px-12 py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold text-white flex items-center gap-3 group">
  Start Inspecting
  <iconify-icon icon="lucide:command" class="group-hover:rotate-45 transition-transform"></iconify-icon>
</button>
```

**Styling**:
```css
.ethereal-btn {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(82, 39, 255, 0.15) 100%);
  border: 1px solid rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.ethereal-btn:hover {
  border-color: #00E5FF;
  box-shadow: 0 0 30px rgba(0, 209, 255, 0.2);
  transform: translateY(-2px);
}
```

### Secondary Button
```html
<button class="px-12 py-5 border border-white/5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
  Read Manifesto
</button>
```

### Status Badge
```html
<div class="inline-flex items-center gap-3 px-4 py-1.5 border border-white/5 bg-white/5 rounded-full">
  <span class="mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest">System Status: Optimal</span>
  <div class="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D1FF]"></div>
</div>
```

### Glow Text Effect (.glow-text)
```css
.glow-text {
  text-shadow: 0 0 35px rgba(0, 229, 255, 0.7);
}
```
- Applied to headlines and key accent text
- Creates ethereal, neon-like glow

### Shadow Overlay (.shadow-overlay)
```html
<div class="shadow-overlay absolute inset-0 z-10"></div>
```

**Styling**:
```css
.shadow-overlay {
  background: radial-gradient(circle at center, transparent 0%, #000000 90%);
  pointer-events: none;
}
```
- Darkens edges, focuses attention on center content
- Non-interactive overlay

---

## WebGL Background (GradientBlinds Component Integration)

### Configuration
- **Engine**: OGL (WebGL)
- **Gradient Colors**: Cyan (#00D1FF) to Magenta (#FF00FF)
- **Blind Count**: 18 stripes
- **Blind Angle**: -15° to 15° (rotated)
- **Spotlight Radius**: 0.6-0.8 (interactive mouse tracking)
- **Spotlight Softness**: 2.0-2.8 (smooth falloff for ethereal effect)
- **Spotlight Opacity**: 0.8-1.0 (visible but not overwhelming)
- **Noise Level**: 0.12 (subtle film grain for texture)
- **Mouse Dampening**: 0.04-0.05 (smooth, responsive tracking)

### Fragment Shader Adjustments
- Blend cyan and magenta equally throughout
- Softer spotlight transition for "moody" atmosphere
- Stripe contrast tuned for balance between visibility and mystique
- Noise adds texture without overwhelming effect

---

## Layout & Spacing

### Hero Section
- **Height**: Full screen (h-screen) with padding-top for nav
- **Max-width**: 5xl (64rem)
- **Padding**: px-6 (mobile), px-10 (desktop)
- **Content Alignment**: Centered (text-center, flex-col justify-center)

### Vertical Spacing
- **Badge to Headline**: mb-8 to mb-10
- **Headline to Copy**: mb-8
- **Copy to Buttons**: mb-12 to mb-24
- **Button gap**: gap-6

### Grid/Components
- Trust section uses: `flex items-center gap-16`
- Icons: 16px gap between items
- Expandable on hover: `grayscale opacity-40 hover:opacity-100 transition-opacity duration-700`

---

## Animation & Motion

### Transitions
- **Standard**: `transition-all 0.3s ease` or `transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1)`
- **Button Hover**: translateY(-2px) + glow intensification
- **Icon Rotate**: `group-hover:rotate-45 transition-transform`

### Continuous Animations
- **Pulse**: Logo icon uses `animate-pulse` for breathing effect
- **Fade-in**: First elements use `animate-fade-in` on page load
- **Scroll Indicators**: Use `animate-bounce` for directional cues

---

## Responsive Design

### Breakpoints
- **Mobile**: Default (px-6 padding)
- **Tablet**: `hidden md:flex` for nav items
- **Desktop**: `max-w-7xl` container width

### Text Scaling
- Headlines: `text-6xl md:text-8xl`
- Body: `text-lg md:text-xl`
- Labels: Constant `text-[10px]` or `text-[11px]`

### Flex Direction
- Buttons: `flex flex-col sm:flex-row` (stack on mobile, row on tablet+)
- Navigation: `hidden md:flex` (hidden on mobile)

---

## Accessibility & Polish

### Focus States
- Hover states on all links: `hover:text-cyan-400` or `hover:opacity-100`
- Buttons have clear visual feedback

### Semantic HTML
- Proper heading hierarchy (h1 for hero)
- Semantic button elements with role attributes where needed
- Icon library uses `<iconify-icon>` for icon support

### Performance
- Mask-image on GL container: `mask-image: radial-gradient(circle at center, black 30%, transparent 100%)`
- Pointer-events optimization: `pointer-events: none` on overlays
- GPU-accelerated transforms for animations

---

## Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Brand Black | #000000 | Background |
| Cyan Accent | #00D1FF | Primary highlights, glow |
| Magenta Accent | #FF00FF | Secondary highlights, gradients |
| Indigo Shadow | #0A0A2E | Gradient depths |
| Text Primary | #FFFFFF | Main content |
| Text Secondary | rgba(255,255,255,0.4) | Supporting copy |
| Glow Intensity | 35px 0 0 rgba(0,229,255,0.7) | Text shadows |
| Border Color | rgba(255,255,255,0.05) | Subtle dividers |

---

## Component Reusability

### Sharable Sections
1. **Navigation Bar** - Fixed header with logo, links, CTA
2. **Hero Section** - Headline, copy, dual CTAs
3. **Status Badge** - System status with icon indicator
4. **Primary CTA Button** - Ethereal gradient with glow
5. **Trust Icons Section** - Grid of partner/tech logos
6. **WebGL Background** - GradientBlinds with tuned parameters
7. **Shadow Overlay** - Radial gradient vignette effect

### Customization Points
- Brand name (replace "Inspectra")
- Headline & copy text
- CTA button labels
- Trust section icons (swap tech logos)
- Color values (maintain cyan/magenta balance)
- WebGL parameters (blind count, angle, spotlight size)