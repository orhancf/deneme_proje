# Runbook — Supply Chain Control Tower

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose

## One-Command Start

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready -U scct -d scct_db

# 3. Seed demo data
cd db/seed && npm install && npm run seed && cd ../..

# 4. Start backend
cd backend && npm install && npm run start:dev &

# 5. Start frontend
cd frontend && npm install && npm run dev &
```

## URLs

| Service | URL |
| ------- | --- |
| Frontend | <http://localhost:3000> |
| Backend API | <http://localhost:3001/api> |
| Swagger Docs | <http://localhost:3001/api/docs> |
| PostgreSQL | localhost:5432 (user: scct, password: scct_dev_2024) |

## Seed Data

The seed script generates:

- 365 days calendar (2025)
- 2 companies, 4 plants, 4 DCs
- 45 products across 5 families
- 20 customers, 10 suppliers, 5 carriers
- ~50K order lines, ~35K shipments, ~80K inventory snapshots
- ~25K production records, ~18K PO lines, ~15K forecasts
- 20 KPI catalog entries with full metadata

To re-seed: `docker-compose down -v && docker-compose up -d` then run seed again.

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| Port 5432 in use | `docker-compose down` or change port in docker-compose.yml |
| Seed fails | Ensure PostgreSQL is running: `docker-compose ps` |
| Backend can't connect to DB | Check `.env` matches docker-compose settings |
| Frontend 404 on API calls | Ensure backend is running on port 3001 |
| Charts show demo data | Backend API is not connected, start it with `npm run start:dev` |
