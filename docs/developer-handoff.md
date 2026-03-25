# Developer Handoff

## Project Review

### Fully Complete

- Auth, OTP verification, login, logout, refresh, password reset
- User dashboard, profile, settings, notifications
- Document upload, parsing, library, and detail view
- Question detection and selection flow
- Answer generation and mini-figure planning
- Final compact PDF rendering
- Private PDF payment unlock flow
- Marketplace listing, browse, detail, purchase, and buyer library
- Wallet ledger and withdrawal request creation/cancel
- Admin dashboard, analytics, moderation, finance oversight, uploads, and upcoming locked content
- Public SEO landing pages, sitemap, robots, and structured metadata

### Partially Complete

- AI provider integration is abstracted and structured, but quality tuning and provider-specific production behavior still need runtime validation
- Payment webhook reconciliation is not finished
- Rate limiting exists but is in-memory, not shared/distributed
- Charts/analytics are functional but not deeply visualized
- UI polish is strong at the shared-system layer but still needs runtime visual QA

### Intentionally Stubbed / Placeholder-Based

- Webhook payment handling endpoint is reserved, not fully implemented
- Lint/typecheck scripts are placeholders
- Some analytics/risk signals are heuristic rather than advanced
- Real-time notifications are not implemented
- No SSR/SSG pipeline exists yet for frontend SEO

## Important Architecture Decisions

- Backend is organized by module with thin routes/controllers and service-heavy logic
- Marketplace supports both student-generated and admin-uploaded products through shared listing architecture
- Generated answer data and final PDF metadata are stored on the same generation model for continuity
- Wallet accounting is ledger-based through `WalletTransaction`
- Withdrawal uses a reserved-balance model with hold and release ledger entries
- SEO landing pages are collection-driven and powered by public API data instead of thin placeholders

## Critical Models And Modules

Backend models to understand first:

- `User`
- `UploadedDocument`
- `ParsedQuestion`
- `GeneratedPdf`
- `MarketplaceListing`
- `Payment`
- `Purchase`
- `WalletTransaction`
- `WithdrawalRequest`
- `AdminUploadedPdf`
- `UpcomingLockedPdf`
- `AuditLog`
- `Notification`

Critical backend modules:

- [apps/api/src/modules/auth](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\auth)
- [apps/api/src/modules/upload](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\upload)
- [apps/api/src/modules/ai](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\ai)
- [apps/api/src/modules/pdf](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\pdf)
- [apps/api/src/modules/payment](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\payment)
- [apps/api/src/modules/marketplace](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\marketplace)
- [apps/api/src/modules/wallet](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\wallet)
- [apps/api/src/modules/withdrawal](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\withdrawal)
- [apps/api/src/modules/admin](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\admin)
- [apps/api/src/modules/admin-content](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\admin-content)
- [apps/api/src/modules/seo](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules\seo)

Critical frontend areas:

- [apps/web/src/routes](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\routes)
- [apps/web/src/context](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\context)
- [apps/web/src/services/api](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\services\api)
- [apps/web/src/components/layout](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\components\layout)
- [apps/web/src/pages](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\pages)
- [apps/web/src/styles/index.css](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web\src\styles\index.css)

## High-Risk Integration Points

- Razorpay order creation and backend verification
- SMTP/OTP delivery
- MongoDB Atlas connectivity and indexes
- AI provider response quality and runtime behavior
- PDF parsing/rendering behavior on real production files
- Wallet and withdrawal state transitions
- Marketplace purchase to library access linkage

## What To Test First After Local Run

1. Auth, OTP, and password reset
2. Upload and parse a real PDF and DOCX
3. Run question detection and answer generation
4. Render a final PDF
5. Test private payment unlock
6. Test marketplace listing and purchase
7. Test seller wallet and withdrawal request
8. Test admin moderation and withdrawal actions

## Known Limitations

- No automated test suite was added in this project pass
- No centralized background job queue exists for heavy or delayed work
- Rate limiting is not yet distributed
- Payment webhook reconciliation is not yet complete
- Linting/typechecking are not production-grade yet
- Full browser/device QA was not performed in this environment

## Recommended Next Improvements After MVP

- Add automated tests for critical services and flows
- Replace in-memory rate limiting with Redis-backed limits
- Add verified payment webhook processing
- Add transaction/session safety around finance writes where possible
- Add real observability: logs, error tracking, uptime monitoring
- Add SSR/SSG or prerender strategy if SEO needs to grow beyond SPA metadata
