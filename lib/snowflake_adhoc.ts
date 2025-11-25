// lib/snowflake_adhoc.ts
import snowflake from 'snowflake-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ConnectionState {
  connection: snowflake.Connection;
  isConnecting: boolean;
  isConnected: boolean;
  sessionUser?: string; // Track which app user is using this connection
}

class SnowflakeConnectionManager {
  private static connections: Map<string, ConnectionState> = new Map();

  /**
   * Get the Snowflake service account username (the one with the private key)
   * This is always the same regardless of who's logged into the app
   */
  private static getSnowflakeUsername(): string {
    const username = process.env.SNOWFLAKE_USERNAME;
    if (!username) {
      throw new Error('SNOWFLAKE_USERNAME environment variable is not set');
    }
    return username;
  }

  /**
   * Get the current logged-in app user from NextAuth/Cognito session
   * This is for auditing/logging purposes only
   */
  private static async getSessionUser(): Promise<string | null> {
    try {
      const session = await getServerSession(authOptions);
      
      if (session?.user?.email) {
        return session.user.email;
      }

      if (session?.user?.username) {
        return session.user.username;
      }

      return null;
    } catch (error) {
      console.error('[Snowflake] Failed to get session user:', error);
      return null;
    }
  }

  /**
   * Get or create a Snowflake connection
   * Uses a single service account but tracks which app user is making requests
   */
  public static async getConnection(): Promise<snowflake.Connection> {
    const snowflakeUsername = this.getSnowflakeUsername();
    const sessionUser = await this.getSessionUser();
    
    let state = this.connections.get(snowflakeUsername);

    if (!state) {
      console.log(`[Snowflake] Initializing new connection for Snowflake user: ${snowflakeUsername}`);
      if (sessionUser) {
        console.log(`[Snowflake] Request initiated by app user: ${sessionUser}`);
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
        role: 'ACCOUNTADMIN',
        authenticator: 'SNOWFLAKE_JWT',
      });

      state = {
        connection,
        isConnecting: false,
        isConnected: false,
        sessionUser: sessionUser || undefined,
      };

      this.connections.set(snowflakeUsername, state);
      console.log(`[Snowflake] Connection object created for ${snowflakeUsername}`);
    } else {
      console.log(`[Snowflake] Reusing existing connection for Snowflake user: ${snowflakeUsername}`);
      if (sessionUser) {
        console.log(`[Snowflake] Request initiated by app user: ${sessionUser}`);
        state.sessionUser = sessionUser;
      }
    }

    return state.connection;
  }

  /**
   * Connect to Snowflake
   */
  public static async connect(): Promise<void> {
    const snowflakeUsername = this.getSnowflakeUsername();
    const state = this.connections.get(snowflakeUsername);

    if (state?.isConnected) {
      console.log(`[Snowflake] Already connected for user: ${snowflakeUsername}`);
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

    const connection = await this.getConnection();
    const connectionState = this.connections.get(snowflakeUsername)!;
    connectionState.isConnecting = true;

    console.log(`[Snowflake] Connecting for user: ${snowflakeUsername}...`);

    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        connectionState.isConnecting = false;
        if (err) {
          connectionState.isConnected = false;
          console.error(`[Snowflake] ❌ Failed to connect for ${snowflakeUsername}:`, err.message);
          return reject(err);
        }

        connectionState.isConnected = true;
        console.log(`[Snowflake] ✅ Connection established for ${snowflakeUsername}`);
        resolve();
      });
    });
  }

  /**
   * Disconnect the Snowflake connection
   */
  public static async disconnect(): Promise<void> {
    const snowflakeUsername = this.getSnowflakeUsername();
    const state = this.connections.get(snowflakeUsername);
    
    if (state?.connection && state.isConnected) {
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
   * Clean up all connections (useful for graceful shutdown)
   */
  public static async disconnectAll(): Promise<void> {
    console.log(`[Snowflake] Disconnecting all ${this.connections.size} connections...`);
    
    const disconnectPromises = Array.from(this.connections.entries()).map(([username, state]) =>
      new Promise<void>((resolve) => {
        if (state.connection && state.isConnected) {
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
   * Get connection status
   */
  public static async getConnectionStatus(): Promise<{
    isConnected: boolean;
    isConnecting: boolean;
    username: string;
    sessionUser: string | null;
  }> {
    const snowflakeUsername = this.getSnowflakeUsername();
    const sessionUser = await this.getSessionUser();
    const state = this.connections.get(snowflakeUsername);

    return {
      isConnected: state?.isConnected || false,
      isConnecting: state?.isConnecting || false,
      username: snowflakeUsername,
      sessionUser,
    };
  }

  /**
   * Execute a query with automatic session tracking
   * Optionally adds query comments for auditing
   */
  public static async executeQuery(
    sql: string,
    addAuditComment: boolean = true
  ): Promise<{
    columns: string[];
    rows: any[];
    executionTime: number;
    rowCount: number;
  }> {
    await this.connect();
    const connection = await this.getConnection();
    const sessionUser = await this.getSessionUser();

    // Optionally prepend a comment for query auditing in Snowflake
    let finalSql = sql;
    if (addAuditComment && sessionUser) {
      finalSql = `-- Executed by: ${sessionUser}\n${sql}`;
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      connection.execute({
        sqlText: finalSql,
        complete: (err: any, stmt: any, rows: any[]) => {
          if (err) {
            console.error("[Snowflake] Query execution error:", err.message);
            reject(err);
          } else {
            const columns = stmt.getColumns().map((col: any) => col.getName());
            const executionTime = (Date.now() - startTime) / 1000;
            
            console.log(`[Snowflake] Query completed in ${executionTime}s, returned ${rows.length} rows`);
            if (sessionUser) {
              console.log(`[Snowflake] Executed by app user: ${sessionUser}`);
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
  }
}

export default SnowflakeConnectionManager;