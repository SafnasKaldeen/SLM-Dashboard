// lib/snowflake_adhoc.ts
import snowflake from 'snowflake-sdk';

interface ConnectionState {
  connection: snowflake.Connection;
  isConnecting: boolean;
  isConnected: boolean;
  lastUsed: number;
  lastQueryTime: number;
}

class SnowflakeConnectionManager {
  private static connections: Map<string, ConnectionState> = new Map();
  private static readonly CONNECTION_TIMEOUT = 10 * 1000; // 10 seconds after last query
  private static readonly CLEANUP_INTERVAL = 30 * 1000; // Clean up every 30 seconds

  // Start cleanup interval
  private static initializeCleanup() {
    if (!(global as any).snowflakeCleanupInitialized) {
      setInterval(() => {
        this.cleanupStaleConnections();
      }, this.CLEANUP_INTERVAL);
      (global as any).snowflakeCleanupInitialized = true;
    }
  }

  /**
   * Get Snowflake username with fallback logic
   */
  private static getSnowflakeUsername(requestedUsername?: string): string {
    // Priority: requested username -> environment default -> fallback
    if (requestedUsername) {
      return this.mapToSnowflakeUsername(requestedUsername);
    }
    
    const envUsername = process.env.SNOWFLAKE_USERNAME;
    if (envUsername) {
      return envUsername;
    }
    
    throw new Error('No Snowflake username provided and SNOWFLAKE_USERNAME environment variable is not set');
  }
  

  /**
   * Map application username to Snowflake username
   */
  private static mapToSnowflakeUsername(appUsername: string): string {
    const usernameMap: Record<string, string> = {
      'safnas': 'HANSIKA',
      'safnas@slmobility.com': 'HANSIKA',
      'oshaniqa': 'OSHANI',
      'oshani@slmobility.com': 'OSHANI',
      'hansika': 'HANSIKA',
      'hansika@slmobility.com': 'HANSIKA',
      // Add other mappings as needed
    };
    
    const mapped = usernameMap[appUsername] || appUsername.split('@')[0].toUpperCase();
    // console.log('🔍 Username mapping:', appUsername, '→', mapped);
    return mapped;
  }

  /**
   * Clean up stale connections (10 seconds after last query)
   */
  private static cleanupStaleConnections(): void {
    const now = Date.now();
    for (const [username, state] of this.connections.entries()) {
      // If connection hasn't been used for 10 seconds since last query, clean it up
      if (now - state.lastQueryTime > this.CONNECTION_TIMEOUT) {
        console.log(`[Snowflake] Cleaning up stale connection for: ${username} (inactive for ${(now - state.lastQueryTime) / 1000}s)`);
        this.disconnect(username).catch(err => {
          console.error(`[Snowflake] Error cleaning up stale connection for ${username}:`, err.message);
        });
      }
    }
  }

