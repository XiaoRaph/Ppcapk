# Sentinel Security Journal

This journal documents critical security-related learnings, patterns, and constraints discovered in this project.

## 2025-05-15 - Input Validation Gap in React Native Event Handlers
**Vulnerability:** Lack of validation on event/action parameters (e.g. choiceName) could lead to unhandled TypeErrors and app crashes. If an unexpected parameter is received from a buggy UI state or external event, calling methods on `undefined` causes a client-side Denial of Service (DoS).
**Learning:** React Native state management doesn't automatically validate incoming arguments to component action handlers. Defensive validation is necessary even in pure client-side single-player games to ensure the application fails securely and gracefully.
**Prevention:** Always validate all arguments in action handlers against a whitelist or schemas before performing operations or reading properties on the target objects.
