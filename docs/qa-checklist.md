# Final QA Checklist

Use this after local setup and again after deployment.

## 1. Authentication

- Signup succeeds with valid input
- Duplicate signup is handled safely
- OTP email is delivered or visible through dev mail transport
- OTP verification succeeds with correct OTP
- Incorrect OTP is rejected
- Resend OTP cooldown is enforced
- Login succeeds after verification
- Repeated failed logins eventually lock the account temporarily
- Logout clears the session
- Refresh session works when refresh cookie exists

## 2. Password Reset

- Forgot-password request accepts a valid email
- Reset OTP is delivered
- Reset with invalid OTP fails
- Reset with valid OTP changes password
- Old password no longer works after reset

## 3. Profile And Settings

- Profile update validates name/phone/avatar URL correctly
- Settings update persists notification preferences
- Blocked users cannot access protected routes

## 4. Upload And Parsing

- PDF upload succeeds
- DOCX upload succeeds
- TXT upload succeeds
- Invalid or mismatched file content is rejected
- Oversized file is rejected
- Uploaded document appears in user document library
- Parsing status changes correctly
- Retry parsing works

## 5. Question Detection

- Detection can run on parsed documents
- Prompt-based filtering affects results
- Selected questions persist correctly
- Repeated rapid detection is throttled
- Very large detection inputs are rejected safely

## 6. Answer Generation

- Answer generation works for selected questions
- Generation fails cleanly with no selected questions
- Regeneration works when allowed
- Per-question answer updates save correctly
- Excessive selected question count is blocked

## 7. Final PDF Generation

- Final render succeeds for a completed answer set
- Generated PDF metadata updates correctly
- Locked PDF cannot download before payment
- Unlocked PDF can download after payment

## 8. Private Payment Unlock

- Private PDF Razorpay order creation works
- Payment verification succeeds only with valid backend signature verification
- Duplicate verification does not unlock twice
- Duplicate payment id reuse is blocked

## 9. Marketplace Selling

- Eligible generated PDF can be listed
- Required taxonomy is enforced
- Price outside Rs. 4 to Rs. 10 is rejected
- Seller can update/unlist listing
- Seller cannot create duplicate problematic listing for same generation

## 10. Marketplace Buying

- Public listing page loads
- Buyer can create marketplace order
- Buyer cannot buy own listing
- Buyer cannot repurchase already-owned listing
- Verified purchase grants library access
- Purchased PDF can download from buyer library

## 11. Wallet And Withdrawals

- Marketplace sale credit appears in seller wallet
- Wallet summary totals look correct
- Withdrawal request is blocked above available balance
- Withdrawal request creates hold correctly
- Pending withdrawal can be cancelled
- Cancel restores reserved amount

## 12. Admin Users

- Admin-only routes reject non-admin users
- Admin can list users
- Admin can block a user
- Blocked user loses protected access
- Admin cannot block own account

## 13. Admin Content And Moderation

- Admin upload accepts valid PDF
- Admin upload rejects invalid PDF content
- Admin can create upcoming locked PDF
- Upcoming locked PDF appears publicly when appropriate
- Admin can publish/unlist/flag listings
- Listing moderation changes are auditable

## 14. Admin Finance

- Admin can view payments
- Admin can view purchases
- Admin can approve withdrawal
- Admin cannot mark pending withdrawal as paid without approval
- Admin must provide payout reference to mark paid

## 15. Notifications And Audit

- User notifications appear after purchase/withdrawal/admin actions
- Admin alerts page loads
- Audit logs show sensitive admin actions

## 16. Public SEO And Discovery

- Homepage loads
- Marketplace page loads
- PDF detail pages load by slug
- Taxonomy landing pages load:
  - university
  - branch
  - semester
  - subject
  - exam-preparation
  - important-questions
- `/robots.txt` responds
- `/sitemap.xml` responds

## 17. Responsive UI Check

- Public pages are usable on mobile width
- Student dashboard is usable on mobile width
- Admin dashboard is usable on mobile width
- Long cards/tables do not overflow badly

## 18. Production Safety

- 500 errors do not expose sensitive details in production mode
- Unauthorized API responses clear stale frontend session correctly
- Rate limiting returns 429 on repeated abuse patterns
