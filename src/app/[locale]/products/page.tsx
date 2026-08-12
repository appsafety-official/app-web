import { productRepository } from "@/repositories/product.repository";
import ProductsView from "@/components/public/ProductsView";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = (await productRepository.findAll()).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    imageUrl: p.imageUrl,
  }));

  return <ProductsView products={products} />;
}

