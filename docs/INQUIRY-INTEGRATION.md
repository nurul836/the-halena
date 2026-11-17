# Enquiry integration boundary — not deployed

`src/services/inquiries.ts` defines `InquiryGateway`. The current gateway is deliberately null. Do not enable the submit button by attaching a mock or a timer. A real transport must acknowledge acceptance with a durable receipt ID.

## Required server workflow

1. Validate the request origin and CSRF protection as appropriate to the selected authentication/session design. Apply request/body size limits before parsing.
2. Revalidate every field independently of browser code. Enforce lengths, enum membership, country code, normalized phone structure, numeric budget bounds, currency and acknowledged notice version. Never trust hidden client state as evidence of consent or authenticity.
3. Apply rate limits and anti-abuse checks at the server/edge. The client honeypot is one signal, not the protection boundary. Introduce a challenge provider only if needed and after provider/privacy decisions are made.
4. Use an idempotency key to avoid duplicate records and duplicate notifications on retries. Persist a receipt only after the enquiry has been durably accepted. A transport timeout must not be treated as confirmation.
5. For references, authorize a short-lived upload grant to a private quarantine location. Verify file size, extension, detected magic bytes and allowed content type; scan files before releasing them for staff access. Reject active formats and never render untrusted file content directly in the public site.
6. Bind uploaded objects to the intended enquiry and authorized staff. Use generated object names, private access and expiring signed download URLs. Do not place personal data or credentials in object paths or public URLs.
7. Define retention, deletion, access logging and orphan-upload cleanup. Avoid logging raw project descriptions, phone numbers or file contents in application telemetry.
8. Send any staff notification through the approved backend provider. A persisted enquiry receipt means accepted; it does not independently prove an email was delivered. Do not promise an appointment or response time without business approval.

## Configuration

Keep provider credentials and upload-signing secrets exclusively server-side. `VITE_` variables are public client configuration. Public contact details can be configured using `VITE_BUSINESS_EMAIL`, `VITE_BUSINESS_PHONE` and `VITE_BUSINESS_ADDRESS`.

Before activation, update the privacy notice to reflect actual providers, purposes, retention and contact details, and replace the form's local-only consent copy with reviewed wording matching the implemented processing. Review country availability, file policies and operational ownership. This document does not claim legal compliance.

## Integration tests to add when a backend exists

Test accepted receipts, duplicate retries, server validation, rate-limit responses, rejected or expired upload grants, mismatched file bytes, scan failures, oversized bodies, orphan cleanup, transport timeouts and cancellation. Confirm that no failure or ambiguous receipt is rendered as successful delivery.
