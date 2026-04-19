## Why

We need a way to capture customer sentiment directly from a QR code scan. This will give supervisors and managers immediate insight into customer satisfaction (sad, neutral, happy) and allow them to monitor trends. The current lack of a public submission form prevents real-time data collection.

## What Changes

- Build a public-facing feedback submission form using React and Vite.
- Implement form fields for emoji rating (sad, neutral, happy), gender, age group, and a review message.
- Add form validation to prevent blank required fields.
- Show a thank-you confirmation message upon successful submission.
- Prevent rapid duplicate submissions with a 2-hour delay check.
- Connect the frontend to the Supabase backend to insert feedback into the `customer_feedback` table.

## Capabilities

### New Capabilities
- `customer-feedback-submission`: Covers the public-facing React frontend UI that handles capturing and validating user reviews.

### Modified Capabilities

## Impact

- **Frontend**: Adds new components for the feedback form and success views.
- **API/Supabase**: Relies on the newly defined `customer_feedback` table and its "Public Insert" RLS policy.
- **Routing**: Introduces a new public route (e.g., `/feedback` or `/`) in the React application.
