# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: JavaScript/TypeScript with React 18+  
**Primary Dependencies**: React, Vite, Supabase, Framer Motion, TailwindCSS, shadcn/ui, React Hook Form, React Router DOM, Zustand, React Query, date-fns, react-pdf, react-hot-toast, recharts, Lucide React  
**Storage**: PostgreSQL via Supabase BaaS  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web browsers (desktop, tablet, mobile)  
**Project Type**: Web application with component-based architecture  
**Performance Goals**: <3s initial page load, 60fps animations, responsive across devices  
**Constraints**: Real-time notifications, role-based security via RLS, offline considerations for critical features  
**Scale/Scope**: Multi-role application with 8+ entities, comprehensive gym management features with premium UX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: Satisfied - React with TypeScript, modular architecture, single responsibility components, service layer pattern.

**User Experience (CRITICAL)**: Satisfied - Framer Motion for animations, shadcn/ui for modern UI, responsive design, micro-interactions, animation variants.

**Functionality Requirements**: Satisfied - Full CRUD via Supabase, real-time updates, no placeholders.

**Logging & Monitoring**: Satisfied - Custom logging service to activity_logs table, structured logging.

**Testing**: Satisfied - Vitest for unit, Playwright for E2E, 80%+ coverage target.

**Security**: Satisfied - Supabase RLS, role-based access, secure auth.

**Performance**: Satisfied - Vite for fast builds, code splitting, image optimization, bundle optimization.

**Documentation**: Satisfied - Comprehensive README, inline comments, API docs.

No violations - all gates pass.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
iron-paradise/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── shared/ (reusable components)
│   │   ├── admin/ (admin-specific components)
│   │   ├── member/ (member-specific components)
│   │   └── public/ (public-facing components)
│   ├── pages/
│   │   ├── Admin/
│   │   ├── Member/
│   │   ├── Public/
│   │   └── Auth/
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── MemberLayout.jsx
│   │   └── PublicLayout.jsx
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── member.service.js
│   │   ├── billing.service.js
│   │   ├── notification.service.js
│   │   └── logging.service.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMembers.js
│   │   └── useNotifications.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── animations.js
│   ├── config/
│   │   ├── supabase.js
│   │   └── constants.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── assets/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

**Structure Decision**: Component-based architecture with feature-based organization. Services layer for API interactions, hooks for reusable logic, layouts for consistent UI structure. Clear separation between admin, member, and public features.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
