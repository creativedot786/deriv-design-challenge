# AGENTS.md

Instructions for any AI coding tool (Claude Code, Cursor, Codex, etc.) working in this repository. Read this before touching `src/design-system` or any screen.

## General principles

- **Tech stack**: React + TypeScript + Vite. Don't introduce another framework, a CSS-in-JS library, or a component library (e.g. MUI, Chakra) — the whole point of this repo is a hand-built design system. Plain CSS (custom properties + stylesheets or CSS modules) is the styling approach.
- **No hardcoded values.** Covered in detail under Ground Rules below — it's the single most important rule in this repo.
- **No code duplication.** If you're about to copy-paste a block of JSX/CSS for the second time, stop and extract it — a component, a shared type, a utility function, a token. Two nearly-identical `TransactionRow` implementations in two screens is a bug, not a shortcut.
- **Clean architecture / separation of concerns**: tokens don't know about components, components don't know about screens, screens don't know about each other. Data flows one direction: `tokens → components → screens`. A component should never import from `src/screens`.
- **Small, focused components.** A component does one job. If a component needs an internal switch/if-chain to render fundamentally different markup depending on a prop, it's probably two components (or a variant, if the design system defines one).
- **Type everything.** No `any`. Props get explicit interfaces. Variant props should be union types (`'primary' | 'secondary' | 'ghost' | 'link'`), not `string`.
- **Consistency over cleverness.** Match the existing pattern in the codebase even if you'd personally write it differently. If you think the existing pattern is wrong, say so and ask — don't silently diverge.
- **Mocked data only.** No backend calls, no auth, no persistence. Mock data lives in `src/mocks`, typed, imported by screens.

## Ground rules

1. **Never hardcode a color, spacing, radius, shadow, or font value in a screen or component.** Every value must come from a token in `src/design-system/tokens`. If a value you need doesn't exist as a token, stop and add it to tokens first — don't inline it "just this once."
2. **Components consume tokens; screens consume components.** Screens should not reach past a component into raw tokens except for layout-only concerns (gaps between components), and even then prefer spacing tokens over arbitrary pixel values.
3. **Primitives vs. semantic tokens**: primitive color tokens (e.g. `ink-900`, `brand-500`) are never referenced directly by components — always go through a semantic token (`text-primary`, `bg-surface`, etc.). This mirrors the two-tier structure in Figma.
4. **Match Figma naming exactly.** Token and component variant names in code should read the same as their Figma counterparts (e.g. Figma `bg/brand-muted` → CSS `--bg-brand-muted`) so a reviewer can cross-reference without translation.

## Token reference

All tokens live in `src/design-system/tokens/`, imported once via `index.css` (already wired into `main.tsx` — never import a token file directly from a component). One file per category:

- **`colors.css`** — two-tier: primitives (`--ink-*`, `--brand-*`, `--success-*`, `--warning-*`, `--error-*`) and semantic tokens that alias them (`--text-*`, `--bg-*`, `--border-*`). Bind to semantic tokens only.
- **`spacing.css`** — `--space-1` through `--space-8` (4px base scale, 4–64px).
- **`radius.css`** — `--radius-sm/md/lg/full`.
- **`elevation.css`** — `--shadow-sm`, `--shadow-md`. Default separation technique — see "Established design decisions" below.
- **`typography.css`** — `--font-family-base` (Inter, loaded via `@fontsource/inter` in `main.tsx`, weights 400/500/600) plus size/line-height/weight variables per text style, each with a ready-to-use utility class: `.ds-text-display-xl`, `.ds-text-display`, `.ds-text-h1`, `.ds-text-h2`, `.ds-text-body-lg`, `.ds-text-body`, `.ds-text-caption`, `.ds-text-label`. Prefer the class over reassembling the variables — it's what components should apply directly to text elements.

Naming matches Figma exactly (Figma `bg/brand-muted` → CSS `--bg-brand-muted`) so token and design file can be cross-referenced without translation.

## Component API reference

### Button (`src/design-system/components/Button`)

```tsx
<Button variant="primary" isLoading={false} fullWidth={false} disabled={false}>
  Send money
</Button>
```

