# Antigravity Master Prompt (v1) — Supply Chain Control Tower (Reporting-Only)

## Mission
Google Antigravity içindeki ajanları kullanarak, **kurumsal seviyede “Supply Chain Control Tower” benzeri, SADECE raporlama/analitik odaklı** bir web uygulaması geliştir.

Bu ürün:
- Operasyonel sistemleri (ERP/WMS/TMS/MES/CRM/SRM) **değiştirmez**; sadece okur.
- “Tek versiyon gerçek” (single source of truth) mantığında KPI’ları standartlaştırır.
- Yönetici panoları + drill-down + exception cockpit + KPI sözlüğü sağlar.

Antigravity ajanlarının çıktıları **doğrulanabilir artefaktlar** olmalı: görev listesi, mimari diyagramlar, şema, test raporu, örnek dashboard JSON’ları vb.

## Target Outcome (Definition of Done)
1) Çalışan web uygulaması (local dev) + README + seed demo data
2) Veri modeli (star schema) + örnek ETL/ELT job’ları
3) KPI Metrics Library (tanım, formül, owner, refresh, grain, source)
4) Rol bazlı yetki (RBAC) + audit log + row-level security yaklaşımı
5) 8–12 dashboard + drill-down sayfaları + export (PDF/CSV) + schedule
6) Data quality monitor (freshness, completeness, reconciliation checks)
7) Testler: unit + API contract + smoke + basic e2e

## Constraints (Hard Rules)
- Reporting-only: UI/API hiçbir iş emri/sipariş/stok hareketi yaratmayacak; **yazma yok**, sadece okuma.
- KPI tanımları ve metrikler “Metric Catalog” üzerinden yönetilecek; her grafik katalogdan beslenecek.
- Performans hedefi: P95 dashboard load < 2.0s (cache ile), P95 API < 500ms (cache ile).
- Güvenlik: SSO-ready (OIDC/SAML placeholder), RBAC, audit trail, PII masking.
- Multi-company / multi-site: Organizasyon/tesis kırılımları first-class entity.

## Preferred Stack (If no prior constraints)
- Frontend: Next.js (App Router) + TypeScript + Tailwind + TanStack Query
- Charts: ECharts veya Recharts
- Backend: NestJS (TypeScript) veya FastAPI (Python) — tercih NestJS
- DB: PostgreSQL (analytics schema + app schema)
- ELT: dbt (SQL) + scheduled jobs (node-cron)
- Auth: NextAuth (OIDC placeholder) + RBAC tables
- Observability: OpenTelemetry + structured logs
- Deployment: Docker opsiyonel; local dev için make scripts

> Eğer repo zaten farklı bir stack kullanıyorsa, mevcut stack’e uyum sağla ve sadece gerekli eklemeleri yap.

## Data Domains (Minimum)
- Orders: sales orders, open orders, backlog, OTIF
- Inventory: on-hand, in-transit, aging, safety stock
- Supply: production plan, schedule adherence, capacity
- Procurement: PO, supplier OT, lead time variance, quality
- Logistics: shipments, freight cost, transit times, carrier OT
- Finance layer (reporting): revenue, COGS proxy, working capital proxy, cash-to-cash

## KPI Library (Minimum)
- OTIF %, OTD %, Fill Rate %
- Inventory Turns, DOH (days of hand), Stockout Rate, Excess & Obsolete
- Forecast Accuracy (WAPE/MAPE) + Bias
- Production Schedule Adherence %, Capacity Utilization
- Supplier OT %, Lead Time Variance, Supplier PPM
- Freight Cost / Unit, Transit Time Variance
- Cash-to-Cash Cycle (proxy), Working Capital (proxy)

## UX Principles (Control Tower Feel)
- Executive “Command Center” landing
- Exception-first: KPI tile → “why?” panel (top drivers)
- Drill-down: company → plant/DC → product family → SKU → order line
- Global filters: time, org, customer segment, product hierarchy, incoterm, channel
- Consistent glossary: KPI definitions hover + link to catalog

## Agent Orchestration
Create these agents and run in parallel:
1) Solution Architect: architecture + domain model + security model + backlog
2) Data Engineer: source mapping + warehouse schema + dbt models + quality tests
3) Backend Engineer: APIs (metrics, dimensions, auth, audit) + caching
4) Frontend Engineer: dashboard shell + filters + charts + drill-down UX
5) QA/Release: test plan + smoke/e2e + CI scripts + release notes

## Deliverables to Produce as Artifacts
- ARCHITECTURE.md (diagram + decisions)
- DATA_MODEL.md (ERD + star schema + dimensions/facts)
- KPI_CATALOG.md (definitions + SQL examples)
- RUNBOOK.md (how to run + seed data + troubleshooting)
- SECURITY.md (RBAC matrix + audit + RLS approach)
- Dashboard specs (JSON/YAML): each dashboard’s visuals, filters, metrics

## Implementation Plan (High Level)
Phase 0 — Repo bootstrap & scaffolding
Phase 1 — Data model + seed demo dataset
Phase 2 — Metric Catalog + compute layer (dbt views/materializations)
Phase 3 — API layer (metrics endpoints + caching)
Phase 4 — UI dashboards + drill-down + exports
Phase 5 — Data quality & reconciliation + alerting
Phase 6 — Security hardening + audit + RLS
Phase 7 — Tests + CI + performance checks

## Acceptance Criteria (Must Pass)
- All dashboards render with demo data
- “Metric Catalog” is the single place for KPI definition + ownership
- A user with role VIEWER sees only allowed org units
- Exports (CSV/PDF) work for at least 3 key dashboards
- Data freshness monitor shows last load timestamp + % completeness
- README gives one-command start (or minimal steps) for local run

## Start Now
1) Inspect repository structure; propose architecture aligned with existing patterns.
2) Produce the task list (checklist) with owners and estimates.
3) Scaffold the project and implement Phase 0–2 first.
