## 1. Setup & Context

- [x] 1.1 Create an `AuthProvider` context in `src/contexts/AuthContext.tsx` to manage Supabase session state.
- [x] 1.2 Wrap the main application component in `App.tsx` with the `AuthProvider`.

## 2. Protected Routing

- [x] 2.1 Install and set up `react-router-dom`.
- [x] 2.2 Create a `ProtectedRoute` component that checks for an active session and redirects to `/login` if absent.
- [x] 2.3 Configure the application routes (`/` for feedback, `/login` for auth, `/dashboard` for protected area).

## 3. Login UI & Logic

- [x] 3.1 Create the `Login` page component (`src/pages/Login.tsx`) with Tailwind CSS styling.
- [x] 3.2 Implement the form state (email, password) and submission logic calling `supabase.auth.signInWithPassword`.
- [x] 3.3 Add error handling to display invalid credential messages to the user.
- [x] 3.4 Ensure successful login redirects the user to `/dashboard`.

## 4. Dashboard Shell & Logout

- [x] 4.1 Create a basic `Dashboard` page component (`src/pages/Dashboard.tsx`).
- [x] 4.2 Add a logout button to the dashboard that calls `supabase.auth.signOut()` and redirects to `/login`.
