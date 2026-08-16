# Unified Citizen Governance — Backend API Reference

Base URL: `http://localhost:5000/api/v1` (port configurable via `PORT`).

All endpoints below reflect the **implemented** backend. Endpoints that do not
exist in the codebase are not documented here.

---

## 1. Conventions

### Authentication

Protected endpoints require a Bearer access token:

```
Authorization: Bearer <accessToken>
```

Access tokens are short-lived JWTs (15 minutes). When they expire, exchange a
refresh token via `POST /auth/refresh`.

### IDs

All database primary keys are **CUIDs** (e.g. `cmsrzow3w000azgft4wvilxuy`),
not UUIDs. Path/body IDs are validated against the CUID format and rejected
with `400` when malformed.

### Error format

Errors are returned as JSON. The central error handler produces:

```json
{ "success": false, "error": "Human readable message" }
```

Validation failures additionally include a structured `errors` array:

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

| Status | Meaning |
| ------ | ------- |
| 400 | Validation failure / invalid input |
| 401 | Missing/invalid/expired credentials |
| 403 | Authenticated but not authorized |
| 404 | Resource not found (or not visible to you) |
| 409 | Conflict (duplicate resource, already escalated, etc.) |
| 413 | Uploaded file too large |
| 429 | Rate limit exceeded |
| 500 | Internal error (message masked outside development) |

Unknown routes return a JSON 404 (`{ "success": false, "error": "Route not found" }`).

### Rate limiting

- `POST /auth/login` — 10 requests / 15 min
- `POST /auth/register`, `POST /auth/refresh` — 20 requests / 15 min

Limits are per-IP and apply **before** validation. Exceeded requests return `429`.

### Pagination

List endpoints support `?page=` and `?limit=` query parameters (`limit` capped
at 100). Responses include additive metadata:

```json
{
  "grievances": [],
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

---

## 2. Health

### `GET /health`

Unauthenticated. Returns:

```json
{ "success": true, "message": "Unified Citizen Governance API is running" }
```

---

## 3. Authentication (`/auth`)

### `POST /auth/register`

Registers a **citizen** account. The role is always `CITIZEN`; client-supplied
roles are never honored.

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

- `name` — min 2 chars
- `email` — valid email format
- `password` — min 6 chars

Responses:

- `201` — `{ "message": "User registered successfully", "userId": "<cuid>" }`
- `409` — email already registered

### `POST /auth/login`

Request:

```json
{ "email": "jane@example.com", "password": "secret123" }
```

Response `200`:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "<cuid>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CITIZEN",
    "departmentId": null
  }
}
```

- `401` — invalid email or password (same message for both, no enumeration)

### `POST /auth/refresh`

Exchanges a refresh token for a new access/refresh pair (token rotation).
The old token is revoked; refresh tokens are stored hashed (SHA-256), never raw.

Request:

```json
{ "refreshToken": "<refreshToken>" }
```

Response `200`:

```json
{ "accessToken": "<new jwt>", "refreshToken": "<new jwt>" }
```

Reuse of a revoked token outside the 10-second concurrency grace period revokes
all of the user's refresh tokens and returns `401`.

### `POST /auth/logout`

