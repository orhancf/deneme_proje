-- ============================================================
-- Supply Chain Control Tower — Materialized Views & Refresh
-- Schema: analytics
-- ============================================================

-- -------------------------------------------------------
-- Materialized View: OTIF Summary (Daily)
-- -------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_kpi_otif_daily AS
SELECT
    o.order_date,
    o.org_id,
    org.org_name,
    COUNT(*)                                                                           AS total_lines,
    COUNT(*) FILTER (WHERE o.is_otif = TRUE)                                           AS otif_lines,
    ROUND(COUNT(*) FILTER (WHERE o.is_otif = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4)   AS otif_pct,
    ROUND(COUNT(*) FILTER (WHERE o.is_on_time = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS otd_pct,
    ROUND(COUNT(*) FILTER (WHERE o.is_in_full = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS fill_rate_pct
FROM analytics.fact_orders o
JOIN analytics.dim_org org ON o.org_id = org.org_id
WHERE o.order_status IN ('DELIVERED','SHIPPED','PARTIAL')
GROUP BY o.order_date, o.org_id, org.org_name
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_otif_daily
    ON analytics.mv_kpi_otif_daily (order_date, org_id);

-- -------------------------------------------------------
-- Materialized View: Inventory Summary (Daily)
-- -------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_kpi_inventory_daily AS
SELECT
    i.snapshot_date,
    i.org_id,
    org.org_name,
    COUNT(*)                                                                   AS sku_count,
    ROUND(AVG(i.days_on_hand), 2)                                              AS avg_doh,
    ROUND(COUNT(*) FILTER (WHERE i.on_hand_qty <= 0)::NUMERIC / NULLIF(COUNT(*),0), 4) AS stockout_rate,
    SUM(i.inventory_value)                                                     AS total_inventory_value
FROM analytics.fact_inventory_snapshot i
JOIN analytics.dim_org org ON i.org_id = org.org_id
GROUP BY i.snapshot_date, i.org_id, org.org_name
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_daily
    ON analytics.mv_kpi_inventory_daily (snapshot_date, org_id);

-- -------------------------------------------------------
-- Materialized View: Forecast Accuracy (Weekly)
-- -------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_kpi_forecast_weekly AS
SELECT
    DATE_TRUNC('week', f.forecast_date)::DATE                                    AS week_start,
    f.org_id,
    org.org_name,
    COUNT(*)                                                                      AS forecast_lines,
    ROUND(AVG(f.pct_error), 4)                                                    AS avg_pct_error,
    ROUND(AVG(f.bias), 4)                                                         AS avg_bias
FROM analytics.fact_forecast f
JOIN analytics.dim_org org ON f.org_id = org.org_id
GROUP BY DATE_TRUNC('week', f.forecast_date)::DATE, f.org_id, org.org_name
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_forecast_weekly
    ON analytics.mv_kpi_forecast_weekly (week_start, org_id);

-- -------------------------------------------------------
-- Materialized View: Supplier Performance (Weekly)
-- -------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_kpi_supplier_weekly AS
SELECT
    DATE_TRUNC('week', po.po_date)::DATE                                            AS week_start,
    po.supplier_id,
    s.supplier_name,
    po.org_id,
    COUNT(*)                                                                         AS total_po_lines,
    ROUND(COUNT(*) FILTER (WHERE po.is_on_time = TRUE)::NUMERIC / NULLIF(COUNT(*),0), 4) AS supplier_ot_pct,
    ROUND(AVG(po.actual_lead_time - po.planned_lead_time), 2)                        AS avg_lead_time_variance,
    ROUND(AVG(po.quality_ppm), 2)                                                    AS avg_quality_ppm
FROM analytics.fact_purchase_orders po
JOIN analytics.dim_supplier s ON po.supplier_id = s.supplier_id
GROUP BY DATE_TRUNC('week', po.po_date)::DATE, po.supplier_id, s.supplier_name, po.org_id
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_supplier_weekly
    ON analytics.mv_kpi_supplier_weekly (week_start, supplier_id, org_id);

-- ============================================================
-- Refresh function: call to refresh all materialized views
-- ============================================================
CREATE OR REPLACE FUNCTION analytics.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    _start TIMESTAMP;
    _elapsed INTERVAL;
BEGIN
    _start := clock_timestamp();
    RAISE NOTICE '[MV Refresh] Starting full refresh at %', _start;

    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_kpi_otif_daily;
    RAISE NOTICE '[MV Refresh] mv_kpi_otif_daily refreshed';

    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_kpi_inventory_daily;
    RAISE NOTICE '[MV Refresh] mv_kpi_inventory_daily refreshed';

    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_kpi_forecast_weekly;
    RAISE NOTICE '[MV Refresh] mv_kpi_forecast_weekly refreshed';

    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_kpi_supplier_weekly;
    RAISE NOTICE '[MV Refresh] mv_kpi_supplier_weekly refreshed';

    _elapsed := clock_timestamp() - _start;
    RAISE NOTICE '[MV Refresh] Complete — duration: %', _elapsed;

    -- Record refresh event in data quality log
    INSERT INTO app.data_quality_log (check_name, check_type, status, details, checked_at)
    VALUES (
        'mv_refresh_all',
        'REFRESH',
        'PASS',
        jsonb_build_object('duration_ms', EXTRACT(EPOCH FROM _elapsed) * 1000),
        NOW()
    );
END;
$$;

-- ============================================================
-- pg_cron scheduling (requires pg_cron extension)
-- Uncomment the lines below if pg_cron is installed:
-- ============================================================
-- SELECT cron.schedule('refresh_mvs_daily', '0 6 * * *', 'SELECT analytics.refresh_all_materialized_views()');
-- SELECT cron.schedule('refresh_mvs_hourly', '30 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_kpi_otif_daily');
