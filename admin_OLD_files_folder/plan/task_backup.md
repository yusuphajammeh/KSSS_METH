# Team Switching & Security Refactor - Task Breakdown

## 1. Security & Session Integrity Refactor [/]

### 1.1 Role Signing & Verification Logic [/]

- [ ] Fix [hashString](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#11-23) usage in [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) (add missing `await`)
- [ ] Refactor `AdminSecurity.login` to use `async/await` for better flow control
- [ ] Standardize hash concatenation order across all signing/verification points
- [ ] **Role Whitelisting**: Restrict [verifyRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#185-192) to `ROLE_ABSOLUTE` and `ROLE_LIMITED` only
- [ ] **Absolute Role Hardening**: Ensure `Y-JAMMEH` flow is strictly awaited and tamper-proof

### 1.2 Session Validation Integrity [ ]

- [ ] Implement Dual-Check: Require both valid role signature AND GitHub token presence
- [ ] Ensure [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) properly awaits [verifyRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#185-192) and [setRole](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#47-57)
- [ ] Implement explicit session invalidation (**setRole(null)**) and **Tamper Logging** on failure
- [ ] Prevent privilege restoration if verification returns null

### 1.3 Authentication Guarding of UI Hooks [ ]

- [ ] Centralize auth check in [secureHook](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#153-168) using `AdminSecurity.isAuthenticated()`
- [ ] **Initialization Guard**: Implement `isInitializing()` check in [secureHook](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#153-168) to block during startup
- [ ] Audit all exposed hooks for consistent auth guarding

### 1.4 Global Exposure Hardening [ ]

- [ ] Verify `AdminSecurity` is defined as a frozen `const` within the closure
- [ ] Verify `KSSS_UI_HOOKS` is correctly frozen
- [ ] Remove any accidental leaks of `AdminSecurity` or [hashString](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#11-23) to the global scope
- [ ] Ensure wrapped functions do not expose internal state

### 1.5 Race Condition & Async Flow [ ]

- [ ] **Restore Order**: Ensure [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293) completes BEFORE [loadMatches](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#1062-1147) is called
- [ ] Implement `isInitializing` flag in `AdminSecurity` to serialise session startup
- [ ] Ensure [loadMatches](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#1062-1147) only executes after successful role verification
- [ ] Fix unawaited async calls in [finishLogin](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#88-112) and [verifySession](file:///c:/Users/yusup/OneDrive/Desktop/PROJECTS-----YJ/KSSS/METH%20QUIZ%20COMPETITION/static/admin.js#264-293)

## 2. Testing & Verification [ ]

- [ ] Verify login for elevated role (Y-JAMMEH) with code
- [ ] Verify login for limited role
- [ ] Test session persistence on page refresh
- [ ] Test session invalidation on storage tampering
- [ ] Verify protected UI actions are blocked for unauthenticated users
- [ ] Check console for errors during all flows
