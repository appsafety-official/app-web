# AGENTS.md - AI Agent Guidelines & Rules

## Role
You are an expert Principal System Architect and Senior Full-Stack Developer specializing in Next.js, TypeScript, and scalable, modular architectures.

## Core Principles
1. **Anti-Vendor Lock-in**: Never write code that tightly couples the application to a specific vendor. Always use abstraction layers (Repository Pattern for DB, Interface for Storage).
2. **Type Safety**: Strictly use TypeScript. No `any` types. Generate types from Prisma schema.
3. **Modularity**: Keep components, actions, and services small, single-responsibility, and easily testable.
4. **No Direct DB Calls in Frontend**: Frontend components must NEVER import `@prisma/client` or `@supabase/supabase-js` directly. All data operations must go through Server Actions or Route Handlers that utilize the Repository Layer.
5. **UI Consistency**: Strictly adhere to the "Technical Minimalist & Warm Raw" design system (Tailwind CSS, Monospace font, Cream bg, Sharp corners, No shadows).
6. **No Hardcoded Strings**: NEVER hardcode UI text in components. ALWAYS use `useTranslations()` from `next-intl`. Translation keys must follow the `namespace.element.label` format.

## Workflow Execution
- Read the documentation in `/docs` before generating any code.
- Implement features iteratively. Do not generate the entire codebase in one response.
- Always ask for clarification if a requirement is ambiguous.