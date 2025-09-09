import { useState, useEffect, useCallback } from 'react';

interface ChargingDataFilters {
  dateRange?: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
  customerId?: string;
  locationName?: string;
  stationName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface ChargingDataPoint {
  CHARGING_DATE: string;
  SESSION_COUNT: number;
  AVG_DURATION?: number;
  TOTAL_ENERGY?: number;
  TOTAL_AMOUNT?: number;
  UNIQUE_CUSTOMERS?: number;
}

interface UseChargingDataReturn {
  data: ChargingDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useChargingData = (filters: ChargingDataFilters = {}): UseChargingDataReturn => {
  const [data, setData] = useState<ChargingDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const { 
      dateRange = '30', 
      aggregation = 'daily',
      customerId,
      locationName,
      stationName,
      paymentMethod,
      paymentStatus = 'COMPLETED'
    } = filters;

    // Determine date format and grouping based on aggregation
    let dateFormat: string;
    let dateGroup: string;
    
    switch (aggregation) {
      case 'weekly':
        dateFormat = "CONCAT(YEAR(FROM_UNIXTIME(PAID_AT)), '-W', LPAD(WEEK(FROM_UNIXTIME(PAID_AT)), 2, '0'))";
        dateGroup = "YEAR(FROM_UNIXTIME(PAID_AT)), WEEK(FROM_UNIXTIME(PAID_AT))";
        break;
      case 'monthly':
        dateFormat = "DATE_FORMAT(FROM_UNIXTIME(PAID_AT), '%Y-%m')";
        dateGroup = "YEAR(FROM_UNIXTIME(PAID_AT)), MONTH(FROM_UNIXTIME(PAID_AT))";
        break;
      case 'daily':
      default:
        dateFormat = "DATE(FROM_UNIXTIME(PAID_AT))";
        dateGroup = "DATE(FROM_UNIXTIME(PAID_AT))";
        break;
    }

    // Build WHERE conditions
    const conditions = [
      `PAYMENT_STATUS = '${paymentStatus}'`,
      `PAYMENT_TYPE = 'CHARGING'`, // Filter for charging payments only
      `PAID_AT >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ${dateRange} DAY))`,
      `PAID_AT IS NOT NULL`,
      `AMOUNT > 0`
    ];

    // Add optional filters
    if (customerId) {
      conditions.push(`CUSTOMER_ID = '${customerId}'`);
    }
    
    if (locationName) {
      conditions.push(`LOCATION_NAME = '${locationName}'`);
    }
    
    if (stationName) {
      conditions.push(`STATION_NAME = '${stationName}'`);
    }
    
    if (paymentMethod) {
      conditions.push(`PAYMENT_METHOD = '${paymentMethod}'`);
    }

    const query = `
      SELECT 
        ${dateFormat} AS CHARGING_DATE,
        COUNT(*) AS SESSION_COUNT,
        ROUND(AVG(CHARGE_PERCENTAGE), 2) AS AVG_DURATION,
        ROUND(SUM(CHARGE_AMOUNT), 2) AS TOTAL_ENERGY,
        ROUND(SUM(AMOUNT), 2) AS TOTAL_AMOUNT,
        COUNT(DISTINCT CUSTOMER_ID) AS UNIQUE_CUSTOMERS
      FROM ADHOC.PAYMENTSFACT_PAYMENT
      WHERE ${conditions.join(' AND ')}
      GROUP BY ${dateGroup}
      ORDER BY CHARGING_DATE ASC
      LIMIT 100
    `;

    return query;
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = buildQuery();
      
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          format: 'json'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Transform the data to match expected format
        const transformedData = result.data.map((row: any) => ({
          CHARGING_DATE: row.CHARGING_DATE || '',
          SESSION_COUNT: parseInt(row.SESSION_COUNT) || 0,
          AVG_DURATION: parseFloat(row.AVG_DURATION) || 0,
          TOTAL_ENERGY: parseFloat(row.TOTAL_ENERGY) || 0,
          TOTAL_AMOUNT: parseFloat(row.TOTAL_AMOUNT) || 0,
          UNIQUE_CUSTOMERS: parseInt(row.UNIQUE_CUSTOMERS) || 0,
        }));

        setData(transformedData);
      } else {
        throw new Error(result.error || 'Failed to fetch charging data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch charging data: ${errorMessage}`);
      console.error('Charging data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};