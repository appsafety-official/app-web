import { productRepository } from "@/repositories/product.repository";
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

  const specData =
    product.specs && typeof product.specs === "object"
      ? (product.specs as Record<string, string>)
      : {};

  return (
    <ProductDetailView
      product={{
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description,
        specs: {
          material: specData.material ?? "",
          size: specData.size ?? "",
          certification: specData.certification ?? "",
        },
      }}
    />
  );
}

