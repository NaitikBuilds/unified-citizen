# Unified Citizen Governance — Product Verification Record

Final regression matrix recorded during the V5.6 finalization pass.
Baseline: `80ab089` · Branch: `feature/visual-system-overhaul` ·
Mock mode (`VITE_USE_MOCK_API=true`) unless noted.

## Verified workflows

### Public
| Route | Result |
|---|---|
| `/` (landing) | Hero + floating pill nav + CTAs render; paper background; no overflow |
| `/about` | Editorial manifesto layout renders; 19 links |
| `/services` | Service categories + login CTA; clean |
| `/how-it-works` | 5-stage journey + system panels; clean |
| `/departments` | **Live data** (`services.department.list`): PWD/SAN cards with codes, populated |
| `/faq` | 10 semantic `<details>`; click + keyboard toggle work |
| `/contact` | Civic help-desk surface; clean |
| `/help` | Editorial guide + nav cards; clean |

### Auth
| Flow | Result |
|---|---|
| Login (citizen / dept-admin / super-admin) | All three role-redirect correctly (`/citizen`, `/department`, `/admin`) |
| Login validation | Empty/invalid → field errors + `aria-invalid` |
| Register validation | Name ≥2, email format, password ≥6, confirm match — 4 field errors + 4 `aria-invalid` |
| Register duplicate email | `An account with this email already exists` (409 path) — clean |
| Register success | SPA → `/auth/login` with `Account created successfully` banner + prefilled email |
| New-account login | SPA-registered citizen logs in → `/citizen` |
| Session restoration | Refresh keeps session; storage keys `ucg.accessToken`/`ucg.user`/`ucg.refreshToken` |
| Password visibility | Show/hide toggles with aria-labels on both pages |
| Autocomplete | `email`, `current-password`, `name`, `new-password` present |

### Citizen
| Surface | Result |
|---|---|
| Dashboard | Midnight hero (greeting/date/status), 5 metric cards with nav, bell badge, user chip |
| Dashboard (new account) | Empty state "No grievances yet" + all-zero metrics |
| Grievance list | 8 status chips (`aria-pressed`), search, priority/sort selects, 4 rows, pagination |
| Grievance detail | AI analysis (94.0%, midnight + electric), timeline (expand), SLA, attachments, comments |
| Submit | 6 fields (title/description/category/priority/location/attachments), validation, `create` → detail redirect, attachment upload |
| Notifications | Unread badge sync, mark-read + navigate, mark-all, empty state, error → retry → recovery |
| Placeholders | Profile/Settings/Help render the shared `ComingSoon` civic panel |

### Officer / Department
| Surface | Result |
|---|---|
| Dashboard | Live workload metrics (5/4/2/0/0/1 for dept-pwd), assignment queue preview, SLA + escalation readouts labeled `DEMO DATA` |
| Queue (`/department/grievances`) | Department-scoped rows, search/status/priority/sort, pagination |
| Detail | Assignment (dept-admin only), status transitions via ConfirmDialog, role gating ("Your case"/"Not your case"), staff comments |
| Mutation verification | Assign → `IN_PROGRESS` + officer set; Mark resolved → `RESOLVED` + `resolvedAt` (in-memory mock) |

### Admin
| Surface | Result |
|---|---|
| Dashboard | Governance metrics derived from live services (citizens 5, staff 8, departments 6, grievances 18, escalated 3); analytics suite labeled `DEMO DATA` (5 badges) |
| Users | Search/filter/role/department, 14 accounts / 2 pages, inline role+department selects, `updateUser` mutation |
| Departments | 6 cards with codes, create (PAR verified), deactivate via ConfirmDialog |
| RBAC | SUPER_ADMIN guard: citizen hitting `/admin` → redirected to `/citizen` |

### Cross-cutting
| Check | Result |
|---|---|
| Console | Clean across all routes (Vite connect/HMR + React DevTools info only) |
| Responsive (563px mobile) | No horizontal overflow on any route after the `grid-cols-1` base fix (17 grids) |
| Reduced motion | 12 `prefers-reduced-motion` blocks; skeleton pulse disabled; cinematic/reveal/pulse static fallbacks |
| Focus visibility | Shared Button/Input/Select/Textarea/Card/Modal/Tabs + `portal-nav-item`/`gl-chip`/icon-buttons all have `focus-visible` rings (role-tone colors for dept/admin) |
| Dialog semantics | `role="dialog"`, `aria-modal`, labelled, Escape, scroll lock, focus move + restore, **Tab trap** |
| Drawer semantics | `role="dialog"`, `inert` when closed, Escape, overlay click, scroll lock, close-after-nav |
| Forms | `<label htmlFor>`, `aria-invalid`, `role="alert"` errors, `aria-describedby` hints |
| Contrast | Danger fills kept on red scale (ucg-critical fails white-text AA); error text red-600; body slate on paper ≥4.5:1 |
| Typecheck / lint / build | Pass (root + web), lint 0/0, production build clean |

## Known limitations (honest)

1. **Desktop widths not live-verified.** The headless preview is locked to
   563px. The 768/1024/1280/1440 layouts are statically reviewed (grid
   breakpoints, table collapse, drawer/sidebar switch) but not pixel-tested.
2. **Mock data is in-memory** — full page reloads reset created
   grievances/users (register→login must be SPA to keep the new account).
   Durable end-to-end testing requires real-API mode.
3. **Mock-only services** (SLA, escalation, analytics, AI) have no backend
   endpoints. They render with explicit `DEMO DATA` labels; production
   telemetry is blocked on backend implementation.
4. **Focus trap + focus rings** are code- and build-verified; the headless
   environment cannot simulate real keyboard focus (`element.focus()` does
   not stick), so keyboard behavior needs one real-browser pass.
5. **Forgot-password** is intentionally absent — the backend does not support
   that flow.
6. **Pagination beyond page 1** was not live-exercised in the department
   queue (5 rows in dept-pwd); the URL/page logic mirrors the citizen list,
   which was verified.

## Commits in this finalization

- `794afc2` feat(ui): document role system and harden responsive surfaces
- `30bd70d` fix(ui): harden accessibility and motion behavior
