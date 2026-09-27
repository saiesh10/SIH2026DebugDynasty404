k# KhanRakshak

Integrated governance and compliance platform for coal mines. The demo uses synthetic records; it is not connected to live mine or regulator systems.

## Requirements

- Node.js 18 or newer
- Docker Desktop with Docker Compose

## Run locally

From the repository root, create the backend environment file and start PostgreSQL:

```powershell
Copy-Item backend/.env.example backend/.env
npm install
npm run db:up
npm run install:all
npm run dev
```

PostgreSQL runs on port `5432`; on its first start Docker initializes the database with the scripts in `backend/seed` in filename order. The API is at `http://localhost:4000` and the Vite app is at `http://localhost:5173` (Vite selects the next available port if that one is occupied). Open `/health` on the API to check that Express is running.

If you already have a database created from an earlier version of this project, apply the additive schema upgrade once with `docker compose exec -T db psql -U khanrakshak -d khanrakshak -f /docker-entrypoint-initdb.d/03_upgrade_existing_installations.sql`.

To reset the demo database and rerun the seed scripts, stop the database and remove its named volume with `docker compose down -v`, then run `npm run db:up` again. This deletes local database data.

## Demo data

The seed includes three subsidiaries, ten mines, contractors, compliance clearances, inspections, corrective actions, and field reports. Records are synthetic and deliberately include expired clearances and overdue actions so the risk and regulator views have something to show.

## API

- `GET /health`
- CRUD resources: `/api/subsidiaries`, `/api/mines`, `/api/contractors`, `/api/compliance`, `/api/inspections`, `/api/corrective-actions`
- `/api/field-reports`, `/api/notifications`, `/api/risk/:mineId`, `/api/dashboard`

The field report screen captures GPS, selects the nearest seeded mine, supports a camera/photo attachment, and queues submissions in IndexedDB while offline for sync after connectivity returns.
