
---

###  5. `04-BUSINESS_RULES.md`
```markdown
# 04-BUSINESS_RULES.md - Business Logic & Validation

## 1. Checkout & Lead Capture Flow
- **Validation**: Name and WhatsApp number are mandatory. Address is mandatory if `orderItems` length > 0.
- **Acquisition Channel**: Auto-detected from URL query param. Defaults to `organic_web`.
- **Execution**: 
  1. Validate payload using Zod.
  2. Call `createProspectAction`.
  3. Repository saves to DB with default status `cold` (or `warm` if source is `tokopedia_insert`).
  4. Server Action returns a formatted WhatsApp URL.
  5. Frontend redirects user to this URL in a new tab.

## 2. Admin Manual Input Flow
- Admin can create a prospect without `orderItems` (e.g., walk-in inquiry).
- `createdBy` field is automatically populated with the logged-in admin's email.
- Default status is `cold`.

## 3. Product Image Upload Flow
- Admin selects a file in the dashboard.
- Frontend sends file to Server Action.
- Server Action calls `IStorageService.upload(file)`.
- Storage service returns a public URL.
- Server Action calls `IProductRepository.create()` with the URL.
- **Rule**: Never store base64 or binary image data in the database.

## 4. Status Management
- **Cold**: New lead, no contact made yet.
- **Warm**: Contacted, discussing, or waiting for payment/verification.
- **Hot**: Deal closed, paid, or highly likely to convert.
- Admin can freely change status and append to `notesAdmin`.

## 5. Security & Access Control
- All `/admin/*` routes are protected by NextAuth middleware. Unauthenticated users are redirected to `/admin/login`.
- Passwords in the `Admin` table must be hashed using `bcrypt` before saving.
- Input sanitization: All string inputs must be trimmed and validated via Zod schemas.

## 6. Localization & Translation Rules
- **Default Language**: English (`en`) is the default for the MVP phase. Indonesian (`id`) is provided as placeholders.
- **Curation**: The `id.json` file contains auto-generated/placeholder translations. The developer will manually curate and refine the Indonesian text post-MVP.
- **Key Structure**: 
  - `common.*` for Navbar, Footer, and shared UI elements.
  - `home.*`, `products.*`, `cart.*` for page-specific content.
- **Swapping Default**: To switch the default language to Indonesian later, only update `defaultLocale: 'id'` in `middleware.ts` and `<html lang="id">` in `layout.tsx`.