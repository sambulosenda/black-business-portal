# Authentication Routes

This route group contains all authentication-related pages.

## Structure

```
(auth)/
├── login/           # User login
├── signup/          # New user registration
│   ├── business/    # Business owner signup
│   └── customer/    # Customer signup
├── forgot-password/ # Password reset request
├── reset-password/  # Password reset form
└── auth/
    └── verify-email/# Email verification
```

## Purpose

- **Authentication flows** - Login, signup, password management
- **Email verification** - Confirm user email addresses
- **Role-based registration** - Separate flows for customers and businesses

## Security Guidelines

- Always use HTTPS in production
- Implement rate limiting on all auth endpoints
- Clear error messages without exposing system details
- Session management via NextAuth.js
- CSRF protection enabled

## User Flow

1. New users → `/signup/customer` or `/signup/business`
2. Existing users → `/login`
3. Forgot password → `/forgot-password` → `/reset-password`
4. Email verification → `/auth/verify-email`

## Notes

- These pages should be accessible even when logged in (for account switching)
- Redirect authenticated users from login/signup to dashboard
- All forms must have proper validation and error handling