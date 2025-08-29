// File: /lib/mock-data/sales-data.ts
export interface SalesRecord {
  id: string;
  bikeId: string;
  bikeModel: string;
  motorCapacity: number;
  batteryCapacity: number;
  bikePrice: number;
  onroadPrice: number;
  customerType: "individual" | "fleet";
  locationCity: string;
  dealerName: string;
  salespersonName: string;
  dateOfSale: string;
  deliveryDate: string;
  batteryOwnershipModel: "owned" | "subscription";
  subscriptionPlanType: string;
  subscriptionStartDate: string;
  swapPlanPrice: number;
  swapStationAssigned: string;
  paymentMethod: "cash" | "finance" | "card";
  financePartner: string;
  downPayment: number;
  loanAmount: number;
  emi: number;
  telematicsId: string;
  warrantyPeriodMonths: number;
  amcPurchased: boolean;
  leadSource: string;
  discountAmount: number;
  referralCode: string;
  registrationNumber: string;
  firstSwapVisitDate: string;
  batteryId: string;
  connectedServicesActive: boolean;
  color: string;
}

export interface DealerPerformance {
  dealerName: string;
  dealerAddress: string;
  city: string;
  region: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  averageOrderValue: number;
  customerSatisfactionScore: number;
  deliveryRating: number;
  salesGrowth: number;
  revenueGrowth: number;
  topModel: string;
  topSalesperson: string;
  salespeople: Array<{
    name: string;
    sales: number;
    revenue: number;
    conversionRate: number;
    customerRating: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    sales: number;
    revenue: number;
    targets: number;
    achievement: number;
  }>;
}

export interface RegionalSales {
  city: string;
  region: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  marketShare: number;
  growthRate: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  bikeRevenue: number;
  subscriptionRevenue: number;
  totalDiscounts: number;
  averageDiscount: number;
  grossMargin: number;
  netProfit: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  individualCustomers: number;
  fleetCustomers: number;
  averageCustomerValue: number;
  customerRetentionRate: number;
  subscriptionAdoptionRate: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averageValue: number;
    retentionRate: number;
  }>;
  customerSatisfaction: Array<{
    category: string;
    score: number;
    trend: number;
  }>;
  leadSources: Array<{
    source: string;
    leads: number;
    conversions: number;
    conversionRate: number;
    cost: number;
  }>;
}

// Generate mock sales data
const bikeModels = ["SL-Scooter Pro", "SL-Scooter Lite", "SL-Bike Urban", "SL-Bike Sport"];
const cities = ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Matara", "Kurunegala", "Anuradhapura"];
const dealers = [
  "Lanka Motors Colombo",
  "City Bikes Kandy", 
  "Coastal Motors Galle",
  "Northern Wheels Jaffna",
  "Beach Bikes Negombo",
  "Southern Motors Matara",
  "Central Bikes Kurunegala",
  "Ancient City Motors Anuradhapura",
];

const dealerAddresses = [
  "No. 123, Galle Road, Colombo 03",
  "45 Kandy Road, Kandy",
  "78 Main Street, Galle",
  "12 Hospital Road, Jaffna", 
  "34 Negombo Road, Negombo",
  "56 Matara Road, Matara",
  "23 Kurunegala Street, Kurunegala",
  "67 Sacred City Road, Anuradhapura",
];

const salespersons = [
  "Kasun Perera",
  "Nimali Silva", 
  "Roshan Fernando",
  "Priya Jayawardena",
  "Chaminda Rathnayake",
  "Sanduni Wickramasinghe",
  "Tharaka Gunasekara",
  "Malini Rajapaksa",
  "Nuwan Mendis",
  "Dilini Rathnayake",
  "Sampath Gunasena",
  "Kavitha Wijesinghe",
  "Ruwan Jayasuriya",
  "Anoma Perera",
  "Mahinda Silva",
  "Shani Fernando"
];

const colors = ["Electric Blue", "Midnight Black", "Pearl White", "Crimson Red", "Forest Green", "Silver Gray"];
const subscriptionPlans = ["Basic 100km", "Standard 200km", "Premium 300km", "Unlimited"];
const leadSources = ["Website", "Social Media", "Referral", "Dealer Walk-in", "Advertisement", "Exhibition"];

