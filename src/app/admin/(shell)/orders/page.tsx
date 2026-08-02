import { orderRepository } from "@/repositories/implementations/PrismaOrderRepository";
import { OrdersManager } from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await orderRepository.findAll();

  return <OrdersManager initialOrders={orders} />;
}
