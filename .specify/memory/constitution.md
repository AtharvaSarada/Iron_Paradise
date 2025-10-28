# Iron Paradise Constitution
<!-- Sync Impact Report: Version change: none → 1.0.0; Added principles: 1.Code Quality, 2.User Experience, 3.Functionality Requirements, 4.Logging & Monitoring, 5.Testing, 6.Security, 7.Performance, 8.Documentation; Added sections: Animation Standards, Technology Constraints, Deployment Requirements, Success Criteria; Removed sections: none; Templates requiring updates: none (✅ updated); Follow-up TODOs: none -->

## Core Principles

### Code Quality
All code must be modular, following single responsibility principle
- Every module must be independently testable
- Code must be maintainable with clear comments and documentation
- Follow consistent naming conventions throughout the project
- Keep functions small and focused (max 50 lines)

### User Experience (CRITICAL)
The UI must be designer-quality, modern, and visually appealing
- Every interactive element must have smooth animations
- The interface must be intuitive - users should understand it without documentation
- Animations should enhance UX, not distract (60fps minimum)
- Mobile-first responsive design is mandatory
- Loading states must always be animated and informative

### Functionality Requirements
NO placeholders or "coming soon" features - everything must be fully functional
- Role-based access control must be strictly enforced
- Data validation on both client and server side
- Real-time updates where appropriate (notifications, bill updates)
- Offline capability considerations for critical features

### Logging & Monitoring
Every user action must be logged with timestamp and user ID
- All errors must be caught, logged, and handled gracefully
- Logs must include context (user role, action attempted, outcome)
- Use structured logging format (JSON) for easy parsing
- Never log sensitive data (passwords, payment info)

### Testing
Unit tests for all business logic (80%+ coverage)
- Integration tests for API endpoints
- E2E tests for critical user journeys
- All tests must pass before considering a feature complete

### Security
Authentication required for all protected routes
- Role-based authorization on every endpoint
- Input sanitization to prevent XSS and SQL injection
- Secure password handling (hashing, salting)
- HTTPS only in production
- Session management with proper timeout

### Performance
Initial page load under 3 seconds
- Animations at 60fps
- Optimized images (WebP format, lazy loading)
- Code splitting for faster load times
- Database queries must be optimized with proper indexing

### Documentation
Comprehensive README with setup instructions
- API documentation for all endpoints
- Inline code comments for complex logic
- User guide for each role
- Deployment documentation

## Additional Standards and Constraints

### Animation Standards
Button hover effects: 0.2s ease-in-out
- Page transitions: 0.3s smooth
- Hero section animations: staggered entrance (0.5s total)
- Scroll animations: intersection observer with threshold
- Dropdown menus: 0.3s with easing function
- Form validation feedback: immediate with 0.2s animation

### Technology Constraints
Use modern, stable libraries with active maintenance
- Minimize dependencies to reduce bundle size
- Prefer native solutions over heavy libraries when possible
- All dependencies must be security-audited

### Deployment Requirements
Code must be hosted on public GitHub repository
- CI/CD pipeline for automated testing and deployment
- Environment-specific configurations (.env files)
- Proper .gitignore to exclude sensitive data
- Deployment platform must support the chosen tech stack

## Success Criteria

A feature is only considered complete when:
1. All functionality works end-to-end
2. Code is tested and tests pass
3. Logging is implemented
4. Documentation is written
5. UI animations are smooth and polished
6. Code is reviewed and follows standards
7. Feature is deployed and accessible

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. Versioning follows semantic versioning: MAJOR for backward incompatible changes, MINOR for new principles, PATCH for clarifications. All PRs/reviews must verify compliance with principles; complexity must be justified.

**Version**: 1.0.0 | **Ratified**: 2025-10-11 | **Last Amended**: 2025-10-11