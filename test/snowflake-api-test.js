import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// ==================== CUSTOM METRICS ====================
const queryDuration = new Trend("snowflake_query_duration_ms");
const queriesExecuted = new Counter("total_queries_executed");
const errorRate = new Rate("query_error_rate");

// ==================== CONFIG ====================
const CONFIG = {
  API_URL: __ENV.API_URL || "http://localhost:3000/api/test-snowflake",
  USERS: parseInt(__ENV.USERS || "5"),
  TOTAL_QUERIES: parseInt(__ENV.TOTAL_QUERIES || "100"),
};

// Queries per virtual user
const queriesPerVU = Math.ceil(CONFIG.TOTAL_QUERIES / CONFIG.USERS);

// ==================== OPTIONS ====================
export let options = {
  vus: CONFIG.USERS,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.05"],
    snowflake_query_duration_ms: ["p(99)<10000"],
  },
};

// ==================== MAIN FUNCTION ====================
export default function () {
  for (let i = 0; i < queriesPerVU; i++) {
    const payload = JSON.stringify({
      sql: "SELECT CURRENT_TIMESTAMP;", // replace with your real query
    });

    const params = {
      headers: { "Content-Type": "application/json" },
    };

    const start = Date.now();
    const res = http.post(CONFIG.API_URL, payload, params);
    const duration = Date.now() - start;

    // Record metrics
    queryDuration.add(duration);
    queriesExecuted.add(1);
    errorRate.add(res.status !== 200);

    // Checks
    check(res, {
      "status is 200": (r) => r.status === 200,
      "returns rows": (r) => {
        try {
          const json = r.json();
          return Array.isArray(json) && json.length > 0;
        } catch {
          return false;
        }
      },
    });

    sleep(1); // 1s between queries
  }
}

// ==================== HTML REPORT ====================
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data), // generates HTML report
    stdout: JSON.stringify(data, null, 2), // also prints JSON summary
  };
}
