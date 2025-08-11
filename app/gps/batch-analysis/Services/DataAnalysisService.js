export class DataAnalysisService {
  static PROGRESS_STAGES = {
    initializing: { percent: 5, status: "Initializing analysis..." },
    connecting: { percent: 15, status: "Connecting to Snowflake..." },
    counting_records: { percent: 20, status: "Counting records..." },
    fetching_data: { percent: 30, status: "Fetching data in batches..." },
    analyzing: { percent: 85, status: "Analyzing data..." },
    compiling: { percent: 95, status: "Compiling insights..." },
    completed: { percent: 100, status: "Analysis complete!" },
    failed: { percent: 0, status: "Analysis failed" },
    using_fallback: { percent: 15, status: "Using fallback mock data..." },
  };

  constructor() {
    this.listeners = new Set();
    this.analysisHistory = [];
    this.currentAnalysisId = null;
    this.useFallbackData = false;
    this.batchSize = 50; // Number of records to fetch per batch
    this.mockDataSizes = {
      vehicle_usage: 100,
      route_metrics: 80,
      battery_health: 120,
      alert_logs: 150,
    };
  }

  async executeSnowflakeQuery(query) {
    if (this.useFallbackData) {
      return this.getMockDataForQuery(query);
    }

    try {
      const response = await fetch("/api/snowflake/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Snowflake query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Snowflake query error:", error);
      throw error;
    }
  }

  async getMockDataForQuery(query) {
    // Extract table name from query
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : "unknown";

    // Check if this is a count query
    const isCountQuery = query.toLowerCase().includes("count(*)");

    if (isCountQuery) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          rows: [{ COUNT: this.mockDataSizes[tableName] || 100 }],
          count: 1,
        },
      };
    }

    // Handle LIMIT and OFFSET for batch processing
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    const offsetMatch = query.match(/OFFSET\s+(\d+)/i);

    const limit = limitMatch ? parseInt(limitMatch[1]) : this.batchSize;
    const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;

    // Simulate delay for mock data (1 second per batch)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock data for the requested batch
    const batchData = [];
    const totalRecords = this.mockDataSizes[tableName] || 100;
    const end = Math.min(offset + limit, totalRecords);

    for (let i = offset; i < end; i++) {
      batchData.push(this.generateMockRow(tableName, i));
    }

    return {
      data: {
        rows: batchData,
        count: batchData.length,
      },
    };
  }

  generateMockRow(tableName, index) {
    const baseRow = { ID: index + 1 };
    const vehicleId = `VH${1000 + index}`;
    const routeId = `RT${2000 + index}`;
    const alertId = `AL${3000 + index}`;
    const randomDate = (days) =>
      new Date(
        Date.now() - Math.random() * days * 24 * 60 * 60 * 1000
      ).toISOString();

    // Common vehicle IDs to create relationships between tables
    const relatedVehicleId = `VH${1000 + Math.floor(Math.random() * 50)}`;

    switch (tableName) {
      case "vehicle_usage":
        // Create some vehicles with high idle time and some with overutilization
        const isOverused = index % 5 === 0; // 20% overused
        const isIdle = index % 4 === 0; // 25% idle

        return {
          ...baseRow,
          VEHICLE_ID: vehicleId,
          OPERATIONAL_TIME: isOverused
            ? Math.floor(14 + Math.random() * 10) // 14-24h for overused
            : Math.floor(4 + Math.random() * 8), // 4-12h normal
          IDLE_TIME: isIdle
            ? Math.floor(8 + Math.random() * 8) // 8-16h for idle
            : Math.floor(1 + Math.random() * 4), // 1-5h normal
          DATE: randomDate(30),
        };

      case "route_metrics":
        // Create some inefficient routes and some long distance routes
        const isInefficient = index % 6 === 0; // ~16% inefficient
        const isLongDistance = index % 8 === 0; // ~12% long distance

        return {
          ...baseRow,
          ROUTE_ID: routeId,
          VEHICLE_ID: relatedVehicleId,
          DISTANCE: isLongDistance
            ? (200 + Math.random() * 100).toFixed(2) // 200-300km
            : (20 + Math.random() * 80).toFixed(2), // 20-100km
          DURATION: isInefficient
            ? Math.floor(120 + Math.random() * 60) // 2-3h for short routes
            : Math.floor(30 + Math.random() * 90), // 0.5-2h normal
          DATE: randomDate(30),
        };

      case "battery_health":
        // Create some poor batteries and some stale charges
        const isPoorBattery = index % 7 === 0; // ~14% poor
        const isStaleCharge = index % 5 === 0; // 20% stale

        return {
          ...baseRow,
          VEHICLE_ID: vehicleId,
          HEALTH_PERCENTAGE: isPoorBattery
            ? (60 + Math.random() * 20).toFixed(2) // 60-80%
            : (80 + Math.random() * 20).toFixed(2), // 80-100%
          LAST_CHARGE: isStaleCharge
            ? randomDate(7) // Up to 7 days old
            : randomDate(2), // Up to 2 days old
          DATE: randomDate(30),
        };

      case "alert_logs":
        // Create some high severity alerts and some vehicles with multiple medium alerts
        const isHighSeverity = index % 10 === 0; // 10% high
        const isFrequentMedium = index % 15 === 0; // ~6% will trigger frequent alerts
        const severity = isHighSeverity
          ? "high"
          : isFrequentMedium
          ? "medium"
          : ["low", "medium"][Math.floor(Math.random() * 2)];

        return {
          ...baseRow,
          ALERT_ID: alertId,
          VEHICLE_ID: isFrequentMedium ? `VH1005` : relatedVehicleId, // Force multiple for VH1005
          SEVERITY: severity,
          MESSAGE:
            severity === "high"
              ? `Critical system failure detected`
              : severity === "medium"
              ? `Warning: ${
                  ["Engine", "Battery", "Tire", "Brake"][index % 4]
                } issue detected`
              : `Info: Routine maintenance notification`,
          DATE: randomDate(30),
        };

      default:
        return baseRow;
    }
  }
  async analyzeData(config, progressCallback) {
    const analysisId = `analysis-${Date.now()}`;
    this.currentAnalysisId = analysisId;
    this.useFallbackData = false;

    try {
      // Initialize analysis record
      const analysis = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        config,
        status: "in-progress",
        insights: [],
        progress: this.createProgressUpdate("initializing"),
      };

      this.analysisHistory.unshift(analysis);
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      // 1. Connect to Snowflake
      analysis.progress = this.createProgressUpdate("connecting");
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      try {
        await this.executeSnowflakeQuery("SELECT CURRENT_VERSION()");
      } catch (error) {
        console.warn("Snowflake connection failed, using fallback data");
        this.useFallbackData = true;
        analysis.progress = this.createProgressUpdate("using_fallback", {
          warning: "Using mock data as Snowflake connection failed",
        });
        this.notifyListeners();
        progressCallback?.(analysis.progress);
      }

      // 2. Count records in each table
      analysis.progress = this.createProgressUpdate("counting_records");
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      const tables = {};
      const activeTables = Object.keys(config.includedTables).filter(
        (table) => config.includedTables[table]
      );

      // Get record counts for each table
      for (const table of activeTables) {
        const countQuery = `SELECT COUNT(*) as count FROM ${table.toUpperCase()}`;
        const result = await this.executeSnowflakeQuery(countQuery);
        tables[table] = {
          count: result.data?.rows?.[0]?.COUNT || 0,
          rows: [],
          batchesProcessed: 0,
          totalBatches: Math.ceil(
            (result.data?.rows?.[0]?.COUNT || 0) / this.batchSize
          ),
        };
      }

      // 3. Fetch data in batches with progress updates
      analysis.progress = this.createProgressUpdate("fetching_data");
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      // Calculate total batches across all tables for progress calculation
      const totalBatchesAllTables = activeTables.reduce(
        (sum, table) => sum + tables[table].totalBatches,
        0
      );
      let completedBatches = 0;

      for (const table of activeTables) {
        const tableData = tables[table];

        if (tableData.count <= this.batchSize) {
          // Small table - fetch all at once
          const query = `SELECT * FROM ${table.toUpperCase()} LIMIT ${
            this.batchSize
          }`;
          const result = await this.executeSnowflakeQuery(query);
          tableData.rows = result.data?.rows || [];
          tableData.batchesProcessed = 1;
          completedBatches += 1;
        } else {
          // Large table - fetch in batches
          for (let batch = 0; batch < tableData.totalBatches; batch++) {
            const offset = batch * this.batchSize;
            const query = `SELECT * FROM ${table.toUpperCase()} LIMIT ${
              this.batchSize
            } OFFSET ${offset}`;
            const result = await this.executeSnowflakeQuery(query);
            tableData.rows.push(...(result.data?.rows || []));
            tableData.batchesProcessed = batch + 1;
            completedBatches += 1;

            // Update progress based on batches completed
            const fetchProgress =
              30 + (50 * completedBatches) / totalBatchesAllTables;
            analysis.progress = {
              ...analysis.progress,
              percent: Math.min(fetchProgress, 80),
              status: `Fetching ${table} (batch ${batch + 1}/${
                tableData.totalBatches
              })`,
              currentTable: table,
              processedRows: tableData.rows.length,
              totalRows: tableData.count,
              details: `Processed ${completedBatches} of ${totalBatchesAllTables} total batches`,
            };
            this.notifyListeners();
            progressCallback?.(analysis.progress);
          }
        }
      }

      // 4. Analyze data
      analysis.progress = this.createProgressUpdate("analyzing");
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      const insights = await this.generateInsights(tables, config.timeRange);

      // 5. Compile results
      analysis.progress = this.createProgressUpdate("compiling");
      this.notifyListeners();
      progressCallback?.(analysis.progress);

      analysis.insights = insights;
      analysis.status = "completed";
      analysis.progress = this.createProgressUpdate("completed");
      analysis.useFallbackData = this.useFallbackData;

      this.notifyListeners();
      progressCallback?.(analysis.progress);

      return analysis;
    } catch (error) {
      const failedAnalysis = this.analysisHistory.find(
        (a) => a.id === analysisId
      );
      if (failedAnalysis) {
        failedAnalysis.status = "failed";
        failedAnalysis.error = error.message;
        failedAnalysis.progress = this.createProgressUpdate("failed", {
          error: error.message,
        });
        this.notifyListeners();
        progressCallback?.(failedAnalysis.progress);
      }
      throw error;
    } finally {
      this.currentAnalysisId = null;
      this.useFallbackData = false;
    }
  }

  createProgressUpdate(stage, additionalData = {}) {
    const stageInfo = DataAnalysisService.PROGRESS_STAGES[stage] || {};
    return {
      status: stageInfo.status || stage,
      percent: stageInfo.percent || 0,
      currentTable: null,
      processedRows: 0,
      totalRows: 0,
      ...additionalData,
    };
  }

  async generateInsights(tables, timeRange) {
    const insights = [];
    const days = this.getDaysFromRange(timeRange);

    // Vehicle Usage Insights
    if (tables.vehicle_usage) {
      const usageInsights = await this.analyzeVehicleUsage(
        tables.vehicle_usage.rows,
        days
      );
      insights.push(...usageInsights);
    }

    // Route Metrics Insights
    if (tables.route_metrics) {
      const routeInsights = await this.analyzeRouteMetrics(
        tables.route_metrics.rows,
        days
      );
      insights.push(...routeInsights);
    }

    // Battery Health Insights
    if (tables.battery_health) {
      const batteryInsights = await this.analyzeBatteryHealth(
        tables.battery_health.rows,
        days
      );
      insights.push(...batteryInsights);
    }

    // Alert Logs Insights
    if (tables.alert_logs) {
      const alertInsights = await this.analyzeAlertLogs(
        tables.alert_logs.rows,
        days
      );
      insights.push(...alertInsights);
    }

    return insights;
  }

  async analyzeVehicleUsage(data, days) {
    const insights = [];
    if (!data || data.length === 0) return insights;

    // 1. High Idle Time Vehicles (idle > 30% of operational time)
    const idleVehicles = data.filter(
      (v) => v.IDLE_TIME > v.OPERATIONAL_TIME * 0.3
    );

    for (const vehicle of idleVehicles) {
      insights.push({
        type: "efficiency",
        message: `Vehicle ${vehicle.VEHICLE_ID} has high idle time (${vehicle.IDLE_TIME}h vs ${vehicle.OPERATIONAL_TIME}h operational)`,
        severity: "medium",
        recommendation: "Review scheduling to improve utilization",
        vehicleId: vehicle.VEHICLE_ID,
      });
    }

    // 2. Overutilized Vehicles (operational > 12h/day average)
    const overusedVehicles = data.filter(
      (v) => v.OPERATIONAL_TIME > 12 * (days / 30)
    );

    for (const vehicle of overusedVehicles) {
      insights.push({
        type: "maintenance",
        message: `Vehicle ${vehicle.VEHICLE_ID} is overutilized (${vehicle.OPERATIONAL_TIME}h operational time)`,
        severity: "high",
        recommendation: "Schedule maintenance check and reduce workload",
        vehicleId: vehicle.VEHICLE_ID,
      });
    }

    return insights;
  }

  async analyzeRouteMetrics(data, days) {
    const insights = [];
    if (!data || data.length === 0) return insights;

    // 1. Long Duration Routes (>2h for <50km)
    const inefficientRoutes = data.filter(
      (r) => r.DURATION > 120 && r.DISTANCE < 50
    );

    for (const route of inefficientRoutes) {
      insights.push({
        type: "routing",
        message: `Route ${route.ROUTE_ID} is inefficient (${route.DURATION}min for ${route.DISTANCE}km)`,
        severity: "medium",
        recommendation:
          "Review route for traffic patterns or better alternatives",
        vehicleId: route.VEHICLE_ID || "N/A",
      });
    }

    // 2. High Distance Routes (>200km)
    const longRoutes = data.filter((r) => r.DISTANCE > 200);

    for (const route of longRoutes) {
      insights.push({
        type: "planning",
        message: `Route ${route.ROUTE_ID} is unusually long (${route.DISTANCE}km)`,
        severity: "low",
        recommendation:
          "Consider breaking into multiple routes or adding charging stops",
        vehicleId: route.VEHICLE_ID || "N/A",
      });
    }

    return insights;
  }

  async analyzeBatteryHealth(data, days) {
    const insights = [];
    if (!data || data.length === 0) return insights;

    // 1. Poor Battery Health (<80%)
    const poorBatteries = data.filter((b) => b.HEALTH_PERCENTAGE < 80);

    for (const battery of poorBatteries) {
      insights.push({
        type: "battery",
        message: `Vehicle ${battery.VEHICLE_ID} has degraded battery (${battery.HEALTH_PERCENTAGE}% health)`,
        severity: "high",
        recommendation: "Schedule battery diagnostic and possible replacement",
        vehicleId: battery.VEHICLE_ID,
      });
    }

    // 2. Long Time Since Last Charge (>3 days)
    const staleCharges = data.filter((b) => {
      const daysSinceCharge =
        (new Date() - new Date(b.LAST_CHARGE)) / (1000 * 60 * 60 * 24);
      return daysSinceCharge > 3;
    });

    for (const battery of staleCharges) {
      insights.push({
        type: "charging",
        message: `Vehicle ${battery.VEHICLE_ID} hasn't been charged in over 3 days`,
        severity: "medium",
        recommendation: "Verify charging schedule and equipment",
        vehicleId: battery.VEHICLE_ID,
      });
    }

    return insights;
  }

  async analyzeAlertLogs(data, days) {
    const insights = [];
    if (!data || data.length === 0) return insights;

    // 1. High Severity Alerts
    const highAlerts = data.filter((a) => a.SEVERITY === "high");

    for (const alert of highAlerts) {
      insights.push({
        type: "safety",
        message: `High priority alert for ${alert.VEHICLE_ID}: ${alert.MESSAGE}`,
        severity: "high",
        recommendation: "Immediate attention required",
        vehicleId: alert.VEHICLE_ID,
      });
    }

    // 2. Frequent Medium Alerts (more than 3 per vehicle)
    const vehicleAlertCounts = data.reduce((acc, alert) => {
      if (alert.SEVERITY === "medium") {
        acc[alert.VEHICLE_ID] = (acc[alert.VEHICLE_ID] || 0) + 1;
      }
      return acc;
    }, {});

    for (const [vehicleId, count] of Object.entries(vehicleAlertCounts)) {
      if (count > 3) {
        insights.push({
          type: "maintenance",
          message: `Vehicle ${vehicleId} has ${count} medium priority alerts`,
          severity: "medium",
          recommendation: "Schedule diagnostic check for recurring issues",
          vehicleId,
        });
      }
    }

    return insights;
  }

  getDaysFromRange(timeRange) {
    return (
      {
        "1d": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
      }[timeRange] || 7
    );
  }

  notifyListeners() {
    const history = [...this.analysisHistory];
    this.listeners.forEach((listener) => listener(history));
  }

  addListener(listener) {
    this.listeners.add(listener);
    // Immediately notify new listener with current state
    listener([...this.analysisHistory]);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  getAllAnalyses() {
    return [...this.analysisHistory];
  }

  getCurrentAnalysis() {
    return this.analysisHistory.find((a) => a.id === this.currentAnalysisId);
  }
}

export default new DataAnalysisService();
