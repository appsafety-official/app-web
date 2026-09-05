-- Backfill sortOrder: existing products ordered by newest first (1..n),
-- so the currently displayed order is preserved. New products get sortOrder 0
-- (top of the list).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) AS rn
  FROM "products"
)
UPDATE "products" SET "sortOrder" = ranked.rn
FROM ranked
WHERE "products".id = ranked.id;
