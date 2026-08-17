# Unified Citizen Governance — Role Tone Guide

This document is the contract for how the three authenticated portals express
the UCG visual system. It is a *usage* guide: it names the tokens that already
exist, the rules for applying them, and the mistakes to avoid. It does not
introduce new tokens. If a rule here contradicts code, the code wins — update
one of them so they agree.

---

## 1. Shared CivicOS DNA (80–90% of every screen)

All three portals share one system. Role identity is an accent layer, never a
second product.

| Concern | Rule |
|---|---|
| Typography | Editorial serif (`--font-editorial`, Iowan Old Style stack) for major titles and narrative headings. System/mono (`--font-system`, SF Mono stack) for metadata, statuses, readouts, ticket IDs, eyebrows. Sans (Inter / default UI stack) for body, buttons, forms, navigation. Never make an entire surface mono. |
| Base neutrals | `ucg-ink` text on `ucg-paper` background; `ucg-fog` for hairlines and quiet fills; `ucg-white` for card surfaces; `ucg-midnight` for dark regions only. |
| Surfaces | Cards: `rounded-xl border border-ucg-fog bg-white` + the layered UCG shadow. Paper/fog fills, hairline borders, restrained depth. No generic gray SaaS cards, no arbitrary colored card backgrounds. |
| Geometry | Subtle grid/network backgrounds live in the portal shells and hero regions only (CSS radial/linear patterns, low opacity). |
| Motion | `--ucg-dur-micro` (180ms) / `--ucg-dur-ui` (280ms) for interactions; `--ucg-dur-section` (600ms) for page/section entrances; `--ucg-dur-story` (1200ms) for storytelling; `--ucg-ease-editorial` (`cubic-bezier(0.22,1,0.36,1)`) for editorial entrances. Prefer transform/opacity. Every animation must have a `prefers-reduced-motion: reduce` static fallback. |
| Accessibility | Visible `focus-visible` rings on every interactive element, semantic headings, labeled forms with `aria-invalid`/`role="alert"` errors, dialog/drawer semantics (`role="dialog"`, `aria-modal`, Escape, scroll lock, focus management), `aria-current` on active nav, meaningful aria-labels on icon-only controls. Touch targets ≥ 36–44px on mobile. |
| Shell | `PortalLayout` (tone prop) → `AppLayout` → `Topbar` / `Sidebar` / `MobileNav`. Active nav uses the exact-match → longest-prefix → undefined resolution in `PortalLayout` (never first-match). |
| Icons | lucide-react, consistent `size-4`/`size-5` usage, `aria-hidden` on decorative icons. |

---

## 2. Role identities (10–20% of every screen)

### CITIZEN — Identity: *Responsibility* · Mode: Civic Light

- **Accents**: `ucg-blue` (interaction, active nav, focus), `ucg-electric` /
  `ucg-signal` as restrained cyan accents, muted teal allowed.
- **Feel**: paper-light, calm, clear, dignified, participation-oriented.
- **Surfaces**: white cards on paper; the midnight hero on the dashboard is
  the one permitted large dark region (civic status hero).
- **Density**: comfortable — generous whitespace, editorial pacing.
- **Where**: `/citizen/**`. Shell class `portal-shell--citizen` (no overrides —
  the default).

### OFFICER / DEPARTMENT — Identity: *Duty + Perseverance* · Mode: Civic Duty

- **Accents**: `--color-dept-primary` (`#1d4ed8`, deeper civic blue) for
  active nav/focus/avatar; `--color-dept-verdant` (`#15803d`) restrained;
  `--color-dept-signal` (cyan) for attention.
- **Feel**: more operational density, work-oriented hierarchy, SLA emphasis,
  assignment and progress visibility.
- **Density**: higher than citizen — compact rows, strong mono metadata.
- **Where**: `/department/**`. Shell class `portal-shell--department`.

### ADMIN — Identity: *Power + Grace* · Mode: Civic Command

