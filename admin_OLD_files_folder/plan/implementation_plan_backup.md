# Security & Session Integrity Refactor Plan

This plan outlines the technical changes required to harden the security and session management in [admin.js](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js).

## Proposed Changes

### [Component Name] Admin Security Module

#### [MODIFY] [admin.js](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js)

- **Async Hardening & Verification Logic**:
  - Convert `AdminSecurity.login` to `async` and use `await` for [hashString](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#11-23) and [setRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#47-57).
  - Fix [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) to properly `await` its internal async calls (specifically [hashString](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#11-23) inside [verifyRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#186-193)).
  - **Token Trust Model**: [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) will require BOTH a valid signed role AND a present GitHub token. If either is missing or invalid, the session will be cleared.
  - **Role Whitelisting**: [verifyRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#186-193) will only accept recognized constants: `ROLE_ABSOLUTE` and `ROLE_LIMITED`. Any other value triggers immediate session invalidation.
- **Session Integrity & Tamper Protection**:
  - Standardize hash concatenation order: `role + SALT + nonce` to prevent accidental mismatch.
  - **Tamper Logging**: If [verifyRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#186-193) or the signature check fails, log: `🔒 Security Alert: Admin Role Tampered or Environmental Integrity Failure. Clearing session.`
  - **Explicit Clearing**: On session invalidation/failure, `AdminSecurity` will **explicitly call [setRole(null)](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#47-57)**, clearing both the internal `role` variable and `sessionStorage`, before exiting. No early returns without complete cleanup.
  - **Restore Order**: Ensure [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) completes (and sets the internal `role` state) before any dependent functions like [loadMatches](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#1062-1147) are called.
- **Runtime Immutability & Hook Protection**:
  - **AdminSecurity Immutability**: Defined as a `const` and its return object is `Object.freeze()`.
  - **Initialization Guard**: `AdminSecurity` will maintain an `isInitializing` flag.
  - **Secure UI Hooks**: The `KSSS_UI_HOOKS` object will be frozen. It will strictly only expose wrapped functions that verify **both `AdminSecurity.isAuthenticated()` and `!AdminSecurity.isInitializing()`** at runtime.
  - **Absolute Role Hardening**: The `Y-JAMMEH` elevated auth flow will be strictly awaited (`await setRole...`) ensuring no race conditions or bypasses can occur before privilege assignment.
  - **Closure Encapsulation**: Ensure `role` state remains private within the `AdminSecurity` closure.

## Verification Plan

### Automated Tests

- [ ] Run `node -c static/admin.js` to ensure syntax is valid.
- [ ] Use browser console to attempt basic role tampering (e.g., modifying `sessionStorage` and refreshing).

### Manual Verification

- [ ] Login as **Y-JAMMEH** and verify elevated actions (e.g., Team Swap).
- [ ] Login as a limited admin and verify restricted access.
- [ ] Refresh the page and confirm the session is correctly restored after verification.
- [ ] Tamper with `secureAdminRole` in `sessionStorage` and verify the session is cleared on refresh.
- [ ] Attempt to call `KSSS_UI_HOOKS.saveToGitHub()` from the console before logging in.
