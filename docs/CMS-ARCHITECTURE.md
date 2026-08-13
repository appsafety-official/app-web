# Arsitektur CMS — APP SAFETY (D:\app-web)

Dokumen referensi arsitektur project CMS + public commerce site. Ditulis berdasarkan kode aktual, bukan asumsi umum.

---

## 1. Overview

Project ini adalah **aplikasi full-stack Next.js terintegrasi** — satu aplikasi yang menangani admin dashboard, public site, dan data access, tanpa API layer terpisah.

Pola arsitektur utama:

- **RSC-first (React Server Components)** — halaman membaca data langsung dari database di server.
- **Server Actions** (`"use server"`) — semua operasi tulis (produk, blog, lead magnet, prospect, order, checkout) memanggil function server langsung dari client component. Tidak ada REST/GraphQL API kecuali `/api/auth`.
- **Repository Pattern** — data access dipisah menjadi interface + implementasi Prisma, diekspor sebagai singleton.

```
[Admin dashboard]──┐   (server actions)        [Database]
[Public site]──────┴──► Repository (Prisma) ──► PostgreSQL
                          ▲
                     [Supabase Storage] (gambar/PDF)
```

---

## 2. Tech Stack

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Framework | Next.js 16.2.12 (App Router + Turbopack) | RSC sebagai basis render |
| Frontend UI | React 19, Tailwind CSS v4, shadcn/ui (`@base-ui/react`), `lucide-react` | `react-hook-form` + `zod` untuk form, `sonner` untuk toast |
| i18n | `next-intl` v4 | Route `[locale]` (id/en), default id; file `messages/{id,en}.json` |
| State client | `zustand` v5 | `useCartStore`, `useCheckoutStore` (drawer keranjang/checkout) |
| Backend | Server Actions + RSC | Hanya `/api/auth` berupa route handler |
| Auth | NextAuth v5 (Credentials + bcrypt + PrismaAdapter, JWT) | Guard boolean "login" di layout admin; belum ada RBAC |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`, `PrismaPg`) | Prisma client di-generate ke `src/generated/prisma` |
| File Storage | Supabase Storage (service-role) | Bucket: `product-images`, `blog-images`, `lead-magnets` |
| Migrations | Prisma Migrate | `prisma/migrations/` (5 file) |

---

## 3. Struktur Direktori

```
src/
├── app/
│   ├── [locale]/                 # Public site (RSC, force-dynamic)
│   │   ├── page.tsx              # Beranda (highlight produk = teaser)
│   │   ├── products/             # Katalog produk
│   │   │   └── [id]/page.tsx     # Detail produk
│   │   ├── about/ blog/ contact/
│   ├── admin/
│   │   ├── login/page.tsx        # Login (NextAuth credentials)
│   │   └── (shell)/              # Route group di balik guard auth
│   │       ├── layout.tsx        # Auth guard: redirect ke /admin/login
│   │       ├── dashboard/ products/ prospects/ orders/ blog/ lead-magnets/
│   │       └── products/
│   │           ├── page.tsx      # List produk
│   │           ├── new/page.tsx  # Form create
│   │           ├── [id]/edit/page.tsx  # Form edit
│   │           └── actions.ts    # Server actions produk (co-located)
│   └── api/auth/[...nextauth]/   # Satu-satunya route handler
├── components/
│   ├── public/                   # ProductsView, ProductCard, ProductDetailView,
│   │                             # CartDrawer, CheckoutForm, Navbar, dll.
│   └── admin/                    # ProductForm, DeleteProductButton, BlogForm,
│                                 # ProspectsManager, OrdersManager, AdminShell, dll.
├── actions/                      # Server actions entitas lain
│   ├── prospectActions.ts
│   ├── postActions.ts
│   ├── orderActions.ts
│   ├── leadMagnetActions.ts
│   └── checkoutActions.ts        # submitCheckout publik → prospects
├── repositories/
│   ├── interfaces/               # IProductRepository, IProspectRepository, dll.
│   ├── implementations/          # PrismaProspectRepository, dll.
│   ├── product.repository.ts     # Produk (lokasi root, tidak di implementations/)
│   └── storage.service.ts        # Upload/delete ke Supabase Storage
├── store/                        # useCartStore, useCheckoutStore (zustand)
└── lib/                          # db.ts (Prisma), auth.ts, auth.config.ts,
                                  # checkoutSchema.ts, supabase/server.ts
prisma/
├── schema.prisma                 # Model: Product, Post, LeadMagnet, Prospect, Order, User, dll.
├── seed.ts
└── migrations/                   # 5 migration
messages/{id,en}.json             # i18n (termasuk namespace admin.*)
```

---

## 4. Data Flow

### 4.1 Alur penuh: input produk di dashboard → tampil di frontend

```
1. Admin login            /admin/login → auth() → redirect ke /admin/dashboard
2. Klik "Tambah Produk"   /admin/products/new  (server component)
3. Isi form               ProductForm.tsx (client) — react-hook-form + zod (validasi client)
4. Submit                 panggil langsung server action createProductAction(payload, imageFile)
5. Server action          products/actions.ts ("use server")
      ├─ requireAdmin()          → cek session (auth)
      ├─ productSchema.parse()   → validasi server-side (authoritative)
      ├─ storageService.upload(file, "product-images") → Supabase → public URL
      └─ productRepository.create({...imageUrl}) → prisma.product.create → INSERT products