- **Accents**: `--color-admin-indigo` (`#4338ca`) active nav/focus/avatar;
  `--color-admin-plum` (`#7c3aed`) restrained; `--color-admin-midnight`
  (`#0e1526`) for analytical system panels; `--color-admin-gold` (`#a8842c`)
  **only** for governance emphasis (currently the 2px sidebar brand edge).
- **Feel**: authoritative, precise, never aggressive. Highest information
  density. The shell stays paper — the midnight treatment is reserved for the
  executive hero and analytical panels.
- **Where**: `/admin/**`. Shell class `portal-shell--admin`.

### The 80/20 rule

Shared: typography, spacing system, geometry, component structure,
accessibility, motion, grid language, base neutrals, icon language.
Role-specific: accent palette, strategic surfaces, dashboard visualization
accents, role system panels, semantic emphasis. If a new page feels like a
different product, it is wrong.

---

## 3. Role colors vs semantic colors

These are different axes and both must survive.

| Color | Kind | Usage |
|---|---|---|
| `ucg-blue` / `ucg-electric` / `ucg-signal` | Citizen accent | Civic identity, interaction |
| `dept-primary` / `dept-verdant` / `dept-signal` | Department accent | Officer identity, operational emphasis |
| `admin-indigo` / `admin-plum` / `admin-gold` | Admin accent | Command identity, governance emphasis |
| `ucg-warning` | Semantic | Warnings, duplicates, at-risk SLA, toast warning |
| `ucg-critical` | Semantic | Breaches, escalated, error surfaces, danger dots |
| emerald (`#10b981` scale) | Semantic | Completed/resolved success states |
| red (`#dc2626` scale) | Semantic | Error borders/messages and destructive buttons — keep `red-600/700/800` for danger *fills* because `ucg-critical` (#ff6b61) fails white-text AA contrast |

**Colors that must NOT be flattened by a consistency pass**: success green,
warning amber, danger/critical red, error red, and all three role accent
groups. They carry meaning.

---

## 4. Typography rules

- **Editorial serif**: page H1s, hero greetings, modal titles, card titles
  (`font-editorial`). Size with weight 600 and tight tracking (`-0.01em`
  letter-spacing) at large sizes.
- **System mono**: eyebrows, overlines, ticket IDs (`GRV-1008`), status
  labels, SLA readouts, pagination counts, table headers. Convention:
  `font-system`, 0.625–0.6875rem, `uppercase`, `tracking-[0.08em–0.22em]`.
- **Sans**: body copy, buttons, navigation, forms, descriptions.
- Never set long body paragraphs in mono; never set everything in serif.

---

## 5. Spacing and density rules

- Base rhythm: 4px scale (`p-1` … `p-6`), section spacing 8–16px.
- Citizen: generous — hero to content gap ~24–32px; cards `p-4`/`p-5`.
- Department: tighter — compact rows, `py-2.5`–`py-3` table rows, mono
  metadata right-aligned where it aids scanning.
- Admin: highest density — dense table rows (`ad-table-row` collapse to
  stacked cards below `md`), inline selects, multi-metric panels.
- Mobile is not a collapsed desktop: grids stack (`grid-cols-1` →
  `sm:grid-cols-2` → `lg:grid-cols-3`), tables become stacked cards below
  `md`, control bars wrap, and touch targets stay usable.

---

## 6. Motion rules

- Communicate state/progress/relationship/navigation/data-change only.
- No: floating shapes, constant spinning, bouncing, flashing backgrounds,
  random particles, unnecessary card rotations.
- Tokens: micro 180ms, ui 280ms, section 600ms, story 1200ms, cinematic
  multi-second (hero only).
- Cinematic/hero motion: dashboard hero, AI analysis, grievance timeline.
  Medium: page entry, cards, notification events. Low: forms, tables,
  settings-like controls.
- `prefers-reduced-motion: reduce`: disable camera, parallax, particles,
  long entrances, pulse; render completed static states immediately.
- Keep animation off the critical path — content must be visible without it.

---

## 7. Accessibility requirements (enforced)

- Every interactive element has a visible `focus-visible` ring (UCG blue,
  or the role's accent).
- Forms: `<label htmlFor>`, `aria-invalid` on error, `role="alert"` error
  text, `aria-describedby` hints, appropriate `autocomplete`.
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`,
  Escape to close, scroll lock, focus moves in and is restored.
- Drawers: same dialog semantics + `inert` when closed, body scroll lock,
  overlay click closes, close after navigation.
- Nav: `aria-current="page"` on the active item; icon-only buttons carry
  aria-labels.
- Status changes: `role="status"`/`aria-live` for async loading/toast
  regions; `role="alert"` for errors.
- No information conveyed by color alone (always pair with text/icon).
- Contrast: body text on paper ≥ 4.5:1; avoid light-on-light accents.

---

## 8. Component usage rules

- **Shared primitives**: `Button`, `Input`, `Select`, `Textarea`, `Card`,
  `Badge`, `StatusBadge`, `PriorityBadge`, `GrievanceCard`, `Modal`,
  `ConfirmDialog`, `Table`, `Pagination`, `EmptyState`, `ErrorState`,
  `Skeleton`, `Spinner`, `Toast`. Never re-implement these per page.
- **Semantic mappings** live in one place: `GRIEVANCE_STATUS_LABELS`,
  `GRIEVANCE_STATUS_VARIANTS`, `PRIORITY_LABELS`/variants
  (`components/grievance`), `SLA_STATUS_*` (`components/sla/slaMeta`).
  Do not restyle per-page; do not invent statuses/priorities.
- **Forms**: fields use the shared field class language; the auth surface
  applies `ucg-input-field` / `auth-label` refinements via `className`/
  `labelClassName` — base primitives stay neutral.
- **Role tone**: pass `tone` on `PortalLayout` (defaults to the portal);
  pages themselves do not hardcode role colors — they use the shared
  primitives and the shell carries the identity.
- **Badges/cards** must not be recolored per screen; semantic tone comes
  from the component's variant, not from page-level class overrides.

---

## 9. Mock / demo labeling rules

- `VITE_USE_MOCK_API=true` is the default dev mode; the same service
  interfaces run against the API adapters in real mode.
- Any surface backed by a **mock-only service** (SLA readouts, escalation
  readouts, analytics suite, AI analysis) must carry an explicit
  `DEMO DATA` badge or equivalent system metadata so it is never mistaken
  for backend telemetry.
- Never show "Submitted successfully", "Notification sent", or an AI result
  unless the service actually returned it. No fabricated backend behavior.

---

## 10. Correct vs incorrect role usage

| ✅ Correct | ❌ Incorrect |
|---|---|
| Citizen dashboard hero: midnight + cyan signal accents, paper everywhere else | Making the whole citizen portal dark |
| Department queue: dept-primary active nav, dense mono rows, SLA readouts | Recoloring status badges to verdant |
| Admin analytical panel: midnight with indigo/plum accents | Turning every admin card purple |
| Admin gold: 2px sidebar brand edge only | Gold buttons, gold badges, gold everywhere |
| Error surfaces: `ucg-critical` tint + red error text/fills where contrast demands | Replacing red danger fills with salmon `ucg-critical` |
| Role accent on active nav item + avatar | Changing the citizen identity when inside `/department` routes |

---

## 11. Verification checklist for new surfaces

1. Typecheck, lint, production build pass.
2. The page renders in all three roles' shells without leaking the wrong
   accent.
3. Semantic status/priority colors come from the shared variants.
4. Every interactive element: keyboard reachable, focus-visible ring,
   correct aria semantics.
5. `prefers-reduced-motion: reduce` renders a complete static page.
6. 375 / 580 / 768 / 1024 / 1440 widths: no horizontal overflow, no
   microscopic grids, touch targets intact.
7. Mock-only data carries a demo label; no fabricated success states.
8. Console is clean (no React warnings, no failed requests).
