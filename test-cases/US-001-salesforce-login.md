# Test Cases — Salesforce login via custom domain

**Story:** US-001 (local draft)
**Feature area:** LOGIN
**Author:** Test Case Writer agent + human review
**Date:** 2026-07-06

## Story summary

> As a QA automation user, I want to log into Salesforce through the org's custom domain, so that I can access the org and run authenticated flows.

**Acceptance criteria**
- AC-1: A user with valid credentials logging in via the custom domain reaches the Salesforce home page
- AC-2: A login attempt with an invalid password shows an error and does not authenticate
- AC-3: A login attempt with an unknown username shows an error and does not authenticate
- AC-4: The custom domain entered on test.salesforce.com resolves to the org's my-domain login page

## Coverage matrix

| Acceptance criterion | Test cases |
|---|---|
| AC-1 | TC-LOGIN-001, TC-LOGIN-004 |
| AC-2 | TC-LOGIN-002 |
| AC-3 | TC-LOGIN-003 |
| AC-4 | TC-LOGIN-001, TC-LOGIN-005 |

---

## TC-LOGIN-001 — Successful login with valid credentials via custom domain

- **Priority:** Critical
- **Type:** Positive
- **Automation:** Automated (`@Login @CriticalPath @Smoke @Regression` — `features/login.feature`)
- **Preconditions:** Valid credentials configured; device activation completed for the browser profile

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user navigates to test.salesforce.com | Login page displays with "Use Custom Domain" link |
| 2 | When the user selects "Use Custom Domain" and enters the org domain | Domain input accepts the value |
| 3 | And the user clicks Continue | Browser lands on the org's my-domain login page |
| 4 | And the user enters a valid username and password and clicks Log In | No verification challenge appears |
| 5 | Then the user reaches the home page | URL switches to lightning.force.com and the App Launcher is visible |

## TC-LOGIN-002 — Login rejected with invalid password

- **Priority:** High
- **Type:** Negative
- **Automation:** Automated (`@Login @Regression` — `features/login.feature`)
- **Preconditions:** Valid username available

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user reaches the my-domain login page via custom domain | Login form displays |
| 2 | When the user enters a valid username and an incorrect password and clicks Log In | Page stays on the login form |
| 3 | Then an error message is displayed | "Please check your username and password" error is visible; user is not authenticated |

## TC-LOGIN-003 — Login rejected with unknown username

- **Priority:** High
- **Type:** Negative
- **Automation:** Automated (`@Login @Regression` — `features/login.feature`)
- **Preconditions:** None

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user reaches the my-domain login page via custom domain | Login form displays |
| 2 | When the user enters an unknown username with any password and clicks Log In | Page stays on the login form |
| 3 | Then an error message is displayed | Login error is visible; user is not authenticated |

## TC-LOGIN-004 — Quick login path with valid credentials

- **Priority:** Critical
- **Type:** Positive
- **Automation:** Automated (`@Login @Smoke @CriticalPath` — `features/login.feature`)
- **Preconditions:** Valid credentials configured

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user logs in with valid credentials (composite flow) | Full login flow completes without manual steps |
| 2 | Then the user reaches the home page | Lightning home verified (URL + App Launcher) |

## TC-LOGIN-005 — Empty custom domain rejected

- **Priority:** Medium
- **Type:** Edge
- **Automation:** Candidate (`@Login @Regression`)
- **Preconditions:** None

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user selects "Use Custom Domain" on test.salesforce.com | Custom domain input displays |
| 2 | When the user leaves the domain field empty and clicks Continue | Inline validation error appears; navigation does not proceed |

## TC-LOGIN-006 — Account lockout after repeated failed attempts

- **Priority:** Medium
- **Type:** Negative
- **Automation:** Manual-only (depends on org lockout policy and would lock the shared QA account, blocking the automated suite)
- **Preconditions:** Dedicated throwaway user; org lockout policy known (default: 10 attempts)

| # | Step (action) | Expected result |
|---|---|---|
| 1 | Given the user reaches the my-domain login page | Login form displays |
| 2 | When the user enters an incorrect password repeatedly up to the lockout threshold | Each attempt shows the standard error |
| 3 | Then the account is locked | Lockout message displayed; even the correct password is rejected until unlock |
