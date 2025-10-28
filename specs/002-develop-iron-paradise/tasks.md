---
description: "Task list template for feature implementation"
---

# Tasks: Iron Paradise Gym Management System

**Input**: Design documents from `/specs/002-develop-iron-paradise/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as required by the constitution (80%+ coverage target) and specification.

**Organization**: Tasks are grouped by user story and feature area to enable independent implementation and testing of each capability.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story or feature area this task belongs to (e.g., US1, ADMIN, MEMBER)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/` at project root (React/Vite structure)
- **Components**: `src/components/`
- **Pages**: `src/pages/`
- **Services**: `src/services/`
- **Tests**: `tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
  **Description**: Set up the frontend directory structure as defined in plan.md, including src/components/, src/pages/, src/services/, src/hooks/, src/utils/, src/config/, src/styles/ directories.
  **Acceptance Criteria**: All required directories exist, package.json is initialized, .gitignore is configured for React/Vite project.
  **Dependencies**: None
  **Estimated Time**: 30 minutes

- [x] T002 Initialize React project with Vite and install dependencies
  **Description**: Create Vite React project, install all dependencies from plan.md: React 18+, Vite, Supabase, Framer Motion, TailwindCSS, shadcn/ui, React Hook Form, React Router DOM, Zustand, React Query, date-fns, react-pdf, react-hot-toast, recharts, Lucide React, Vitest, Playwright.
  **Acceptance Criteria**: Project builds successfully, all dependencies installed without conflicts, basic Vite dev server runs.
  **Dependencies**: T001
  **Estimated Time**: 1 hour

- [x] T003 Configure linting and formatting tools
  **Description**: Set up ESLint with React rules, Prettier configuration, Husky for pre-commit hooks, and integrate with VSCode.
  **Acceptance Criteria**: ESLint and Prettier run without errors, Husky prevents commits with linting issues.
  **Dependencies**: T002
  **Estimated Time**: 45 minutes

- [x] T004 Set up TailwindCSS and shadcn/ui
  **Description**: Configure TailwindCSS with custom theme, install and configure shadcn/ui components, set up component library structure.
  **Acceptance Criteria**: TailwindCSS compiles correctly, shadcn/ui components import and render properly.
  **Dependencies**: T002
  **Estimated Time**: 1 hour

- [x] T005 Configure state management and routing
  **Description**: Set up Zustand stores, React Query client, React Router with protected routes, and integrate with authentication.
  **Acceptance Criteria**: Routing works, state management initialized, no console errors.
  **Dependencies**: T002
  **Estimated Time**: 45 minutes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Set up Supabase project and client configuration
  **Description**: Create Supabase project, configure client in src/config/supabase.js, set up environment variables, enable real-time features.
  **Acceptance Criteria**: Supabase client connects successfully, environment variables loaded, real-time subscriptions work.
  **Dependencies**: T001
  **Estimated Time**: 1 hour
  **Status**: ✅ COMPLETED - Supabase project live at https://uwhlnukpfubpnqbxnnni.supabase.co

- [x] T007 Create database schema and RLS policies
  **Description**: Execute the SQL schema from data-model.md in Supabase, create all tables, relationships, indexes, and RLS policies for role-based access.
  **Acceptance Criteria**: All tables created, relationships established, RLS policies prevent unauthorized access, sample data inserted.
  **Dependencies**: T006
  **Estimated Time**: 2 hours
  **Status**: ✅ COMPLETED - Full schema deployed with RLS policies

- [ ] T008 Implement authentication service and context
  **Description**: Create authentication service in src/services/auth.service.js, authentication context with Zustand, login/logout/signup functions.
  **Acceptance Criteria**: Users can register, login, logout; JWT tokens managed correctly; role information accessible throughout app.
  **Dependencies**: T006, T005
  **Estimated Time**: 2 hours

- [ ] T009 Create role-based routing and layouts
  **Description**: Implement protected routes, AdminLayout, MemberLayout, PublicLayout components in src/layouts/, with navigation and role checks.
  **Acceptance Criteria**: Different roles see appropriate layouts, unauthorized access prevented, navigation works smoothly.
  **Dependencies**: T008
  **Estimated Time**: 1.5 hours

- [x] T010 Implement logging service
  **Description**: Create logging service in src/services/logging.service.js that writes to Supabase activity_logs table, with log levels and structured data.
  **Acceptance Criteria**: All critical actions logged with user ID, action type, and details; logs appear in database.
  **Dependencies**: T006
  **Estimated Time**: 1 hour

- [x] T011 Set up animation variants and utilities
  **Description**: Create src/utils/animations.js with reusable Framer Motion variants (fadeIn, slideIn, etc.), animation utilities, and intersection observer setup.
  **Acceptance Criteria**: Animation variants work across components, smooth 60fps animations, no performance issues.
  **Dependencies**: T002
  **Estimated Time**: 45 minutes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2.5: Initial Deployment Setup (PRIORITY)

**Purpose**: Get the application deployed early for continuous integration and testing

**⚠️ RECOMMENDED**: Deploy early and often for better development workflow

- [x] T012-DEPLOY [P] [DEPLOY] Create deployment configuration files
  **Description**: Set up vercel.json, GitHub Actions workflow, environment variable templates, deployment documentation.
  **Acceptance Criteria**: Deployment configuration files created and documented in DEPLOYMENT.md.
  **Dependencies**: T001
  **Estimated Time**: 1 hour
  **Status**: ✅ COMPLETED

- [ ] T013-DEPLOY [DEPLOY] Initial deployment to Vercel
  **Description**: Deploy current state to Vercel, configure environment variables, test basic functionality.
  **Acceptance Criteria**: App accessible via Vercel URL, Supabase connection works, basic routing functional.
  **Dependencies**: T006, T012-DEPLOY
  **Estimated Time**: 45 minutes
  **Priority**: HIGH - Do this ASAP for continuous deployment

- [ ] T014-DEPLOY [P] [DEPLOY] Set up GitHub repository secrets
  **Description**: Configure GitHub secrets for CI/CD: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, Supabase credentials.
  **Acceptance Criteria**: GitHub Actions can deploy automatically on push.
  **Dependencies**: T013-DEPLOY
  **Estimated Time**: 15 minutes

---

## Phase 3: User Story 1 - Add New Member (Priority: P1) 🎯 MVP

**Goal**: Enable admin to add new members with full details and see them in a searchable list

**Independent Test**: Admin can add member via form, member appears in list, can be searched/filtered

### Tests for User Story 1 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Unit test for member service create method in tests/unit/services/member.service.test.js
  **Description**: Write Vitest unit test for member creation, mocking Supabase calls.
  **Acceptance Criteria**: Test passes after implementation, covers success and error cases.
  **Dependencies**: T010
  **Estimated Time**: 30 minutes

- [ ] T013 [P] [US1] Contract test for members API endpoints in tests/contract/members.test.js
  **Description**: Test API contracts from contracts/api-contracts.yaml for member creation.
  **Acceptance Criteria**: Contract tests validate API responses match specification.
  **Dependencies**: None
  **Estimated Time**: 45 minutes

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create member service methods in src/services/member.service.js
  **Description**: Implement create, getAll, getById, update, delete methods with error handling and logging.
  **Acceptance Criteria**: All CRUD operations work with Supabase, proper error handling, logging integrated.
  **Dependencies**: T007, T010
  **Estimated Time**: 1.5 hours

- [ ] T015 [P] [US1] Create member form component in src/components/admin/MemberForm.jsx
  **Description**: Build animated form with React Hook Form, validation, photo upload, package selection.
  **Acceptance Criteria**: Form validates all fields, shows errors, uploads photos, saves to database.
  **Dependencies**: T014, T011
  **Estimated Time**: 2 hours

- [ ] T016 [P] [US1] Create member list component in src/components/admin/MemberList.jsx
  **Description**: Build searchable, filterable table with pagination, edit/delete actions.
  **Acceptance Criteria**: Displays members, search/filter works, actions trigger modals.
  **Dependencies**: T014
  **Estimated Time**: 1.5 hours

- [ ] T017 [US1] Create admin members page in src/pages/Admin/Members.jsx
  **Description**: Combine MemberForm and MemberList in a page with animations and state management.
  **Acceptance Criteria**: Page loads, form submission adds members, list updates, smooth animations.
  **Dependencies**: T015, T016, T009
  **Estimated Time**: 1 hour

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Member View Bills (Priority: P1)

**Goal**: Enable members to view their bills with detailed receipts

**Independent Test**: Member logs in, sees bill list, can view details and download PDF

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] Unit test for billing service in tests/unit/services/billing.service.test.js
  **Description**: Test bill retrieval and PDF generation logic.
  **Acceptance Criteria**: Tests cover all billing operations.
  **Dependencies**: T010
  **Estimated Time**: 30 minutes

- [ ] T019 [P] [US2] Integration test for bill viewing journey in tests/integration/member-bills.test.js
  **Description**: End-to-end test for member bill viewing flow.
  **Acceptance Criteria**: Journey works from login to PDF download.
  **Dependencies**: T017
  **Estimated Time**: 45 minutes

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create billing service in src/services/billing.service.js
  **Description**: Implement getBillsForMember, getBillDetails, generatePDF methods.
  **Acceptance Criteria**: Bills retrieved correctly, PDF generation works.
  **Dependencies**: T007, T010
  **Estimated Time**: 1 hour

- [ ] T021 [P] [US2] Create bill list component in src/components/member/BillList.jsx
  **Description**: Timeline or table view of bills with status indicators.
  **Acceptance Criteria**: Bills display with animations, status colors correct.
  **Dependencies**: T020
  **Estimated Time**: 1 hour

- [ ] T022 [P] [US2] Create bill details modal in src/components/member/BillDetailsModal.jsx
  **Description**: Animated modal showing itemized receipt with PDF download.
  **Acceptance Criteria**: Modal slides in, shows all details, PDF downloads correctly.
  **Dependencies**: T020
  **Estimated Time**: 1 hour

- [ ] T023 [US2] Create member bills page in src/pages/Member/Bills.jsx
  **Description**: Integrate BillList and BillDetailsModal with member layout.
  **Acceptance Criteria**: Complete bill viewing experience, smooth interactions.
  **Dependencies**: T021, T022, T009
  **Estimated Time**: 45 minutes

**Checkpoint**: User Story 2 complete - members can fully manage their bills

---

## Phase 5: User Story 3 - Public Package Exploration (Priority: P2)

**Goal**: Enable public users to browse packages and submit inquiries

**Independent Test**: User visits site, views packages, submits inquiry form

### Tests for User Story 3 ⚠️

- [ ] T024 [P] [US3] Unit test for package service in tests/unit/services/package.service.test.js
  **Description**: Test package retrieval operations.
  **Acceptance Criteria**: Service methods work correctly.
  **Dependencies**: T010
  **Estimated Time**: 30 minutes

### Implementation for User Story 3

- [ ] T025 [P] [US3] Create package service in src/services/package.service.js
  **Description**: Implement getAllPackages method with caching.
  **Acceptance Criteria**: Packages fetched efficiently with React Query.
  **Dependencies**: T007
  **Estimated Time**: 45 minutes

- [ ] T026 [P] [US3] Create package card component in src/components/public/PackageCard.jsx
  **Description**: Animated card showing package details with hover effects.
  **Acceptance Criteria**: Cards animate in, display all package info.
  **Dependencies**: T025, T011
  **Estimated Time**: 1 hour

- [ ] T027 [P] [US3] Create inquiry form component in src/components/public/InquiryForm.jsx
  **Description**: Contact form with validation and animations.
  **Acceptance Criteria**: Form validates, submits to admin, shows success animation.
  **Dependencies**: T011
  **Estimated Time**: 1 hour

- [ ] T028 [US3] Create public packages page in src/pages/Public/Packages.jsx
  **Description**: Landing page with hero, package grid, and inquiry form.
  **Acceptance Criteria**: Page loads fast, animations smooth, form works.
  **Dependencies**: T026, T027, T009
  **Estimated Time**: 1 hour

**Checkpoint**: Public package exploration complete

---

## Phase 6: Admin Package Management and Analytics

**Goal**: Enable admin to create and manage membership packages plus view comprehensive analytics dashboard

- [ ] T029 [P] [ADMIN] Extend package service with CRUD operations in src/services/package.service.js
  **Description**: Implement create, update, delete, assign methods for packages with logging.
  **Acceptance Criteria**: Full package management API works, all actions logged.
  **Dependencies**: T025
  **Estimated Time**: 1 hour

- [ ] T030 [P] [ADMIN] Create package form component in src/components/admin/PackageForm.jsx
  **Description**: Form for creating/editing packages with features array input.
  **Acceptance Criteria**: Form saves packages, validates features array.
  **Dependencies**: T029
  **Estimated Time**: 1 hour

- [ ] T031 [ADMIN] Add package management to admin dashboard in src/pages/Admin/Dashboard.jsx
  **Description**: Integrate package CRUD with dashboard navigation.
  **Acceptance Criteria**: Admin can fully manage packages from dashboard.
  **Dependencies**: T030, T017
  **Estimated Time**: 45 minutes

- [ ] T054 [P] [ADMIN] Create analytics counter cards in src/components/admin/AnalyticsCards.jsx
  **Description**: Animated counter cards for total members, active memberships, monthly revenue, pending payments using Framer Motion staggered entrance.
  **Acceptance Criteria**: Cards animate on load with 0.5s total stagger, numbers count up smoothly.
  **Dependencies**: T031, T011
  **Estimated Time**: 1 hour

- [ ] T055 [P] [ADMIN] Implement revenue chart component in src/components/admin/RevenueChart.jsx
  **Description**: Monthly revenue trend chart using recharts with entrance animation.
  **Acceptance Criteria**: Chart loads with fade-in, shows last 12 months data.
  **Dependencies**: T031
  **Estimated Time**: 1 hour

- [ ] T056 [P] [ADMIN] Create member growth chart in src/components/admin/MemberGrowthChart.jsx
  **Description**: Line chart showing member growth over time with smooth animations.
  **Acceptance Criteria**: Chart animates on entrance, interactive tooltips.
  **Dependencies**: T031
  **Estimated Time**: 1 hour

- [ ] T057 [P] [ADMIN] Build package popularity chart in src/components/admin/PackagePopularityChart.jsx
  **Description**: Pie/donut chart showing package distribution with hover effects.
  **Acceptance Criteria**: Segments animate in sequence, hover shows percentages.
  **Dependencies**: T031
  **Estimated Time**: 1 hour

- [ ] T058 [ADMIN] Add recent activity feed in src/components/admin/ActivityFeed.jsx
  **Description**: Real-time activity feed showing latest member actions, bill payments, etc.
  **Acceptance Criteria**: Feed updates in real-time via Supabase subscriptions, shows timestamps.
  **Dependencies**: T031, T033
  **Estimated Time**: 1 hour

---

## Phase 7: Billing and Notification Systems

**Goal**: Complete billing system and notification management

- [ ] T032 [P] [ADMIN] Extend billing service with bill creation in src/services/billing.service.js
  **Description**: Add createBill method with automatic notifications.
  **Acceptance Criteria**: Bills created, notifications sent.
  **Dependencies**: T020
  **Estimated Time**: 1 hour

- [ ] T033 [P] [ADMIN] Create notification service in src/services/notification.service.js
  **Description**: Implement sendNotification, getNotifications methods with Supabase real-time subscriptions for member dashboards.
  **Acceptance Criteria**: Notifications sent and received, real-time updates work, badge count updates automatically, toast notifications appear on new messages.
  **Dependencies**: T007, T010
  **Estimated Time**: 1 hour

- [ ] T034 [P] [ADMIN] Create bill generation component in src/components/admin/BillGenerator.jsx
  **Description**: Interface for creating bills for members.
  **Acceptance Criteria**: Bills generated with proper validation.
  **Dependencies**: T032
  **Estimated Time**: 1 hour

- [ ] T035 [ADMIN] Add billing and notifications to admin dashboard
  **Description**: Integrate all billing and notification features.
  **Acceptance Criteria**: Complete admin billing workflow.
  **Dependencies**: T033, T034, T031
  **Estimated Time**: 1 hour

---

## Phase 8: Member Dashboard and Features

**Goal**: Complete member experience with dashboard and profile

- [ ] T036 [P] [MEMBER] Create member dashboard component in src/components/member/Dashboard.jsx
  **Description**: Personalized dashboard with membership status and quick actions.
  **Acceptance Criteria**: Dashboard loads personalized data with animations.
  **Dependencies**: T023
  **Estimated Time**: 1 hour

- [ ] T037 [MEMBER] Create member dashboard page in src/pages/Member/Dashboard.jsx
  **Description**: Integrate dashboard with member layout and navigation.
  **Acceptance Criteria**: Complete member home experience.
  **Dependencies**: T036, T009
  **Estimated Time**: 45 minutes

---

## Phase 9: Supplement Store and Diet Management

**Goal**: Implement supplement catalog and diet planning features

- [ ] T038 [P] [ADMIN] Create supplement service in src/services/supplement.service.js
  **Description**: CRUD operations for supplements.
  **Acceptance Criteria**: Supplement management works.
  **Dependencies**: T007
  **Estimated Time**: 1 hour

- [ ] T039 [P] [ADMIN] Create diet service in src/services/diet.service.js
  **Description**: CRUD operations for diets and assignments.
  **Acceptance Criteria**: Diet management and assignment works.
  **Dependencies**: T007
  **Estimated Time**: 1 hour

- [ ] T040 [ADMIN] Add supplement and diet management to admin interface
  **Description**: Integrate with admin dashboard.
  **Acceptance Criteria**: Complete supplement and diet admin features.
  **Dependencies**: T038, T039, T035
  **Estimated Time**: 1 hour

---

## Phase 10: Reporting and Export Functionality

**Goal**: Implement reporting system with PDF/Excel exports

- [ ] T041 [P] [ADMIN] Create reporting service in src/services/reporting.service.js
  **Description**: Generate member reports, financial reports, export to PDF/Excel.
  **Acceptance Criteria**: Reports generated correctly, exports work.
  **Dependencies**: T007
  **Estimated Time**: 1.5 hours

- [ ] T042 [ADMIN] Add reporting interface to admin dashboard
  **Description**: UI for generating and downloading reports.
  **Acceptance Criteria**: Complete reporting workflow.
  **Dependencies**: T041, T040
  **Estimated Time**: 1 hour

---

## Phase 11: Animations, Polish, and Performance Optimization

**Goal**: Add professional animations and optimize performance

- [ ] T043 [P] [POLISH] Implement hero section animations in src/pages/Public/Packages.jsx
  **Description**: Add parallax scrolling, fade-in animations for hero and CTA buttons.
  **Acceptance Criteria**: Hero loads with smooth animations, 60fps performance.
  **Dependencies**: T028
  **Estimated Time**: 1 hour

- [ ] T044 [P] [POLISH] Add micro-interactions throughout the app
  **Description**: Implement button hover effects, form validation animations, loading spinners.
  **Acceptance Criteria**: All interactive elements have polished animations.
  **Dependencies**: T011
  **Estimated Time**: 2 hours

- [ ] T045 [P] [POLISH] Optimize images and implement lazy loading
  **Description**: Convert images to WebP, add lazy loading, optimize bundles.
  **Acceptance Criteria**: Page load under 3s, images load efficiently.
  **Dependencies**: T002
  **Estimated Time**: 1 hour

- [ ] T046 [POLISH] Conduct performance audit and optimizations
  **Description**: Run Lighthouse, optimize code splitting, fix performance issues.
  **Acceptance Criteria**: Lighthouse score > 90, all performance goals met.
  **Dependencies**: All previous tasks
  **Estimated Time**: 2 hours

---

## Phase 12: Testing and Bug Fixes

**Goal**: Achieve 80%+ test coverage and fix all bugs

- [ ] T047 [P] [TESTING] Write unit tests for all services
  **Description**: Create comprehensive unit tests for all service methods.
  **Acceptance Criteria**: All services have >80% coverage.
  **Dependencies**: All service implementations
  **Estimated Time**: 4 hours

- [ ] T048 [P] [TESTING] Write component tests for critical UI
  **Description**: Test key components with React Testing Library.
  **Acceptance Criteria**: Critical components tested.
  **Dependencies**: All component implementations
  **Estimated Time**: 3 hours

- [ ] T049 [P] [TESTING] Write E2E tests for user journeys
  **Description**: Create Playwright tests for complete user flows.
  **Acceptance Criteria**: All user stories have E2E coverage.
  **Dependencies**: All features implemented
  **Estimated Time**: 3 hours

- [ ] T050 [TESTING] Bug fixing and QA
  **Description**: Test all features, fix bugs, ensure cross-browser compatibility.
  **Acceptance Criteria**: No critical bugs, app works on desktop/tablet/mobile.
  **Dependencies**: T047, T048, T049
  **Estimated Time**: 4 hours

---

## Phase 13: Documentation and Deployment

**Goal**: Complete documentation and deploy to production

- [x] T051 [P] [DEPLOY] Configure deployment infrastructure
  **Description**: Set up Vercel configuration, GitHub Actions CI/CD, environment variables, and deployment documentation.
  **Acceptance Criteria**: vercel.json configured, GitHub Actions workflow ready, deployment guide complete.
  **Dependencies**: None
  **Estimated Time**: 2 hours
  **Status**: ✅ COMPLETED - Deployment configuration ready

- [ ] T052 [DEPLOY] Deploy to Vercel
  **Description**: Deploy frontend to Vercel, configure environment variables, test production deployment.
  **Acceptance Criteria**: App accessible via Vercel URL, all features work in production.
  **Dependencies**: T051
  **Estimated Time**: 1 hour

- [ ] T053 [P] [DEPLOY] Write comprehensive README.md
  **Description**: Document setup, development, deployment, and usage.
  **Acceptance Criteria**: README covers all aspects from quickstart.md and deployment guide.
  **Dependencies**: None
  **Estimated Time**: 1 hour

- [ ] T054 [DEPLOY] Set up monitoring and analytics
  **Description**: Configure Vercel Analytics, Supabase monitoring, error tracking.
  **Acceptance Criteria**: Performance metrics visible, error tracking active.
  **Dependencies**: T052
  **Estimated Time**: 30 minutes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Feature Phases (Phase 6-10)**: Depend on user stories and each other
- **Polish & Testing (Phase 11-12)**: Depends on all features being complete
- **Deployment (Phase 13)**: Depends on testing completion

### Parallel Opportunities

- All [P] marked tasks can run in parallel within their phases
- Different feature areas can be developed simultaneously after foundation
- Testing tasks can run in parallel
- Documentation can be done in parallel with final development

### Implementation Strategy

**MVP First**: Complete Phase 1-3 (setup, foundation, US1) for basic member addition

**Incremental Delivery**: Add US2, then US3, then remaining features

**Parallel Development**: Multiple developers can work on different phases after foundation

Total estimated time: ~60 hours across 7 weeks
