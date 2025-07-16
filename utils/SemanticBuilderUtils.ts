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
      if (lower.includes("date") || lower.includes("time")) return "date";
      if (
        lower.includes("amount") ||
        lower.includes("cost") ||
        lower.includes("price") ||
        lower.includes("salary") ||
        lower.includes("pay")
      )
        return "float";
      if (
        lower.includes("flag") ||
        lower.includes("status") ||
        lower.includes("tier") ||
        lower.includes("method")
      )
        return "string";
      if (lower.includes("rating")) return "float";
      if (
        lower.includes("email") ||
        lower.includes("name") ||
        lower.includes("country") ||
        lower.includes("language") ||
        lower.includes("channel") ||
        lower.includes("type") ||
        lower.includes("reason")
      )
        return "string";
      if (lower.includes("phone")) return "string";
      return "string";
    };

    const columnSynonymMap: Record<string, string[]> = {
      id: ["identifier", "number", "ref", "code"],
      name: ["label", "title"],
      email: ["email address", "e-mail"],
      phone: ["contact", "mobile number"],
      date: ["time", "timestamp", "datetime"],
      country: ["nation", "region"],
      price: ["cost", "rate", "amount"],
      amount: ["value", "total", "charge"],
      rating: ["score", "stars"],
      flag: ["boolean", "indicator"],
      status: ["state", "condition"],
      quantity: ["units", "count"],
      description: ["info", "details"],
    };

    const tableSynonymMap: Record<string, string[]> = {
      customers: ["clients", "users", "buyers"],
      orders: ["purchases", "transactions"],
      products: ["items", "goods", "merchandise"],
      reviews: ["ratings", "feedback", "comments"],
      order_items: ["order lines", "line items"],
      categories: ["types", "product types"],
      returns: ["product returns", "return requests"],
      inventory_movements: ["stock changes", "inventory logs"],
      payroll: ["salary records", "wage sheets"],
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
        name: "customers",
        description:
          "Customer profiles with demographic, contact, signup, and loyalty program data",
        columns: [
          "customer_id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "signup_date",
          "loyalty_tier",
          "date_of_birth",
          "country",
          "preferred_language",
        ],
      },
      {
        name: "orders",
        description:
          "High-level order header records with dates, status, currency, and channel",
        columns: [
          "order_id",
          "customer_id",
          "order_date",
          "status",
          "total_amount",
          "currency",
          "sales_channel",
          "shipping_method",
          "tax_amount",
        ],
      },
      {
        name: "order_items",
        description:
          "Individual line items per order, including product, quantity, and per‑unit pricing",
        columns: [
          "order_item_id",
          "order_id",
          "product_id",
          "quantity",
          "unit_price",
          "discount_amount",
          "tax_amount",
        ],
      },
      {
        name: "products",
        description:
          "Product catalog with SKUs, categories, pricing, dimensions, and inventory flags",
        columns: [
          "product_id",
          "sku",
          "name",
          "category_id",
          "price",
          "cost",
          "weight_kg",
          "height_cm",
          "width_cm",
          "depth_cm",
          "in_stock",
          "discontinued",
        ],
      },
      {
        name: "categories",
        description:
          "Hierarchical product categories and metadata for navigation and reporting",
        columns: [
          "category_id",
          "parent_category_id",
          "name",
          "description",
          "display_order",
          "is_active",
        ],
      },
      {
        name: "suppliers",
        description:
          "External suppliers providing products, with contact info and rating",
        columns: [
          "supplier_id",
          "name",
          "contact_name",
          "contact_email",
          "phone",
          "address",
          "rating",
          "active_since",
        ],
      },
      {
        name: "inventory_movements",
        description:
          "Stock in/out events per warehouse with quantity, reason, and timestamps",
        columns: [
          "movement_id",
          "product_id",
          "warehouse_id",
          "movement_type",
          "quantity",
          "movement_date",
          "reference_no",
        ],
      },
      {
        name: "warehouses",
        description:
          "Physical warehouse locations with capacity and manager assignments",
        columns: [
          "warehouse_id",
          "name",
          "location_city",
          "location_country",
          "capacity_units",
          "manager_employee_id",
        ],
      },
      {
        name: "employees",
        description:
          "Company employees, their roles, departments, hire dates, salaries",
        columns: [
          "employee_id",
          "first_name",
          "last_name",
          "email",
          "department_id",
          "role",
          "hire_date",
          "salary",
          "manager_id",
        ],
      },
      {
        name: "departments",
        description:
          "Organizational departments with cost centers and head counts",
        columns: [
          "department_id",
          "name",
          "cost_center_code",
          "location",
          "budget_year",
        ],
      },
      {
        name: "payroll",
        description:
          "Monthly payroll runs per employee, including gross/net pay, deductions, taxes",
        columns: [
          "payroll_id",
          "employee_id",
          "pay_period_start",
          "pay_period_end",
          "gross_pay",
          "net_pay",
          "tax_deduction",
          "benefits_deduction",
        ],
      },
      {
        name: "attendance",
        description: "Daily clock‑in/clock‑out records for hourly employees",
        columns: [
          "attendance_id",
          "employee_id",
          "date",
          "clock_in_time",
          "clock_out_time",
          "hours_worked",
        ],
      },
      {
        name: "returns",
        description:
          "Product return events with reason codes, restocking status, refund amounts",
        columns: [
          "return_id",
          "order_item_id",
          "return_date",
          "reason_code",
          "refunded_amount",
          "restocked_flag",
        ],
      },
      {
        name: "reviews",
        description:
          "Customer product reviews with ratings, comments, and moderation status",
        columns: [
          "review_id",
          "product_id",
          "customer_id",
          "rating",
          "review_text",
          "review_date",
          "status",
        ],
      },
      {
        name: "regions",
        description:
          "Geographical sales regions for territory management and reporting",
        columns: [
          "region_id",
          "name",
          "manager_employee_id",
          "target_sales_amount",
          "currency",
        ],
      },
      {
        name: "sales_targets",
        description:
          "Monthly/quarterly sales targets per region and product category",
        columns: [
          "target_id",
          "region_id",
          "category_id",
          "period_start",
          "period_end",
          "target_amount",
        ],
      },
      {
        name: "marketing_campaigns",
        description:
          "Campaign metadata, channels, budget, start/end, and attribution data",
        columns: [
          "campaign_id",
          "name",
          "channel",
          "budget_total",
          "start_date",
          "end_date",
          "attribution_model",
        ],
      },
      {
        name: "campaign_performance",
        description:
          "Daily campaign KPIs: impressions, clicks, cost, conversions",
        columns: [
          "performance_id",
          "campaign_id",
          "date",
          "impressions",
          "clicks",
          "cost",
          "conversions",
          "revenue_attributed",
        ],
      },
      {
        name: "website_traffic",
        description:
          "Web analytics daily figures: sessions, pageviews, bounce rates, device mix",
        columns: [
          "traffic_id",
          "date",
          "sessions",
          "pageviews",
          "bounce_rate",
          "device_type",
          "avg_session_duration",
        ],
      },
      {
        name: "support_tickets",
        description:
          "Customer support tickets: categories, priorities, status, resolution times",
        columns: [
          "ticket_id",
          "customer_id",
          "created_at",
          "closed_at",
          "priority",
          "status",
          "category",
        ],
      },
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

    // Build relationships
    const relationships: Relationship[] = [];
    const primaryKeys = new Map<string, string>();
    tableDefinitions.forEach((tbl) => {
      primaryKeys.set(tbl.name, `${tbl.name}_id`);
    });

    tableDefinitions.forEach((tbl) => {
      const leftTable = tbl.name;
      tbl.columns.forEach((col) => {
        if (
          col.endsWith("_id") &&
          col !== primaryKeys.get(leftTable) &&
          col.length > 3
        ) {
          const candidateTableName = col.slice(0, -3);
          const matchTable = primaryKeys.has(candidateTableName)
            ? candidateTableName
            : primaryKeys.has(candidateTableName + "s")
            ? candidateTableName + "s"
            : null;

          if (matchTable) {
            relationships.push({
              left_table: leftTable,
              left_column: col,
              right_table: matchTable,
              right_column: primaryKeys.get(matchTable)!,
              type: "many-to-one",
            });
          }
        }
      });
    });

    // Measures with join info
    const measures: Record<string, Measure> = {
      total_returned_quantity: {
        expression: "SUM(CAST(order_items.quantity AS INTEGER))",
        description:
          "Total quantity of returned products by summing quantities from order_items joined via returns",
        requiredJoins: [
          {
            fromTable: "returns",
            fromColumn: "order_item_id",
            toTable: "order_items",
            toColumn: "order_item_id",
          },
        ],
        baseTable: "returns",
      },
      average_rating: {
        expression: "AVG(reviews.rating)",
        description: "Average rating from reviews linked to products",
        requiredJoins: [
          {
            fromTable: "reviews",
            fromColumn: "product_id",
            toTable: "products",
            toColumn: "product_id",
          },
        ],
      },
    };

    const default_filters: Record<string, Record<string, DefaultFilter>> = {
      orders: {
        order_date: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
        status: { operator: "!=", value: "'cancelled'" },
      },
      returns: {
        return_date: {
          operator: ">=",
          value: "CURRENT_DATE - INTERVAL '6 months'",
        },
      },
    };

    const accessControl = {
      customers: {
        read: ["admin", "manager", "analyst"],
        write: ["admin", "manager"],
        columnConstraints: {
          email: ["admin", "manager"],
          phone: ["admin", "manager"],
          loyalty_tier: ["admin"],
          date_of_birth: ["admin"],
        },
      },
      orders: {
        read: ["admin", "manager", "analyst", "support"],
        write: ["admin", "manager"],
        columnConstraints: {
          order_id: ["admin", "manager"],
        },
      },
      payroll: {
        read: ["admin", "hr"],
        write: ["admin"],
        columnConstraints: {
          salary: ["admin"],
          tax_deduction: ["admin"],
          benefits_deduction: ["admin"],
        },
      },
      employees: {
        read: ["admin", "manager", "hr"],
        write: ["admin", "hr"],
        columnConstraints: {
          salary: ["admin", "hr"],
          email: ["admin", "hr"],
        },
      },
      support_tickets: {
        read: ["admin", "support", "manager"],
        write: ["admin", "support"],
        columnConstraints: {
          customer_id: ["admin", "support"],
          priority: ["admin", "support"],
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