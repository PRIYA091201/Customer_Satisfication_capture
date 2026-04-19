## ADDED Requirements

### Requirement: Feedback Form Display
The system SHALL display a feedback form accessible to public users without login. The form SHALL include fields for emoji rating (sad, neutral, happy), gender, age group, and an optional review message.

#### Scenario: User opens feedback form
- **WHEN** user navigates to the public feedback route
- **THEN** they see the feedback form with all relevant fields

### Requirement: Form Validation
The system SHALL require the emoji rating to be selected before submission.

#### Scenario: User submits blank form
- **WHEN** user tries to submit without selecting an emoji rating
- **THEN** system displays a validation error message and prevents submission

### Requirement: Data Storage
The system SHALL save valid submissions directly to the Supabase `customer_feedback` table.

#### Scenario: User submits valid form
- **WHEN** user submits a completed form
- **THEN** their data is saved to the database and they see a thank-you message

### Requirement: Rate Limiting
The system SHALL prevent rapid duplicate submissions from the same device within a 2-hour window.

#### Scenario: User tries to submit twice rapidly
- **WHEN** user submits a form and then tries to submit another one within 2 hours
- **THEN** system displays an error or disabled state indicating they must wait
