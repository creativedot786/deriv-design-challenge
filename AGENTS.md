# AGENTS.md

Instructions for any AI coding tool (Claude Code, Cursor, Codex, etc.) working in this repository. Read this before touching `src/design-system` or any screen.

## Ground rules

1. **Never hardcode a color, spacing, radius, shadow, or font value in a screen or component.** Every value must come from a token in `src/design-system/tokens`. If a value you need doesn't exist as a token, stop and add it to tokens first — don't inline it "just this once."
2. **Components consume tokens; screens consume components.** Screens should not reach past a component into raw tokens except for layout-only concerns (gaps between components), and even then prefer spacing tokens over arbitrary pixel values.
3. **Primitives vs. semantic tokens**: primitive color tokens (e.g. `ink-900`, `brand-500`) are never referenced directly by components — always go through a semantic token (`text-primary`, `bg-surface`, etc.). This mirrors the two-tier structure in Figma.
4. **Match Figma naming exactly.** Token and component variant names in code should read the same as their Figma counterparts (e.g. Figma `bg/brand-muted` → CSS `--bg-brand-muted`) so a reviewer can cross-reference without translation.

## Token reference

_TODO — fill in once `src/design-system/tokens` is built (Phase 2 milestone M2). Should list every token file and its contents, matching the Foundations page in Figma: color (primitive + semantic), spacing, radius, elevation, typography._

## Component API reference

_TODO — fill in one entry per component as it's built (Phase 2 milestone M3). Each entry should cover: props/variants, which tokens it binds to, and a do/don't example._

Known component list (from Figma), in build order:
- [ ] Button — Primary/Secondary/Ghost/Link × Default/Hover/Loading/Disabled
- [ ] Input — Default/Focus/Error/Disabled
- [ ] Badge — Kind (Success/Warning/Error/Neutral) × Style (Pill/Quiet)
- [ ] Card — Elevated/Flat/Spotlight
- [ ] Avatar
- [ ] Transaction Row
- [ ] Quick Send Item
- [ ] Recipient Option / Add Recipient
- [ ] Amount Input
- [ ] Total Block

## Established design decisions worth knowing

These aren't obvious from the code alone — they came out of an explicit design review pass and shouldn't be "corrected" back to a more conventional pattern:

- **Shadow over border** is the default separation technique (`shadow-sm`/`shadow-md`), not a visible border. Borders are reserved for interactive affordance (input fields, a selected state) — not generic container chrome.
- **Card has three variants, not one**: Elevated (default), Flat (quiet grouping, no shadow/border), Spotlight (dark hero surface — reserved for exactly one moment per screen, the balance card). Don't add a 4th variant without a real reason.
- **Badge defaults to Quiet** (dot + colored text, no pill chrome) for in-context status like transaction rows. Pill (filled background) is reserved for standalone emphasis, e.g. the Success screen's single status line.
- **Link button is not a smaller Ghost button.** It's fully transparent in every state (including hover/disabled), tight inline padding, underline on hover. Use it for in-flow text CTAs (Change, Breakdown, View receipt) — use Ghost for standalone secondary actions (Cancel).
- **Send Money is a single 2-step modal**, not separate screens, and not separate mobile/desktop layouts — one modal UI works at both breakpoints.
- **No working "Add recipient" flow.** It's a static, non-functional affordance by design — don't wire it up unless explicitly asked.

## What not to do

- Don't introduce a new component for something a token or existing component variant already covers.
- Don't reintroduce borders as the default way to separate cards/sections.
- Don't add loading/empty/error states beyond what's explicitly scoped (see README).
- Don't add authentication, real API calls, or persistence — all data is mocked.
