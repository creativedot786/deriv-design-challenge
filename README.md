# RemitOne

> A money transfer experience designed to simplify remittances and local transfers through a unified fintech wallet.

**Live URL:** [deriv-design-challenge-a7ywtuaoh.vercel.app](https://deriv-design-challenge-a7ywtuaoh.vercel.app)
**Figma file:** _TODO — paste the shareable Figma link here_
**Loom walkthrough (max 5 min):** _TODO — paste the Loom link here_

---

## The problem

Living in the UAE, I've noticed that sending money abroad is a routine task for a large portion of the population. Since exchange rates and transfer fees vary across providers, many people keep multiple remittance apps installed just to compare rates before making a transfer.

Once the best option is found, users still need to switch between apps, authenticate through their bank, and complete the payment journey. The experience feels fragmented and takes more effort than it should.

The idea behind RemitOne is to bring this experience together into a single app. Instead of switching between multiple remittance providers, users can connect their provider accounts, compare available rates in one place, choose the best option for their transfer, and send money through a pre-funded wallet topped up using their debit card or Apple Pay.

The goal is simple: make sending money faster, easier, and more transparent.

For this challenge, I intentionally focused on the core journey:

**Dashboard → Send Money → Success**

Rather than designing multiple disconnected screens, I wanted to demonstrate a complete user flow supported by a scalable design system.

From a design perspective, I kept the experience simple and focused. Sending money is the primary purpose of the product, so every decision was made to reduce friction, improve clarity, and help users complete the task confidently.

## Design approach

The direction for RemitOne was based on creating a trustworthy fintech experience with minimal distractions.

The interface prioritizes:

- Clear financial information hierarchy
- Fast access to primary actions
- Simple transfer flow
- Strong visual feedback
- Reusable design patterns

The dashboard focuses on "at a glance" information:

- Available balance
- Quick actions
- Recent transactions

The Send Money experience was designed as a focused interaction rather than a long multi-page journey. The transfer flow is broken into simple steps:

1. Select recipient
2. Enter amount
3. Confirm transfer
4. Receive confirmation

The success state completes the journey by providing confirmation and transaction details, giving users confidence that the transfer was completed.

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

## Folder structure

```
src/
  design-system/
    tokens/       # color, spacing, radius, elevation, typography — defined once
    components/   # 14 components, one folder each
  screens/        # Dashboard, SendMoneyModal, SuccessModal
  mocks/          # typed mock data (recipients, transactions, user)
```

## AI workflow

I used Claude throughout the entire project, from initial design exploration to final implementation.

The challenge required creating the design system and screens in Figma before moving into development. Instead of starting from a blank canvas, I collaborated with Claude to define the product direction, information architecture, design tokens, component inventory, and screen structure.

Once the direction was established, I created the design system and screens in Figma, including reusable components, variables, and styles. I reviewed and refined each stage before moving into implementation.

After completing the design phase, I used Claude again as an engineering partner to build the frontend experience. Claude helped scaffold the project, implement the design token architecture, create reusable React components, and translate the Figma designs into a working product.

Throughout the process, I treated AI as a collaborator rather than an autopilot. I reviewed outputs, refined prompts, challenged decisions, and validated the implementation against the original design direction.

AI was especially useful for accelerating repetitive tasks, maintaining consistency across components, and reviewing the implementation for potential issues.

However, some problems could only be discovered through real interaction with the product. During testing, I identified and fixed issues around input validation, component behaviour, layout alignment, and UI states. These improvements came through manual review and iteration rather than blindly accepting AI-generated output.

Using AI across both design and development allowed me to spend more time focusing on product decisions, usability, and creating a more polished experience.

## What I'd do with more time

This challenge was intentionally scoped to demonstrate the design system and the core money transfer journey. Given more time, I would first validate the concept with users before expanding the product.

The next areas I would explore:

- Provider onboarding and account connection flow
- Wallet funding experience
- Recipient management
- Exchange rate comparison
- Transfer tracking
- Transaction history
- Notifications
- Error and edge cases

From a design system perspective, I would continue expanding the component library, improve documentation, introduce dark mode through the existing token architecture, complete a full accessibility audit, and add automated testing.

The current version focuses on proving the core experience and establishing a scalable foundation. With additional time, I would evolve RemitOne into a complete production-ready remittance platform based on user feedback and validation.

## Based on an existing product?

No. RemitOne is an original concept inspired by a real problem I have observed while living in the UAE, where comparing exchange rates across multiple remittance providers is a common part of sending money internationally.

The product borrows familiar fintech patterns such as balance-first dashboards, transaction history, and streamlined transfer flows, but it is not based on any single existing application.

The goal was to explore how a unified remittance wallet could simplify today's fragmented money transfer experience.

## Tech stack

- React + TypeScript + Vite
- CSS custom properties for design tokens
- CSS Modules for component styling
- Claude Code for AI-assisted development
- Figma for design system and interface design

All data is mocked. No backend, authentication, or real payment APIs are connected.

## Running locally

```bash
npm install
npm run dev
```

See [AGENTS.md](./AGENTS.md) for rules on how an AI coding tool should use this design system.
