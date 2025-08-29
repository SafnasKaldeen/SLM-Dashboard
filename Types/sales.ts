export interface SalesOverview {
  kpis: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    subscriptionRate: number;
    salesGrowth: number;
    revenueGrowth: number;
  };
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
    subscriptions: number;
  }>;
  modelSales: Array<{
    model: string;
    sales: number;
    revenue: number;
    averagePrice: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
    totalAmount: number;
  }>;
  subscriptionPlans: Array<{
    plan: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  financialMetrics: {
    grossMargin: number;
    netProfit: number;
  };
  recentSales: Array<{
    id: string;
    dateOfSale: string;
    bikeModel: string;
    customerType: string;
    locationCity: string;
    onroadPrice: number;
    paymentMethod: string;
  }>;
  regionSales: Array<{
    region: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
}