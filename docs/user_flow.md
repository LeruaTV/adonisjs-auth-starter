# AdonisJS Auth Starter - User Flows Documentation

This documentation describes the main user flows of the AdonisJS Auth Starter application, with special focus on triggered events and email notifications.

## 📋 Overview

The application supports the following main functions:

- ✅ User registration with automatic email verification
- ✅ User login with login tracking
- ✅ User profile updates
- ✅ Password reset flow with email confirmation
- ✅ Event-based architecture for email notifications
- ❌ **User deletion is not yet implemented**
- ⚠️ **Email templates are incomplete and need further development**

---

## 🚀 1. User Registration

### API Endpoint

```
POST /api/v1/auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirmation": "password123",
  "firstName": "John"
}
```

**Required Fields:**

- `email` - Must be a valid email format and unique
- `password` - Minimum 8 characters
- `passwordConfirmation` - Must match password

**Optional Fields:**

- `firstName` - String (auto-generated from email if not provided)

### Flow Description

1. **Input Data Validation**

   - Email format validation
   - Password confirmation match
   - Email uniqueness check

2. **User Creation (`UserService.create()`)**

   - First user automatically becomes administrator
   - `firstName` derived from email if not provided
   - Password automatically hashed

3. **Event Dispatch: `UserRegistered`**

   ```typescript
   UserRegistered.dispatch(user)
   ```

4. **Access Token Creation**

   - JWT token generated
   - User automatically logged in

5. **Event Dispatch: `UserLoggedIn`**
   ```typescript
   UserLoggedIn.dispatch(user)
   ```

### 📧 Triggered Emails

#### 1. Verification Email

- **Listener**: `SendVerificationEmail`
- **Event**: `UserRegistered`
- **Email Class**: `VerifyEmailNotification`
- **Subject**: "Verify email address"
- **Content**: 6-digit numerical verification code
- **Template**: `resources/views/emails/verify_email/`
- ⚠️ **Template Status**: Basic HTML structure implemented, requires MJML styling completion

### Response

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "user@example.com",
    "isVerified": false,
    "lastLoginAt": null,
    "isAdmin": false
  }
}
```

---

## 🔐 2. User Login

### API Endpoint

```
POST /api/v1/auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Required Fields:**

- `email` - Must be a valid email format
- `password` - User's current password

### Flow Description

1. **Credential Verification**

   - Email and password are validated
   - `User.verifyCredentials()` is called

2. **Access Token Creation**

   - New JWT token is generated

3. **Event Dispatch: `UserLoggedIn`**
   ```typescript
   UserLoggedIn.dispatch(user)
   ```

### 🔄 Triggered Actions

#### Last Login Update

- **Listener**: `UpdateUserLastLogin`
- **Event**: `UserLoggedIn`
- **Action**: `lastLoginAt` is set to current time
- **Service**: `UserService.updateLastLogin()`

### Response

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "user@example.com",
    "isVerified": true,
    "lastLoginAt": "2025-06-01T10:30:00.000Z",
    "isAdmin": false
  }
}
```

---

## ✏️ 3. User Profile Update

### API Endpoint

```
PUT /api/v1/me
```

### Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "newPassword123" // Optional
}
```

**Required Fields:**

- None - all fields are optional

**Optional Fields:**

- `firstName` - String, minimum 2 characters
- `lastName` - String, minimum 2 characters
- `password` - String, minimum 8 characters

**Note**: Email cannot be changed through this endpoint

### Flow Description

1. **Authentication Check**

   - JWT token must be valid
   - User must be logged in

2. **Data Validation**

   - Input data is validated using `updateMeValidator`
   - Email field is explicitly not allowed

3. **User Update (`UserService.update()`)**

   - Only provided fields are updated
   - Password is automatically hashed (if provided)

4. **Event Dispatch: `UserUpdated`**

   ```typescript
   UserUpdated.dispatch(user)
   ```

5. **Conditional Event: `UserPasswordChanged`**
   ```typescript
   if (data.password !== undefined) {
     UserPasswordChanged.dispatch(user)
   }
   ```

### 📧 Triggered Emails (when password is changed)

#### Password Change Confirmation

