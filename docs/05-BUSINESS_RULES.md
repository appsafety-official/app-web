
---

###  5. `04-BUSINESS_RULES.md`
```markdown
# 04-BUSINESS_RULES.md - Business Logic & Validation

## 1. Quote Request (Conversation-First B2B Flow)
- **Concept**: B2B buyers discuss before transacting. There is no transactional checkout — all CTAs lead to a WhatsApp conversation ("Request Quotation").
- **No public prices**: Product pages and cards never display prices (label: "Price on request"). `Product.price` is optional in the CMS (nullable) and serves only as an internal baseline.
- **Validation**: Name and WhatsApp number are mandatory. Email and notes/requirements are optional.
- **Acquisition Channel**: `web_quote` (quote request from the site). Defaults to `web_quote`.
- **Execution**:
  1. Validate payload using Zod (`checkoutSchema`).
  2. Re-resolve product name/price from the DB (never trust client values).
  3. Repository saves to `prospects` with default status `cold`, `orderItems` JSON as requirement reference.
  4. Server action returns a WhatsApp URL with an inquiry-style message (no prices).
  5. Frontend opens the URL in a new tab.

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