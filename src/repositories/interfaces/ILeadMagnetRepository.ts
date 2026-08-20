export interface LeadMagnetData {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  pdfUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadMagnetInput {
  title: string;
  titleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  pdfUrl: string;
  isActive?: boolean;
}

export interface ILeadMagnetRepository {
  findAll(): Promise<LeadMagnetData[]>;
  getActive(): Promise<LeadMagnetData | null>;
  findById(id: string): Promise<LeadMagnetData | null>;
  create(data: LeadMagnetInput): Promise<LeadMagnetData>;
  update(id: string, data: Partial<LeadMagnetInput>): Promise<LeadMagnetData>;
  delete(id: string): Promise<void>;
}