- **Listener**: `SendUserPasswordChangedEmail`
- **Event**: `UserPasswordChanged`
- **Email Class**: `PasswordResetSuccessNotification`
- **Subject**: "Password Reset Successful"
- **Content**: Confirmation of password change
- **Template**: `resources/views/emails/password_reset_success/`
- ⚠️ **Template Status**: Basic HTML structure, needs styling improvements

### Response

```json
{
  "user": {
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "email": "user@example.com",
    "isVerified": true,
    "lastLoginAt": "2025-06-01T10:30:00.000Z",
    "isAdmin": false
  }
}
```

---

## 🔄 4. Password Reset Flow

### 4.1 Request Password Reset

#### API Endpoint

```
POST /api/v1/auth/forgot-password
```

#### Request Body

```json
{
  "email": "user@example.com"
}
```

**Required Fields:**

- `email` - Must be a valid email format

#### Flow Description

1. **Email Existence Check**

   - User is searched by email
   - Same response is always sent for security reasons

2. **Reset Token Generation (`UserTokenService`)**

   - 6-digit numerical token
   - Validity: 1 hour
   - Token is stored in database

3. **Event Dispatch: `UserPasswordResetRequested`**
   ```typescript
   UserPasswordResetRequested.dispatch(user, resetToken)
   ```

#### 📧 Triggered Emails

##### Password Reset Email

- **Listener**: `SendPasswordResetEmail`
- **Event**: `UserPasswordResetRequested`
- **Email Class**: `ResetPasswordNotification`
- **Subject**: "Reset Your Password"
- **Content**: 6-digit reset code and reset link
- **Template**: `resources/views/emails/reset_password/`
- **Validity**: 1 hour
- ⚠️ **Template Status**: Basic HTML implementation, needs proper styling and responsive design

#### Response

```json
{
  "message": "If the email exists in our system, you will receive a password reset link"
}
```

### 4.2 Reset Password

#### API Endpoint

```
POST /api/v1/auth/reset-password
```

#### Request Body

```json
{
  "token": "123456",
  "password": "newPassword123",
  "passwordConfirmation": "newPassword123"
}
```

**Required Fields:**

- `token` - 6-digit numerical reset token
- `password` - New password, minimum 8 characters
- `passwordConfirmation` - Must match password

#### Flow Description

1. **Token Validation**

   - Token is searched in database
   - Validity is checked (not expired)
   - Associated user is loaded

2. **Password Update**

   - New password is hashed and saved
   - Token is deleted from database (single use)

3. **Event Dispatch: `UserPasswordReset`**
   ```typescript
   UserPasswordReset.dispatch(user)
   ```

#### 📧 Triggered Emails

##### Password Reset Confirmation

- **Listener**: `SendPasswordResetSuccessEmail`
- **Event**: `UserPasswordReset`
- **Email Class**: `PasswordResetSuccessNotification`
- **Subject**: "Password Reset Successful"
- **Content**: Confirmation of successful password reset
- **Template**: `resources/views/emails/password_reset_success/`
- ⚠️ **Template Status**: Basic HTML structure, needs professional design and responsive layout

#### Response

```json
{
  "message": "Password has been reset successfully",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "user@example.com",
    "isVerified": true,
    "lastLoginAt": null,
    "isAdmin": false
  }
}
```

---

## 📡 Event System Overview

### Registered Event Listeners (`start/events.ts`)

```typescript
emitter.listen(UserPasswordChanged, [() => import('#listeners/send_user_password_changed_email')])
emitter.listen(UserRegistered, [() => import('#listeners/send_verification_email')])
emitter.listen(UserLoggedIn, [() => import('#listeners/update_user_last_login')])
emitter.listen(UserPasswordResetRequested, [() => import('#listeners/send_password_reset_email')])
emitter.listen(UserPasswordReset, [() => import('#listeners/send_password_reset_success_email')])
```

### Available Events

| Event                        | Triggered When              | Payload                              | Listener                        |
| ---------------------------- | --------------------------- | ------------------------------------ | ------------------------------- |
| `UserRegistered`             | New user registration       | `{ user: User }`                     | `SendVerificationEmail`         |
| `UserLoggedIn`               | Successful login            | `{ user: User }`                     | `UpdateUserLastLogin`           |
| `UserUpdated`                | Profile update              | `{ user: User }`                     | No automatic listeners          |
| `UserPasswordChanged`        | Password change             | `{ user: User }`                     | `SendUserPasswordChangedEmail`  |
| `UserPasswordResetRequested` | Password reset requested    | `{ user: User, resetToken: string }` | `SendPasswordResetEmail`        |
| `UserPasswordReset`          | Password successfully reset | `{ user: User }`                     | `SendPasswordResetSuccessEmail` |

