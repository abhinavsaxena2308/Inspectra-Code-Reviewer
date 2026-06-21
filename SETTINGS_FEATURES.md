# Inspectra Settings Page - Planned Features

This document outlines the detailed plan for additional features to be implemented on the Settings Page to make it a fully-featured, production-ready portal.

## 1. Automated GitHub OAuth Integration
**Priority:** High
**Description:** Replace or augment the manual Personal Access Token (PAT) input with a seamless OAuth flow.
**Implementation Details:**
- Add a "Connect GitHub" button in the API Integration section.
- Use Clerk's built-in OAuth providers (`user.externalAccounts`) to trigger a popup or redirect flow to authenticate with GitHub.
- Request the necessary repository scopes (`repo`, `read:org`) during the OAuth handshake.
- Once connected, display the linked GitHub account username and a "Disconnect" button.
- The backend will fetch the GitHub token securely from Clerk's backend using the active session.

## 2. Usage & Billing Tier Management
**Priority:** High
**Description:** Provide users with transparency into their plan limits and usage metrics.
**Implementation Details:**
- Create a new "Plan & Usage" card component.
- Display the current active tier (e.g., *Free Tier* vs *PRO*).
- Show a progress bar indicating how many repository scans have been used this billing cycle (e.g., `3/10 Scans Used`).
- Include an "Upgrade to PRO" button that integrates with Stripe Checkout to manage subscriptions.
- If the user is on a PRO plan, show a link to the Stripe Customer Portal for managing billing details.

## 3. Notification Preferences
**Priority:** Medium
**Description:** Allow users to control the volume and types of notifications they receive.
**Implementation Details:**
- Add a "Notifications" section with modern UI toggle switches.
- **Toggles to include:**
  - *Scan Completion:* "Email me when a deep-scan completes."
  - *Weekly Digest:* "Send me a weekly digest of repository health and new vulnerabilities."
  - *Critical Alerts:* "Alert me immediately if a critical security vulnerability is found in a linked repository."
- Store these preferences in the database (e.g., a `user_preferences` table) or within Clerk's `publicMetadata` object.

## 4. Data Management & Export
**Priority:** Medium
**Description:** Ensure data compliance and privacy by giving users control over their stored historical data.
**Implementation Details:**
- Add a "Data Management" section (distinct from the Clerk account deletion).
- **Export Data:** A button that generates and downloads a JSON or CSV file containing all their historical analysis results, scores, and detected issues.
- **Clear History:** A destructive action (with a confirmation modal) that purges all stored analysis ledgers and cached repository data from the Inspectra database without deleting the user's actual account.

## 5. Custom Avatar & Profile Enhancements
**Priority:** Low
**Description:** Improve personalization by allowing users to manage their visual identity.
**Implementation Details:**
- Currently, the generic Clerk `<UserProfile />` handles this if the user clicks "Manage Password & Security".
- To make it more seamless, expose a click-to-upload avatar component directly in the "Profile" card on the Settings page.
- Sync the uploaded image with Clerk's user metadata so it updates the profile picture across the entire application (including the sidebar).