- `variant`: `'primary' | 'secondary' | 'ghost' | 'link'` (default `'primary'`)
- `isLoading`: shows a spinner, sets the native `disabled` attribute for non-interactivity, but **keeps full-color styling** — it is not the same visual state as `disabled`. If you need to check one bug class in this component, check this: styling must key off a dedicated `disabledLook` class applied only when `disabled && !isLoading`, never off the `:disabled` pseudo-class directly, or Loading silently inherits the muted Disabled look.
- `fullWidth`: stretches to container width; default is `fit-content`. Don't make buttons full-width by default — most Buttons (Cancel, Change, Breakdown) should hug their label.
- Extends all native `<button>` props (`onClick`, `type`, `aria-*`, etc.) — pass through freely.
- Tokens: `--bg-brand`, `--bg-surface`, `--bg-brand-muted`, `--bg-surface-muted`, `--text-inverse`, `--text-brand`, `--text-disabled`, `--border-brand`, `--border-secondary`, `--radius-md`, `--space-2/3/5`, `--shadow-sm/md`, `.ds-text-label`.
- **Do**: `<Button variant="link">Change</Button>` for an inline text CTA. **Don't**: reach for `variant="ghost"` with custom inline padding overrides to fake a link — use `variant="link"`, it exists for exactly this.

### Input (`src/design-system/components/Input`)

```tsx
<Input label="Amount" helperText="Available balance: $12,480.50" />
<Input label="Amount" errorText="Exceeds available balance" />
```

- `label` (required), `helperText`, `errorText` — passing `errorText` puts the field in its error state (red border/text) and takes priority over `helperText` if both are somehow passed; don't pass both intentionally.
- Focus and Disabled are native (`:focus`, `disabled` prop) — no separate props needed for those.
- `id` is generated internally via `useId()` and wired to the label (`htmlFor`) and helper/error text (`aria-describedby`) automatically — don't pass your own `id`, the type deliberately omits it.
- Extends native `<input>` props (`value`, `onChange`, `type`, `placeholder`, etc.).
- Tokens: `--bg-surface`, `--bg-surface-muted`, `--border-primary`, `--border-brand`, `--border-error`, `--border-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-error`, `--text-disabled`, `--radius-md`, `--space-2/3/4`, `.ds-text-label` (field label), `.ds-text-body-lg` (value), `.ds-text-caption` (helper/error).
- Note: the field label uses the `Label` text style (14px), not a bespoke 13px size that appeared in the original HTML mockup — reusing an existing type-scale entry rather than introducing a new one-off size.

### Badge (`src/design-system/components/Badge`)

```tsx
<Badge kind="success">Completed</Badge>              {/* Quiet — default, in-context */}
<Badge kind="success" variant="pill">Completed</Badge> {/* Pill — standalone emphasis only */}
```

- `kind`: `'success' | 'warning' | 'error' | 'neutral'` (required, no default — always be explicit about status)
- `variant`: `'quiet' | 'pill'`, default `'quiet'`. Quiet is dot + colored text, no container — use it for transaction rows and any in-context status. Pill adds the filled rounded background — reserve it for a single standalone status line (e.g. the Success screen), not for lists.
- Tokens: `--text-success/warning/error/secondary`, `--border-success/warning/error` (reused for the dot color — semantic, not the raw `success-500` primitive), `--text-muted` (neutral dot), `--bg-*-muted` (pill background), `--radius-full`, `--space-1/2`, `.ds-text-caption`.
- **Do not** add a 5th `kind` or reach for a raw primitive color for a new status — extend the semantic token set in `colors.css` first if a genuinely new status is needed.

### Card (`src/design-system/components/Card`)

```tsx
<Card variant="spotlight">
  <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>Available balance</p>
  <p className="ds-text-display">$12,480.50</p>
</Card>
```

- `variant`: `'elevated' | 'flat' | 'spotlight'`, default `'elevated'`.
- **Deliberately a generic container (`children`), not a fixed Eyebrow/Value/Subtext prop API.** The Figma component had rigid props and it broke down the moment a receipt-style card needed multiple label/value rows plus a Badge instead — don't reintroduce that rigidity in code. Compose content with the typography utility classes (`ds-text-*`) directly inside `<Card>`.
- `spotlight` sets `color: var(--text-inverse)` on the card itself, but its own children still need explicit `var(--text-inverse-muted)` for secondary text (eyebrow/subtext) — the card only sets the primary text color for you.
- Extends native `<div>` props (`className`, `style`, `onClick`, etc.).
- Tokens: `--bg-surface`, `--bg-surface-muted`, `--bg-inverse`, `--shadow-sm/md`, `--radius-lg`, `--space-5/6`, `--text-inverse`, `--text-inverse-muted`.
- **Spotlight is reserved for exactly one moment per screen** (the Dashboard balance). Don't use it for a second element on the same screen — that defeats its purpose as a hero moment.

