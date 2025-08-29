// services/tableMetadataService.ts
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

interface TableMetadataResponse {
  success: boolean;
  data?: {
    tables: TableInfo[];
    totalCount: number;
    databases: string[];
    schemas: string[];
  };
  error?: string;
}

class TableMetadataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Fetch table metadata with filters
   */
  async getTableMetadata(filters: TableMetadataFilters = {}): Promise<TableMetadataResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.connectionId) params.append('connectionId', filters.connectionId);
      if (filters.database) params.append('database', filters.database);
      if (filters.schema) params.append('schema', filters.schema);
      if (filters.tableName) params.append('tableName', filters.tableName);
      if (filters.includeColumns) params.append('includeColumns', 'true');
      if (filters.includeSystemTables) params.append('includeSystemTables', 'true');
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await fetch(`${this.baseUrl}/api/table-metadata?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch table metadata');
      }

      // Process dates
      const processedTables = result.data.tables.map((table: any) => ({
        ...table,
        created: table.created ? new Date(table.created) : undefined,
        modified: table.modified ? new Date(table.modified) : undefined,
      }));

      return {
        success: true,
        data: {
          ...result.data,
          tables: processedTables,
        },
      };

    } catch (error: any) {
      console.error('Error fetching table metadata:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch table metadata',
      };
    }
  }

  /**
   * Get detailed information for a specific table including fresh column data
   */
  async getTableDetails(
    database: string, 
    schema: string, 
    tableName: string,
    forceRefresh: boolean = false
  ): Promise<TableInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/table-metadata`, {
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

    } catch (error: any) {
      console.error('Error fetching table details:', error);
      return null;
    }
  }

  /**
   * Get all tables for a specific connection
   */
  async getConnectionTables(connectionId: string, includeColumns: boolean = false): Promise<TableInfo[]> {
    const result = await this.getTableMetadata({
      connectionId,
      includeColumns,
    });

    return result.success ? result.data?.tables || [] : [];
  }

  /**
   * Search tables across databases/schemas
   */
  async searchTables(
    searchQuery: string,
    filters?: Partial<TableMetadataFilters>
  ): Promise<TableInfo[]> {
    const result = await this.getTableMetadata({
      ...filters,
      searchQuery,
    });

    return result.success ? result.data?.tables || [] : [];
  }

  /**
   * Get unique databases
   */
  async getDatabases(connectionId?: string): Promise<string[]> {
    const result = await this.getTableMetadata({
      connectionId,
      includeColumns: false,
    });

    return result.success ? result.data?.databases || [] : [];
  }

  /**
   * Get schemas for a specific database
   */
  async getSchemas(database: string, connectionId?: string): Promise<string[]> {
    const result = await this.getTableMetadata({
      connectionId,
      database,
      includeColumns: false,
    });

    if (result.success && result.data?.schemas) {
      return result.data.schemas
        .filter(schema => schema.startsWith(`${database}.`))
        .map(schema => schema.replace(`${database}.`, ''));
    }

    return [];
  }

  /**
   * Get tables for a specific database and schema
   */
  async getTables(
    database: string, 
    schema: string, 
    connectionId?: string,
    includeColumns: boolean = false
  ): Promise<TableInfo[]> {
    const result = await this.getTableMetadata({
      connectionId,
      database,
      schema,
      includeColumns,
    });

    return result.success ? result.data?.tables || [] : [];
  }

  /**
   * Get table statistics
   */
  async getTableStats(connectionId?: string): Promise<{
    totalTables: number;
    totalDatabases: number;
    totalSchemas: number;
    totalRows: number;
    tablesByType: Record<string, number>;
  }> {
    const result = await this.getTableMetadata({
      connectionId,
      includeColumns: false,
    });

    if (!result.success || !result.data) {
      return {
        totalTables: 0,
        totalDatabases: 0,
        totalSchemas: 0,
        totalRows: 0,
        tablesByType: {},
      };
    }

    const { tables, databases, schemas } = result.data;

    // Calculate table types
    const tablesByType = tables.reduce((acc, table) => {
      const type = table.tableType || 'TABLE';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total rows
    const totalRows = tables.reduce((sum, table) => sum + (table.rows || 0), 0);

    return {
      totalTables: tables.length,
      totalDatabases: databases.length,
      totalSchemas: schemas.length,
      totalRows,
      tablesByType,
    };
  }

  /**
   * Get column information for multiple tables (batch operation)
   */
  async getColumnsForTables(
    tableReferences: Array<{ database: string; schema: string; tableName: string }>
  ): Promise<Map<string, ColumnInfo[]>> {
    const results = new Map<string, ColumnInfo[]>();

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < tableReferences.length; i += batchSize) {
      const batch = tableReferences.slice(i, i + batchSize);
      
      const promises = batch.map(async ({ database, schema, tableName }) => {
        const tableKey = `${database}.${schema}.${tableName}`;
        const tableDetails = await this.getTableDetails(database, schema, tableName, true);
        
        if (tableDetails && tableDetails.columns) {
          results.set(tableKey, tableDetails.columns);
        }
        
        return { tableKey, columns: tableDetails?.columns || [] };
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Refresh table metadata cache
   */
  async refreshTableCache(connectionId?: string): Promise<boolean> {
    try {
      // This could trigger a cache refresh endpoint if you implement one
      const result = await this.getTableMetadata({
        connectionId,
        includeColumns: false,
      });

      return result.success;
    } catch (error) {
      console.error('Error refreshing table cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tableMetadataService = new TableMetadataService();

// Export types for use in components
export type {
  TableInfo,
  ColumnInfo,
  TableMetadataFilters,
  TableMetadataResponse,
};