---
title: "Astryx Getting Started Guide"
description: "Meta's 'agent-ready' unified design system, open-sourced under the MIT license on June 18, 2026."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Astryx
  - Meta design system
  - React StyleX
  - agent-ready UI
  - design tokens
tags:
  - UI
  - Design System
  - React
  - Meta
  - Open Source
---

# Astryx Getting Started Guide

> An "Agent-Ready" unified design system open-sourced by Meta under the MIT license on June 18, 2026
> Official site: [astryx.atmeta.com](https://astryx.atmeta.com) | GitHub: [facebook/astryx](https://github.com/facebook/astryx) | Currently Beta (v0.1.x)

One-line summary: Meta open-sourced the design system it uses internally. It's not just a UI library — it extends into components + themes + templates + CLI + MCP server, letting small startups achieve consistent UX without a designer. In short, it's great.

---

## 1. What Is Astryx?

Astryx is Meta's largest internal design system — refined over 8 years and powering 13,000+ internal apps — rebuilt on React + StyleX and released publicly. It's not just a UI library but a combination of **components + themes + templates + CLI + MCP server** working as a single system, designed from the ground up so humans and AI coding agents build UI the same way, off the same reference.

| Item | Details |
|---|---|
| Release date | June 18, 2026 (Beta) |
| License | MIT |
| Underlying tech | React, StyleX (Meta's compile-time CSS engine), TypeScript |
| Component count | 150+ (accessibility and dark mode built in by default) |
| Public themes | 7 npm packages (neutral, butter, chocolate, matcha, stone, gothic, y2k) |
| Track record | 8 years inside Meta, 13,000+ apps, roughly half of updates contributed by the internal builder community |
| Build requirements | None — pre-built CSS provided, no PostCSS/Babel plugins needed |

---

## 2. Key Features

### 2.1 Agent-Ready / AI-Fluent Design

- All components follow the same naming, prop, and composition conventions, so learning a handful lets both humans and AI predict the behavior of the rest
- The CLI returns a self-describing JSON manifest — AI agents read a structured command system directly instead of scraping help text
- Built-in **MCP (Model Context Protocol) server** — lets agents like Claude, Cursor, and Copilot query the component API and scaffold programmatically
- The repository includes a `CLAUDE.md`, and running `npx astryx init` automatically sets up AI-agent documentation in your project

### 2.2 Full Customization Without Vendor Lock-In

| Customization layer | Method |
|---|---|
| Design Token | A theme is a set of CSS custom property overrides. Change color, typography, radius, and motion at the token level to restyle every component with zero component code changes |
| Styling Override | Internally StyleX, but invisible to consumers. Override via `className` using Tailwind, CSS Modules, or plain CSS |
| Swizzle (Eject) | `npx astryx swizzle Button` — extracts the full component source into your project for direct ownership and modification. You own only what you swizzled; everything else keeps receiving upstream updates |
| Open Internals | Every primitive is exported and composable at any level. Nothing is locked behind a closed top-level API |

### 2.3 Three-Layer Architecture

| Layer | Components | Role |
|---|---|---|
| Foundations | Typography, Color, Layout, Accessibility | The basis for visual consistency and accessibility |
| Components | 150+ TypeScript components | Reusable UI building blocks (Button, Modal, DataTable, Form Wizard, etc.) |
| Patterns / Templates | Table Page, Detail Page, Form Wizard, Navigation, Data Entry Flow | Proven page-level design solutions — scaffold full source via CLI |

### 2.4 Other Technical Features

- **Context-aware spacing compensation**: the system automatically corrects the double-padding problem caused by nested components — a key differentiator from other design systems
- **Guidance over enforcement**: design opinions live only in docs and examples. Pass any value and the component renders as-is (guardrails don't fight the developer)
- Two deployment approaches: (1) use pre-built stylesheet imports only, or (2) build StyleX from source (`@astryxdesign/build`)

---

## 3. Installation and Initial Setup

### 3.1 Package Installation

```bash
# npm
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli

# pnpm
pnpm add @astryxdesign/core @astryxdesign/theme-neutral
pnpm add -D @astryxdesign/cli
```

For reliable CLI usage, it's recommended to register a script in `package.json` (this avoids path errors when AI agents or new developers invoke the CLI):

```json
"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

### 3.2 CSS Setup (Next.js + Tailwind — the Simplest Path)

Pre-built CSS coexists with Tailwind with no build plugins required.

```css
/* src/app/globals.css */
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
@import '@astryxdesign/core/tailwind-theme.css';
@import 'tailwindcss/utilities.css' layer(utilities);
```

`tailwind-theme.css` bridges XDS tokens into Tailwind utilities:

| Tailwind class | XDS token |
|---|---|
| `text-primary` / `text-secondary` | `--color-text-primary` / `--color-text-secondary` |
| `bg-surface` / `bg-card` / `bg-body` | `--color-background-*` |
| `rounded-sm` / `md` / `lg` | `--radius-inner` / `element` / `container` |
| `shadow-sm` / `md` / `lg` | `--shadow-low` / `med` / `high` |

### 3.3 Theme Provider Setup

```tsx
// src/app/providers.tsx
'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
```

```tsx
// src/app/layout.tsx
import './globals.css';
import {Providers} from './providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3.4 Using Your First Component

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello XDS" variant="primary" />;
}
```

Components use per-path imports (`@astryxdesign/core/Button`), and the whole system follows consistent prop conventions — for example, `Button` takes a `label` prop instead of children. With Vite, the same CSS import + Provider setup applies and no separate build plugin is needed.

---

## 4. Usage Examples

### 4.1 Using the CLI

```bash
npx astryx --help                        # full command list
npx astryx init                          # initialize project (auto-sets up AI agent docs)
npx astryx component Button              # full component docs + related block templates
npx astryx template --list               # full list of page/block templates
npx astryx template dashboard            # generate full source for a dashboard page
npx astryx template settings --skeleton  # layout skeleton (with spacing annotations)
npx astryx docs                          # reference docs (principles, tokens, themes, styling)
npx astryx docs tokens                   # spacing/color/radius/typography token reference
npx astryx docs theme                    # theming guide (Theme, defineTheme, light/dark)
npx astryx theme build                   # build production theme CSS
npx astryx swizzle Button                # eject component source
npx astryx upgrade --apply               # run migration codemods between versions
npx astryx gap-report                    # report missing features
```

Component docs can also be queried directly from the core package without the CLI:

```bash
node node_modules/@astryxdesign/core/docs.mjs Button          # full docs for a specific component
node node_modules/@astryxdesign/core/docs.mjs --list --brief  # brief summary of all components
```

### 4.2 Swizzle Workflow

```bash
# 1. Extract the real component source into your repo
npx astryx swizzle Button
```

```tsx
// 2. Import the local copy instead of the package
import {Button} from './components/Button';
```

The ejected source can be freely modified, while the remaining un-customized components continue to receive package updates.

### 4.3 Quickly Getting Started with Page Templates

Templates use a content-only structure, providing dashboard, settings, form, and detail page patterns that combine header/content/panel slots within `XDSLayout`. Global navigation is added by wrapping with `XDSAppShell`, `XDSTopNav`, or `XDSSideNav`.

```bash
npx astryx template dashboard   # -> generates the full dashboard page source in your project
```

### 4.4 AI Agent Integration (MCP)

Running `npx astryx init` sets up AI-agent documentation for the project, and the MCP server lets Claude Code, Cursor, and similar agents query the component API, tokens, and templates in structured form directly. Rather than agents inventing arbitrary CSS wrappers, they generate UI conforming to brand guidelines based on the system's machine-readable manifest — dramatically reducing style fragmentation in AI-generated code and UI debugging time.

---

## 5. How Startups Can Use It

### 5.1 Why It Fits Startups

| Startup problem | Astryx's solution |
|---|---|
| No designer / limited design resources | Meta's 8-year-validated components + 7 themes -> brand it by changing tokens alone. Accessibility and dark mode are built in, no separate investment needed |
| "Adopting a big-tech system makes us look like someone else's brand" | Themes are CSS variable overrides, so you can fully transform it into your own brand without forking or wrapping |
| Maintenance debt from copy/paste component collections | Upstream fix/upgrade path is preserved (`astryx upgrade --apply` codemods). You only own what you've swizzled |
| Small teams heavily reliant on AI coding tools | Agents read the system directly via MCP/CLI, structurally guaranteeing consistency in vibe-coded output |
| Licensing cost | MIT — unlimited free use in commercial products |

### 5.2 Phased Adoption Roadmap

**Phase 1 — MVP (Day 1-7)**

1. `npm install` + CSS import + `<Theme>` Provider — up and running instantly with zero build config
2. Pick a template matching your product type from `npx astryx template --list` (dashboard, settings, form, etc.)
3. Use the default theme (neutral) as-is and focus on product logic — UI starts from an "80% done" state

**Phase 2 — Branding (Week 2-4)**

1. Understand the token structure via `npx astryx docs tokens`
2. Define your own theme (`defineTheme`) by overriding brand colors, typography, and radius as CSS custom properties
3. Generate production theme CSS via `npx astryx theme build` — not a single line of component code changes

**Phase 3 — Differentiation (Month 2+)**

1. `swizzle`-eject only the components on screens that need a competitive edge, for deep customization
2. Keep the rest tracking upstream -> minimize maintenance debt
3. Use `astryx gap-report` to request needed features upstream or contribute them directly

**AI-Native Development Practice (in parallel across all phases)**

1. Set up agent docs + connect the MCP server via `npx astryx init`
2. Delegate tasks like "build a payment settings page based on the Astryx template" to Claude Code / Cursor
3. The agent reads the manifest and generates code that follows the system's rules -> reducing review costs

### 5.3 Usage Scenarios by Startup Type

| Type | Usage |
|---|---|
| B2B SaaS | Build admin/analytics screens in days using dashboard/table page/settings templates. Complex components like DataTable and Form Wizard are already battle-tested |
| Fintech / Web3 | Built-in accessibility and dark mode ease regulatory/audit burden. Token-based theming supports multi-brand (white-label) scenarios |
| Agencies / contract development | Swap only the client-specific theme package to ship multiple projects from the same codebase — shortens delivery time |
| AI-native products | Use the Astryx manifest as a grounding source for products where an LLM dynamically generates UI — ensures generated-UI consistency |
| Internal tools | Astryx originates from Meta's own internal tools — the most battle-tested use case for ops dashboards and back offices |

### 5.4 Pre-Adoption Checklist (Risks)

- **Beta stage** (v0.1.x): early for a public project; breaking changes are possible, so include the `astryx upgrade --apply` codemod path in CI
- **React only**: not suitable for a Vue/Svelte stack
- **Component count discrepancy**: the GitHub README says 150+, the docs site says 160+ — check the actual count needed via `npx astryx component --list`
- **Unreleased packages**: `@astryxdesign/lab` (experimental components) and `@astryxdesign/vega` (chart wrapper) aren't published to npm yet — products where charts are core need a separate chart library alongside
- **Community maturity**: at 3 weeks post-launch, GitHub has 6.3k stars and 140+ issues — the ecosystem (third-party extensions, tutorials) is still thinner than shadcn/ui or MUI

---

## 6. Summary

Astryx's core value comes down to three things:

1. **Battle-tested breadth** — 150+ components and page patterns refined over 8 years and 13,000+ apps at Meta
2. **Lock-in-free customization** — three degrees of freedom from token theming to className overrides to swizzle ejection, all under MIT
3. **Human-AI shared design** — a CLI JSON manifest and MCP server let humans and agents build from the same reference

For startups, it can be summarized as a tool that lets you "hand 80% of your UI to a battle-tested system and focus the remaining 20% on differentiation and business logic." That said, since it's still in Beta, it's safer to secure the upgrade codemod path and pre-validate core dependent components before adopting.

---

## References

- Official site: https://astryx.atmeta.com
- Intro blog: https://astryx.atmeta.com/blog/introducing-astryx
- Technical background: https://astryx.atmeta.com/blog/how-astryx-works
- GitHub: https://github.com/facebook/astryx
- Component Storybook: https://facebook.github.io/astryx/
- StyleX: https://stylexjs.com
