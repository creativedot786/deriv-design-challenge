# Build With AI — Money Transfer

> A focused money-transfer web app (Dashboard → Send Money → Success), designed and built as a design-system-driven challenge submission.

**Live URL:** _TODO — add deployed link_
**Figma file:** _TODO — add Figma link_
**Loom walkthrough (max 5 min):** _TODO — add Loom link_

---

## The problem

_TODO — what screen(s)/journey I picked and why. What need it addresses, who it's for, what "premium modern fintech" meant in this context._

## Design system structure

_TODO — once components are built, document:_
- _Token architecture (primitive → semantic, spacing/radius/elevation/type scales) and where they live in code_
- _Component list and API (props, variants) for Button, Input, Badge, Card, and the composed patterns (Transaction Row, Quick Send Item, Recipient Option, Amount Input, Total Block)_
- _How tokens are consumed (CSS custom properties) vs. hardcoded values — the rule enforced throughout_
- _Folder structure (`src/design-system/tokens`, `src/design-system/components`)_

## AI workflow

_TODO — tools used, how I directed them, where AI helped, where it failed and how I fixed it. Key moments worth calling out:_
- _Figma component library built via MCP tools, audited repeatedly for token/binding discrepancies_
- _Iterative design review via HTML artifacts before every Figma build pass_
- _Bugs caught during audits (component-clone property-reference stripping, unbound default fills, misplaced frames) and how they were fixed_

## What I'd do with more time

_TODO — e.g. real add-recipient flow, more transaction states, dark mode via token swap only, animation/motion pass, unit/visual regression tests._

## Based on an existing product?

_TODO — if inspired by a real fintech product, note what was retained, what was changed, and why. (Currently: an invented product, "Build With AI," not based on a specific existing app — retained common fintech patterns like balance-first dashboards and grouped transaction history.)_

---

## Tech stack

- React + TypeScript + Vite
- Design tokens as CSS custom properties (`src/design-system/tokens`)
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
