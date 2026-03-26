# Inspectra PRD & Design Plan - Design System

## Typography

- **Global Font**: INTER
- **Headline Font**: INTER
- **Body Font**: INTER
- **Label Font**: INTER
- **Code & Data**: JetBrains Mono

*Note: The typography system pairs the high-readability of Inter with the structural rigidity of JetBrains Mono. Inter is set with tight letter-spacing for display/headlines, while JetBrains Mono is reserved for logs, hashes, and terminal outputs.*

## Color Mode
**DARK** - "Dark-First" philosophy, where color is used strictly as a semantic signal.

### Core Surface Tokens
- **Background**: `#10141a`
- **Surface**: `#10141a`
- **Surface Container Low**: `#181c22`
- **Surface Container**: `#1c2026`
- **Surface Container High**: `#262a31`
- **Surface Container Highest**: `#31353c`

### Primary Colors
- **Primary**: `#a2c9ff`
- **Primary Container**: `#58a6ff`
- **On Primary**: `#00315c`
- **On Primary Container**: `#003a6b`

### Secondary & Tertiary Colors
- **Secondary**: `#67df70`
- **Secondary Container**: `#27a640`
- **Tertiary**: `#fabc45`
- **Tertiary Container**: `#d29922`

### Semantic Colors
- **Error**: `#ffb4ab`
- **Error Container**: `#93000a`
- **On Error**: `#690005`
- **On Error Container**: `#ffdad6`

### Text & Icons
- **On Surface**: `#dfe2eb`
- **On Surface Variant**: `#c0c7d4`
- **On Background**: `#dfe2eb`

### Borders & Outlines
- **Outline**: `#8b919d`
- **Outline Variant**: `#414752`

## The Semantic Architect (Design Principles)

1. **The "No-Line" Rule**: 1px solid borders are prohibited for sectioning. Boundaries must be defined through background color shifts instead.
2. **The "Glass & Gradient" Rule**: Floating elements must utilize Glassmorphism (surface-container-high at 80% opacity with 20px backdrop-blur). Primary buttons should feature a subtle linear gradient.
3. **Elevation & Depth**: Achieved via tonal layering, not drop shadows. Use a "Ghost Border" (outline_variant at 20% opacity) for input fields.

## Override Variables
- **Override Primary Color**: `#58a6ff`
- **Override Secondary Color**: `#3fb950`
- **Override Tertiary Color**: `#d29922`
- **Override Neutral Color**: `#0d1117`
