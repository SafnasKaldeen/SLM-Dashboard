export const OrgContext = `
- The 'customers' table is the single source of truth for all customer data.
- Orders with status 'cancelled' are excluded from sales analyses.
- Products where 'discontinued' = false are considered active.
- Avoid unnecessary joins to improve query efficiency.
- If supplier performance is analyzed, ensure the 'products' table includes a 'supplier_id' field to link with 'suppliers'.
- Campaign ROI is calculated as: (revenue_attributed - cost) / cost from the 'campaign_performance' table.
- Only include campaigns where cost > 0 to avoid divide-by-zero errors in ROI calculation.
`;
