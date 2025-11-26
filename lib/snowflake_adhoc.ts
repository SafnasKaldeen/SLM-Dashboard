// lib/snowflake_adhoc.ts
import snowflake from 'snowflake-sdk';

interface ConnectionState {
  connection: snowflake.Connection;
  isConnecting: boolean;
  isConnected: boolean;
  lastUsed: number;
}

class SnowflakeConnectionManager {
  private static connections: Map<string, ConnectionState> = new Map();
  private static connectionTimeout = 300000; // 5 minutes
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second

  /**
   * Get Snowflake username with fallback logic
   */
  private static getSnowflakeUsername(requestedUsername?: string): string {
    // For now, we'll use a single service account for all users
    // but track which app user made the request for auditing
    const serviceAccount = process.env.SNOWFLAKE_USERNAME;
    
    if (!serviceAccount) {
      throw new Error('SNOWFLAKE_USERNAME environment variable is not set');
    }

    console.log(`[Snowflake] Using service account: ${serviceAccount}, Requested by: ${requestedUsername || 'system'}`);
    return serviceAccount;
  }

  /**
   * Check if connection is valid and not terminated
   */
  private static isConnectionValid(connection: snowflake.Connection): boolean {
    try {
      // Try to check connection state - if it throws, connection is dead
      return connection.isUp();
    } catch (error) {
      console.log('[Snowflake] Connection check failed, connection is terminated');
      return false;
    }
  }

  /**
   * Clean up terminated connections
   */
  private static cleanupTerminatedConnections(): void {
    const now = Date.now();
    for (const [username, state] of this.connections.entries()) {
      // Remove connections that are terminated or too old
      if (!this.isConnectionValid(state.connection) || 
          (now - state.lastUsed) > this.connectionTimeout) {
        console.log(`[Snowflake] Cleaning up old/terminated connection for: ${username}`);
        try {
          state.connection.destroy((err) => {
            if (err) {
              console.warn(`[Snowflake] Error destroying connection for ${username}:`, err.message);
            }
          });
        } catch (error) {
          console.warn(`[Snowflake] Error during connection cleanup for ${username}:`, error);
        }
        this.connections.delete(username);
      }
    }
  }

  /**
   * Get or create a Snowflake connection
   */
  public static async getConnection(requestedUsername?: string): Promise<snowflake.Connection> {
    this.cleanupTerminatedConnections();
    
    const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    
    let state = this.connections.get(snowflakeUsername);

    // Check if existing connection is still valid
    if (state && state.isConnected) {
      if (this.isConnectionValid(state.connection)) {
        state.lastUsed = Date.now();
        console.log(`[Snowflake] Reusing existing valid connection for: ${snowflakeUsername}`);
        return state.connection;
      } else {
        console.log(`[Snowflake] Existing connection is terminated, creating new one for: ${snowflakeUsername}`);
        this.connections.delete(snowflakeUsername);
        state = undefined;
      }
    }

    // Create new connection
    console.log(`[Snowflake] Initializing new connection for: ${snowflakeUsername}`);
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
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'ADHOC',
      database: process.env.SNOWFLAKE_DATABASE || 'ADHOC',
      schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
      role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
      authenticator: 'SNOWFLAKE_JWT',
      clientSessionKeepAlive: true, // Keep connection alive
    });

    state = {
      connection,
      isConnecting: false,
      isConnected: false,
      lastUsed: Date.now(),
    };

    this.connections.set(snowflakeUsername, state);
    console.log(`[Snowflake] Connection object created for ${snowflakeUsername}`);

    return connection;
  }

  /**
   * Connect to Snowflake with retry logic
   */
  public static async connect(requestedUsername?: string): Promise<void> {
    const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const state = this.connections.get(snowflakeUsername);

        if (state?.isConnected && this.isConnectionValid(state.connection)) {
          console.log(`[Snowflake] Already connected for user: ${snowflakeUsername}`);
          state.lastUsed = Date.now();
          return;
        }

        if (state?.isConnecting) {
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

        const connection = await this.getConnection(requestedUsername);
        const connectionState = this.connections.get(snowflakeUsername)!;
        connectionState.isConnecting = true;

        console.log(`[Snowflake] Connecting for user: ${snowflakeUsername} (attempt ${attempt})...`);

        await new Promise<void>((resolve, reject) => {
          connection.connect((err) => {
            connectionState.isConnecting = false;
            if (err) {
              connectionState.isConnected = false;
              console.error(`[Snowflake] ❌ Failed to connect for ${snowflakeUsername} (attempt ${attempt}):`, err.message);
              
              // Clean up failed connection
              this.connections.delete(snowflakeUsername);
              return reject(err);
            }

            connectionState.isConnected = true;
            connectionState.lastUsed = Date.now();
            console.log(`[Snowflake] ✅ Connection established for ${snowflakeUsername}`);
            resolve();
          });
        });

        return; // Success, exit retry loop

      } catch (error: any) {
        console.error(`[Snowflake] Connection attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to connect after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  /**
   * Execute a query with retry logic for connection issues
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
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.connect(requestedUsername);
        const connection = await this.getConnection(requestedUsername);
        const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);

        // Add audit comment
        let finalSql = sql;
        if (addAuditComment) {
          const auditUser = requestedUsername || snowflakeUsername;
          finalSql = `-- Executed by: ${auditUser}\n${sql}`;
        }

        return await new Promise((resolve, reject) => {
          const startTime = Date.now();

          connection.execute({
            sqlText: finalSql,
            complete: (err: any, stmt: any, rows: any[]) => {
              if (err) {
                console.error("[Snowflake] Query execution error:", err.message);
                
                // If it's a connection error, we should retry
                if (err.code === 405503 || err.message.includes('terminated') || err.message.includes('connection')) {
                  console.log('[Snowflake] Connection error detected, will retry');
                  // Clean up the broken connection
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
                
                // Update last used timestamp
                const state = this.connections.get(snowflakeUsername);
                if (state) {
                  state.lastUsed = Date.now();
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
        console.error(`[Snowflake] Query execution attempt ${attempt} failed:`, error.message);
        
        // Check if this is a connection error that we should retry
        if (error.code === 405503 || error.message.includes('terminated') || error.message.includes('connection')) {
          if (attempt === this.maxRetries) {
            throw new Error(`Query failed after ${this.maxRetries} attempts due to connection issues: ${error.message}`);
          }
          
          console.log(`[Snowflake] Retrying query (attempt ${attempt + 1}/${this.maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          continue;
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
    
    throw new Error('Unexpected error in executeQuery');
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
  }> {
    const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const state = this.connections.get(snowflakeUsername);

    const isConnected = state?.isConnected && this.isConnectionValid(state.connection);

    return {
      isConnected: isConnected || false,
      isConnecting: state?.isConnecting || false,
      username: requestedUsername || 'system',
      snowflakeUser: snowflakeUsername,
      appUser: requestedUsername,
    };
  }

  /**
   * Disconnect a specific Snowflake connection
   */
  public static async disconnect(requestedUsername?: string): Promise<void> {
    const snowflakeUsername = this.getSnowflakeUsername(requestedUsername);
    const state = this.connections.get(snowflakeUsername);
    
    if (state?.connection) {
      return new Promise<void>((resolve, reject) => {
        state.connection.destroy((err) => {
          if (err) {
            console.error(`[Snowflake] Error disconnecting ${snowflakeUsername}:`, err.message);
            reject(err);
          } else {
            console.log(`[Snowflake] Disconnected ${snowflakeUsername}`);
            this.connections.delete(snowflakeUsername);
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
}

export default SnowflakeConnectionManager;