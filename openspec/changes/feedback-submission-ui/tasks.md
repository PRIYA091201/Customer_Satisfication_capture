## 1. Project Initialization & Dependencies

- [x] 1.1 Verify React, Vite, and Tailwind CSS are properly configured in `customer_feedback`.
- [x] 1.2 Install `@supabase/supabase-js` if not already present.
- [x] 1.3 Add Supabase URL and Anon Key to `.env` and set up the Supabase client connection.

## 2. UI Components Construction

- [x] 2.1 Create the main `FeedbackForm` component layout with Tailwind CSS.
- [x] 2.2 Implement the Emoji Rating selector (sad, neutral, happy) and make it a required selection.
- [x] 2.3 Implement the input fields for Gender (dropdown), Age Group (dropdown), and Review message (textarea).
- [x] 2.4 Create a `SuccessMessage` component to display after successful submission.

## 3. State Management & Validation

- [x] 3.1 Wire up React state to hold the form inputs.
- [x] 3.2 Add validation logic to ensure the rating is selected before the form can be submitted.
- [x] 3.3 Add visual error messages if validation fails on submit.

## 4. Supabase Integration & Rate Limiting

- [x] 4.1 Implement `localStorage` check to verify if the user has submitted in the last 2 hours.
- [x] 4.2 If the user is rate-limited, disable the form and show a "Please wait" message.
- [x] 4.3 Create the API call to insert the form data into the Supabase `customer_feedback` table using the anonymous client.
- [x] 4.4 Handle loading states (disabling submit button, showing spinner) and catch network/Supabase errors.
- [x] 4.5 On success, set the 2-hour timestamp in `localStorage` and transition to the `SuccessMessage` component.
