// hooks/useTableMetadata.ts
import { useState, useEffect, useCallback } from 'react';

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  comment?: string;
  position: number;
}

interface TableInfo {
  name: string;
  database: string;
  schema: string;
  rows?: number;
  columns?: ColumnInfo[];
  tableType?: string;
  comment?: string;
  created?: Date;
  modified?: Date;
}

interface TableMetadataFilters {
  connectionId?: string;
  database?: string;
  schema?: string;
  tableName?: string;
  includeColumns?: boolean;
  includeSystemTables?: boolean;
  searchQuery?: string;
}

interface TableMetadataResult {
  tables: TableInfo[];
  totalCount: number;
  databases: string[];
  schemas: string[];
}

interface UseTableMetadataReturn {
  data: TableMetadataResult | null;
  loading: boolean;
  error: string | null;
  refetch: (filters?: TableMetadataFilters) => Promise<void>;
  fetchTableDetails: (database: string, schema: string, tableName: string, forceRefresh?: boolean) => Promise<TableInfo | null>;
}

export function useTableMetadata(initialFilters?: TableMetadataFilters): UseTableMetadataReturn {
  const [data, setData] = useState<TableMetadataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async (filters: TableMetadataFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filters.connectionId) params.append('connectionId', filters.connectionId);
      if (filters.database) params.append('database', filters.database);
      if (filters.schema) params.append('schema', filters.schema);
      if (filters.tableName) params.append('tableName', filters.tableName);
      if (filters.includeColumns) params.append('includeColumns', 'true');
      if (filters.includeSystemTables) params.append('includeSystemTables', 'true');
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await fetch(`/api/table-metadata?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch table metadata');
      }

      // Convert date strings back to Date objects
      const processedTables = result.data.tables.map((table: any) => ({
        ...table,
        created: table.created ? new Date(table.created) : undefined,
        modified: table.modified ? new Date(table.modified) : undefined,
      }));

      setData({
        ...result.data,
        tables: processedTables,
      });

    } catch (err: any) {
      console.error('Error fetching table metadata:', err);
      setError(err.message || 'Failed to fetch table metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTableDetails = useCallback(async (
    database: string, 
    schema: string, 
    tableName: string,
    forceRefresh: boolean = false
  ): Promise<TableInfo | null> => {
    try {
      const response = await fetch('/api/table-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          database,
          schema,
          tableName,
          forceRefresh,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch table details');
      }

      const table = result.data.tables[0];
      if (table) {
        return {
          ...table,
          created: table.created ? new Date(table.created) : undefined,
          modified: table.modified ? new Date(table.modified) : undefined,
        };
      }

      return null;

    } catch (err: any) {
      console.error('Error fetching table details:', err);
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initialFilters) {
      fetchMetadata(initialFilters);
    }
  }, [fetchMetadata, initialFilters]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetadata,
    fetchTableDetails,
  };
}

// Specific hook for connection tables
export function useConnectionTables(connectionId?: string) {
  const { data, loading, error, refetch } = useTableMetadata(
    connectionId ? { connectionId, includeColumns: false } : undefined
  );

  const refreshTables = useCallback(() => {
    if (connectionId) {
      refetch({ connectionId, includeColumns: false });
    }
  }, [connectionId, refetch]);

  return {
    tables: data?.tables || [],
    databases: data?.databases || [],
    schemas: data?.schemas || [],
    totalCount: data?.totalCount || 0,
    loading,
    error,
    refreshTables,
  };
}

// Hook for table search with debouncing
export function useTableSearch(searchQuery: string, filters?: Partial<TableMetadataFilters>) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useTableMetadata({
    ...filters,
    searchQuery: debouncedQuery.trim() || undefined,
  });

  const search = useCallback((query: string, newFilters?: Partial<TableMetadataFilters>) => {
    refetch({
      ...filters,
      ...newFilters,
      searchQuery: query.trim() || undefined,
    });
  }, [filters, refetch]);

  return {
    results: data?.tables || [],
    totalCount: data?.totalCount || 0,
    databases: data?.databases || [],
    schemas: data?.schemas || [],
    loading,
    error,
    search,
    isSearching: loading && debouncedQuery.trim().length > 0,
  };
}