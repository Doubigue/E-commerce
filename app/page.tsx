import SalesChart from "@/components/SalesChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Tableau de bord</h1>
      <SalesChart />
    </div>
  );
}
