-- ============================================================
-- Supply Chain Control Tower — Fact Tables
-- Schema: analytics
-- ============================================================

-- -------------------------------------------------------
-- fact_orders: sales order line grain
-- -------------------------------------------------------
CREATE TABLE analytics.fact_orders (
    order_line_id    VARCHAR(40) PRIMARY KEY,
    order_id         VARCHAR(30) NOT NULL,
    order_date       DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    requested_date   DATE,
    promised_date    DATE,
    shipped_date     DATE,
    delivered_date   DATE,
    org_id           VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    customer_id      VARCHAR(20) NOT NULL REFERENCES analytics.dim_customer(customer_id),
    product_id       VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    ordered_qty      NUMERIC(12,2) NOT NULL,
    shipped_qty      NUMERIC(12,2) DEFAULT 0,
    delivered_qty    NUMERIC(12,2) DEFAULT 0,
    unit_price       NUMERIC(12,2),
    line_value       NUMERIC(14,2),
    currency         VARCHAR(3)  DEFAULT 'USD',
    order_status     VARCHAR(20) NOT NULL CHECK (order_status IN ('OPEN','SHIPPED','DELIVERED','CANCELLED','PARTIAL')),
    is_on_time       BOOLEAN,
    is_in_full       BOOLEAN,
    is_otif          BOOLEAN,
    load_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_orders_date   ON analytics.fact_orders(order_date);
CREATE INDEX idx_fact_orders_org    ON analytics.fact_orders(org_id);
CREATE INDEX idx_fact_orders_cust   ON analytics.fact_orders(customer_id);
CREATE INDEX idx_fact_orders_prod   ON analytics.fact_orders(product_id);
CREATE INDEX idx_fact_orders_status ON analytics.fact_orders(order_status);

-- -------------------------------------------------------
-- fact_shipments: shipment line grain
-- -------------------------------------------------------
CREATE TABLE analytics.fact_shipments (
    shipment_line_id  VARCHAR(40) PRIMARY KEY,
    shipment_id       VARCHAR(30) NOT NULL,
    order_line_id     VARCHAR(40) REFERENCES analytics.fact_orders(order_line_id),
    ship_date         DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    delivery_date     DATE,
    org_id            VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    carrier_id        VARCHAR(20) REFERENCES analytics.dim_carrier(carrier_id),
    lane_id           VARCHAR(30) REFERENCES analytics.dim_lane(lane_id),
    product_id        VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    shipped_qty       NUMERIC(12,2) NOT NULL,
    weight_kg         NUMERIC(10,2),
    freight_cost      NUMERIC(12,2),
    currency          VARCHAR(3)  DEFAULT 'USD',
    transit_days_actual   SMALLINT,
    transit_days_planned  SMALLINT,
    is_on_time        BOOLEAN,
    shipment_status   VARCHAR(20) CHECK (shipment_status IN ('IN_TRANSIT','DELIVERED','DELAYED','RETURNED')),
    load_ts           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_shipments_date    ON analytics.fact_shipments(ship_date);
CREATE INDEX idx_fact_shipments_carrier ON analytics.fact_shipments(carrier_id);

-- -------------------------------------------------------
-- fact_inventory_snapshot: daily SKU-location
-- -------------------------------------------------------
CREATE TABLE analytics.fact_inventory_snapshot (
    snapshot_id       VARCHAR(50) PRIMARY KEY,
    snapshot_date     DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    org_id            VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    product_id        VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    on_hand_qty       NUMERIC(12,2) NOT NULL DEFAULT 0,
    in_transit_qty    NUMERIC(12,2) DEFAULT 0,
    allocated_qty     NUMERIC(12,2) DEFAULT 0,
    available_qty     NUMERIC(12,2) DEFAULT 0,
    safety_stock_qty  NUMERIC(12,2) DEFAULT 0,
    unit_cost         NUMERIC(12,2),
    inventory_value   NUMERIC(14,2),
    days_on_hand      NUMERIC(8,1),
    age_bucket        VARCHAR(20) CHECK (age_bucket IN ('0-30','31-60','61-90','90+')),
    is_excess         BOOLEAN     DEFAULT FALSE,
    is_obsolete       BOOLEAN     DEFAULT FALSE,
    load_ts           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_inv_date ON analytics.fact_inventory_snapshot(snapshot_date);
CREATE INDEX idx_fact_inv_org  ON analytics.fact_inventory_snapshot(org_id);
CREATE INDEX idx_fact_inv_prod ON analytics.fact_inventory_snapshot(product_id);

-- -------------------------------------------------------
-- fact_production: daily workcenter/product
-- -------------------------------------------------------
CREATE TABLE analytics.fact_production (
    production_id       VARCHAR(40) PRIMARY KEY,
    production_date     DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    org_id              VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    product_id          VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    planned_qty         NUMERIC(12,2) NOT NULL,
    actual_qty          NUMERIC(12,2) NOT NULL DEFAULT 0,
    scrap_qty           NUMERIC(12,2) DEFAULT 0,
    planned_hours       NUMERIC(8,2),
    actual_hours        NUMERIC(8,2),
    capacity_available  NUMERIC(8,2),
    capacity_used       NUMERIC(8,2),
    schedule_adherence  NUMERIC(5,4),   -- ratio 0..1
    capacity_utilization NUMERIC(5,4),  -- ratio 0..1
    yield_rate          NUMERIC(5,4),   -- ratio 0..1
    load_ts             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_prod_date ON analytics.fact_production(production_date);
CREATE INDEX idx_fact_prod_org  ON analytics.fact_production(org_id);

-- -------------------------------------------------------
-- fact_purchase_orders: PO line grain
-- -------------------------------------------------------
CREATE TABLE analytics.fact_purchase_orders (
    po_line_id        VARCHAR(40) PRIMARY KEY,
    po_id             VARCHAR(30) NOT NULL,
    po_date           DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    promised_date     DATE,
    received_date     DATE,
    org_id            VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    supplier_id       VARCHAR(20) NOT NULL REFERENCES analytics.dim_supplier(supplier_id),
    product_id        VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    ordered_qty       NUMERIC(12,2) NOT NULL,
    received_qty      NUMERIC(12,2) DEFAULT 0,
    unit_cost         NUMERIC(12,2),
    line_value        NUMERIC(14,2),
    currency          VARCHAR(3)  DEFAULT 'USD',
    po_status         VARCHAR(20) CHECK (po_status IN ('OPEN','PARTIAL','RECEIVED','CANCELLED')),
    is_on_time        BOOLEAN,
    lead_time_planned SMALLINT,
    lead_time_actual  SMALLINT,
    quality_ppm       NUMERIC(10,1),
    load_ts           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_po_date     ON analytics.fact_purchase_orders(po_date);
CREATE INDEX idx_fact_po_supplier ON analytics.fact_purchase_orders(supplier_id);

-- -------------------------------------------------------
-- fact_forecast: time bucket + product + org
-- -------------------------------------------------------
CREATE TABLE analytics.fact_forecast (
    forecast_id       VARCHAR(40) PRIMARY KEY,
    forecast_date     DATE        NOT NULL REFERENCES analytics.dim_date(date_key),
    org_id            VARCHAR(20) NOT NULL REFERENCES analytics.dim_org(org_id),
    product_id        VARCHAR(30) NOT NULL REFERENCES analytics.dim_product(product_id),
    forecast_qty      NUMERIC(12,2) NOT NULL,
    actual_qty        NUMERIC(12,2),
    forecast_value    NUMERIC(14,2),
    actual_value      NUMERIC(14,2),
    abs_error         NUMERIC(12,2),
    pct_error         NUMERIC(8,4),
    bias              NUMERIC(8,4),   -- signed: positive = over-forecast
    bucket_type       VARCHAR(10) DEFAULT 'WEEKLY' CHECK (bucket_type IN ('DAILY','WEEKLY','MONTHLY')),
    load_ts           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fact_forecast_date ON analytics.fact_forecast(forecast_date);
CREATE INDEX idx_fact_forecast_org  ON analytics.fact_forecast(org_id);
