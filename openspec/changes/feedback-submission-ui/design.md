## Context

We are implementing a customer feedback submission frontend using React, Vite, and Tailwind CSS. The backend database is Supabase (`customer_feedback` table), which requires direct client integration via the Supabase JS SDK.

## Goals / Non-Goals

**Goals:**
- Create a performant, responsive React UI for capturing customer sentiment (emoji-based) and text feedback.
- Connect the frontend to the Supabase backend using Row Level Security to allow anonymous public inserts.
- Implement rate-limiting logic (2-hour wait) on the client side.

**Non-Goals:**
- Building the Supervisor Dashboard (this will be handled in a separate change).
- User authentication on the frontend (the submission form is public).

## Decisions

- **Framework**: React 18+ with Vite for fast builds, aligning with the project's tech stack.
- **Styling**: Tailwind CSS for rapid prototyping and clean utility classes.
- **Form State Management**: Simple React state, as the form is relatively small and dependencies should be kept minimal.
- **Database Connection**: Use `@supabase/supabase-js` directly on the client side. The table will have RLS enabled with a public insert policy.
- **Rate Limiting**: We will use `localStorage` to check if a user has submitted feedback in the last 2 hours.

## Risks / Trade-offs

- **Risk**: `localStorage` rate limiting can be bypassed by clearing cookies or changing browsers.
  - *Mitigation*: We accept this for V1. We can implement Supabase Edge Functions with IP tracking later if spam becomes an issue.
- **Risk**: Exposing Supabase anon key publicly.
  - *Mitigation*: The `anon` key is designed to be public, but we must ensure Row Level Security is strictly set so public users can ONLY `INSERT` into the `customer_feedback` table and cannot `SELECT`, `UPDATE`, or `DELETE`.
