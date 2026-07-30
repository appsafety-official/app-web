
---

### 📄 3. `02-DATABASE.md`
```markdown
# 02-DATABASE.md - Database Schema & Strategy

## 1. Prisma 7+ Schema (`prisma/schema.prisma`)
*Note: In Prisma 7, the `datasource` block is removed from schema.prisma and moved to `prisma.config.ts`.*
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

model Product {
  id          String   @id @default(cuid())
  name        String
  category    String   // "firefighting", "welding", "hazmat", "hand_protection"
  price       Int
  description String?
  imageUrl    String?  // URL from storage, NOT binary data
  specs       Json?    // Flexible specifications
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
  acquisitionChannel    String   // "organic_web", "tokopedia_insert", "walk_in", "phone_order"
  status                String   @default("cold") // "cold", "warm", "hot"
  notesAdmin            String?
  totalAmount           Int      @default(0)
  orderItems            Json     // Array of objects: [{ productId, name, quantity, price }]
  createdBy             String?  // "system" or admin email
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