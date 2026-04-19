## Context
The application needs secure access for supervisors to view feedback. Supabase provides a built-in authentication system that integrates seamlessly with PostgreSQL Row Level Security (RLS).

## Goals / Non-Goals

**Goals:**
- Provide a login interface for existing administrative accounts.
- Protect dashboard routes from unauthenticated access.
- Manage user sessions robustly across page reloads.

**Non-Goals:**
- Self-service user registration or sign-up flows (accounts are provisioned manually by admins).
- Social logins (OAuth) - email/password is sufficient.
- Role-based granular permissions (we focus solely on authentication for now; authorization between Manager vs Admin can follow).

## Decisions
- **Auth Provider**: Supabase Auth (Email/Password). It's built-in, secure, and integrates with our existing database setup.
- **State Management**: React Context (`AuthProvider`) to wrap the app and provide the current `user` and `session` state to any component.
- **Routing**: Use React Router's nested routes to create a `ProtectedRoute` wrapper component that checks the auth state and redirects to `/login` if null.
- **Styling**: Tailwind CSS for a professional, centered login card design.

## Risks / Trade-offs
- **Risk**: Session expiration during active use.
  - *Mitigation*: Supabase JS client handles token refresh automatically in the background.
- **Risk**: Flash of unauthenticated content while checking session on mount.
  - *Mitigation*: Implement a loading state in the AuthProvider that delays rendering the protected app until the initial session check resolves.
