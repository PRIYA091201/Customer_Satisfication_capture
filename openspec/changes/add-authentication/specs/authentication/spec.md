## ADDED Requirements

### Requirement: Login Interface
The system SHALL provide a `/login` route containing a form with email and password inputs.

#### Scenario: User navigates to login
- **WHEN** user visits `/login`
- **THEN** they see the email and password fields and a submit button

### Requirement: Authentication Execution
The system SHALL authenticate users using Supabase Auth. Only pre-provisioned accounts can succeed.

#### Scenario: Successful login
- **WHEN** user submits valid credentials
- **THEN** they are logged in and redirected to the dashboard

#### Scenario: Failed login
- **WHEN** user submits invalid credentials
- **THEN** the system displays a clear error message

### Requirement: Session Management
The system SHALL persist the user session across page reloads and provide a mechanism to log out.

#### Scenario: User reloads page
- **WHEN** an authenticated user refreshes the browser
- **THEN** they remain logged in

#### Scenario: User logs out
- **WHEN** user clicks the logout button
- **THEN** their session is destroyed and they are redirected to `/login`

### Requirement: Route Protection
The system SHALL prevent unauthenticated access to the dashboard.

#### Scenario: Unauthorized access attempt
- **WHEN** an unauthenticated user attempts to visit `/dashboard`
- **THEN** they are immediately redirected to `/login`
