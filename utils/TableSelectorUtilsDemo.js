import { TableDescription } from "../models/TableDescription.js";

export class TableSelectorUtils {
  static createSampleTableDescriptions() {
    return [
      new TableDescription(
        "customers",
        "Customer profiles with demographic, contact, signup, and loyalty program data",
        [
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
        ]
      ),

      new TableDescription(
        "orders",
        "High-level order header records with dates, status, currency, and channel",
        [
          "order_id",
          "customer_id",
          "order_date",
          "status",
          "total_amount",
          "currency",
          "sales_channel",
          "shipping_method",
          "tax_amount",
        ]
      ),

      new TableDescription(
        "order_items",
        "Individual line items per order, including product, quantity, and per‑unit pricing",
        [
          "order_item_id",
          "order_id",
          "product_id",
          "quantity",
          "unit_price",
          "discount_amount",
          "tax_amount",
        ]
      ),

      new TableDescription(
        "products",
        "Product catalog with SKUs, categories, pricing, dimensions, and inventory flags",
        [
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
        ]
      ),

      new TableDescription(
        "categories",
        "Hierarchical product categories and metadata for navigation and reporting",
        [
          "category_id",
          "parent_category_id",
          "name",
          "description",
          "display_order",
          "is_active",
        ]
      ),

      new TableDescription(
        "suppliers",
        "External suppliers providing products, with contact info and rating",
        [
          "supplier_id",
          "name",
          "contact_name",
          "contact_email",
          "phone",
          "address",
          "rating",
          "active_since",
        ]
      ),

      new TableDescription(
        "inventory_movements",
        "Stock in/out events per warehouse with quantity, reason, and timestamps",
        [
          "movement_id",
          "product_id",
          "warehouse_id",
          "movement_type", // e.g. "INBOUND", "OUTBOUND", "ADJUSTMENT"
          "quantity",
          "movement_date",
          "reference_no",
        ]
      ),

      new TableDescription(
        "warehouses",
        "Physical warehouse locations with capacity and manager assignments",
        [
          "warehouse_id",
          "name",
          "location_city",
          "location_country",
          "capacity_units",
          "manager_employee_id",
        ]
      ),

      new TableDescription(
        "employees",
        "Company employees, their roles, departments, hire dates, salaries",
        [
          "employee_id",
          "first_name",
          "last_name",
          "email",
          "department_id",
          "role",
          "hire_date",
          "salary",
          "manager_id",
        ]
      ),

      new TableDescription(
        "departments",
        "Organizational departments with cost centers and head counts",
        ["department_id", "name", "cost_center_code", "location", "budget_year"]
      ),

      new TableDescription(
        "payroll",
        "Monthly payroll runs per employee, including gross/net pay, deductions, taxes",
        [
          "payroll_id",
          "employee_id",
          "pay_period_start",
          "pay_period_end",
          "gross_pay",
          "net_pay",
          "tax_deduction",
          "benefits_deduction",
        ]
      ),

      new TableDescription(
        "attendance",
        "Daily clock‑in/clock‑out records for hourly employees",
        [
          "attendance_id",
          "employee_id",
          "date",
          "clock_in_time",
          "clock_out_time",
          "hours_worked",
        ]
      ),

      new TableDescription(
        "returns",
        "Product return events with reason codes, restocking status, refund amounts",
        [
          "return_id",
          "order_item_id",
          "return_date",
          "reason_code",
          "refunded_amount",
          "restocked_flag",
        ]
      ),

      new TableDescription(
        "reviews",
        "Customer product reviews with ratings, comments, and moderation status",
        [
          "review_id",
          "product_id",
          "customer_id",
          "rating",
          "review_text",
          "review_date",
          "status", // e.g. "PENDING", "APPROVED", "REJECTED"
        ]
      ),

      new TableDescription(
        "regions",
        "Geographical sales regions for territory management and reporting",
        [
          "region_id",
          "name",
          "manager_employee_id",
          "target_sales_amount",
          "currency",
        ]
      ),

      new TableDescription(
        "sales_targets",
        "Monthly/quarterly sales targets per region and product category",
        [
          "target_id",
          "region_id",
          "category_id",
          "period_start",
          "period_end",
          "target_amount",
        ]
      ),

      new TableDescription(
        "marketing_campaigns",
        "Campaign metadata, channels, budget, start/end, and attribution data",
        [
          "campaign_id",
          "name",
          "channel", // e.g. "EMAIL", "SOCIAL", "PAID_SEARCH"
          "budget_total",
          "start_date",
          "end_date",
          "attribution_model",
        ]
      ),

      new TableDescription(
        "campaign_performance",
        "Daily campaign KPIs: impressions, clicks, cost, conversions",
        [
          "performance_id",
          "campaign_id",
          "date",
          "impressions",
          "clicks",
          "cost",
          "conversions",
          "revenue_attributed",
        ]
      ),

      new TableDescription(
        "website_traffic",
        "Web analytics daily figures: sessions, pageviews, bounce rates, device mix",
        [
          "traffic_id",
          "date",
          "sessions",
          "pageviews",
          "bounce_rate",
          "device_type",
          "avg_session_duration",
        ]
      ),

      new TableDescription(
        "support_tickets",
        "Customer support tickets: categories, priorities, status, resolution times",
        [
          "ticket_id",
          "customer_id",
          "created_at",
          "closed_at",
          "priority", // e.g. "LOW", "MEDIUM", "HIGH"
          "status", // e.g. "OPEN", "PENDING", "RESOLVED"
          "category", // e.g. "BILLING", "TECHNICAL", "GENERAL"
        ]
      ),
    ];
  }

  static logSelectionResults(query, selectedTables, allTables) {
    // console.log(`Query: ${query}`);
    // console.log("Selected tables:", selectedTables);
    // console.log("All available tables:", allTables);
  }
}
