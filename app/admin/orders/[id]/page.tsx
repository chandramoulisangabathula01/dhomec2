
import { getOrderById, getOrderHistory } from "@/app/actions/orders";
import OrderDetails from "@/components/admin/OrderDetails";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) {
    notFound();
  }

  const history = await getOrderHistory(id);

  // Cast type if needed or ensure getOrderById returns valid Order
  // getOrderById does return typed Order if db types match
  
  return <OrderDetails order={order as any} history={history || []} />;
}
