export interface ProspectData {
  id: string;
  name: string;
  whatsapp: string;
  address: string | null;
  tokopediaOrderId: string | null;
  acquisitionChannel: string;
  status: string;
  notesAdmin: string | null;
  totalAmount: number;
  orderItems: unknown;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProspectInput {
  name: string;
  whatsapp: string;
  address?: string | null;
  tokopediaOrderId?: string | null;
  acquisitionChannel?: string;
  status?: string;
  notesAdmin?: string | null;
  totalAmount?: number;
  orderItems?: unknown;
  createdBy?: string;
}

export interface ProspectFilters {
  status?: string;
  source?: string;
  search?: string;
}

export interface IProspectRepository {
  findAll(filters?: ProspectFilters): Promise<ProspectData[]>;
  findById(id: string): Promise<ProspectData | null>;
  create(data: ProspectInput): Promise<ProspectData>;
  update(id: string, data: Partial<ProspectInput>): Promise<ProspectData>;
  updateStatus(id: string, status: string, notes?: string): Promise<ProspectData>;
  delete(id: string): Promise<void>;
  exportToCSV(): Promise<string>;
}
