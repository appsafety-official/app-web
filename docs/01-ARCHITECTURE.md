# 01-ARCHITECTURE.md - System Architecture & Anti-Lock-in Policy

## 1. Tech Stack
- **Framework**: Next.js 16+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (Client-side cart state)
- **ORM**: Prisma ORM v7.9.1 (Driver Adapter Pattern)
- **Database**: PostgreSQL (Managed via Supabase)
- **Storage**: Supabase Storage (via Abstraction Layer)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Internationalization**: `next-intl` (Cookie-based, Clean URLs)
- **Deployment**: Vercel (Frontend/API), Supabase (DB/Storage)

## 2. Design System: "Technical Minimalist & Warm Raw"
- **Typography**: Global Monospace (Space Mono / JetBrains Mono) for ALL elements (headings, body, buttons, inputs).
- **Colors**: Background Warm Cream (`#FAFAF9` / `bg-stone-50`), Text & Borders Dark Charcoal (`#1C1917` / `text-stone-900`).
- **Shapes**: STRICTLY `rounded-none` (sharp corners). NO drop shadows (`shadow-none`). Use 1px solid borders.
- **Accent**: Safety Yellow (`#EAB308`) used ONLY for text inside black buttons or small highlights. Primary buttons = Black bg + Yellow text.

## 3. Anti-Vendor Lock-in Policy
- **Database Abstraction**: Frontend interacts ONLY with Server Actions/Route Handlers. These use a Repository Interface. Concrete implementation handles Prisma. Swapping DB providers only requires changing the concrete implementation.
- **Storage Abstraction**: File uploads must use an `IStorageService` interface. Concrete implementation handles Supabase Storage. Swapping to S3/Cloudinary only requires a new implementation.

## 4. Internationalization (i18n) Strategy
- **Library**: `next-intl`
- **Strategy**: Cookie-based locale detection. Clean URLs (no `/en` or `/id` prefix).
- **Locales**: `en` (Default for MVP), `id` (Secondary/Placeholder).
- **Toggle**: Flag icon in Navbar, saves preference to `NEXT_LOCALE` cookie.

## 5. High-Level Folder Structure
```text
├── app/
│   ├── (public)/          # Public facing routes
│   ├── admin/             # Protected admin routes
│   ├── api/               # Route handlers (Auth, etc.)
│   └── layout.tsx         # Root layout (Wrapped with NextIntlClientProvider)
├── messages/              # Translation files
│   ├── en.json            # English (Source of truth)
│   └── id.json            # Indonesian (Placeholder)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── public/            # Public components (Navbar, LanguageToggle, ProductCard)
│   └── admin/             # Admin-specific components
├── lib/
│   ├── db.ts              # Prisma client singleton (Driver Adapter)
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # cn() utility, formatters
├── repositories/          # ABSTRACTION LAYER
│   ├── interfaces/        # IProductRepository, IProspectRepository, IStorageService
│   └── implementations/   # PrismaProductRepository, SupabaseStorageService
├── actions/               # Server Actions
├── store/                 # Zustand stores (useCartStore)
├── docs/                  # Documentation folder
├── prisma/
│   ├── schema.prisma      # Pure model definitions
│   └── prisma.config.ts   # Datasource & adapter configuration
├── i18n.ts                # next-intl configuration
└── middleware.ts          # Locale detection middleware