  /**
   * Get or create a Snowflake connection with automatic reconnection
   */
  public static async getConnection(requestedUsername?: string): Promise<snowflake.Connection> {
    this.initializeCleanup();
    
    // const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const snowflakeUsername = requestedUsername?.toLocaleLowerCase();
    
    let state = this.connections.get(snowflakeUsername);

    // Check if connection exists but is terminated - if so, remove it
    if (state && this.isConnectionTerminated(state.connection)) {
      console.log(`[Snowflake] Connection terminated for ${snowflakeUsername}, will create new one`);
      this.connections.delete(snowflakeUsername);
      state = undefined;
    }

    if (!state) {
      console.log(`[Snowflake] Initializing new connection for user: ${snowflakeUsername}`);
      if (requestedUsername) {
        console.log(`[Snowflake] Requested by app user: ${requestedUsername}`);
      }

      const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!privateKey) {
        throw new Error('SNOWFLAKE_PRIVATE_KEY environment variable is not set');
      }

      if (!process.env.SNOWFLAKE_ACCOUNT) {
        throw new Error('SNOWFLAKE_ACCOUNT environment variable is not set');
      }

      const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: snowflakeUsername,
        privateKey: privateKey,
        warehouse: 'ADHOC',
        database: 'ADHOC',
        schema: 'PUBLIC',
        role: 'SYSADMIN',
        authenticator: 'SNOWFLAKE_JWT',
      });

      state = {
        connection,
        isConnecting: false,
        isConnected: false,
        lastUsed: Date.now(),
        lastQueryTime: Date.now(),
      };

      this.connections.set(snowflakeUsername, state);
      console.log(`[Snowflake] Connection object created for ${snowflakeUsername}`);
    } else {
      state.lastUsed = Date.now();
      console.log(`[Snowflake] Reusing existing connection for Snowflake user: ${snowflakeUsername}`);
    }

    return state.connection;
  }

  /**
   * Check if a connection is terminated
   */
  private static isConnectionTerminated(connection: snowflake.Connection): boolean {
    try {
      // Try to access connection state - if it throws, connection is terminated
      const state = (connection as any)._state;
      return state === 'TERMINATED' || state === 'DESTROYED' || state === 'DISCONNECTED';
    } catch (error) {
      return true;
    }
  }

  /**
   * Connect to Snowflake with automatic reconnection for terminated connections
   */
  public static async connect(requestedUsername?: string): Promise<void> {
    // const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const snowflakeUsername = requestedUsername?.toLocaleLowerCase();
    let state = this.connections.get(snowflakeUsername);

    // If connection is terminated, remove it and create new one
    if (state && this.isConnectionTerminated(state.connection)) {
      console.log(`[Snowflake] Connection terminated for ${snowflakeUsername}, creating new connection`);
      this.connections.delete(snowflakeUsername);
      state = undefined;
    }

    // Get fresh connection (will create new one if needed)
    const connection = await this.getConnection(requestedUsername);
    state = this.connections.get(snowflakeUsername)!;

    if (state.isConnected) {
      console.log(`[Snowflake] Already connected for user: ${snowflakeUsername}`);
      return;
    }

    if (state.isConnecting) {
      console.log(`[Snowflake] Connection already in progress for user: ${snowflakeUsername}...`);
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 30 seconds'));
        }, 30000);

        const interval = setInterval(() => {
          const currentState = this.connections.get(snowflakeUsername);
          if (currentState?.isConnected) {
            clearInterval(interval);
            clearTimeout(timeout);
            resolve();
          }
          if (!currentState?.isConnecting) {
            clearInterval(interval);
            clearTimeout(timeout);
            reject(new Error('Connection failed while waiting.'));
          }
        }, 100);
      });
      return;
    }

    state.isConnecting = true;

    console.log(`[Snowflake] Connecting for user: ${snowflakeUsername}...`);

    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        state!.isConnecting = false;
        if (err) {
          state!.isConnected = false;
          console.error(`[Snowflake] ❌ Failed to connect for ${snowflakeUsername}:`, err.message);
          
          // Remove failed connection from pool
          this.connections.delete(snowflakeUsername);
          return reject(err);
        }

        state!.isConnected = true;
        state!.lastUsed = Date.now();
        console.log(`[Snowflake] ✅ Connection established for ${snowflakeUsername}`);
        resolve();
      });
    });
  }

  /**
   * Execute a query with automatic connection management
   */
  public static async executeQuery(
    sql: string,
    requestedUsername?: string,
    addAuditComment: boolean = true
  ): Promise<{
    columns: string[];
    rows: any[];
    executionTime: number;
    rowCount: number;
  }> {
    // const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const snowflakeUsername = requestedUsername?.toLocaleLowerCase();

    
    try {
      await this.connect(requestedUsername);
      const connection = await this.getConnection(requestedUsername);
      const state = this.connections.get(snowflakeUsername)!;

      // Add audit comment
      let finalSql = sql;
      if (addAuditComment) {
        const auditUser = requestedUsername || snowflakeUsername;
        finalSql = `-- Executed by: ${auditUser}\n${sql}`;
      }

      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        connection.execute({
          sqlText: finalSql,
          complete: (err: any, stmt: any, rows: any[]) => {
            // Update last query time
            if (state) {
              state.lastQueryTime = Date.now();
              state.lastUsed = Date.now();
            }

            if (err) {
              console.error("[Snowflake] Query execution error:", err.message);
              
              // If connection error, remove from pool
              if (err.code === 405503 || err.message.includes('terminated') || err.message.includes('Cannot connect')) {
                console.log(`[Snowflake] Removing terminated connection: ${snowflakeUsername}`);
                this.connections.delete(snowflakeUsername);
              }
              
              reject(err);
            } else {
              const columns = stmt.getColumns().map((col: any) => col.getName());
              const executionTime = (Date.now() - startTime) / 1000;
              
              console.log(`[Snowflake] Query completed in ${executionTime}s, returned ${rows.length} rows`);
              if (requestedUsername) {
                console.log(`[Snowflake] Executed by app user: ${requestedUsername}`);
              }
              
              resolve({
                columns,
                rows,
                executionTime,
                rowCount: rows.length,
              });
            }
          },
        });
      });
    } catch (error: any) {
      // If connection failed, ensure it's removed from pool
      this.connections.delete(snowflakeUsername);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public static async getConnectionStatus(requestedUsername?: string): Promise<{
    isConnected: boolean;
    isConnecting: boolean;
    username: string;
    snowflakeUser: string;
    appUser?: string;
    lastUsed: number;
    lastQueryTime: number;
    timeSinceLastQuery: number;
  }> {
    // const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
        const snowflakeUsername = requestedUsername?.toLocaleLowerCase();

    const state = this.connections.get(snowflakeUsername);
    const now = Date.now();

    return {
      isConnected: state?.isConnected || false,
      isConnecting: state?.isConnecting || false,
      username: requestedUsername || 'system',
      snowflakeUser: snowflakeUsername,
      appUser: requestedUsername,
      lastUsed: state?.lastUsed || 0,
      lastQueryTime: state?.lastQueryTime || 0,
      timeSinceLastQuery: state ? now - state.lastQueryTime : 0,
    };
  }

  /**
   * Disconnect a specific Snowflake connection
   */
  public static async disconnect(requestedUsername?: string): Promise<void> {
    // const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const snowflakeUsername = requestedUsername;
    // const state = this.connections.get(snowflakeUsername);
    
    if (state?.connection) {
      return new Promise<void>((resolve, reject) => {
        state.connection.destroy((err) => {
          this.connections.delete(snowflakeUsername);
          if (err) {
            console.error(`[Snowflake] Error disconnecting ${snowflakeUsername}:`, err.message);
            reject(err);
          } else {
            console.log(`[Snowflake] Disconnected ${snowflakeUsername}`);
            resolve();
          }
        });
      });
    }
  }

  /**
   * Clean up all connections
   */
  public static async disconnectAll(): Promise<void> {
    console.log(`[Snowflake] Disconnecting all ${this.connections.size} connections...`);
    
    const disconnectPromises = Array.from(this.connections.entries()).map(([username, state]) =>
      new Promise<void>((resolve) => {
        if (state.connection) {
          state.connection.destroy((err) => {
            if (err) {
              console.error(`[Snowflake] Error disconnecting ${username}:`, err.message);
            } else {
              console.log(`[Snowflake] Disconnected ${username}`);
            }
            resolve();
          });
        } else {
          resolve();
        }
      })
    );

    await Promise.allSettled(disconnectPromises);
    this.connections.clear();
    console.log('[Snowflake] All connections closed.');
  }

  /**
   * Get connection pool stats
   */
  public static getPoolStats(): {
    totalConnections: number;
    activeConnections: number;
    connections: Array<{
      snowflakeUser: string;
      isConnected: boolean;
      isConnecting: boolean;
      lastUsed: number;
      lastQueryTime: number;
      timeSinceLastQuery: number;
    }>;
  } {
    const now = Date.now();
    const connections = Array.from(this.connections.entries()).map(([username, state]) => ({
      snowflakeUser: username,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      lastUsed: state.lastUsed,
      lastQueryTime: state.lastQueryTime,
      timeSinceLastQuery: now - state.lastQueryTime,
    }));

    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.isConnected).length,
      connections,
    };
  }
}

export default SnowflakeConnectionManager;