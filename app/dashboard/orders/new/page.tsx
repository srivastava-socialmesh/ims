'use client';

import { useOrders } from '@/lib/hooks/useOrders';
import OrderForm from '@/components/forms/OrderForm';
import { useRouter } from 'next/navigation';

export default function NewOrderPage() {
  const { createOrder } = useOrders();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createOrder(data);
    router.push('/dashboard/orders');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm onSubmit={handleSubmit} />
    </div>
  );
}