---

## 📧 Email Notifications

### Email Classes and Templates

| Email Class                        | Template Path                    | Subject                     | Usage                                  |
| ---------------------------------- | -------------------------------- | --------------------------- | -------------------------------------- |
| `VerifyEmailNotification`          | `emails/verify_email/`           | "Verify email address"      | On registration                        |
| `ResetPasswordNotification`        | `emails/reset_password/`         | "Reset Your Password"       | On password reset request              |
| `PasswordResetSuccessNotification` | `emails/password_reset_success/` | "Password Reset Successful" | On successful reset or password change |

### Template Technologies

- **Verification Email**: MJML for responsive emails
- **Password Emails**: Standard HTML with CSS
- ⚠️ **Status**: All templates are basic implementations requiring professional design and responsive layout improvements

### Email Configuration

All emails use the following environment variables:

- `SMTP_FROM`: Sender email address
- `FRONTEND_URL_RESET_PASSWORD`: Frontend URL for password reset

---

## 🔒 Security Aspects

### Token Security

- **Reset Tokens**: 6-digit numerical, 1 hour validity
- **Verification Tokens**: 6-digit numerical, default validity
- **Single Use**: Tokens are deleted after use

### Password Security

- Automatic hashing with bcrypt
- Password confirmation required for registration and reset
- No plaintext storage

### Privacy Protection

- Email existence is not disclosed
- Consistent responses for existing/non-existing emails
- Secure token generation

---

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Email Address**: HTTP 422 with validation errors
2. **Password Mismatch**: HTTP 422 during registration/reset
3. **Expired Token**: HTTP 500 during password reset
4. **Invalid Credentials**: HTTP 400 during login
5. **Missing Authentication**: HTTP 401 for protected routes

### Best Practices

- Consistent error messages for better UX
- Detailed logs for debugging
- Graceful degradation on email failures
- Rate limiting for security (not implemented, recommended)

---

## 📝 Integration Examples

### Complete Registration Flow

```typescript
// 1. Registration
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    passwordConfirmation: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  }),
})

// 2. Events are automatically triggered:
// - UserRegistered → SendVerificationEmail
// - UserLoggedIn → UpdateUserLastLogin

// 3. User receives verification email with 6-digit code
```

### Complete Password Reset Flow

```typescript
// 1. Request reset
const forgotResponse = await fetch('/api/v1/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
})

// 2. Event: UserPasswordResetRequested → SendPasswordResetEmail
// 3. User receives email with reset code

// 4. Reset password
const resetResponse = await fetch('/api/v1/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: '123456',
    password: 'newPassword123',
    passwordConfirmation: 'newPassword123',
  }),
})

// 5. Event: UserPasswordReset → SendPasswordResetSuccessEmail
// 6. User receives confirmation email
```

---

## 📚 Additional Resources

- **API Endpoints**: See `start/routes.ts`
- **Validation Rules**: See `app/validators/`
- **Database Models**: See `app/models/`
- **Email Templates**: See `resources/views/emails/`
- **Tests**: See `tests/functional/` and `tests/unit/`

---

## ⚠️ Known Limitations

### Missing Features

- **User Deletion**: No endpoint or service method exists for deleting user accounts
  - No soft delete functionality
  - No account deactivation option
  - Recommendation: Implement DELETE `/api/v1/me` endpoint with proper cleanup

### Incomplete Email Templates

All email templates require significant improvements:

1. **Design Issues**:

   - Basic HTML structure only
   - No responsive design
   - Minimal CSS styling
   - No branding or visual identity

2. **Content Issues**:

   - Missing company information
   - No unsubscribe links
   - Basic text content only
   - No internationalization support

3. **Technical Issues**:
   - MJML templates are incomplete
   - No fallback text versions for some emails
   - Missing accessibility features

### Recommended Improvements

- Implement professional email design system
- Add comprehensive user management features
- Include proper error handling for edge cases
- Add rate limiting for security
- Implement email preferences and unsubscribe functionality
