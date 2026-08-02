export interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverUrl?: string | null;
  published?: boolean;
}

export interface IPostRepository {
  findAll(publishedOnly?: boolean): Promise<PostData[]>;
  findById(id: string): Promise<PostData | null>;
  findBySlug(slug: string): Promise<PostData | null>;
  create(data: PostInput): Promise<PostData>;
  update(id: string, data: Partial<PostInput>): Promise<PostData>;
  delete(id: string): Promise<void>;
}