function generateMockSalesData(count: number): SalesRecord[] {
  const salesData: SalesRecord[] = [];

  for (let i = 0; i < count; i++) {
    const saleDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const deliveryDate = new Date(saleDate.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000);
    const subscriptionStart = new Date(deliveryDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    const firstSwapDate = new Date(subscriptionStart.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000);

    const bikePrice = 350000 + Math.random() * 100000;
    const discountAmount = Math.random() * 50000;
    const onroadPrice = bikePrice - discountAmount + bikePrice * 0.15; // Adding taxes
    const isFinanced = Math.random() > 0.4;
    const downPayment = isFinanced ? onroadPrice * (0.2 + Math.random() * 0.3) : onroadPrice;
    const loanAmount = isFinanced ? onroadPrice - downPayment : 0;
    const emi = loanAmount > 0 ? loanAmount / (24 + Math.random() * 36) : 0;

    salesData.push({
      id: `SALE_${String(i + 1).padStart(4, "0")}`,
      bikeId: `BIKE_${String(i + 1).padStart(6, "0")}`,
      bikeModel: bikeModels[Math.floor(Math.random() * bikeModels.length)],
      motorCapacity: 1000 + Math.random() * 2000,
      batteryCapacity: 15 + Math.random() * 25,
      bikePrice,
      onroadPrice,
      customerType: Math.random() > 0.8 ? "fleet" : "individual",
      locationCity: cities[Math.floor(Math.random() * cities.length)],
      dealerName: dealers[Math.floor(Math.random() * dealers.length)],
      salespersonName: salespersons[Math.floor(Math.random() * salespersons.length)],
      dateOfSale: saleDate.toISOString().split("T")[0],
      deliveryDate: deliveryDate.toISOString().split("T")[0],
      batteryOwnershipModel: Math.random() > 0.3 ? "subscription" : "owned",
      subscriptionPlanType: subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)],
      subscriptionStartDate: subscriptionStart.toISOString().split("T")[0],
      swapPlanPrice: 5000 + Math.random() * 10000,
      swapStationAssigned: `STATION_${Math.floor(Math.random() * 50) + 1}`,
      paymentMethod: isFinanced ? "finance" : Math.random() > 0.5 ? "cash" : "card",
      financePartner: isFinanced
        ? ["DFCC Bank", "Commercial Bank", "HNB", "Sampath Bank"][Math.floor(Math.random() * 4)]
        : "",
      downPayment,
      loanAmount,
      emi,
      telematicsId: `TEL_${String(i + 1).padStart(6, "0")}`,
      warrantyPeriodMonths: [12, 24, 36][Math.floor(Math.random() * 3)],
      amcPurchased: Math.random() > 0.6,
      leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
      discountAmount,
      referralCode: Math.random() > 0.7 ? `REF_${Math.floor(Math.random() * 1000)}` : "",
      registrationNumber: `${cities[Math.floor(Math.random() * cities.length)].substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
      firstSwapVisitDate: firstSwapDate.toISOString().split("T")[0],
      batteryId: `BAT_${String(i + 1).padStart(6, "0")}`,
      connectedServicesActive: Math.random() > 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  return salesData;
}

// Generate 500 sales records
export const mockSalesData = generateMockSalesData(500);



// Generate monthly performance data for each dealer
function generateMonthlyPerformance(dealerSales: SalesRecord[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return months.map((month, index) => {
    const monthlySales = dealerSales.filter(sale => {
      const saleMonth = new Date(sale.dateOfSale).getMonth();
      return saleMonth === index;
    });
    
    const sales = monthlySales.length;
    const revenue = monthlySales.reduce((sum, sale) => sum + sale.onroadPrice, 0);
    const targets = Math.ceil(sales * (0.8 + Math.random() * 0.4)); // Target 80-120% of actual
    const achievement = targets > 0 ? (sales / targets) * 100 : 0;
    
    return {
      month,
      sales,
      revenue,
      targets,
      achievement
    };
  });
}

// Generate salesperson performance for each dealer
function generateSalespersonPerformance(dealerSales: SalesRecord[]) {
  const salespersonMap = dealerSales.reduce((acc, sale) => {
    if (!acc[sale.salespersonName]) {
      acc[sale.salespersonName] = {
        name: sale.salespersonName,
        sales: 0,
        revenue: 0
      };
    }
    acc[sale.salespersonName].sales += 1;
    acc[sale.salespersonName].revenue += sale.onroadPrice;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(salespersonMap).map((person: any) => ({
    ...person,
    conversionRate: 65 + Math.random() * 25, // 65-90% conversion rate
    customerRating: 3.8 + Math.random() * 1.2 // 3.8-5.0 rating
  }));
}

// Calculate enhanced dealer performance with all required fields
export const mockDealerPerformance: DealerPerformance[] = dealers.map((dealer, index) => {
  const dealerSales = mockSalesData.filter((sale) => sale.dealerName === dealer);
  const totalRevenue = dealerSales.reduce((sum, sale) => sum + sale.onroadPrice, 0);
  
  // Calculate top model
  const modelCounts = dealerSales.reduce(
    (acc, sale) => {
      acc[sale.bikeModel] = (acc[sale.bikeModel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topModel = Object.entries(modelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";
  
  // Calculate top salesperson
  const salespersonCounts = dealerSales.reduce((acc, sale) => {
    acc[sale.salespersonName] = (acc[sale.salespersonName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSalesperson = Object.entries(salespersonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";
  
  // Generate region mapping
  const regionMap: Record<string, string> = {
    "Lanka Motors Colombo": "Western",
    "City Bikes Kandy": "Central", 
    "Coastal Motors Galle": "Southern",
    "Northern Wheels Jaffna": "Northern",
    "Beach Bikes Negombo": "Western",
    "Southern Motors Matara": "Southern",
    "Central Bikes Kurunegala": "Central",
    "Ancient City Motors Anuradhapura": "North Central",
  };

  return {
    dealerName: dealer,
    dealerAddress: dealerAddresses[index],
    city: cities[index],
    region: regionMap[dealer] || "Other",
    totalSales: dealerSales.length,
    totalRevenue,
    averagePrice: totalRevenue / dealerSales.length || 0,
    averageOrderValue: totalRevenue / dealerSales.length || 0,
    customerSatisfactionScore: 4.0 + Math.random() * 1.0, // 4.0-5.0
    deliveryRating: 4.2 + Math.random() * 0.8, // 4.2-5.0
    salesGrowth: -5 + Math.random() * 25, // -5% to +20%
    revenueGrowth: -3 + Math.random() * 23, // -3% to +20%
    topModel,
    topSalesperson,
    salespeople: generateSalespersonPerformance(dealerSales),
    monthlyPerformance: generateMonthlyPerformance(dealerSales)
  };
});

// Calculate regional sales
export const mockRegionalSales: RegionalSales[] = cities.map((city) => {
  const citySales = mockSalesData.filter((sale) => sale.locationCity === city);
  const totalRevenue = citySales.reduce((sum, sale) => sum + sale.onroadPrice, 0);

  return {
    city,
    region: ["Colombo", "Negombo"].includes(city)
      ? "Western"
      : ["Kandy", "Kurunegala"].includes(city)
        ? "Central"
        : ["Galle", "Matara"].includes(city)
          ? "Southern"
          : "Northern",
    totalSales: citySales.length,
    totalRevenue,
    averagePrice: totalRevenue / citySales.length || 0,
    marketShare: (citySales.length / mockSalesData.length) * 100,
    growthRate: -10 + Math.random() * 30, // Random growth rate between -10% to 20%
  };
});



// Calculate financial metrics
export const mockFinancialMetrics: FinancialMetrics = {
  totalRevenue: mockSalesData.reduce((sum, sale) => sum + sale.onroadPrice, 0),
  bikeRevenue: mockSalesData.reduce((sum, sale) => sum + sale.bikePrice, 0),
  subscriptionRevenue: mockSalesData
    .filter((sale) => sale.batteryOwnershipModel === "subscription")
    .reduce((sum, sale) => sum + sale.swapPlanPrice * 12, 0), // Annual subscription
  totalDiscounts: mockSalesData.reduce((sum, sale) => sum + sale.discountAmount, 0),
  averageDiscount: mockSalesData.reduce((sum, sale) => sum + sale.discountAmount, 0) / mockSalesData.length,
  grossMargin: 0.25, // 25% gross margin
  netProfit: 0.15, // 15% net profit margin
};

// Monthly sales trend data
export const mockMonthlySales = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2024, i, 1).toLocaleString("default", { month: "short" });
  const monthlySales = mockSalesData.filter((sale) => {
    const saleMonth = new Date(sale.dateOfSale).getMonth();
    return saleMonth === i;
  });

  return {
    month,
    sales: monthlySales.length,
    revenue: monthlySales.reduce((sum, sale) => sum + sale.onroadPrice, 0),
    subscriptions: monthlySales.filter((sale) => sale.batteryOwnershipModel === "subscription").length,
  };
});

// Model-wise sales data
export const mockModelSales = bikeModels.map((model) => {
  const modelSales = mockSalesData.filter((sale) => sale.bikeModel === model);
  return {
    model,
    sales: modelSales.length,
    revenue: modelSales.reduce((sum, sale) => sum + sale.onroadPrice, 0),
    averagePrice: modelSales.reduce((sum, sale) => sum + sale.onroadPrice, 0) / modelSales.length || 0,
  };
});

// Payment method breakdown
export const mockPaymentMethods = ["cash", "finance", "card"].map((method) => {
  const methodSales = mockSalesData.filter((sale) => sale.paymentMethod === method);
  return {
    method,
    count: methodSales.length,
    percentage: (methodSales.length / mockSalesData.length) * 100,
    totalAmount: methodSales.reduce((sum, sale) => sum + sale.onroadPrice, 0),
  };
});

// Subscription plan distribution
export const mockSubscriptionPlans = subscriptionPlans.map((plan) => {
  const planSales = mockSalesData.filter((sale) => sale.subscriptionPlanType === plan);
  return {
    plan,
    count: planSales.length,
    percentage: (planSales.length / mockSalesData.length) * 100,
    revenue: planSales.reduce((sum, sale) => sum + sale.swapPlanPrice, 0),
  };
});

// Customer insights function
export function getCustomerInsights(): CustomerInsights {
  // Calculate basic customer metrics
  const totalCustomers = mockSalesData.length;
  const individualCustomers = mockSalesData.filter(sale => sale.customerType === "individual").length;
  const fleetCustomers = mockSalesData.filter(sale => sale.customerType === "fleet").length;
  
  // Calculate average customer value
  const averageCustomerValue = mockSalesData.reduce((sum, sale) => sum + sale.onroadPrice, 0) / totalCustomers;
  
  // Calculate subscription adoption rate
  const subscriptionCustomers = mockSalesData.filter(sale => sale.batteryOwnershipModel === "subscription").length;
  const subscriptionAdoptionRate = (subscriptionCustomers / totalCustomers) * 100;
  
  // Mock customer retention rate
  const customerRetentionRate = 85.5;
  
  // Create customer segments
  const premiumCustomers = mockSalesData.filter(sale => sale.onroadPrice > 450000);
  const standardCustomers = mockSalesData.filter(sale => sale.onroadPrice >= 350000 && sale.onroadPrice <= 450000);
  const budgetCustomers = mockSalesData.filter(sale => sale.onroadPrice < 350000);
  const fleetCustomersData = mockSalesData.filter(sale => sale.customerType === "fleet");
  
  const customerSegments = [
    {
      segment: "Premium Individual",
      count: premiumCustomers.filter(sale => sale.customerType === "individual").length,
      percentage: Math.round((premiumCustomers.filter(sale => sale.customerType === "individual").length / totalCustomers) * 100),
      averageValue: premiumCustomers.filter(sale => sale.customerType === "individual")
        .reduce((sum, sale) => sum + sale.onroadPrice, 0) / 
        Math.max(1, premiumCustomers.filter(sale => sale.customerType === "individual").length),
      retentionRate: 92.5
    },
    {
      segment: "Standard Individual",
      count: standardCustomers.filter(sale => sale.customerType === "individual").length,
      percentage: Math.round((standardCustomers.filter(sale => sale.customerType === "individual").length / totalCustomers) * 100),
      averageValue: standardCustomers.filter(sale => sale.customerType === "individual")
        .reduce((sum, sale) => sum + sale.onroadPrice, 0) / 
        Math.max(1, standardCustomers.filter(sale => sale.customerType === "individual").length),
      retentionRate: 85.2
    },
    {
      segment: "Budget Individual",
      count: budgetCustomers.filter(sale => sale.customerType === "individual").length,
      percentage: Math.round((budgetCustomers.filter(sale => sale.customerType === "individual").length / totalCustomers) * 100),
      averageValue: budgetCustomers.filter(sale => sale.customerType === "individual")
        .reduce((sum, sale) => sum + sale.onroadPrice, 0) / 
        Math.max(1, budgetCustomers.filter(sale => sale.customerType === "individual").length),
      retentionRate: 78.8
    },
    {
      segment: "Fleet Customers",
      count: fleetCustomersData.length,
      percentage: Math.round((fleetCustomersData.length / totalCustomers) * 100),
      averageValue: fleetCustomersData.reduce((sum, sale) => sum + sale.onroadPrice, 0) / Math.max(1, fleetCustomersData.length),
      retentionRate: 94.1
    }
  ];
  
  // Mock customer satisfaction data
  const customerSatisfaction = [
    { category: "Product Quality", score: 4.3, trend: 0.2 },
    { category: "Delivery Experience", score: 4.4, trend: 0.1 },
    { category: "Sales Process", score: 4.2, trend: -0.1 },
    { category: "Service Quality", score: 4.1, trend: 0.3 },
    { category: "After Sales Support", score: 3.9, trend: -0.2 },
    { category: "Value for Money", score: 4.0, trend: 0.1 }
  ];
  
  // Calculate lead sources and conversion rates
  const leadSourcesMap = mockSalesData.reduce((acc, sale) => {
    if (!acc[sale.leadSource]) {
      acc[sale.leadSource] = { leads: 0, conversions: 0 };
    }
    acc[sale.leadSource].conversions++;
    return acc;
  }, {} as Record<string, { leads: number; conversions: number }>);
  
  const leadSources = Object.entries(leadSourcesMap).map(([source, data]) => {
    const conversionRate = source === "Referral" ? 78 : 
                          source === "Dealer Walk-in" ? 72 :
                          source === "Website" ? 65 :
                          source === "Exhibition" ? 58 :
                          source === "Advertisement" ? 52 :
                          source === "Social Media" ? 48 : 60;
    
    const leads = Math.round(data.conversions / (conversionRate / 100));
    const cost = source === "Website" ? leads * 2500 :
                source === "Social Media" ? leads * 1800 :
                source === "Advertisement" ? leads * 4200 :
                source === "Exhibition" ? leads * 3500 :
                source === "Referral" ? leads * 800 :
                leads * 1500;
    
    return {
      source,
      leads,
      conversions: data.conversions,
      conversionRate,
      cost
    };
  });
  
  return {
    totalCustomers,
    individualCustomers,
    fleetCustomers,
    averageCustomerValue,
    customerRetentionRate,
    subscriptionAdoptionRate,
    customerSegments,
    customerSatisfaction,
    leadSources
  };
}

// Additional utility functions for customer analysis
export function getCustomerValueDistribution() {
  const valueRanges = [
    { range: "Below 300K", min: 0, max: 300000 },
    { range: "300K - 400K", min: 300000, max: 400000 },
    { range: "400K - 500K", min: 400000, max: 500000 },
    { range: "Above 500K", min: 500000, max: Infinity }
  ];
  
  return valueRanges.map(range => {
    const customers = mockSalesData.filter(sale => 
      sale.onroadPrice >= range.min && sale.onroadPrice < range.max
    );
    return {
      range: range.range,
      count: customers.length,
      percentage: Math.round((customers.length / mockSalesData.length) * 100),
      totalValue: customers.reduce((sum, sale) => sum + sale.onroadPrice, 0),
      averageValue: customers.length > 0 ? 
        customers.reduce((sum, sale) => sum + sale.onroadPrice, 0) / customers.length : 0
    };
  });
}

export function getCustomerGeographicDistribution() {
  const cityCustomers = cities.map(city => {
    const citySales = mockSalesData.filter(sale => sale.locationCity === city);
    const individualCount = citySales.filter(sale => sale.customerType === "individual").length;
    const fleetCount = citySales.filter(sale => sale.customerType === "fleet").length;
    
    return {
      city,
      totalCustomers: citySales.length,
      individualCustomers: individualCount,
      fleetCustomers: fleetCount,
      averageValue: citySales.length > 0 ? 
        citySales.reduce((sum, sale) => sum + sale.onroadPrice, 0) / citySales.length : 0,
      subscriptionRate: citySales.length > 0 ?
        (citySales.filter(sale => sale.batteryOwnershipModel === "subscription").length / citySales.length) * 100 : 0
    };
  });
  
  return cityCustomers;
}

export function getCustomerLifecycleMetrics() {
  const averageCustomerValue = mockSalesData.reduce((sum, sale) => sum + sale.onroadPrice, 0) / mockSalesData.length;
  
  return {
    prospects: Math.round(mockSalesData.length * 2.5),
    leads: Math.round(mockSalesData.length * 1.8),
    opportunities: Math.round(mockSalesData.length * 1.2),
    customers: mockSalesData.length,
    advocates: Math.round(mockSalesData.length * 0.3),
    averageConversionTime: 18,
    averageCustomerLifetimeValue: averageCustomerValue * 1.5,
    churnRate: 14.5,
    customerAcquisitionCost: 35000,
    netPromoterScore: 72
  };
}