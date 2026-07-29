# 01-ARCHITECTURE.md - System Architecture & Anti-Lock-in Policy

## 1. Tech Stack
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (Client-side cart state)
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (Managed via Supabase)
- **Storage**: Supabase Storage (via Abstraction Layer)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Deployment**: Vercel (Frontend/API), Supabase (DB/Storage)

## 2. Anti-Vendor Lock-in Policy
- **Database Abstraction**: The frontend interacts ONLY with Server Actions/Route Handlers. These handlers use a Repository Interface (e.g., `IProspectRepository`). The concrete implementation (e.g., `PrismaProspectRepository`) handles the actual DB call. Swapping DB providers only requires changing the concrete implementation, not the business logic.
- **Storage Abstraction**: File uploads must use an `IStorageService` interface (`upload`, `getUrl`, `delete`). The concrete implementation handles the Supabase Storage logic. Swapping to AWS S3 or Cloudinary only requires a new implementation of this interface.

## 3. High-Level Folder Structure
```text
├── app/
│   ├── (public)/          # Public facing routes (Home, Products, Checkout, Promo)
│   ├── admin/             # Protected admin routes (Dashboard, Prospects, Products)
│   ├── api/               # Route handlers (Auth, Webhooks if needed)
│   └── layout.tsx         # Root layout with global fonts/styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── public/            # Public-facing components (Hero, ProductCard, CartDrawer)
│   └── admin/             # Admin-specific components (DataTable, Forms)
├── lib/
│   ├── db.ts              # Prisma client singleton
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # cn() utility, formatters
├── repositories/          # ABSTRACTION LAYER
│   ├── interfaces/        # IProductRepository, IProspectRepository, IStorageService
│   └── implementations/   # PrismaProductRepository, SupabaseStorageService
├── actions/               # Server Actions (e.g., createProspectAction, loginAction)
├── store/                 # Zustand stores (e.g., useCartStore)
├── docs/                  # This documentation folder
└── prisma/
    └── schema.prisma      # Source of truth for database schema