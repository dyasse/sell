# Google Play Data Safety Mapping

Date: May 21, 2026

This mapping must match `privacy-policy.html`.

## Data Types

| Play category | Collected | Shared | Purpose | Optional/required | Notes |
| --- | --- | --- | --- | --- | --- |
| Location: approximate | Yes | Yes | App functionality: prayer times, qibla, city display | Optional; only when user opens prayer/qibla and grants permission | Android manifest uses coarse location only. Sent to Aladhan and BigDataCloud. |
| Location: precise | No intended Android permission | Possible browser coordinate precision depends on platform | App functionality if browser supplies it | Optional | Android fine location removed. |
| Personal info: email | Yes if auth enabled | Yes, Supabase | Account management/authentication | Optional | Auth is disabled unless Supabase public config is injected. |
| User IDs | Yes if auth enabled | Yes, Supabase | Account management/authentication | Optional | Supabase user ID/session. |
| App activity | Yes if analytics/ads enabled | Yes, Google/Vercel | Analytics, ads, fraud prevention, app improvement | Optional/SDK-dependent | GA/Vercel only when configured. |
| Device or other IDs | Yes if ads/analytics enabled | Yes, Google/Vercel | Advertising, analytics, fraud prevention, diagnostics | Optional/SDK-dependent | Includes advertising/device identifiers used by SDKs. |
| Diagnostics/crash logs | Possible through Google SDKs/hosting | Yes | App quality, fraud/security | SDK-dependent | No custom crash SDK currently identified. |
| Financial info | Not collected by app directly | Yes if user uses PayPal/support provider | Donations/support, fraud/legal record keeping | Optional | External provider processes payment data. |

## Security And Deletion

- Encryption in transit: Yes, HTTPS is used where supported.
- User can request data deletion: Yes, `delete-account.html` and `support@nour-quran.com`.
- Local device data deletion: user can clear app/browser storage.
- Data sale: No sale of personal/sensitive data.
- Ads personalization: possible through Google AdMob/AdSense depending on consent and Google settings; disclose as used for ads/personalization if production ads are enabled.

## Third-Party Sharing

- Google AdMob/AdSense: ads, device IDs, ad interactions, diagnostics.
- Google Analytics/Vercel Analytics: app/page activity and device/browser data when configured.
- Supabase: email, user ID, auth session if login/signup enabled.
- Aladhan/BigDataCloud: location coordinates for prayer/qibla/city.
- Quran.com/alquran.cloud/audio providers: requested content, IP/device/network metadata.
- PayPal/support provider: payment/support information when used.