### Avatar (`src/design-system/components/Avatar`)

```tsx
<Avatar initials="AK" />           {/* default size 36 */}
<Avatar initials="AK" size={48} /> {/* Quick Send uses 48 */}
```

- `initials`, `size` (px, default 36 — 40 in the Dashboard header, 48 in Quick Send). These are fixed non-token dimensions, an accepted exception (same reasoning as in Figma): avatars are a small, closed set of sizes, not a spacing concern.
- Always `aria-hidden` — the initials are decorative. Every place Avatar is used, the full name is rendered as visible text alongside it; don't use Avatar somewhere that omits the name, or the decorative-only assumption breaks.

### Transaction Row (`src/design-system/components/TransactionRow`)

```tsx
<TransactionRow
  name="Jordan Diaz"
  meta="2:14 PM"
  amount="-$250.00"
  direction="outgoing"
  status="success"
  statusLabel="Completed"
/>
```

- `direction`: `'incoming' | 'outgoing'` — drives both the icon (down/up arrow) and the amount color (`text-success` for incoming, `text-primary` for outgoing). Not inferred from the amount string's sign — pass it explicitly.
- `status` + `statusLabel`: renders a `Badge` (`quiet` variant) internally. **This is a deliberate fix over the Figma source component**, where Status was a plain TEXT property hardcoded to `text/success` green regardless of its actual value — meaning a "Failed" status would still render green in Figma. In code, `status` is properly typed as `BadgeKind` so the color is always correct.
- Composes `Badge` internally — don't duplicate badge styling here if you're extending this component; adjust `Badge` instead.
- Tokens: `--bg-surface-muted`, `--text-secondary/primary/muted/success`, `--radius-md`, `--space-1/2/3`.

### Quick Send Item (`src/design-system/components/QuickSendItem`)

```tsx
<QuickSendItem kind="person" initials="AK" name="Amara" onClick={...} />
<QuickSendItem kind="add" onClick={...} />
```

- Discriminated union on `kind` (`'person' | 'add'`) — TypeScript will reject `initials`/`name` on the `'add'` variant, don't work around that with an `as` cast.
- Composes `Avatar` (size 48) for the person variant.

### Recipient Option / Add Recipient (`src/design-system/components/RecipientOption`)

```tsx
<RecipientOption initials="AK" name="Amara Khan" meta="Account ending 4821" selected onClick={...} />
<AddRecipient onClick={...} />
```

- Two separate exports from the same folder (they're visually and semantically distinct, unlike Quick Send Item's two `kind`s which share a layout).
- `RecipientOption`'s `selected` toggles `border-brand` + `bg-brand-muted`; default rests on `bg-surface-muted` with no border — border is reserved for the selected state, not decoration.
- `AddRecipient` is a **static affordance only** — its `onClick` prop exists for completeness but there is no real add-recipient flow. Don't build one unless explicitly asked.

### Amount Input (`src/design-system/components/AmountInput`)

```tsx
<AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} helperText="Available balance: $12,480.50" />
```

- A real, controlled `<input>` (not a styled `<div>`) — extends native input props, so `value`/`onChange`/`defaultValue` all work normally.
- Uses the new `Display XL` (48/56) text style for the value and `Display` (32/40, muted) for the `$` prefix — this is the one place in the design system that size is used.
- No border/background chrome by design — it reads as an input via size and placement, not a boxed field. Don't add a border "to make it clearer it's an input."
- **Sanitizes input to digits + one decimal point internally** (`sanitizeAmount`, wraps the `onChange` prop before forwarding it). `inputMode="decimal"` alone only hints the mobile keyboard — it does not block typed characters — so without this a user could type `"asa9.9.9abc"` and it would just render as-is. Caught during manual testing, not something a type-checker or build would catch. If you touch this component, keep it a real `<input type="text">` with this sanitizer, not `type="number"` (which has its own, worse set of UX quirks for currency input — spinner arrows, silently clamping invalid states, locale-dependent decimal separators).