6. Revalidate & redirect  revalidatePath("/admin/products"); router.push("/admin/products")
7. Public page            /[locale]/products (RSC, force-dynamic) → productRepository.findAll()
                          → ProductsView → ProductCard
8. Detail page            /[locale]/products/[id] (RSC) → productRepository.findById(id)
                          → ProductDetailView (qty, add-to-cart, checkout)
```

### 4.2 Alur checkout publik

```
ProductDetailView → CHECK OUT → useCheckoutStore.openCheckout(...)
   → CartDrawer (drawer terpadu, editable qty)
   → CheckoutForm → submitCheckout (checkoutActions.ts)
        ├─ checkoutSchema.parse()
        ├─ re-resolve harga/nama dari DB per productId (jangan percaya nilai client)
        └─ INSERT ke prospects (status "warm", orderItems JSON, channel organic_web | web_buy_now)
        → redirect WhatsApp admin (wa.me/6287824604747)
```

### 4.3 Diagram lapisan per request

```
UI (client) ─► Server Action ─► Repository ─► Prisma ─► PostgreSQL / Supabase
                (validasi,       (interface →   (SQL)
                 auth, upload)    implementasi)
```

Setiap entitas CMS mengikuti pola yang sama: `Product`, `Post`, `LeadMagnet`, `Prospect`, `Order`.

---

## 5. Lapisan Komponen Penting (untuk modifikasi)

| # | Lapisan | File / Lokasi | Fungsi & catatan |
|---|---|---|---|
| 1 | UI Form Input | `src/components/admin/ProductForm.tsx` | Form tunggal create & edit (`initialData` prop). Fields: name, category, price, stock, description, specs{material,size,certification}, upload gambar |
| 2 | Validasi (2 lapis) | `ProductForm.tsx` (zod client) + `products/actions.ts` `productSchema` (server) | Server-side adalah authoritative. Tambah field → edit keduanya |
| 3 | Controller / Handler | `src/app/admin/(shell)/products/actions.ts` | `createProductAction`, `updateProductAction`, `deleteProductAction`. Semua `requireAdmin()` |
| 4 | Data Access | `repositories/interfaces/IProductRepository.ts` + `repositories/product.repository.ts` | Interface + implementasi Prisma. Produk di root, entitas lain di `implementations/` |
| 5 | Database Schema & Migration | `prisma/schema.prisma` (model `Product`) | Ubah schema → `npx prisma migrate dev --name <nama>` |
| 6 | File / Asset Storage | `src/repositories/storage.service.ts` (bucket `product-images`) | Upload, public URL, delete. Supabase service-role |
| 7 | Halaman List (Admin) | `src/app/admin/(shell)/products/page.tsx` | Tabel list, tombol edit (Link) & delete (`DeleteProductButton.tsx`) |
| 8 | Halaman Publik | `src/app/[locale]/products/…` + `ProductsView`, `ProductCard`, `ProductDetailView` | Render RSC + komponen client |
| 9 | i18n | `messages/{id,en}.json` → namespace `admin.products` | Setiap label baru wajib di kedua file |
| 10 | Auth Guard | `products/actions.ts` `requireAdmin()` + `(shell)/layout.tsx` | Semua mutasi admin lewat `requireAdmin()` |
| 11 | Cache Revalidation | `revalidatePath()` | Admin revalidate `/admin/products`; publik `force-dynamic` |
| 12 | Generated client | `src/generated/prisma/` | Regenerate saat `prisma migrate`/`generate` setelah ubah schema |

---

## 6. Checklist Tambah Field Baru (contoh: `weight` / `color`)

1. `prisma/schema.prisma` → tambah field di `model Product` → `npx prisma migrate dev`.
2. `IProductRepository.ts` → perbarui `ProductData` & `ProductInput` + implementasi.
3. `products/actions.ts` `productSchema` → tambah aturan zod server.
4. `ProductForm.tsx` → tambah input field + aturan zod client.
5. `messages/{id,en}.json` → label field.
6. Jika perlu tampil publik → `ProductsView` / `ProductDetailView` / `page.tsx` (mapping field).
7. Pastikan tipe sinkron — `ProductData` dipakai admin & publik (perhatikan `specs` yang bertipe `unknown`).

---

## 7. Catatan Arsitektur / Technical Debt

- **Belum ada RBAC** — semua user login dianggap admin. Untuk production perlu sistem role.
- **Read publik `force-dynamic`** — selalu query DB per render (fresh tapi ada biaya). Untuk skala besar pertimbangkan ISR / caching + `revalidatePath` di publik.
- **`Product` tidak punya halaman detail read-only di admin** — hanya list/new/edit.
- **`Order` terpisah dari `Prospect`** — checkout publik menulis ke `prospects`; `orders` adalah entitas admin yang belum tersambung penuh ke alur pembelian.
- **Konvensi lokasi tidak seragam** — action produk co-located di `products/actions.ts`, entitas lain di `src/actions/`. Bisa dirapikan.
- **`specs` bertipe `unknown`** di repository — perlu schema/type yang lebih ketat bila dibutuhkan validasi lanjutan.
