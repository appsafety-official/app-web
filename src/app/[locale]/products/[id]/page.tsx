import { productRepository } from "@/repositories/product.repository";
import { normalizeSpecs } from "@/lib/product-specs";
import { sanitizeProductDescription } from "@/lib/sanitize-product-description";
import ProductDetailView from "@/components/public/ProductDetailView";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const product = await productRepository.findById(id);

  if (!product) {
    return <ProductDetailView product={null} />;
  }

  return (
    <ProductDetailView
      product={{
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        descriptionHtml: sanitizeProductDescription(product.description),
        specs: normalizeSpecs(product.specs),
      }}
    />
  );
}

