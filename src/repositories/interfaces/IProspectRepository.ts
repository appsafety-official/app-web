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
  address?: string;
  tokopediaOrderId?: string;
  acquisitionChannel?: string;
  status?: string;
  notesAdmin?: string;
  totalAmount?: number;
  orderItems?: unknown;
  createdBy?: string;
}

export interface IProspectRepository {
  findAll(): Promise<ProspectData[]>;
  findById(id: string): Promise<ProspectData | null>;
  create(data: ProspectInput): Promise<ProspectData>;
  update(id: string, data: Partial<ProspectInput>): Promise<ProspectData>;
  delete(id: string): Promise<void>;
}