Requires Bearer token. Revokes the provided refresh token (or all of the
user's tokens when none is provided).

Request (optional body):

```json
{ "refreshToken": "<refreshToken>" }
```

Response `200` — `{ "message": "Logged out successfully" }`

### `GET /auth/me`

Requires Bearer token. Returns the authenticated user's profile:

```json
{
  "user": {
    "id": "<cuid>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CITIZEN",
    "departmentId": null,
    "createdAt": "2026-08-17T00:00:00.000Z"
  }
}
```

---

## 4. Users (`/users`)

Admin user management (requires `SUPER_ADMIN` or `DEPARTMENT_ADMIN`).
`DEPARTMENT_ADMIN` access is scoped to their own department; a department admin
without a department receives `403`.

### `GET /users`

Lists users. Paginated (`?page=`, `?limit=`). Department admins see only users
in their department; super admins see all.

Response `200`:

```json
{
  "users": [
    {
      "id": "<cuid>",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CITIZEN",
      "departmentId": null,
      "createdAt": "2026-08-17T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### `GET /users/:id`

Returns one user (`404` if not found / outside scope; `400` if the ID is not a
valid CUID).

### `PATCH /users/:id`

**SUPER_ADMIN only.** Updates a user's role and/or department. Role changes and
department changes are audited.

Request (at least one field required):

```json
{
  "role": "OFFICER",
  "departmentId": "<cuid>"
}
```

`role` — one of `CITIZEN`, `OFFICER`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`.
`departmentId` — valid CUID or `null` to unassign.

Responses: `200` with the updated user, `400` (inactive department / invalid
values), `404` (user or department not found).

### `PATCH /users/me`

Authenticated. Updates the caller's own profile.

Request:

```json
{ "name": "Jane Q. Doe" }
```

Response `200` — `{ "message": "Profile updated successfully", "user": { ... } }`

Note: the canonical "get my profile" endpoint is `GET /auth/me`.

---

## 5. Departments (`/departments`)

### `GET /departments`

Authenticated. Lists **active** departments.

Response `200`:

```json
{
  "departments": [
    {
      "id": "<cuid>",
      "name": "Roads",
      "code": "ROA",
      "description": null,
      "isActive": true,
      "createdAt": "2026-08-17T00:00:00.000Z"
    }
  ]
}
```

### `GET /departments/:id`

Authenticated. Returns one active department (`400` invalid CUID, `404` not found).

### `POST /departments`

**SUPER_ADMIN only.** Creates a department.

Request:

```json
{
  "name": "Water Supply",
  "code": "WAT",
  "description": "Handles water-related grievances"
}
```

`code` is optional; when omitted it is generated from the name. Duplicate
name/code → `409`.

### `PATCH /departments/:id`

**SUPER_ADMIN only.** Updates `name` and/or `description` (at least one required).
Audited.

### `DELETE /departments/:id`

**SUPER_ADMIN only.** **Soft-deletes** a department by setting `isActive: false`.
Existing users/grievances/SLA policies keep their references. Already-inactive
departments → `400`.

---

## 6. Grievances (`/grievances`)

All grievance routes require authentication. Access rules:

| Role | List / View |
| ---- | ----------- |
| CITIZEN | Own grievances only |
| OFFICER | Grievances with an **ACTIVE assignment to them** (must belong to their department) |
| DEPARTMENT_ADMIN | All grievances in their department |
| SUPER_ADMIN | All grievances |

Staff users without a department get `403`.

### `POST /grievances`

**CITIZEN only.** Creates a grievance. Grievance creation and its SLA are
atomic (a failed SLA rolls back the grievance). When no department is set, no
SLA is created.

Request:

```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole blocking the right lane for two weeks.",
  "category": "ROADS",
  "priority": "HIGH",
  "departmentId": "<cuid>",
  "isAnonymous": false,
  "location": "Main Street, Sector 4",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

- `title` — min 5 chars
- `description` — min 10 chars
- `category` — required
- `priority` — optional, one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (default `MEDIUM`)
- `departmentId` — optional CUID (citizens may suggest a department)

Response `201`:

```json
{
  "message": "Grievance created successfully",
  "grievance": {
    "id": "<cuid>",
    "ticketId": "GRV-1755000000000-1234",
    "title": "Pothole on Main Street",
    "description": "Large pothole blocking the right lane for two weeks.",
    "category": "ROADS",
    "priority": "HIGH",
    "status": "SUBMITTED",
    "departmentId": "<cuid>",
    "citizenId": "<cuid>",
    "latitude": 28.6139,
    "longitude": 77.209,
    "address": null,
    "createdAt": "2026-08-17T00:00:00.000Z",
    "updatedAt": "2026-08-17T00:00:00.000Z"
  }
}
```

### `GET /grievances`

Authenticated. Lists grievances scoped by role (see table above). Paginated.

### `GET /grievances/:id`

Authenticated. Returns one grievance (`403` if outside the caller's scope).

### `PATCH /grievances/:id`

Authenticated. Updates a grievance.

Rules:
- **CITIZEN** — owner only, and only while status is `SUBMITTED`
- **OFFICER** — only grievances **actively assigned to them** (and in their department)
- **DEPARTMENT_ADMIN** — department scope
- **SUPER_ADMIN** — any grievance; may also change `departmentId`

Request (all optional):

```json
{
  "title": "Updated title",
  "description": "Updated description text that is long enough.",
  "category": "WATER",
  "departmentId": "<cuid>",
  "latitude": 28.7,
  "longitude": 77.2,
  "address": "New address"
}
```

### `PATCH /grievances/:id/status`

**OFFICER / DEPARTMENT_ADMIN / SUPER_ADMIN.** Transitions a grievance's status.
Officers require an ACTIVE assignment; department admins require department
scope.

Allowed transitions (others → `400`):

```
SUBMITTED     -> AI_CLASSIFIED | ASSIGNED | IN_PROGRESS
AI_CLASSIFIED -> ASSIGNED | IN_PROGRESS | REJECTED
ASSIGNED      -> IN_PROGRESS | REJECTED
IN_PROGRESS   -> RESOLVED | REJECTED | ESCALATED
ESCALATED     -> IN_PROGRESS | RESOLVED
RESOLVED      -> REOPENED
REJECTED      -> (terminal)
REOPENED      -> IN_PROGRESS
```

Request:

```json
{ "status": "IN_PROGRESS", "comment": "Investigating" }
```

`comment` is optional and recorded as an audit note. Resolving a grievance
completes its SLA; rejecting a grievance also completes its SLA (terminal).

### `DELETE /grievances/:id`

**CITIZEN (own) / SUPER_ADMIN.** Permanently deletes a grievance and its
dependent records. Audited.

### `POST /grievances/:id/assign`

**DEPARTMENT_ADMIN / SUPER_ADMIN.** Assigns (or reassigns) a grievance to an
officer.

Request:

```json
{ "officerId": "<cuid>", "reason": "Best fit for this category" }
```

- `officerId` — required CUID; the officer must belong to the grievance's department
- `departmentId` — optional (ignored for the assignment; derived from the grievance)
- `reason` — optional

Reassignment cancels the previous ACTIVE assignment. Audited; the officer is
notified. Assignment statuses: `ACTIVE`, `COMPLETED`, `CANCELLED`.

### `POST /grievances/:id/escalate`

**CITIZEN (own) / OFFICER (actively assigned) / DEPARTMENT_ADMIN (scope) / SUPER_ADMIN.**

Request:

```json
{ "level": "LEVEL_2", "reason": "No response in 7 days" }
```

- `level` — one of `LEVEL_1`, `LEVEL_2`, `LEVEL_3`, `ADMIN`
- `reason` — min 3 chars

Creates an `Escalation` record (`status: OPEN`), moves the grievance to
`ESCALATED`, audits, and notifies the citizen. Duplicate OPEN escalation for
the same grievance → `409`.

### `POST /grievances/:id/feedback`

**CITIZEN (own, RESOLVED only).** One feedback per citizen per grievance.

Request:

```json
{ "rating": 4, "comment": "Satisfied with the outcome" }
```

`rating` — integer 1–5. Duplicate submission → `409`.

### `GET /grievances/:id/feedback`

Authenticated, grievance-scoped. Citizens see only their own feedback; staff
see all feedback for the grievance.

### `POST /grievances/:id/reopen`

**CITIZEN (own, RESOLVED only).** Reopens a resolved grievance
(`RESOLVED -> REOPENED`), optionally with a reason comment. The officer holding
the ACTIVE assignment (if any) is notified. Audited.

Request:

```json
{ "reason": "The issue returned after a week" }
```

### `POST /grievances/:id/comments`

Authenticated, grievance-scoped (citizen owner, active-assigned officer,
department admin scope, super admin).

Request:

```json
{ "message": "Please provide an update", "isInternal": false }
```

- `message` — required
- `isInternal` — optional boolean; **internal comments are hidden from citizens**

Response `201` — `{ "message": "Comment added successfully", "comment": { ... } }`

### `GET /grievances/:id/comments`

Authenticated, grievance-scoped. Citizens do not see `isInternal` comments.

### `POST /grievances/:id/attachments`

Authenticated, grievance-scoped. Multipart upload with a single `file` field.

- Allowed types: JPEG, PNG, WEBP, PDF, DOC, DOCX
- Max size: 5 MB (exceeding → `413`)
- Content is verified by magic bytes after upload (client MIME header is not trusted)

Response `201` — `{ "message": "File uploaded successfully", "attachment": { ... } }`

### `GET /grievances/:id/attachments`

Authenticated, grievance-scoped. Returns attachment metadata (no file contents).

### `GET /grievances/:id/attachments/:attachmentId`

Authenticated, grievance-scoped. **Protected download** — streams the file with
`Content-Disposition: attachment`. The attachment must belong to the grievance;
access follows the same grievance-scope rules. There is no public/static file
exposure.

---

## 7. Notifications (`/notifications`)

### `GET /notifications`

Authenticated. Lists the caller's notifications, newest first. Paginated.

```json
{
  "notifications": [
    {
      "id": "<cuid>",
      "userId": "<cuid>",
      "grievanceId": "<cuid>",
      "title": "Grievance escalated",
      "message": "Your grievance has been escalated for urgent handling.",
      "type": "ESCALATION_CREATED",
      "isRead": false,
      "createdAt": "2026-08-17T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

`type` — one of `GRIEVANCE_CREATED`, `STATUS_CHANGED`, `COMMENT_ADDED`,
`ASSIGNMENT_CHANGED`, `SLA_WARNING`, `ESCALATION_CREATED`, `SYSTEM`.

### `PATCH /notifications/:id/read`

Authenticated. Marks the caller's notification as read (`404` if the
notification does not belong to them).

---

## 8. Governance notes

- **SLA:** Created atomically with the grievance when a department is set.
  Policies are looked up strictly within the grievance's department (priority-
  specific first, then department default). The periodic checker (60 s)
  transitions SLA to `WARNING` then `BREACHED`, and notifies the citizen on
  breach. `RESOLVED` and `REJECTED` grievances complete their SLA.
- **Audit log:** Registration, login, logout, role/department changes,
  department create/update/deactivate, grievance create/update/status/delete,
  assignment, escalation, reopen, and staff comments are audited. Passwords and
  tokens are never stored in audit records.
- **Refresh tokens:** Stored hashed (SHA-256) with rotation and replay
  detection. Expired/revoked tokens older than 30 days are purged hourly.
- **Departments:** Soft-deleted via `isActive`. Inactive departments cannot
  receive new assignments or user assignments.
