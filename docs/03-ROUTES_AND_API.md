
---

### 📄 4. `03-ROUTES_AND_API.md`
```markdown
# 03-ROUTES_AND_API.md - Routing & Server Actions

## 1. Public Routes (`app/(public)`)
- `/` : Home page (Hero, Features, Highlight Products)
- `/products` : Product gallery with category filters
- `/products/[id]` : Product detail page
- `/promo-tp` : Tokopedia shifting landing page (accepts `?source=tokopedia_insert`)
- `/contact` : Contact information and form

## 2. Admin Routes (`app/admin`) - Protected by NextAuth Middleware
- `/admin/login` : Admin authentication page
- `/admin/dashboard` : Overview stats and charts
- `/admin/prospects` : List, filter, and manual input of prospects
- `/admin/prospects/[id]` : Detail view, update status, add notes
- `/admin/products` : List and CRUD operations for products

## 3. Server Actions (`actions/`)
- `createProspectAction(data: ProspectInput)`: Validates data, calls `IProspectRepository.create()`, returns success/WA redirect URL.
- `createProductAction(data: ProductInput, file: File)`: Calls `IStorageService.upload()`, then `IProductRepository.create()` with the returned URL.
- `updateProspectStatusAction(id: string, status: string, notes: string)`: Updates prospect record.
- `loginAction(email: string, password: string)`: NextAuth credentials handler.

## 4. API Routes (`app/api`)
- `/api/auth/[...nextauth]/route.ts` : NextAuth handler
- *(Optional V2)* `/api/export/prospects/route.ts` : CSV export endpoint for admin