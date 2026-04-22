# Supermarks Auth Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `supermarks` login and register pages as a cohesive night convenience store themed auth entrance while preserving existing auth behavior.

**Architecture:** Keep the current React pages and global stylesheet. Update `LoginPage.tsx` and `RegisterPage.tsx` to use a shared auth shell structure through CSS classes, then add auth-specific layout and visual styles in `styles.css`. Do not change API calls, routes, state shape, or submit handlers.

**Tech Stack:** React 18, React Router, TypeScript, Vite, plain CSS.

---

## File Structure

- Modify `supermarks/src/pages/LoginPage.tsx`: replace the plain centered auth card markup with the new auth stage, brand panel, and login form panel.
- Modify `supermarks/src/pages/RegisterPage.tsx`: apply the same auth stage and form panel structure with register-specific copy and role emphasis.
- Modify `supermarks/src/styles.css`: add auth-stage layout, storefront panel, form panel, role chips, responsive behavior, and focused auth states.

## Task 1: Login Page Structure

**Files:**
- Modify: `supermarks/src/pages/LoginPage.tsx`

- [ ] Replace the top-level `center-screen` wrapper with `auth-stage`.
- [ ] Add an `auth-frame` container with `auth-showcase` and `auth-panel`.
- [ ] Move the redirect hint into an `auth-notice` element.
- [ ] Keep `handleSubmit`, state, `authApi.login`, `onLoginSuccess`, and `Link` behavior unchanged.

## Task 2: Register Page Structure

**Files:**
- Modify: `supermarks/src/pages/RegisterPage.tsx`

- [ ] Replace the plain centered auth card markup with the same `auth-stage` and `auth-frame` structure.
- [ ] Add register-specific showcase content and role cards.
- [ ] Keep form state, `authApi.register`, `navigate("/login")`, and field order unchanged.
- [ ] Make the role selector visually identifiable by wrapping it in the shared form panel layout while preserving the native `<select>`.

## Task 3: Auth Visual System CSS

**Files:**
- Modify: `supermarks/src/styles.css`

- [ ] Add new auth variables and classes for `auth-stage`, `auth-frame`, `auth-showcase`, `auth-panel`, `auth-form`, `auth-notice`, `auth-chip`, `auth-role-card`, and auth footer links.
- [ ] Preserve existing `.input`, `.primary-btn`, `.field-label`, `.error-text`, and `.muted` compatibility for other pages.
- [ ] Add stronger focus and disabled states without breaking existing usage.
- [ ] Add responsive rules for `max-width: 900px` and `max-width: 680px`.

## Task 4: Verification

**Files:**
- Read: `supermarks/package.json`

- [ ] Run `npm run build` in `supermarks`.
- [ ] Expected result: TypeScript and Vite build complete successfully.
- [ ] If build fails because of the code changes, fix the changed files and re-run.
- [ ] If build fails for an unrelated pre-existing issue, report the exact failure and avoid unrelated fixes.

## Self-Review Checklist

- [ ] The login and register pages use the same auth system.
- [ ] Existing auth submission logic is unchanged.
- [ ] The redirect hint, error state, and disabled submit text still render.
- [ ] The design reads as a snack retail entrance rather than a generic form.
- [ ] Mobile layout remains single-column and usable.
