// lib/snowflake.ts
import snowflake from 'snowflake-sdk';

class SnowflakeConnectionManager {
  private static instance: snowflake.Connection | null = null;
  private static isConnecting = false;
  private static isConnected = false;

  public static getConnection(): snowflake.Connection {
    if (!this.instance) {
      this.instance = snowflake.createConnection({
    account: "BQSPVDD-GP91871",
    username: "HANSIKA",
    password: "Hansitharu@331",
    role: "SYSADMIN",
    warehouse: "SNOWFLAKE_LEARNING_WH",
    database: "DB_DUMP",
    schema: "PUBLIC",
  });
    }
    console.log('Using eisting Snowflake connection instance');
    return this.instance;
  }

  public static async connect(): Promise<void> {
    if (this.isConnected) return;       // already connected
    if (this.isConnecting) {
      // wait for ongoing connection attempt
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.isConnected) {
            clearInterval(interval);
            resolve();
          }
          if (!this.isConnecting) {
            clearInterval(interval);
            reject(new Error('Connection failed'));
          }
        }, 100);
      });
      return;
    }

    this.isConnecting = true;
    const connection = this.getConnection();

    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        this.isConnecting = false;
        if (err) {
          this.isConnected = false;
          return reject(err);
        }
        this.isConnected = true;
        resolve();
      });
    });
  }
}

export default SnowflakeConnectionManager;
