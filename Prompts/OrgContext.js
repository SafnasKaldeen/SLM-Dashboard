export const OrgContext = `
BUSINESS MODEL: Electric vehicle battery swapping service with multiple stations. Revenue from swap fees and payment transactions. Tracks operational expenses (electricity, rent, maintenance).

KEY ENTITIES:
- Stations: DIM_SWAPPING_STATION with operational status
- Customers: DIM_CUSTOMERS with contact/demographic data  
- Vehicles: DIM_VEHICLE with registration/specifications
- Batteries: DIM_BATTERY with health metrics and charge cycles
- Dealers: DIM_DEALER network partners
- TBoxes: DIM_TBOXES telemetry units for GPS/performance
- LOOKUP_VIEW: Central hub connecting TBOX_ID, VEHICLE_ID, CUSTOMER_ID, DEALER_ID, BATTERY_TYPE_ID

CORE PROCESSES:
- Swap transactions: FACT_PAYMENT with payment methods/amounts
- Vehicle telemetry: FACT_VEHICLE_TELEMETRY and GPS tracking  
- Station expenses: FACT_EXPENSES (electricity, rent, maintenance)
- Ownership mapping: FACT_VEHICLE_OWNER
- Session tracking: FACT_TBOX_BMS_SESSION

FINANCIAL STRUCTURE:
- Revenue streams: payment transactions tracked in FACT_PAYMENT
- Expense categories: electricity, station rent, maintenance in FACT_EXPENSES
- Payment methods include wallet, card payments, and refunds
- Station-wise and location-wise expense allocation

DATA ARCHITECTURE:
- LOOKUP_VIEW eliminates complex multi-hop joins in normalized warehouse
- DIM_CUSTOMERS master record for customer info
- FACT_PAYMENT links customers/stations/transactions
- Telemetry flows from TBox units to fact tables
- DIM_BATTERY connects to DIM_BATTERY_TYPE for specifications

QUERY OPTIMIZATION:
- Use LOOKUP_VIEW for cross-dimensional analysis (avoids complex joins)
- **Always use CREATED_EPOCH for date filtering in FACT_PAYMENT, never CREATED_AT**
- Convert epoch to number for month/year comparison: 
  TO_NUMBER(TO_CHAR(adhoc.metadata.unix_to_timestamp(fp.CREATED_EPOCH), 'YYYYMM'))
- Filter FACT_PAYMENT by date ranges using epoch
- Use session-based aggregation for high-volume telemetry
- Exclude inactive records (ACTIVE = 0 or DELETED = 1)
- PAYMENT_STATUS is a string field; use string literals like 'PAID', 'COMPLETED', 'SUCCESS'

PERFORMANCE METRICS:
- Vehicle distance and session data in FACT_VEHICLE_DISTANCE
- Battery health monitoring (SOH, cycle count, voltage, temperature) in telemetry
- GPS tracking with 30-second intervals in FACT_TBOX_GPS
- Payment transaction success rates and refund percentages
- Session-based vehicle utilization through FACT_TBOX_BMS_SESSION

LOOKUP_VIEW PATTERNS:
┌─────────────────────────────────────────────────────────────────┐
│ TYPICAL JOINS:                                                 │
│ • Telemetry → LOOKUP_VIEW → Customers (avoids 4-table chain)   │
│ • Distance → LOOKUP_VIEW → (Customers, Dealers)               │
│ • Payment → LOOKUP_VIEW → Cross-entity analysis               │  
└─────────────────────────────────────────────────────────────────┘

UTILITY FUNCTIONS:
- unix_to_timestamp(epoch NUMBER) → TIMESTAMP_NTZ(6)
  • Converts Unix epoch (ms) to readable timestamp
  • Usage: ✅ EXTRACT(MONTH FROM adhoc.metadata.unix_to_timestamp(fp.CREATED_EPOCH))
           ❌ Avoid EXTRACT(MONTH FROM fp.CREATED_AT)

IMPORTANT DATE RULES:
- Always use CREATED_EPOCH with unix_to_timestamp → TIMESTAMP_NTZ
- Do NOT use LTZ or session time zone conversions for revenue or monthly aggregates
- For month/year calculations, always convert to NUMBER:
  TO_NUMBER(TO_CHAR(unix_to_timestamp(CREATED_EPOCH), 'YYYYMM'))

EXAMPLE QUERIES:
1. Customer Sessions: FACT_VEHICLE_DISTANCE → LOOKUP_VIEW → DIM_CUSTOMERS
2. Regional Revenue: FACT_PAYMENT → LOOKUP_VIEW → DIM_DEALER  
3. Battery Health: FACT_VEHICLE_TELEMETRY → LOOKUP_VIEW → Vehicle/Customer dims
`;
