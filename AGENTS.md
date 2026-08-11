# Unified Citizen Governance Platform — AI Agent Instructions

## 1. Project Overview

This repository contains the Unified Citizen Governance Platform.

The platform is an AI-powered citizen grievance management and governance

system connecting:

- Citizens
- Government departments
- Department officers
- Department administrators
- Super administrators

The platform allows citizens to submit, track, and receive updates about

government grievances.

Government departments can process, assign, resolve, and escalate grievances.

Administrators can monitor the entire governance system through analytics

and dashboards.

---

## 2. Main Features

The platform should eventually support:

### Citizen

- Registration
- Login
- Profile management
- Submit grievance
- Upload attachments
- Add location
- Track grievance
- View grievance history
- View grievance status timeline
- Receive notifications
- Submit feedback
- Reopen unresolved grievances
- AI-assisted grievance submission

### Department Officer

- Officer login
- Officer dashboard
- View assigned grievances
- Filter grievances
- View grievance details
- Update grievance status
- Add comments
- Upload resolution proof
- Escalate grievances
- View department analytics

### Department Administrator

- Manage department officers
- Assign grievances
- Monitor department performance
- View SLA violations
- Manage department-level analytics

### Super Administrator

- Manage users
- Manage departments
- Manage grievance categories
- View all grievances
- Monitor escalations
- Monitor SLA violations
- View system-wide analytics
- Manage governance configuration

### AI

The AI system may assist with:

- Grievance classification
- Department prediction
- Priority prediction
- Urgency detection
- Duplicate grievance detection
- Grievance summarization
- Suggested resolution
- Citizen assistance

AI must assist the system but must not blindly perform sensitive

administrative actions.

---

# 3. Repository Architecture

This is a monorepo.

The main structure is:

apps/

  web/

  api/

packages/

  shared/

  config/

prisma/

docs/

.github/

