import OrdersTable from "@/components/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Commandes</h1>
      <OrdersTable />
    </div>
  );
}
