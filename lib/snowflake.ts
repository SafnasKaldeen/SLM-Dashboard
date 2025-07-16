import snowflake from 'snowflake-sdk';
import fs from 'fs';

class SnowflakeConnectionManager {
  private static instance: snowflake.Connection | null = null;
  private static isConnecting = false;
  private static isConnected = false;

  // Load PEM string directly
  private static loadPrivateKey(): string {
    const privateKeyPath = './secrets/rsa_key.p8';
    return fs.readFileSync(privateKeyPath, 'utf8'); // ✅ raw PEM string
  }

  public static getConnection(): snowflake.Connection {
    if (!this.instance) {
      console.log('[Snowflake] Initializing new connection instance...');

      const privateKey = this.loadPrivateKey(); // ✅ now it's a string

      this.instance = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        privateKey: privateKey || process.env.SNOWFLAKE_PRIVATE_KEY,
        warehouse: 'SNOWFLAKE_LEARNING_WH',
        database: 'DB_DUMP',
        schema: 'PUBLIC',
        role: 'SYSADMIN',
        authenticator: 'SNOWFLAKE_JWT', // ✅ required for private key auth
      });

      console.log('[Snowflake] Connection object created.');
    } else {
      console.log('[Snowflake] Reusing existing Snowflake connection instance.');
    }

    return this.instance;
  }

  public static async connect(): Promise<void> {
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
    const connection = this.getConnection();

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
}

export default SnowflakeConnectionManager;
