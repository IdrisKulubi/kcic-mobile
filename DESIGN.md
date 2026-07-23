# KCIC Climate Hub Design System

## Brand Colors (canonical)

These five colors are the only approved brand hues. Do not introduce competing greens, blues, or neutrals outside this palette.

| Token | Hex | Role |
|-------|-----|------|
| Green | `#80C738` | Primary actions, active states, success emphasis |
| Gray | `#8B8D90` | Secondary text, labels, subdued UI, borders |
| White | `#FFFFFF` | Primary surfaces, cards, inverted text on colored buttons |
| Blue | `#00ADDD` | Information, links, content taxonomy, resource cues |
| Brown | `#E97451` | Warm highlights, non-destructive emphasis, featured callouts |

### Derived neutrals (allowed)

For accessibility and layout, derive borders, disabled states, and panel backgrounds from Gray and White only. Examples:

- Primary text: darkened Gray (`#4A4B4D` or similar)
- Panel / shell: very light Gray tint on White (`#F5F5F6`)
- Borders: Gray at reduced opacity or `#E5E5E6`

Never use legacy forest (`#006B45`), ink (`#111827`), shell blue (`#F6F8FF`), or other off-palette brand colors.

## Typography

- **Mobile app:** Native system font stack. Use weight and size contrast rather than decorative type.
- **Auth and email:** Inter where loaded (auth screens, React Email templates).
- Headings: editorial and confident. Labels and metadata: compact.

## Shape And Spacing

- 8px radius family for compact controls.
- 14px to 18px radius for feature cards and image-led panels.
- Stable bottom navigation. Avoid nested cards.

## Interface Register

Light mode, white-led surfaces. Green for primary actions. Blue for informational and taxonomy states. Brown for warm emphasis. Gray for secondary copy. Restrained color; hierarchy through type and spacing.

## Motion

Subtle, state-driven motion only. No choreographed page loads.

## Email

React Email templates use the shared theme in `backend/kcic-mobile/emails/theme.ts`. White-led layout, semantic tokens (`brand`, `accent`, `warm`, `fg`, `fg-2`, `fg-3`), no raw hex in template files.
