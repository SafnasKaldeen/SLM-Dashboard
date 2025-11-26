import snowflake, { Connection, Statement } from 'snowflake-sdk';

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  rowCount: number;
}

/**
 * SnowflakeConnectionManager - Singleton with username mapping support
 */
class SnowflakeConnectionManager {
  private static instance: snowflake.Connection | null = null;
  private static isConnecting = false;
  private static isConnected = false;

  /**
   * Map app username to Snowflake username
   */
  private static mapToSnowflakeUsername(appUsername?: string): string {
    console.log('🔍 Mapping app username to Snowflake username for:', appUsername);
    const usernameMap: Record<string, string> = {
      'safnas': 'SAFNAS',
      'safnas@slmobility.com': 'SAFNAS',
      'hansika': 'HANSIKA',
      'hansika@slmobility.com': 'HANSIKA',
      'oshaniqa': 'OSHANI',
      'oshani@slmobility.com': 'OSHANI',
      // Add other user mappings as needed
    };

    if (appUsername) {
      const mapped = usernameMap[appUsername] || process.env.SNOWFLAKE_USERNAME;
      // console.log('🔍 Username mapping:', appUsername, '→', mapped);
      return mapped || process.env.SNOWFLAKE_USERNAME!;
    }

    return process.env.SNOWFLAKE_USERNAME!;
  }

  /**
   * Create connection with dynamic username
   */
  private static createConnection(username?: string): Connection {
    // const snowflakeUsername = this.mapToSnowflakeUsername(username?.toLocaleLowerCase());
    const snowflakeUsername = username?.toLocaleLowerCase();
    const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey) throw new Error('SNOWFLAKE_PRIVATE_KEY not set');
    if (!process.env.SNOWFLAKE_ACCOUNT) throw new Error('SNOWFLAKE_ACCOUNT not set');
    if (!snowflakeUsername) throw new Error('SNOWFLAKE_USERNAME not set');

    console.log('🔍 Creating Snowflake connection for user:', snowflakeUsername);

    return snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: snowflakeUsername,
      privateKey: privateKey,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'AIDASHBOARD',
      database: 'DB_DUMP',
      schema: 'PUBLIC',
      role: 'SYSADMIN',
      authenticator: 'SNOWFLAKE_JWT',
    });
  }

  public static getConnection(username?: string): snowflake.Connection {
    if (!this.instance) {
      console.log('[Snowflake] Initializing new connection instance...');
      this.instance = this.createConnection(username);
      console.log('[Snowflake] Connection object created.');
    } else {
      console.log('[Snowflake] Reusing existing Snowflake connection instance.');
    }

    return this.instance;
  }

  public static async connect(username?: string): Promise<void> {
    if (this.isConnected) {
      console.log('[Snowflake] Already connected.');
      return;
    }

    if (this.isConnecting) {
      console.log('[Snowflake] Connection already in progress...');
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.isConnected) {
            clearInterval(interval);
            resolve();
          }
          if (!this.isConnecting) {
            clearInterval(interval);
            reject(new Error('Connection failed while waiting.'));
          }
        }, 100);
      });
      return;
    }

    this.isConnecting = true;
    const connection = this.getConnection(username);

    console.log('[Snowflake] Connecting...');

    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        this.isConnecting = false;
        if (err) {
          this.isConnected = false;
          console.error('[Snowflake] ❌ Failed to connect:', err.message);
          return reject(err);
        }

        this.isConnected = true;
        console.log('[Snowflake] ✅ Connection established.');
        resolve();
      });
    });
  }

  /**
   * Execute a SQL query with username context
   */
  public static async executeQuery(
    sql: string,
    requestedUsername?: string,
    addAuditComment: boolean = true
  ): Promise<QueryResult> {
    const finalSql = addAuditComment ? `-- Executed by app user: ${requestedUsername}\n${sql}` : sql;
    
    await this.connect(requestedUsername);
    const connection = this.getConnection();

    return new Promise<QueryResult>((resolve, reject) => {
      const startTime = Date.now();

      console.log('🔍 Executing Snowflake query for user:', requestedUsername);
      connection.execute({
        sqlText: finalSql,
        complete: (execErr: any, stmt: Statement, rows: any[]) => {
          if (execErr) {
            console.error('❌ Query execution failed:', execErr);
            return reject(execErr);
          }

          const columns = stmt.getColumns()?.map((col) => col.getName()) || [];
          const executionTime = (Date.now() - startTime) / 1000;

          console.log(`✅ Query completed: ${rows.length} rows in ${executionTime}s`);
          
          resolve({
            columns,
            rows: rows || [],
            executionTime,
            rowCount: rows?.length || 0,
          });
        },
      });
    });
  }
}

export default SnowflakeConnectionManager;