## Why
We need a secure way to restrict access to the dashboard so that only authorized supervisors and managers can view customer feedback and analytics.

## What Changes
- Implement an authentication system using Supabase Auth.
- Create a secure `/login` route with email and password fields.
- Restrict registration (only pre-created accounts are allowed).
- Add session persistence and logout capabilities.
- Protect all dashboard routes, redirecting unauthenticated users to the login page.

## Capabilities

### New Capabilities
- `authentication`: Covers the secure login flow, session management, and route protection.

### Modified Capabilities

## Impact
- **Frontend**: Adds login page, auth state provider, and protected route wrappers.
- **Backend/Supabase**: Relies on Supabase Auth for JWT issuance and validation.
- **Routing**: Introduces `/login` and protects `/dashboard`.
