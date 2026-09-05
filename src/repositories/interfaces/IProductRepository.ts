export type SpecPair = {
  key: string;
  value: string;
};

export type ProductSpecs = SpecPair[];

export interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  imageGallery: string[];
  specs: ProductSpecs;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock?: number;
  description?: string | null;
  imageUrl?: string | null;
  imageGallery?: string[];
  specs?: ProductSpecs;
}

export interface IProductRepository {
  findAll(): Promise<ProductData[]>;
  findById(id: string): Promise<ProductData | null>;
  findByCategory(category: string): Promise<ProductData[]>;
  create(data: ProductInput): Promise<ProductData>;
  update(id: string, data: Partial<ProductInput>): Promise<ProductData>;
  delete(id: string): Promise<void>;
  /** Persist a new display order. `ids` must contain every product id. */
  reorder(ids: string[]): Promise<void>;
}
