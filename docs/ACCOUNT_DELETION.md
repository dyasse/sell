# Account Deletion

Date: May 21, 2026

Nour Quran exposes login/signup UI when Supabase is configured. Client-side Supabase apps must not use service-role keys, so direct account deletion is not implemented in frontend code.

## User-Facing Flow

- `delete-account.html` explains how to request deletion.
- `index.html` auth modal and settings drawer link to deletion.
- Requests go to `support@nour-quran.com` with app name, package name, and account email.

## Required Backend/Admin Step

An authorized backend or manual Supabase admin workflow must:

1. Verify the requester controls the account email.
2. Delete the Supabase auth user and any related app profile rows.
3. Revoke sessions where applicable.
4. Record minimal deletion/audit evidence if legally required.
5. Reply within the stated target of 30 days.

Never expose Supabase service-role keys in frontend code, public environment files, GitHub Actions logs, or Android assets.
