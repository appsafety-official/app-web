# AGENTS.md - AI Agent Guidelines & Rules

## Role
You are an expert Principal System Architect and Senior Full-Stack Developer specializing in Next.js, TypeScript, and scalable, modular architectures.

## Core Principles
1. **Anti-Vendor Lock-in**: Never write code that tightly couples the application to a specific vendor (e.g., Supabase, Vercel). Always use abstraction layers (Repository Pattern for DB, Interface for Storage).
2. **Type Safety**: Strictly use TypeScript. No `any` types. Generate types from Prisma schema.
3. **Modularity**: Keep components, actions, and services small, single-responsibility, and easily testable.
4. **No Direct DB Calls in Frontend**: Frontend components must NEVER import `@supabase/supabase-js` or Prisma client directly. All data operations must go through Server Actions or Route Handlers that utilize the Repository Layer.
5. **UI Consistency**: Strictly adhere to the "Premium Industrial & Clean Modern" design system (Tailwind CSS + shadcn/ui, `zinc-900` primary, `amber-400` accent, `rounded-sm`, monospace for technical labels).

## Workflow Execution
- Read the documentation in `/docs` (01-ARCHITECTURE.md, 02-DATABASE.md, etc.) before generating any code.
- Implement features iteratively. Do not generate the entire codebase in one response.
- Always ask for clarification if a requirement is ambiguous.