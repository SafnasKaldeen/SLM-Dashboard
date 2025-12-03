type ColumnType = "integer" | "float" | "string" | "date";

interface ColumnMeta {
  type: ColumnType;
  synonyms: string[];
}

interface TableDefinition {
  name: string;
  description: string;
  columns: string[];
}

interface TableMeta {
  description: string;
  columns: Record<string, ColumnMeta>;
  synonyms: string[];
}

interface Relationship {
  left_table: string;
  left_column: string;
  right_table: string;
  right_column: string;
  type: "many-to-one" | "one-to-many" | "one-to-one";
}

interface JoinInfo {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

interface Measure {
  expression: string;
  description: string;
  requiredJoins: JoinInfo[];
  baseTable?: string;
}

interface DefaultFilter {
  operator: string;
  value: string;
}

interface AccessControl {
  read: string[];
  write?: string[];
  columnConstraints?: Record<string, string[]>;
}

interface Catalog {
  tables: Record<string, TableMeta>;
  relationships: Relationship[];
  measures: Record<string, Measure>;
  default_filters: Record<string, Record<string, DefaultFilter>>;
  accessControl: Record<string, AccessControl>;
}

export class SemanticBuilderUtils {
  static getOrganizationCatalog(): Catalog {
    const inferType = (columnName: string): ColumnType => {
      const lower = columnName.toLowerCase();
      if (lower.includes("id")) return "integer";
      if (lower.includes("date") || lower.includes("time") || lower.includes("at")) return "date";
      if (
        lower.includes("amount") ||
        lower.includes("cost") ||
        lower.includes("price") ||
        lower.includes("revenue") ||
        lower.includes("bill") ||
        lower.includes("commission") ||
        lower.includes("refund") ||
        lower.includes("expense") ||
        lower.includes("profit") ||
        lower.includes("volt") ||
        lower.includes("current") ||
        lower.includes("temp") ||
        lower.includes("rpm") ||
        lower.includes("percent") ||
        lower.includes("rate") ||
        lower.includes("latitude") ||
        lower.includes("longitude")
      )
        return "float";
      if (
        lower.includes("active") ||
        lower.includes("deleted") ||
        lower.includes("status") ||
        lower.includes("method") ||
        lower.includes("type") ||
        lower.includes("flag") ||
        lower.includes("error") ||
        lower.includes("enable") ||
        lower.includes("lock")
      )
        return "string";
      if (
        lower.includes("count") ||
        lower.includes("qty") ||
        lower.includes("quantity") ||
        lower.includes("sequence") ||
        lower.includes("cycle") ||
        lower.includes("swaps") ||
        lower.includes("units")
      )
        return "integer";
      if (
        lower.includes("email") ||
        lower.includes("name") ||
        lower.includes("mobile") ||
        lower.includes("phone") ||
        lower.includes("address") ||
        lower.includes("serial") ||
        lower.includes("nic") ||
        lower.includes("code") ||
        lower.includes("number") ||
        lower.includes("imei")
      )
        return "string";
      return "string";
    };

    const columnSynonymMap: Record<string, string[]> = {
      id: ["identifier", "number", "ref", "code"],
      name: ["label", "title"],
      email: ["email address", "e-mail"],
      phone: ["contact", "mobile number", "telephone"],
      mobile: ["phone", "contact number"],
      date: ["time", "timestamp", "datetime"],
      location: ["place", "site", "position"],
      station: ["swap station", "BSS", "battery station"],
      battery: ["bat", "power unit"],
      vehicle: ["bike", "scooter", "ev"],
      customer: ["client", "user"],
      amount: ["value", "total", "charge", "fee"],
      revenue: ["income", "earnings", "sales"],
      expense: ["cost", "expenditure", "outgoing"],
      swap: ["exchange", "replacement", "change"],
      rating: ["score", "grade"],
      status: ["state", "condition"],
      quantity: ["units", "count", "qty"],
      active: ["enabled", "operational"],
      deleted: ["removed", "inactive"],
      serial: ["serial number", "s/n"],
      voltage: ["volt", "v"],
      temperature: ["temp", "heat"],
      percentage: ["percent", "%"],
      efficiency: ["performance", "utilization"]
    };

    const tableSynonymMap: Record<string, string[]> = {
      customer: ["clients", "users", "riders"],
      vehicle: ["bikes", "scooters", "evs", "electric vehicles"],
      battery: ["batteries", "power units"],
      swapping_station: ["stations", "swap stations", "BSS", "battery stations"],
      location: ["sites", "places", "areas"],
      package: ["plans", "subscriptions", "service packages"],
      payment: ["transactions", "billing"],
      dealer: ["partners", "distributors"],
      tboxes: ["telemetry units", "tracking devices"],
      vendor: ["suppliers", "manufacturers"],
      revenue_summary: ["sales data", "financial summary"],
      expense_summary: ["cost data", "expenditure summary"],
      swap_summary: ["swap data", "exchange records"],
      maintenance_log: ["service records", "repair logs"]
    };

    const generateSynonyms = (columnName: string): string[] => {
      const lower = columnName.toLowerCase();
      const synonyms = new Set<string>();

      for (const key in columnSynonymMap) {
        if (lower.includes(key)) {
          columnSynonymMap[key].forEach((syn) => synonyms.add(syn));
        }
      }
      if (columnName.includes("_")) {
        synonyms.add(columnName.replace(/_/g, " "));
      }

      return Array.from(synonyms);
    };

    const tableDefinitions: TableDefinition[] = [
      {
        name: "customer",
        description: "Customer profiles with contact information, demographics, and account details",
        columns: [
          "customer_id",
          "mobile",
          "nic",
          "surname",
          "other_names",
          "email",
          "address",
          "alt_phone",
          "city_id",
          "active",
          "deleted",
          "created_at",
          "updated_at",
          "customer_type"
        ],
      },
      {
        name: "vehicle",
        description: "Electric vehicle master data including registration, model, and specifications",
        columns: [
          "vehicle_id",
          "vendor_id",
          "vehicle_type_id",
          "vehicle_model_id",
          "vehicle_model_color_id",
          "batch_no",
          "chassis_number",
          "license_plate",
          "motor_number",
          "tbox_id",
          "battery_type_id",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "battery",
        description: "Battery inventory with specifications, location tracking, and operational attributes",
        columns: [
          "battery_id",
          "vendor_id",
          "serial_no",
          "bms_id",
          "location",
          "location_ref",
          "material",
          "charge_cycle",
          "battery_type_id",
          "manufacture_date",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "swapping_station",
        description: "Battery swapping station information, location, and operational details",
        columns: [
          "station_id",
          "vendor_id",
          "station_model",
          "serial_no",
          "name",
          "location_id",
          "rating_group_id",
          "maintenance_mode",
          "active",
          "deleted",
          "created_at",
          "updated_at",
          "bss_planted_date"
        ],
      },
      {
        name: "location",
        description: "Master data about locations including coordinates, region, and operational details",
        columns: [
          "location_id",
          "city_id",
          "location_code",
          "latitude",
          "longitude",
          "name",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "swap_summary",
        description: "Aggregated battery swap summaries including counts, duration, and performance metrics",
        columns: [
          "date",
          "locationname",
          "stationname",
          "total_swaps",
          "total_revenue",
          "avg_swap_time",
          "total_refund",
          "efficiency"
        ],
      },
      {
        name: "my_revenuesummary",
        description: "Aggregated revenue summary data for financial reporting and KPI tracking",
        columns: [
          "date",
          "locationname",
          "stationname",
          "paymentmethod",
          "total_swaps",
          "gross_revenue",
          "directpay_commission",
          "total_revenue",
          "total_refund"
        ],
      },
      {
        name: "my_expensessummary",
        description: "Aggregated expense summary data for analysis and reporting",
        columns: [
          "date",
          "location",
          "stationname",
          "electricity_consumed_in_units",
          "electricity_bill",
          "station_rent",
          "maintanance_cost"
        ],
      },
      {
        name: "fact_payment",
        description: "Detailed payment transactions including amount, method, and timestamps",
        columns: [
          "payment_id",
          "payment_method_id",
          "approved_swap_id",
          "wallet_id",
          "payment_method",
          "payment_status",
          "amount",
          "currency",
          "location_name",
          "station_name",
          "paid_at",
          "created_at",
          "amount_paid",
          "charge_amount",
          "refund_amount"
        ],
      },
      {
        name: "customer_wallet",
        description: "Wallet or account balance information for customers including available funds",
        columns: [
          "wallet_id",
          "wallet_code",
          "wallet_active_status",
          "customer_id",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "package",
        description: "Service packages offered to customers with swap limits and pricing",
        columns: [
          "package_id",
          "package_name",
          "total_swap_count",
          "min_battery_percent",
          "per_day_swap_count",
          "flat_rate_above_min",
          "expiry_duration_day_count",
          "price",
          "active",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "package_vehicle_detail",
        description: "Detailed vehicle information associated with service packages",
        columns: [
          "package_bike_detail_id",
          "vehicle_id",
          "customer_id",
          "package_id",
          "package_status",
          "expire_date",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "dealer",
        description: "Dealer information including contact details, authorization status, and operational regions",
        columns: [
          "dealer_id",
          "dealer_shop_name",
          "dealer_code",
          "dealer_br_number",
          "dealer_address",
          "dealer_mobile_number",
          "dealer_email",
          "station_id",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "tboxes",
        description: "TBOX hardware or telemetry unit master data for vehicle tracking",
        columns: [
          "tbox_id",
          "tbox_serial_no",
          "tbox_imei_no",
          "internal_no",
          "sim_mobile_no",
          "sim_imei_no",
          "created_at"
        ],
      },
      {
        name: "fact_vehicle_telemetry",
        description: "Telemetry facts from vehicles including sensor and performance data",
        columns: [
          "telemetry_id",
          "bms_tbox_connection",
          "tbox_id",
          "gear_information",
          "bms_id",
          "time_stamp",
          "side_stand_info",
          "battery_error",
          "brake_status",
          "inverter_error",
          "bat_temp",
          "bat_volt",
          "bat_cycle_count",
          "bat_soh",
          "bat_percent",
          "throttle_percent",
          "bat_current",
          "motor_rpm",
          "motor_temp",
          "inverter_temp",
          "state"
        ],
      },
      {
        name: "city",
        description: "City-level master data including name, code, and administrative information",
        columns: [
          "city_id",
          "area_id",
          "postal_code",
          "latitude",
          "longitude",
          "name",
          "active",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "area",
        description: "Geographic areas or zones for operational or reporting purposes",
        columns: [
          "area_id",
          "state_id",
          "name",
          "active",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "state",
        description: "Master data for states or provinces including name and code",
        columns: [
          "state_id",
          "country_id",
          "name",
          "active",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "battery_type",
        description: "Different battery types, capacities, and specifications",
        columns: [
          "battery_type_id",
          "name",
          "capacity",
          "bgcolor",
          "textcolor",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "vehicle_model",
        description: "Vehicle model information including make, specifications, and release details",
        columns: [
          "model_id",
          "vehicle_type_id",
          "brand",
          "name",
          "charging_type",
          "efficiency",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      },
      {
        name: "vendor",
        description: "Vendor information including contact details and products supplied",
        columns: [
          "vendor_id",
          "name",
          "country",
          "primary_contact_name",
          "primary_contact_phone",
          "primary_contact_email",
          "charging_station",
          "swapping_station",
          "battery",
          "active",
          "deleted",
          "created_at",
          "updated_at"
        ],
      }
    ];

    const tables: Record<string, TableMeta> = {};

    tableDefinitions.forEach((table) => {
      const columnMap: Record<string, ColumnMeta> = {};
      table.columns.forEach((col) => {
        columnMap[col] = {
          type: inferType(col),
          synonyms: generateSynonyms(col),
        };
      });

      const tableSynonyms = new Set<string>();
      tableSynonyms.add(table.name.replace(/_/g, " "));
      if (tableSynonymMap[table.name]) {
        tableSynonymMap[table.name].forEach((s) => tableSynonyms.add(s));
      }

      tables[table.name] = {
        description: table.description,
        columns: columnMap,
        synonyms: Array.from(tableSynonyms),
      };
    });

    // Build relationships based on EV battery swapping context
    const relationships: Relationship[] = [
      // Customer relationships
      {
        left_table: "customer",
        left_column: "city_id",
        right_table: "city",
        right_column: "city_id",
        type: "many-to-one"
      },
      {
        left_table: "customer_wallet",
        left_column: "customer_id",
        right_table: "customer",
        right_column: "customer_id",
        type: "many-to-one"
      },
      // Vehicle relationships
      {
        left_table: "vehicle",
        left_column: "vendor_id",
        right_table: "vendor",
        right_column: "vendor_id",
        type: "many-to-one"
      },
      {
        left_table: "vehicle",
        left_column: "vehicle_model_id",
        right_table: "vehicle_model",
        right_column: "model_id",
        type: "many-to-one"
      },
      {
        left_table: "vehicle",
        left_column: "battery_type_id",
        right_table: "battery_type",
        right_column: "battery_type_id",
        type: "many-to-one"
      },
      {
        left_table: "vehicle",
        left_column: "tbox_id",
        right_table: "tboxes",
        right_column: "tbox_id",
        type: "one-to-one"
      },
      // Battery relationships
      {
        left_table: "battery",
        left_column: "vendor_id",
        right_table: "vendor",
        right_column: "vendor_id",
        type: "many-to-one"
      },
      {
        left_table: "battery",
        left_column: "battery_type_id",
        right_table: "battery_type",
        right_column: "battery_type_id",
        type: "many-to-one"
      },
      // Station relationships
      {
        left_table: "swapping_station",
        left_column: "location_id",
        right_table: "location",
        right_column: "location_id",
        type: "many-to-one"
      },
      {
        left_table: "swapping_station",
        left_column: "vendor_id",
        right_table: "vendor",
        right_column: "vendor_id",
        type: "many-to-one"
      },
      // Location hierarchy
      {
        left_table: "location",
        left_column: "city_id",
        right_table: "city",
        right_column: "city_id",
        type: "many-to-one"
      },
      {
        left_table: "city",
        left_column: "area_id",
        right_table: "area",
        right_column: "area_id",
        type: "many-to-one"
      },
      {
        left_table: "area",
        left_column: "state_id",
        right_table: "state",
        right_column: "state_id",
        type: "many-to-one"
      },
      // Package relationships
      {
        left_table: "package_vehicle_detail",
        left_column: "vehicle_id",
        right_table: "vehicle",
        right_column: "vehicle_id",
        type: "many-to-one"
      },
      {
        left_table: "package_vehicle_detail",
        left_column: "customer_id",
        right_table: "customer",
        right_column: "customer_id",
        type: "many-to-one"
      },
      {
        left_table: "package_vehicle_detail",
        left_column: "package_id",
        right_table: "package",
        right_column: "package_id",
        type: "many-to-one"
      },
      // Dealer relationships
      {
        left_table: "dealer",
        left_column: "station_id",
        right_table: "swapping_station",
        right_column: "station_id",
        type: "many-to-one"
      },
      // Payment relationships
      {
        left_table: "fact_payment",
        left_column: "wallet_id",
        right_table: "customer_wallet",
        right_column: "wallet_id",
        type: "many-to-one"
      },
      // Telemetry relationships
      {
        left_table: "fact_vehicle_telemetry",
        left_column: "tbox_id",
        right_table: "tboxes",
        right_column: "tbox_id",
        type: "many-to-one"
      }
    ];

    // EV-specific measures
    const measures: Record<string, Measure> = {
      total_swaps: {
        expression: "SUM(CAST(swap_summary.total_swaps AS INTEGER))",
        description: "Total number of battery swaps across all stations",
        requiredJoins: [],
        baseTable: "swap_summary",
      },
      average_swap_time: {
        expression: "AVG(swap_summary.avg_swap_time)",
        description: "Average time taken for battery swaps in minutes",
        requiredJoins: [],
        baseTable: "swap_summary",
      },
      total_revenue: {
        expression: "SUM(my_revenuesummary.total_revenue)",
        description: "Total revenue from battery swaps and services",
        requiredJoins: [],
        baseTable: "my_revenuesummary",
      },
      station_efficiency: {
        expression: "AVG(swap_summary.efficiency)",
        description: "Average efficiency rating of swap stations",
        requiredJoins: [],
        baseTable: "swap_summary",
      },
      total_expenses: {
        expression: "SUM(my_expensessummary.electricity_bill + my_expensessummary.station_rent + my_expensessummary.maintanance_cost)",
        description: "Total operational expenses including electricity, rent, and maintenance",
        requiredJoins: [],
        baseTable: "my_expensessummary",
      },
      profit_margin: {
        expression: "(SUM(my_revenuesummary.total_revenue) - SUM(my_expensessummary.electricity_bill + my_expensessummary.station_rent + my_expensessummary.maintanance_cost)) / SUM(my_revenuesummary.total_revenue) * 100",
        description: "Profit margin percentage calculated from revenue minus expenses",
        requiredJoins: [
          {
            fromTable: "my_revenuesummary",
            fromColumn: "date",
            toTable: "my_expensessummary",
            toColumn: "date",
          },
        ],
        baseTable: "my_revenuesummary",
      },
      active_vehicles: {
        expression: "COUNT(DISTINCT vehicle.vehicle_id)",
        description: "Number of active vehicles in the system",
        requiredJoins: [],
        baseTable: "vehicle",
      },
      battery_health_avg: {
        expression: "AVG(fact_vehicle_telemetry.bat_soh)",
        description: "Average battery state of health across all vehicles",
        requiredJoins: [],
        baseTable: "fact_vehicle_telemetry",
      },
      customer_acquisition_rate: {
        expression: "COUNT(DISTINCT customer.customer_id)",
        description: "Total number of registered customers",
        requiredJoins: [],
        baseTable: "customer",
      }
    };

    const default_filters: Record<string, Record<string, DefaultFilter>> = {
      swap_summary: {
        date: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
      },
      my_revenuesummary: {
        date: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
      },
      my_expensessummary: {
        date: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
      },
      fact_payment: {
        payment_status: { operator: "=", value: "'completed'" },
        paid_at: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
      },
      vehicle: {
        active: { operator: "=", value: "1" },
        deleted: { operator: "=", value: "0" },
      },
      battery: {
        active: { operator: "=", value: "1" },
        deleted: { operator: "=", value: "0" },
      },
      swapping_station: {
        active: { operator: "=", value: "1" },
        deleted: { operator: "=", value: "0" },
      },
      customer: {
        active: { operator: "=", value: "1" },
        deleted: { operator: "=", value: "0" },
      },
    };

    const accessControl = {
      customer: {
        read: ["admin", "manager", "analyst", "support"],
        write: ["admin", "manager"],
        columnConstraints: {
          email: ["admin", "manager"],
          mobile: ["admin", "manager", "support"],
          nic: ["admin"],
          address: ["admin", "manager"],
        },
      },
      fact_payment: {
        read: ["admin", "finance", "manager"],
        write: ["admin", "finance"],
        columnConstraints: {
          amount: ["admin", "finance"],
          payment_method: ["admin", "finance", "manager"],
        },
      },
      my_revenuesummary: {
        read: ["admin", "finance", "manager", "analyst"],
        write: ["admin", "finance"],
        columnConstraints: {
          total_revenue: ["admin", "finance", "manager"],
          gross_revenue: ["admin", "finance"],
        },
      },
      my_expensessummary: {
        read: ["admin", "finance", "manager"],
        write: ["admin", "finance"],
        columnConstraints: {
          electricity_bill: ["admin", "finance"],
          station_rent: ["admin", "finance"],
          maintanance_cost: ["admin", "finance"],
        },
      },
      vehicle: {
        read: ["admin", "manager", "analyst", "technician"],
        write: ["admin", "manager"],
        columnConstraints: {
          chassis_number: ["admin", "manager"],
          license_plate: ["admin", "manager", "support"],
        },
      },
      battery: {
        read: ["admin", "manager", "technician"],
        write: ["admin", "manager", "technician"],
        columnConstraints: {
          serial_no: ["admin", "manager", "technician"],
          charge_cycle: ["admin", "technician"],
        },
      },
      fact_vehicle_telemetry: {
        read: ["admin", "manager", "technician", "analyst"],
        write: ["admin"],
        columnConstraints: {
          bat_volt: ["admin", "technician"],
          bat_current: ["admin", "technician"],
          motor_temp: ["admin", "technician"],
        },
      },
      dealer: {
        read: ["admin", "manager", "sales"],
        write: ["admin", "manager"],
        columnConstraints: {
          dealer_email: ["admin", "manager"],
          dealer_mobile_number: ["admin", "manager"],
        },
      },
    };
    
    return {
      tables,
      relationships,
      measures,
      default_filters,
      accessControl,
    };
  }
}