-- ============================================================
-- Supply Chain Control Tower — KPI Views (Semantic Layer)
-- Schema: analytics
-- ============================================================

-- -------------------------------------------------------
-- OTIF % (On-Time In-Full)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_otif AS
SELECT
    o.order_date,
    o.org_id,
    o.customer_id,
    o.product_id,
    d.product_family,
    c.segment        AS customer_segment,
    org.org_name,
    COUNT(*)                                                AS total_lines,
    COUNT(*) FILTER (WHERE o.is_otif = TRUE)                AS otif_lines,
    ROUND(COUNT(*) FILTER (WHERE o.is_otif = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS otif_pct,
    COUNT(*) FILTER (WHERE o.is_on_time = TRUE)             AS on_time_lines,
    ROUND(COUNT(*) FILTER (WHERE o.is_on_time = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS otd_pct,
    COUNT(*) FILTER (WHERE o.is_in_full = TRUE)             AS in_full_lines,
    ROUND(COUNT(*) FILTER (WHERE o.is_in_full = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS fill_rate_pct
FROM analytics.fact_orders o
JOIN analytics.dim_product d ON o.product_id = d.product_id
JOIN analytics.dim_customer c ON o.customer_id = c.customer_id
JOIN analytics.dim_org org ON o.org_id = org.org_id
WHERE o.order_status IN ('DELIVERED','SHIPPED','PARTIAL')
GROUP BY o.order_date, o.org_id, o.customer_id, o.product_id,
         d.product_family, c.segment, org.org_name;

-- -------------------------------------------------------
-- Backlog
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_backlog AS
SELECT
    o.org_id,
    org.org_name,
    o.product_id,
    d.product_family,
    o.customer_id,
    c.segment AS customer_segment,
    COUNT(*)                  AS open_lines,
    SUM(o.ordered_qty - COALESCE(o.shipped_qty, 0)) AS backlog_qty,
    SUM(o.line_value)         AS backlog_value
FROM analytics.fact_orders o
JOIN analytics.dim_product d ON o.product_id = d.product_id
JOIN analytics.dim_customer c ON o.customer_id = c.customer_id
JOIN analytics.dim_org org ON o.org_id = org.org_id
WHERE o.order_status IN ('OPEN','PARTIAL')
GROUP BY o.org_id, org.org_name, o.product_id, d.product_family, o.customer_id, c.segment;

-- -------------------------------------------------------
-- Inventory KPIs (DOH, Turns, Stockout, E&O)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_inventory AS
SELECT
    inv.snapshot_date,
    inv.org_id,
    org.org_name,
    inv.product_id,
    d.product_family,
    inv.on_hand_qty,
    inv.in_transit_qty,
    inv.available_qty,
    inv.safety_stock_qty,
    inv.inventory_value,
    inv.days_on_hand,
    inv.age_bucket,
    inv.is_excess,
    inv.is_obsolete,
    CASE WHEN inv.available_qty <= 0 THEN TRUE ELSE FALSE END AS is_stockout
FROM analytics.fact_inventory_snapshot inv
JOIN analytics.dim_product d ON inv.product_id = d.product_id
JOIN analytics.dim_org org ON inv.org_id = org.org_id;

-- Inventory Turns (aggregated monthly)
CREATE OR REPLACE VIEW analytics.v_kpi_inventory_turns AS
SELECT
    DATE_TRUNC('month', inv.snapshot_date)::DATE AS month_date,
    inv.org_id,
    org.org_name,
    inv.product_id,
    d.product_family,
    -- Avg on-hand for the month
    ROUND(AVG(inv.on_hand_qty), 2) AS avg_on_hand_qty,
    ROUND(AVG(inv.inventory_value), 2) AS avg_inventory_value,
    -- Avg days on hand
    ROUND(AVG(inv.days_on_hand), 1) AS avg_doh
FROM analytics.fact_inventory_snapshot inv
JOIN analytics.dim_product d ON inv.product_id = d.product_id
JOIN analytics.dim_org org ON inv.org_id = org.org_id
GROUP BY DATE_TRUNC('month', inv.snapshot_date)::DATE, inv.org_id, org.org_name, inv.product_id, d.product_family;

-- -------------------------------------------------------
-- Forecast Accuracy (WAPE, Bias)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_forecast AS
SELECT
    f.forecast_date,
    f.org_id,
    org.org_name,
    f.product_id,
    d.product_family,
    f.forecast_qty,
    f.actual_qty,
    f.abs_error,
    f.pct_error,
    f.bias,
    -- WAPE = SUM(|actual - forecast|) / SUM(actual)
    -- computed at aggregate level, this view provides row-level data
    f.bucket_type
FROM analytics.fact_forecast f
JOIN analytics.dim_product d ON f.product_id = d.product_id
JOIN analytics.dim_org org ON f.org_id = org.org_id;

-- -------------------------------------------------------
-- Production Schedule Adherence & Capacity Utilization
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_production AS
SELECT
    p.production_date,
    p.org_id,
    org.org_name,
    p.product_id,
    d.product_family,
    p.planned_qty,
    p.actual_qty,
    p.scrap_qty,
    p.schedule_adherence,
    p.capacity_utilization,
    p.yield_rate,
    p.capacity_available,
    p.capacity_used
FROM analytics.fact_production p
JOIN analytics.dim_product d ON p.product_id = d.product_id
JOIN analytics.dim_org org ON p.org_id = org.org_id;

-- -------------------------------------------------------
-- Supplier Performance (OT%, Lead Time Variance, PPM)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_supplier AS
SELECT
    po.po_date,
    po.org_id,
    org.org_name,
    po.supplier_id,
    s.supplier_name,
    s.tier           AS supplier_tier,
    po.product_id,
    d.product_family,
    COUNT(*)                                                    AS total_lines,
    COUNT(*) FILTER (WHERE po.is_on_time = TRUE)                AS on_time_lines,
    ROUND(COUNT(*) FILTER (WHERE po.is_on_time = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4)
                                                                AS supplier_ot_pct,
    ROUND(AVG(po.lead_time_actual - po.lead_time_planned), 1)   AS avg_lead_time_variance,
    ROUND(AVG(COALESCE(po.quality_ppm, 0)), 1)                  AS avg_quality_ppm,
    SUM(po.line_value)                                          AS total_spend
FROM analytics.fact_purchase_orders po
JOIN analytics.dim_supplier s ON po.supplier_id = s.supplier_id
JOIN analytics.dim_product d ON po.product_id = d.product_id
JOIN analytics.dim_org org ON po.org_id = org.org_id
GROUP BY po.po_date, po.org_id, org.org_name, po.supplier_id, s.supplier_name, s.tier ,po.product_id, d.product_family;

-- -------------------------------------------------------
-- Logistics / Shipment Performance
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_kpi_logistics AS
SELECT
    sh.ship_date,
    sh.org_id,
    org.org_name,
    sh.carrier_id,
    cr.carrier_name,
    cr.mode          AS transport_mode,
    sh.lane_id,
    sh.product_id,
    d.product_family,
    COUNT(*)                                                     AS total_shipments,
    COUNT(*) FILTER (WHERE sh.is_on_time = TRUE)                 AS on_time_shipments,
    ROUND(COUNT(*) FILTER (WHERE sh.is_on_time = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4)
                                                                 AS carrier_ot_pct,
    ROUND(AVG(sh.transit_days_actual), 1)                        AS avg_transit_days,
    ROUND(AVG(sh.transit_days_actual - sh.transit_days_planned), 1) AS avg_transit_variance,
    ROUND(SUM(sh.freight_cost) / NULLIF(SUM(sh.shipped_qty), 0), 2) AS freight_cost_per_unit,
    SUM(sh.freight_cost)                                         AS total_freight_cost
FROM analytics.fact_shipments sh
JOIN analytics.dim_carrier cr ON sh.carrier_id = cr.carrier_id
JOIN analytics.dim_product d ON sh.product_id = d.product_id
JOIN analytics.dim_org org ON sh.org_id = org.org_id
GROUP BY sh.ship_date, sh.org_id, org.org_name, sh.carrier_id, cr.carrier_name, cr.mode,
         sh.lane_id, sh.product_id, d.product_family;

-- -------------------------------------------------------
-- Data Freshness View
-- -------------------------------------------------------
CREATE OR REPLACE VIEW analytics.v_data_freshness AS
SELECT 'fact_orders'              AS table_name, MAX(load_ts) AS last_load, COUNT(*) AS row_count FROM analytics.fact_orders
UNION ALL
SELECT 'fact_shipments',           MAX(load_ts), COUNT(*) FROM analytics.fact_shipments
UNION ALL
SELECT 'fact_inventory_snapshot',  MAX(load_ts), COUNT(*) FROM analytics.fact_inventory_snapshot
UNION ALL
SELECT 'fact_production',          MAX(load_ts), COUNT(*) FROM analytics.fact_production
UNION ALL
SELECT 'fact_purchase_orders',     MAX(load_ts), COUNT(*) FROM analytics.fact_purchase_orders
UNION ALL
SELECT 'fact_forecast',            MAX(load_ts), COUNT(*) FROM analytics.fact_forecast;

-- -------------------------------------------------------
-- Org access + user KPI grants (for RLS)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW app.v_user_org_scope AS
SELECT
    u.user_id,
    u.email,
    u.display_name,
    r.role_id,
    oa.org_id,
    org.org_name,
    org.org_type
FROM app.app_user u
JOIN app.app_user_role r ON u.user_id = r.user_id
LEFT JOIN app.user_org_access oa ON u.user_id = oa.user_id
LEFT JOIN analytics.dim_org org ON oa.org_id = org.org_id
WHERE u.is_active = TRUE;