### Total Block (`src/design-system/components/TotalBlock`)

```tsx
<TotalBlock total="$250.00" onBreakdownClick={() => setShowBreakdown(true)} />
```

- Composes `Button` (`variant="link"`) for "Breakdown" — this is the reference example for when to reach for the Link button variant: an inline text CTA next to other content, not a standalone action.
- Single `total` string prop, not separate amount/fee values — this component replaced an earlier Amount/Fee/Total summary card design; it intentionally only shows the final number plus a link to a (not-yet-built) breakdown detail view.

Known component list (from Figma) — all built:
- [x] Button — Primary/Secondary/Ghost/Link × Default/Hover/Loading/Disabled
- [x] Input — Default/Focus/Error/Disabled
- [x] Badge — Kind (Success/Warning/Error/Neutral) × Style (Pill/Quiet)
- [x] Card — Elevated/Flat/Spotlight
- [x] Avatar
- [x] Transaction Row
- [x] Quick Send Item
- [x] Recipient Option / Add Recipient
- [x] Amount Input
- [x] Total Block

### Modal (`src/design-system/components/Modal`)

Not part of the original Figma component list — added in M4 because Send Money and Success were converted from full screens to modals after Figma was otherwise locked. Uses a new `--overlay-scrim` token (`colors.css`), the only token added post-Figma.

```tsx
<Modal isOpen={isOpen} onClose={onClose} label="Send money">
  {/* content */}
</Modal>
```

- `label` sets the accessible name (`aria-label`) — always pass a real label, not "Modal".
- Handles Escape-to-close, click-on-backdrop-to-close (not click-inside-panel), focuses the panel on open, and locks body scroll while open. All in the component — don't re-implement any of this in a screen that uses Modal.
- Renders inline (no `createPortal`) — acceptable at this app's scale since nothing in the tree uses `overflow: hidden`/`transform` that would break `position: fixed`. If a future ancestor introduces one, this will need a portal.
- Content composition (header, steps, actions) is entirely up to the consumer — Modal only owns the overlay/panel/dismissal behavior.

## Screens (`src/screens`)

- **Dashboard** — one responsive component, not separate mobile/desktop components. Sidebar nav and header CTA appear via `@media (min-width: 860px)`; bottom nav and full-width CTA are the mobile default. This 860px breakpoint is the one used consistently for the app-shell switch — don't introduce a second, different breakpoint elsewhere for the same kind of decision.
- **Dashboard layout is capped at 1440px, centered, with 40px side padding** (`.pageInner`) — on very wide screens the content doesn't stretch edge-to-edge. 40px is a literal value (not on the spacing scale; nearest tokens are `space-6`/32 and `space-7`/48), same treatment as the Display XL exception — flagged rather than silently forced into the nearest token.
- **The sidebar is a contained, elevated card** (`bg-surface`, `shadow-sm`, `radius-lg`, `align-self: flex-start`), not a full-viewport-height, edge-to-edge panel. If you touch `.page`, keep it a plain block (no `display: flex`) — flexbox + `width: 100%` + `max-width` on `.pageInner` had a real centering bug (the item wouldn't respect `margin-inline: auto` correctly), fixed by removing flex from the parent since it only ever has one child.
- **SendMoneyModal** — owns its own 2-step state (`'recipient' | 'amount'`) internally; parent (`App.tsx`) only knows whether the modal is open and receives an `onComplete({ recipientName, amount })` callback when the user hits Send. Resets to step 1 every time it's reopened (via a `useEffect` keyed on `isOpen`) — don't remove that, or a second transfer will silently resume on the previous recipient/amount.
- **SuccessModal** — purely presentational, takes `recipientName`/`amount` as props from whatever `SendMoneyModal.onComplete` produced. Date/time are computed live (`new Date()`), not mocked — this is one of the few non-mocked pieces of data in the app, and that's intentional (a receipt's timestamp should reflect when it happened).
- Recipients used in Quick Send and the Send Money recipient list come from **one shared mock array** (`src/mocks/recipients.ts`, filtered by `isFrequent`) — this is a deliberate architectural fix for a data-consistency bug that existed in the Figma/HTML passes, where Quick Send and the full recipient list were separate hand-maintained lists that drifted out of sync. Don't reintroduce two separate recipient lists.

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