[AGENTS.md](http://AGENTS.md)

---

# 4. Frontend

The frontend is located at:

apps/web

Technology:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts

Frontend responsibilities:

- User interface
- Routing
- Authentication state
- API communication
- Forms
- Dashboards
- Charts
- Notifications
- Responsive design

Do not put database logic directly inside frontend components.

Do not expose secrets or API keys in frontend code.

---

# 5. Backend

The backend is located at:

apps/api

Technology:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

Backend responsibilities:

- Authentication
- Authorization
- Business logic
- Database operations
- Grievance management
- User management
- Department management
- AI integration
- Notifications
- Audit logging
- API validation

The backend should use the following architecture:

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

Do not put large amounts of business logic directly inside routes.

---

# 6. Database

PostgreSQL is the primary database.

Prisma is the ORM.

Important entities include:

- User
- CitizenProfile
- Department
- OfficerProfile
- Grievance
- GrievanceCategory
- GrievanceStatusHistory
- GrievanceAssignment
- Comment
- Attachment
- Notification
- Escalation
- Feedback
- AIAnalysis
- AuditLog

Database schema changes must be made through Prisma migrations.

Never manually modify the production database.

---

# 7. User Roles

The system uses role-based access control.

Available roles:

- CITIZEN
- OFFICER
- DEPARTMENT_ADMIN
- SUPER_ADMIN

Every protected API route must verify authentication.

Routes must verify that the authenticated user has the required role.

Never trust the role supplied by the frontend.

The backend must determine the user's actual role from authenticated data.

---

# 8. Authentication

Authentication should use:

- Secure password hashing
- JWT authentication
- Protected routes
- Role-based authorization

Passwords must NEVER be stored as plaintext.

Never log passwords.

Never return password hashes in API responses.

Authentication secrets must be stored in environment variables.

Never commit `.env` files.

---

# 9. API Structure

All APIs should use:

/api/v1/

Example:

GET /api/v1/grievances

POST /api/v1/grievances

GET /api/v1/grievances/:id

PATCH /api/v1/grievances/:id

Authentication:

POST /api/v1/auth/register

POST /api/v1/auth/login

GET /api/v1/auth/me

---

# 10. API Response Format

Use consistent API responses.

Successful response example:

{

  "success": true,

  "data": {},

  "message": "Operation successful"

}

Error response example:

{

  "success": false,

  "message": "Something went wrong",

  "error": {}

}

Do not expose internal stack traces in production responses.

---

# 11. Validation

All external input must be validated.

Use Zod for validation.

Never assume that frontend validation is sufficient.

Validate:

- Request body
- Query parameters
- Route parameters
- Uploaded file metadata
- Important AI outputs

---

# 12. Grievance Lifecycle

The main grievance lifecycle is:

SUBMITTED

↓

AI_ANALYZED

↓

ASSIGNED

↓

IN_PROGRESS

↓

RESOLVED

↓

CLOSED

Additional states may include:

REJECTED

ESCALATED

REOPENED

Status changes must be validated by backend business rules.

Users must not be able to arbitrarily change grievance statuses.

---

# 13. AI Architecture

AI functionality must be implemented through backend services.

Never call AI providers directly from the frontend.

Never expose AI API keys to the browser.

AI output should be treated as untrusted data.

Validate and sanitize AI responses before storing or using them.

AI services should be modular.

For example:

services/

  ai/

```
classification.service.ts

priority.service.ts

duplicate.service.ts

summary.service.ts
```

---

# 14. Security Rules

Never:

- Commit secrets
- Commit API keys
- Store plaintext passwords
- Trust client-side authorization
- Expose internal server errors
- Hardcode production credentials
- Put sensitive credentials in frontend code

Always:

- Validate input
- Authenticate protected requests
- Authorize based on backend roles
- Sanitize user-generated content where appropriate
- Use environment variables
- Handle errors safely

---

# 15. Frontend Rules

Use reusable components.

Avoid duplicated UI logic.

Keep pages separate from reusable components.

Use:

components/

pages/

layouts/

hooks/

services/

context/

routes/

types/

Use responsive design.

The platform should work on:

- Desktop
- Tablet
- Mobile

Accessibility should be considered when creating UI components.

---

# 16. Coding Standards

Use TypeScript.

Prefer strict typing.

Avoid `any`.

Use async/await.

Use descriptive variable names.

Keep functions small.

Keep files focused on one responsibility.

Avoid unnecessary dependencies.

Avoid duplicated business logic.

Do not rewrite unrelated code.

---

# 17. Error Handling

Every API endpoint must handle expected errors.

The frontend should display useful error messages.

Loading states should be implemented for asynchronous operations.

Empty states should be implemented for lists and dashboards.

Never silently ignore errors.

---

# 18. Git Rules

The main branch is:

main

Do not directly implement large features on main.

Use feature branches.

Examples:

feature/auth

feature/grievance

feature/citizen-dashboard

feature/officer-dashboard

feature/admin-dashboard

feature/ai

feature/notifications

Commit messages should follow:

feat: new feature

fix: bug fix

refactor: code restructuring

docs: documentation

chore: maintenance

Examples:

feat(auth): implement user registration

feat(grievance): add grievance submission API

fix(auth): fix JWT validation

docs: update API documentation

---

# 19. Multi-Agent Development Rules

Multiple AI coding agents may work on this repository.

Before modifying code, an agent must:

1. Inspect the repository.
2. Read [AGENTS.md](http://AGENTS.md).
3. Understand the existing architecture.
4. Inspect related files.
5. Avoid modifying unrelated modules.
6. Preserve existing functionality.
7. Run appropriate checks after changes.

Agents must not:

- Delete working functionality without justification.
- Rewrite the entire application unnecessarily.
- Change architecture without documenting the reason.
- Modify unrelated modules.
- Introduce conflicting dependencies.
- Hardcode secrets.
- Commit `.env` files.

---

# 20. Module Ownership

Frontend:

apps/web

Backend:

apps/api

Shared types:

packages/shared

Shared configuration:

packages/config

Database:

prisma

Documentation:

docs

An agent working on one module should avoid changing another module unless

integration requires it.

---

# 21. Dependency Rules

Before adding a new dependency:

1. Check whether an existing dependency already solves the problem.
2. Prefer established libraries.
3. Avoid unnecessary dependencies.
4. Explain major dependency additions in the commit or PR.

---

# 22. Testing

Before considering a feature complete:

- Run TypeScript checks.
- Run tests where available.
- Test API endpoints.
- Test important UI flows.
- Test authentication and authorization.
- Test error cases.

Critical functionality must not be considered complete without testing.

---

# 23. Environment Variables

Environment variables must be stored in `.env`.

Example:

DATABASE_URL=

JWT_SECRET=

AI_API_KEY=

Never commit `.env`.

Provide `.env.example` with variable names but without secrets.

---

# 24. Documentation

Important architecture decisions should be documented in:

docs/

Examples:

docs/[architecture.md](http://architecture.md)

docs/[database.md](http://database.md)

docs/[api.md](http://api.md)

---

# 25. General AI Agent Behavior

When asked to implement a feature:

1. Inspect the current repository.
2. Identify affected files.
3. Explain the implementation approach if necessary.
4. Implement only the required changes.
5. Reuse existing components and utilities.
6. Maintain existing architecture.
7. Run tests/type checks.
8. Report what changed.
9. Report any remaining issues.

Do not assume missing functionality.

Inspect the code first.

---

# 26. Priority

When making implementation decisions, prioritize:

1. Security
2. Correctness
3. Maintainability
4. Reliability
5. User experience
6. Performance
7. Visual polish

The application should prioritize being functional and reliable over

unnecessary visual complexity.