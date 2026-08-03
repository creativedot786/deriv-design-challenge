# Build With AI — Money Transfer

> A focused money-transfer web app (Dashboard → Send Money → Success), designed and built as a design-system-driven challenge submission.

**Live URL:** [deriv-design-challenge-a7ywtuaoh.vercel.app](https://deriv-design-challenge-a7ywtuaoh.vercel.app)
**Figma file:** _TODO — paste the shareable Figma link here_
**Loom walkthrough (max 5 min):** _TODO — paste the Loom link here_

---

## The problem

A money transfer journey for an invented fintech product, **"Build With AI"** — Dashboard → Send Money → Success. I scoped to one coherent journey rather than a scattered set of screens, on the theory that a single polished flow demonstrates a design system better than three shallow ones.

**Dashboard** carries the weight of "at a glance" fintech UX: balance, quick actions, recent activity. **Send Money** is the one task users actually come back for — a 2-step modal (choose recipient → enter amount) rather than a full-page flow, since a transfer is a focused, interruptible task, not a destination. **Success** closes the loop with a receipt, because a transfer isn't done until the user has proof it happened.

"Premium modern fintech" here meant restraint: one dark "Spotlight" surface for the single most important number (the balance), shadow-based elevation instead of borders everywhere, and a quiet, date-grouped transaction list instead of a bordered data table. That direction came out of an explicit design-critique pass mid-project — the first version was correct but "boxy," and fixing that took more editorial judgment than component-building.

## Design system structure

**Tokens** (`src/design-system/tokens/`) — one file per category, imported once via `index.css`:
- `colors.css` — two-tier: primitives (`--ink-*`, `--brand-*`, `--success/warning/error-*`) → semantic tokens that alias them (`--text-*`, `--bg-*`, `--border-*`, `--overlay-scrim`). Components bind to semantic tokens only, never primitives.
- `spacing.css` — 8-step, 4px-based scale (`--space-1` … `--space-8`)
- `radius.css` — `sm/md/lg/full`
- `elevation.css` — `--shadow-sm`/`--shadow-md`, the default surface-separation technique (border is reserved for interactive affordance and the selected state)
- `typography.css` — size/line-height/weight variables per text style, each with a matching `.ds-text-*` utility class (`display-xl`, `display`, `h1`, `h2`, `body-lg`, `body`, `caption`, `label`) — components apply the class, not raw variables

**Components** (`src/design-system/components/`), 14 total, each its own folder with a `.tsx` + CSS Module:
- Core: **Button** (Primary/Secondary/Ghost/Link × Default/Hover/Loading/Disabled), **Input**, **Badge** (Quiet/Pill), **Card** (Elevated/Flat/Spotlight)
- Composed: **Avatar**, **TransactionRow**, **QuickSendItem**, **RecipientOption**/**AddRecipient**, **AmountInput**, **TotalBlock**
- Infrastructure: **Modal** (added in the code phase — Send Money/Success became modals after the Figma pass), **Skeleton**, **EmptyState**

Every value a component needs — color, spacing, radius, shadow, type — comes from a token. Screens only ever import components, never reach past them into raw tokens (aside from layout-only gaps, which still use spacing tokens). See [AGENTS.md](./AGENTS.md) for the full token/component reference and the specific rules an AI coding tool should follow in this repo.

**Folder structure:**
```
src/
  design-system/
    tokens/       # color, spacing, radius, elevation, typography
    components/   # 14 components, one folder each
  screens/        # Dashboard, SendMoneyModal, SuccessModal
  mocks/          # typed mock data (recipients, transactions, user)
```

## AI workflow

Built end-to-end with **Claude Code**, across three phases: Figma (design system + screens, via Figma's MCP integration), then code (this repo). I drove it as a design lead + tech lead would — reviewing every artifact before the next phase started, not just accepting first-pass output.

**Where it helped:**
- Translating an agreed HTML/CSS review artifact 1:1 into real Figma variables, text styles, and components — tedious, mechanical work that's easy to get subtly wrong by hand, and easy to verify by screenshot when AI does it
- Catching its own mistakes when I asked for an audit — repeatedly, not once. Discrepancies found across the project: unbound default fills on layout wrapper frames (Figma defaults to a white fill that isn't a token binding), a `textStyleId` binding order bug (setting the style before the text content silently drops the link), frames landing on the wrong Figma page because page context resets between plugin calls, and a component-clone bug where cloning a variant stripped its property reference (so a "Link" button variant rendered the wrong label regardless of what was passed in)
- In code: building consistent, typed components quickly, and — critically — improving on the Figma source where the design had a real bug rather than blindly porting it (see below)

**Where it failed and how I fixed it:**
- **Transaction status color was hardcoded green in Figma** — the "Status" property was plain text bound to a single color, so a "Failed" row would still render green. I didn't port this to code; `TransactionRow.status` is properly typed as `BadgeKind` and composes the real `Badge` component, so color always matches the value.
- **`AmountInput` accepted arbitrary text** — `inputMode="decimal"` only hints the mobile keyboard, it doesn't block keystrokes. Caught by manually typing letters into the field, not by any automated check; fixed with an explicit sanitizer.
- **`Skeleton` collapsed to 0×0 inside `Card`** — it rendered as a bare `<span>` (inline by default), so explicit `width`/`height` were silently ignored unless the parent happened to be flex/grid (which blockifies children). Only visible by actually looking at the loading state in a browser, not from the code alone.
- **A layout centering bug**: `display: flex` + `justify-content: center` on a wrapper fought with `margin-inline: auto` on its capped child, so a "centered, max-width 1440px" layout was silently rendering left-aligned. Confirmed with `getBoundingClientRect()` math, not just eyeballing a screenshot.
- Two claimed timing issues turned out to be tooling latency, not bugs — a loading state I couldn't "catch" in a screenshot was actually resolving correctly; the round trip between issuing a browser action and seeing its result exceeded the delay I was testing against. Worth knowing if you extend the loading logic: verify with a deliberately long delay first, then dial it back down.

## What I'd do with more time

- Wire up a real "Add recipient" flow (currently a static, intentionally non-functional affordance)
- Build out the "Breakdown" detail view behind Total Block's link (currently just logs a click)
- A real accessibility pass — semantic landmarks, full keyboard-nav audit of the modal's focus trap, and a contrast re-check now that the premium redesign's dark Spotlight card is in the mix
- Dark mode, purely via token swap (the token architecture was built two-tier specifically so this would be additive, not a rewrite)
- A second extended screen (e.g. Activity/transaction history) reusing the system with zero new one-off styles
- Basic test coverage — component unit tests at minimum, ideally a visual regression pass given how many of the bugs above were only visible by actually rendering the UI

## Based on an existing product?

Not based on one specific product — "Build With AI" is invented. It borrows conventions common across the category (Mercury, Wise, Cash App-style balance-first dashboards, grouped transaction history, a dark "hero" surface for the primary number) rather than copying any single app's specific screens.

---

## Tech stack

- React + TypeScript + Vite
- Design tokens as CSS custom properties (`src/design-system/tokens`)
- CSS Modules for component styling (no CSS-in-JS, no component library)
- All data mocked — no backend, no auth, no real APIs

## Running locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  design-system/
    tokens/       # color, spacing, radius, elevation, typography — defined once
    components/   # Button, Input, Badge, Card, and composed patterns
  screens/        # Dashboard, Send Money (modal), Success (modal)
  mocks/          # mock data for screens
```

See [AGENTS.md](./AGENTS.md) for rules on how an AI coding tool should use this design system.
