# Supply Chain Control Tower — Reporting & Analytics

> Enterprise-grade, **read-only** supply chain reporting platform.  
> Single source of truth for KPIs across Plan, Source, Make, Deliver, and Inventory.

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **Docker** (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Seed Demo Data

```bash
cd db/seed
npm install
npm run seed
cd ../..
```

### 3. Start Backend (NestJS, port 3001)

```bash
cd backend
npm install
npm run start:dev
```

### 4. Start Frontend (Next.js, port 3000)

```bash
cd frontend
npm install
npm run dev
```

### 5. Open in Browser

- **Dashboard:** <http://localhost:3000>  
- **API Docs:** <http://localhost:3001/api/docs>

---

## 📁 Project Structure

```text
├── frontend/       → Next.js 14 (App Router + TypeScript + Tailwind)
│   └── src/
│       ├── app/    → 8 dashboard pages + KPI Catalog + Audit
│       ├── components/  → KpiTile, ChartCard, Sidebar
│       └── lib/    → API client
├── backend/        → NestJS (TypeScript)
│   └── src/
│       ├── metrics/     → KPI catalog & query endpoints
│       ├── dimensions/  → Filter dropdown data
│       ├── health/      → Data freshness & quality
│       └── audit/       → Activity audit trail
├── db/
│   ├── init/       → DDL scripts (auto-run by PostgreSQL)
│   └── seed/       → Demo data generator
├── docs/           → Architecture, Data Model, KPI Catalog, Security
└── docker-compose.yml
```

---

## 📊 Dashboards (8 Pages)

| Dashboard | KPIs | Description |
| --------- | ---- | ----------- |
| **Command Center** | OTIF, OTD, Fill Rate, Backlog, DOH, Schedule Adherence, Supplier OT, Freight | Executive overview with exception feed |
| **Plan** | Forecast Accuracy, Bias, Backlog Trend | Demand & forecast monitoring |
| **Source** | Supplier OT, Lead Time Variance, PPM | Procurement & supplier scorecard |
| **Make** | Schedule Adherence, Capacity Utilization, Yield | Production performance |
| **Deliver** | Carrier OT, Freight Cost/Unit, Transit Variance | Logistics & carrier scorecard |
| **Inventory** | DOH, Turns, Stockout, E&O, Aging | Stock health & site breakdown |
| **Data Quality** | Freshness, Completeness, Reconciliation | Data pipeline health |
| **KPI Catalog** | All 20 KPIs | Searchable metric definitions |

---

## 🔑 API Endpoints

All endpoints are **read-only**.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/metrics` | List KPI catalog |
| GET | `/api/metrics/:kpiId` | KPI definition |
| POST | `/api/metrics/query` | Query metric data |
| GET | `/api/dimensions` | List dimension names |
| GET | `/api/dimensions/:name` | Dimension members |
| GET | `/api/health` | Health check |
| GET | `/api/health/freshness` | Data freshness |
| GET | `/api/audit` | Audit trail |

Full Swagger docs at `http://localhost:3001/api/docs`.

---

## 🗄️ Data Model (Star Schema)

**Dimensions:** date, org, product, customer, supplier, carrier, lane  
**Facts:** orders, shipments, inventory_snapshot, production, purchase_orders, forecast

See [docs/DATA_MODEL.md](docs/DATA_MODEL.md) for ERD and table details.

---

## 🔐 Security Model

- **RBAC Roles:** ADMIN, EXEC, MANAGER, ANALYST, VIEWER
- **Row-Level Security:** `user_org_access` table scopes data by organization
- **Audit Log:** All dashboard views, exports, and queries are logged
- **SSO Ready:** OIDC/SAML placeholder via NextAuth

See [docs/SECURITY.md](docs/SECURITY.md) for the full matrix.

---

## 📝 Demo Users

| Email | Role | Org Access |
| ----- | ---- | ---------- |
| <admin@scct.dev> | ADMIN | All organizations |
| <director@scct.dev> | EXEC | All organizations |
| <analyst@scct.dev> | ANALYST | All organizations |
| <viewer@scct.dev> | VIEWER | Acme Global Corp only |
