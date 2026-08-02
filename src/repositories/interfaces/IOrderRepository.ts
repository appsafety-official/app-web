export interface OrderData {
  id: string;
  customerName: string;
  whatsapp: string | null;
  address: string | null;
  items: unknown;
  totalAmount: number;
  status: string;
  acquisitionChannel: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInput {
  customerName: string;
  whatsapp?: string | null;
  address?: string | null;
  items?: unknown;
  totalAmount?: number;
  status?: string;
  acquisitionChannel?: string;
  notes?: string | null;
}

export interface OrderFilters {
  status?: string;
}

export interface OrderSummary {
  total: number;
  paidTotal: number;
  pendingCount: number;
  shippedCount: number;
  cancelledCount: number;
}

export interface IOrderRepository {
  findAll(filters?: OrderFilters): Promise<OrderData[]>;
  findById(id: string): Promise<OrderData | null>;
  create(data: OrderInput): Promise<OrderData>;
  updateStatus(id: string, status: string, notes?: string): Promise<OrderData>;
  getSummary(): Promise<OrderSummary>;
}
