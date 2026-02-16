import { createClient } from "@/utils/supabase/server";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  let userProfile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
    userProfile = data;
  }

  // Parallel data fetching
  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    { data: recentOrders },
    { data: allOrders }, // For chart
    { data: recentTickets }, // For "Recent Messages" replacement
    { data: products }, // For "Top Categories"
    { data: categories }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("id, total_amount, status, created_at, profiles!user_id(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total_amount, status, created_at").order("created_at", { ascending: true }),
    supabase.from("tickets").select("id, subject, status, created_at, profiles!user_id(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("category_id, stock_quantity"),
    supabase.from("categories").select("id, name")
  ]);

  // Process Revenue & Order Stats
  const totalOrdersCount = allOrders?.length || 0;
  let totalRevenue = 0;
  let realizedRevenue = 0;
  let pendingRevenue = 0;
  
  let deliveredOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;

  // Process data for charts (By Year and Month)
  const yearsAggregated: Record<number, any[]> = {};
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  allOrders?.forEach(order => {
    const amount = Number(order.total_amount) || 0;
    
    // Global Stats
    if (order.status !== 'CANCELLED') {
        totalRevenue += amount;
    }

    if (order.status === 'DELIVERED') {
        realizedRevenue += amount;
        deliveredOrders++;
    } else if (order.status === 'CANCELLED') {
        cancelledOrders++;
    } else {
        pendingRevenue += amount;
        pendingOrders++;
    }

    // Chart Data
    const date = new Date(order.created_at);
    const yr = date.getFullYear();

    if (!yearsAggregated[yr]) {
        yearsAggregated[yr] = months.map(name => ({ name, completed: 0, pending: 0 }));
    }

    const monthData = yearsAggregated[yr][date.getMonth()];
    
    if (order.status === 'DELIVERED') {
      monthData.completed += amount;
    } else if (order.status !== 'CANCELLED') {
      monthData.pending += amount;
    }
  });

  // Ensure current year always exists
  if (!yearsAggregated[currentYear]) {
      yearsAggregated[currentYear] = months.map(name => ({ name, completed: 0, pending: 0 }));
  }

  // Calculate Growth (MoM)
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const lastMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const lastMonthYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;

  const revenueThisMonth = (yearsAggregated[currentYear]?.[currentMonthIdx]?.completed || 0) + (yearsAggregated[currentYear]?.[currentMonthIdx]?.pending || 0);
  
  const revenueLastMonth = (yearsAggregated[lastMonthYear]?.[lastMonthIdx]?.completed || 0) + (yearsAggregated[lastMonthYear]?.[lastMonthIdx]?.pending || 0);

  const revenueGrowth = revenueLastMonth === 0 
    ? (revenueThisMonth > 0 ? 100 : 0) 
    : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

  // For orders growth, we iterate again or could have tracked it above. Simpler to iterate again or optimize later.
  // Actually, let's keep it simple for now and just pass revenue growth.
  // To get order growth, we'd need to count orders per month too. Let's do a quick count.
  let ordersThisMonth = 0;
  let ordersLastMonth = 0;

  allOrders?.forEach(order => {
      const d = new Date(order.created_at);
      if (d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear) ordersThisMonth++;
      if (d.getMonth() === lastMonthIdx && d.getFullYear() === lastMonthYear) ordersLastMonth++;
  });

  const ordersGrowth = ordersLastMonth === 0 
    ? (ordersThisMonth > 0 ? 100 : 0)
    : Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100);

  const revenueChartData = yearsAggregated;

  // Process Top Categories & Stock
  const categoryCounts: Record<string, number> = {};
  let inStock = 0;
  let outOfStock = 0;

  products?.forEach(p => {
    if (p.category_id) categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    if ((p.stock_quantity || 0) > 0) inStock++;
    else outOfStock++;
  });

  const categoryMap = new Map(categories?.map(c => [c.id, c.name]));
  
  const topCategories = Object.entries(categoryCounts)
    .map(([id, count]) => ({
      name: categoryMap.get(id) || "Unknown",
      count,
      percent: productsCount ? Math.round((count / productsCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  // Add product stock data to stats
  const productsPie = [
      { name: "In Stock", value: inStock, color: "#4C63FC" },
      { name: "Out of Stock", value: outOfStock, color: "#E5E7EB" }
  ];

  return (
    <AdminDashboardClient
      userProfile={userProfile}
      stats={{
        users: usersCount || 0,
        products: productsCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue,
        growth: { revenue: revenueGrowth, orders: ordersGrowth },
        pieCharts: {
            earnings: [
                { name: "Realized", value: realizedRevenue, color: "#4C63FC" },
                { name: "Pending", value: pendingRevenue, color: "#E5E7EB" }
            ],
            sales: [
                { name: "Delivered", value: deliveredOrders, color: "#10B981" },
                { name: "Processing", value: pendingOrders, color: "#E5E7EB" },
                { name: "Cancelled", value: cancelledOrders, color: "#EF4444" }
            ],
            products: productsPie
        }
      }}
      recentOrders={recentOrders || []}
      recentTickets={recentTickets || []}
      revenueChartData={revenueChartData}
      topCategories={topCategories}
    />
  );
}
