-- ============================================================
-- Supply Chain Control Tower — Application Schema
-- Schema: app
-- ============================================================

CREATE SCHEMA IF NOT EXISTS app;

-- -------------------------------------------------------
-- Users & Roles
-- -------------------------------------------------------
CREATE TABLE app.app_user (
    user_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT         UNIQUE NOT NULL,
    display_name TEXT         NOT NULL,
    avatar_url   TEXT,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE app.app_role (
    role_id      TEXT PRIMARY KEY,
    description  TEXT,
    permissions  JSONB NOT NULL DEFAULT '[]'
);

INSERT INTO app.app_role (role_id, description, permissions) VALUES
('ADMIN',   'Full access + user management',                  '["metrics:read","metrics:admin","dashboards:read","dashboards:export","audit:read","users:manage","config:manage"]'),
('EXEC',    'All dashboards, no raw export',                   '["metrics:read","dashboards:read"]'),
('MANAGER', 'Dashboards + CSV/PDF export',                     '["metrics:read","dashboards:read","dashboards:export"]'),
('ANALYST', 'Deep drill + ad-hoc query',                       '["metrics:read","dashboards:read","dashboards:export","query:adhoc"]'),
('VIEWER',  'Read-only standard dashboards',                   '["metrics:read","dashboards:read"]');

CREATE TABLE app.app_user_role (
    user_id  UUID REFERENCES app.app_user(user_id) ON DELETE CASCADE,
    role_id  TEXT REFERENCES app.app_role(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- -------------------------------------------------------
-- Row-Level Security: user ↔ org access
-- -------------------------------------------------------
CREATE TABLE app.user_org_access (
    user_id  UUID        REFERENCES app.app_user(user_id) ON DELETE CASCADE,
    org_id   VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, org_id)
);

-- -------------------------------------------------------
-- Audit Log
-- -------------------------------------------------------
CREATE TABLE app.audit_log (
    audit_id   BIGSERIAL   PRIMARY KEY,
    user_id    UUID        REFERENCES app.app_user(user_id),
    action     VARCHAR(30) NOT NULL CHECK (action IN ('LOGIN','LOGOUT','DASHBOARD_VIEW','EXPORT','QUERY','CONFIG_CHANGE')),
    resource   TEXT,
    details    JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON app.audit_log(user_id);
CREATE INDEX idx_audit_action ON app.audit_log(action);
CREATE INDEX idx_audit_created ON app.audit_log(created_at DESC);

-- -------------------------------------------------------
-- KPI Catalog
-- -------------------------------------------------------
CREATE TABLE app.kpi_catalog (
    kpi_id            TEXT PRIMARY KEY,
    name              TEXT         NOT NULL,
    description       TEXT,
    owner             TEXT         NOT NULL,
    business_question TEXT,
    formula_business  TEXT         NOT NULL,
    formula_sql       TEXT,
    unit              VARCHAR(10)  DEFAULT '%',
    grain             TEXT,
    dimensions        TEXT[],
    refresh_sla       TEXT,
    source_tables     TEXT[],
    drill_paths       JSONB,
    thresholds        JSONB,       -- {"green": 0.95, "yellow": 0.90, "red": 0}
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- Data Quality Log
-- -------------------------------------------------------
CREATE TABLE app.data_quality_log (
    dq_id         BIGSERIAL   PRIMARY KEY,
    check_name    TEXT         NOT NULL,
    check_type    VARCHAR(20)  NOT NULL CHECK (check_type IN ('FRESHNESS','COMPLETENESS','RECONCILIATION','VOLUME')),
    target_table  TEXT         NOT NULL,
    status        VARCHAR(10)  NOT NULL CHECK (status IN ('PASS','WARN','FAIL')),
    metric_value  NUMERIC(12,4),
    threshold     NUMERIC(12,4),
    details       JSONB,
    checked_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dq_table  ON app.data_quality_log(target_table);
CREATE INDEX idx_dq_status ON app.data_quality_log(status);

-- -------------------------------------------------------
-- Seed demo admin user
-- -------------------------------------------------------
INSERT INTO app.app_user (user_id, email, display_name) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@scct.dev', 'Admin User'),
('a0000000-0000-0000-0000-000000000002', 'director@scct.dev', 'SC Director'),
('a0000000-0000-0000-0000-000000000003', 'analyst@scct.dev', 'Analyst User'),
('a0000000-0000-0000-0000-000000000004', 'viewer@scct.dev', 'Viewer User');

INSERT INTO app.app_user_role (user_id, role_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'ADMIN'),
('a0000000-0000-0000-0000-000000000002', 'EXEC'),
('a0000000-0000-0000-0000-000000000003', 'ANALYST'),
('a0000000-0000-0000-0000-000000000004', 'VIEWER');
