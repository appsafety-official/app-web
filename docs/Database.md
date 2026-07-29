
---

### 📄 3. `02-DATABASE.md`
```markdown
# 02-DATABASE.md - Database Schema & Strategy

## 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  category    String   // "firefighting", "welding", "hazmat", "hand_protection"
  price       Int
  description String?
  imageUrl    String?  // URL from storage, NOT binary data
  specs       Json?    // Flexible specifications (e.g., {"material": "Nomex", "size": "L"})
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("products")
}

model Prospect {
  id                    String   @id @default(cuid())
  name                  String
  whatsapp              String
  address               String?
  tokopediaOrderId      String?  // Optional, for Tokopedia shifting verification
  acquisitionChannel    String   // "organic_web", "tokopedia_insert", "walk_in", "phone_order", "event"
  status                String   @default("cold") // "cold", "warm", "hot"
  notesAdmin            String?
  totalAmount           Int      @default(0)
  orderItems            Json     // Array of objects: [{ productId, name, quantity, price }]
  createdBy             String?  // "system" or admin email (for manual admin input)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("prospects")
}

model Admin {
  id        String @id @default(cuid())
  email     String @unique
  password  String // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now())
  
  @@map("admins")
}