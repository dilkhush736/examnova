# ExamNova AI Architecture

## Overview

ExamNova AI is a monorepo with two main applications:

- [apps/web](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\web): React frontend
- [apps/api](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api): Express + MongoDB backend

The platform supports an end-to-end exam-preparation workflow:

1. Student signs up and verifies account
2. Student uploads study material
3. Backend parses uploaded content
4. AI flow detects likely questions
5. AI flow generates compact answers
6. Backend renders a final PDF
7. Student unlocks private PDF or lists it in the marketplace
8. Buyers purchase marketplace PDFs
9. Seller earnings move into wallet and withdrawal flow
10. Admin manages users, content, finance, and operational oversight

## Frontend Shape

Key frontend layers:

- `src/routes`: public, app, and admin route wiring
- `src/components/layout`: shared layouts for public, user, and admin shells
- `src/components/ui`: reusable UI building blocks
- `src/pages/public`: SEO-facing public pages and marketplace discovery
- `src/pages/app`: authenticated user flows
- `src/pages/admin`: admin operations console
- `src/services/api`: client-side API modules
- `src/context`: auth/session state
- `src/seo` and `src/utils/seo.js`: metadata and schema helpers

## Backend Shape

Backend is organized into modular domains under [apps/api/src/modules](C:\Users\pkper\OneDrive\Desktop\ExamNova AI\apps\api\src\modules):

- `auth`
- `profile`
- `dashboard`
- `upload`
- `ai`
- `pdf`
- `payment`
- `purchase`
- `marketplace`
- `wallet`
- `withdrawal`
- `admin`
- `admin-content`
- `notification`
- `seo`
- `public`

Supporting layers:

- `models`: Mongoose models
- `validators`: request validation and normalization
- `middleware`: auth, error handling, rate limiting, uploads
- `lib`: token, storage, payment, and helper clients
- `services`: shared services like mail and notifications
- `config`: env, CORS, database, and integration config

## Core Domain Models

Major persistent entities:

- `User`
- `Session`
- `OtpVerification`
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
- `Notification`
- `AuditLog`

## Important Business Rules

- Private generated PDF unlock price: `Rs. 4`
- Marketplace listing price range: `Rs. 4` to `Rs. 10`
- Marketplace revenue split: `30%` admin, `70%` seller
- Marketplace listings require academic taxonomy:
  - university
  - branch
  - year
  - semester
  - subject
- Withdrawal flow uses a reserved-balance model
- Admin-uploaded PDFs and user-generated PDFs both flow through shared marketplace listing architecture

## SEO/Public Architecture

Public route families include:

- `/marketplace`
- `/pdf/:slug`
- `/university/:slug`
- `/branch/:slug`
- `/semester/:slug`
- `/subject/:slug`
- `/exam-preparation/:slug`
- `/important-questions/:slug`
- `/faq`
- `/resources`

Backend also serves:

- `/robots.txt`
- `/sitemap.xml`

## Current Production-Readiness Notes

Strongly implemented:

- modular domain structure
- SEO/public architecture
- finance and marketplace flow structure
- admin intelligence and moderation foundations
- validation and abuse-protection pass

Still needing final production follow-through:

- full runtime QA
- payment webhook reconciliation
- distributed rate limiting
- automated tests
- stronger deployment monitoring/observability
