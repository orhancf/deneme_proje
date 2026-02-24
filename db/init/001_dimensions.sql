-- ============================================================
-- Supply Chain Control Tower — Dimension Tables
-- Schema: analytics
-- ============================================================

CREATE SCHEMA IF NOT EXISTS analytics;

-- -------------------------------------------------------
-- dim_date: calendar + fiscal dimensions
-- -------------------------------------------------------
CREATE TABLE analytics.dim_date (
    date_key      DATE         PRIMARY KEY,
    day_of_week   SMALLINT     NOT NULL,      -- 1=Mon..7=Sun
    day_name      VARCHAR(10)  NOT NULL,
    week_of_year  SMALLINT     NOT NULL,
    month_num     SMALLINT     NOT NULL,
    month_name    VARCHAR(10)  NOT NULL,
    quarter       SMALLINT     NOT NULL,
    year          SMALLINT     NOT NULL,
    fiscal_month  SMALLINT,
    fiscal_quarter SMALLINT,
    fiscal_year   SMALLINT,
    is_weekend    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_holiday    BOOLEAN      NOT NULL DEFAULT FALSE
);

-- -------------------------------------------------------
-- dim_org: company → plant/DC hierarchy
-- -------------------------------------------------------
CREATE TABLE analytics.dim_org (
    org_id        VARCHAR(20)  PRIMARY KEY,
    org_name      VARCHAR(100) NOT NULL,
    org_type      VARCHAR(20)  NOT NULL CHECK (org_type IN ('COMPANY','PLANT','DC','REGION')),
    parent_org_id VARCHAR(20)  REFERENCES analytics.dim_org(org_id),
    country       VARCHAR(50),
    region        VARCHAR(50),
    city          VARCHAR(50),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dim_org_parent ON analytics.dim_org(parent_org_id);

-- -------------------------------------------------------
-- dim_product: family → category → SKU
-- -------------------------------------------------------
CREATE TABLE analytics.dim_product (
    product_id     VARCHAR(30)  PRIMARY KEY,
    product_name   VARCHAR(150) NOT NULL,
    product_family VARCHAR(50),
    category       VARCHAR(50),
    subcategory    VARCHAR(50),
    uom            VARCHAR(10)  NOT NULL DEFAULT 'EA',
    unit_cost      NUMERIC(12,2),
    unit_price     NUMERIC(12,2),
    weight_kg      NUMERIC(8,3),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dim_product_family ON analytics.dim_product(product_family);

-- -------------------------------------------------------
-- dim_customer: segment, channel, geography
-- -------------------------------------------------------
CREATE TABLE analytics.dim_customer (
    customer_id   VARCHAR(20)  PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    segment       VARCHAR(30),
    channel       VARCHAR(30),
    country       VARCHAR(50),
    region        VARCHAR(50),
    city          VARCHAR(50),
    credit_tier   VARCHAR(10),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dim_customer_segment ON analytics.dim_customer(segment);

-- -------------------------------------------------------
-- dim_supplier
-- -------------------------------------------------------
CREATE TABLE analytics.dim_supplier (
    supplier_id    VARCHAR(20)  PRIMARY KEY,
    supplier_name  VARCHAR(150) NOT NULL,
    country        VARCHAR(50),
    region         VARCHAR(50),
    lead_time_days SMALLINT,
    tier           VARCHAR(10),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- dim_carrier
-- -------------------------------------------------------
CREATE TABLE analytics.dim_carrier (
    carrier_id    VARCHAR(20)  PRIMARY KEY,
    carrier_name  VARCHAR(150) NOT NULL,
    mode          VARCHAR(20)  CHECK (mode IN ('ROAD','AIR','SEA','RAIL','MULTIMODAL')),
    country       VARCHAR(50),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- dim_lane: origin–destination pair
-- -------------------------------------------------------
CREATE TABLE analytics.dim_lane (
    lane_id           VARCHAR(30) PRIMARY KEY,
    origin_org_id     VARCHAR(20) REFERENCES analytics.dim_org(org_id),
    destination_org_id VARCHAR(20),
    origin_country    VARCHAR(50),
    dest_country      VARCHAR(50),
    incoterm          VARCHAR(10),
    standard_transit_days SMALLINT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dim_lane_origin ON analytics.dim_lane(origin_org_id);
