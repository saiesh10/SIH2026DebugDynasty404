<div align="center">

# KhanRakshak

### Mine governance, compliance, and field reporting in one operational workspace

**Smart India Hackathon project | Team Debug Dynasty 404**

</div>

KhanRakshak is a prototype for bringing mine-site compliance, inspections, risk signals, and field observations into one shared workflow. It provides focused views for mine officials, corporate teams, regulators, and field workers.

> **Demo scope:** This project runs on synthetic seed data. It is not connected to live mine records, government portals, or regulator systems. The role tabs are demonstration views, not authentication or access-control boundaries.

## At A Glance

- Track statutory clearances, inspection history, and corrective actions by mine.
- Surface portfolio risk signals using rule-based checks, anomaly indicators, and trend projections.
- Review expired compliance and high-severity inspection records in a regulator-oriented ledger.
- Capture field observations with GPS, photos, and voice notes; queue reports locally while offline and sync when connectivity returns.
- Receive alerts for expired or soon-to-expire clearances and overdue corrective actions.

## Product Screens

Screens below were captured from the running application with the included demo data.

### Mine Official

Mine-level clearance status, corrective actions, inspection history, and inspection logging.

![Mine Official dashboard](frontend/public/mine-official.png)

### Corporate

Cross-mine portfolio summary and risk register with mine-level rule and model signals.

![Corporate risk dashboard](frontend/public/corporate.png)

### Regulator

Read-only view of expired clearances and high-severity inspection records, with filters.

![Regulator dashboard](frontend/public/regulator.png)

### Field Report

Offline-first field capture for GPS location, observation category, photo, and voice note.

![Field report screen](frontend/public/field-report.png)

## System Architecture

```mermaid
flowchart LR
		MineUser[Mine official]
		CorporateUser[Corporate reviewer]
		RegulatorUser[Regulator reviewer]
		FieldUser[Field worker]

		subgraph Client[React client and PWA]
				Views[Role-based dashboard views]
				ApiClient[Fetch API client]
				ShellCache[Service worker app-shell cache]
				OfflineQueue[IndexedDB report queue]
		end

		subgraph Server[Node.js and Express API]
				Routes[REST routes]
				Risk[Risk rules, anomaly indicators, trend forecast]
				Alerts[15-minute alert scheduler]
		end

		Database[(PostgreSQL)]

		MineUser --> Views
		CorporateUser --> Views
		RegulatorUser --> Views
		FieldUser --> Views
		Views --> ApiClient
		Views --> ShellCache
		Views --> OfflineQueue
		OfflineQueue -->|Reconnect and sync| ApiClient
		ApiClient --> Routes
		Routes --> Database
		Routes --> Risk
		Risk --> Database
		Alerts --> Database
```

The React client is served by Vite during development. The Express API owns data access and business calculations, and PostgreSQL stores the demo records. The browser service worker caches the application shell; pending field reports are stored separately in IndexedDB and submitted to the API when the browser is online.

## Workflows

1. **Mine governance:** The Mine Official view loads mines, compliance records, corrective actions, and inspections. Selecting a mine filters its ledger; officials can submit a new inspection.
2. **Portfolio risk:** The Corporate view loads the dashboard summary and requests risk results for each mine. Risk scores combine expired and pending compliance with high- and medium-severity inspection counts. Rule flags add context for overdue actions, lapsed permits, and inspection cadence; anomaly and trend indicators are also returned.
3. **Regulatory review:** The Regulator view combines expired compliance records and high-severity inspections into a dated register, then lets reviewers filter by violation type.
4. **Field capture:** The Field Report view captures device coordinates, estimates the nearest mine from the seeded mine locations, and accepts an observation, photo, and optional voice note. If the API is unavailable, the report is queued in IndexedDB and retried when connectivity returns.
5. **Alerts:** A backend scheduler checks compliance and corrective-action dates at startup and every 15 minutes, adding fingerprinted notifications to avoid duplicate alerts.

Risk and forecast outputs are prototype decision-support signals based on the included data and code. They are not certified safety assessments or substitutes for statutory inspection and professional judgment.

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, CSS, browser service worker |
| Backend | Node.js, Express 5, PostgreSQL client (`pg`) |
| Database | PostgreSQL 16, SQL schema and demo seed scripts |
| Offline field queue | IndexedDB, browser Geolocation and MediaRecorder APIs |
| Risk signals | Rule engine, z-score anomaly indicator, linear trend projection |

## Run Locally

### Prerequisites

- Node.js 18 or newer and npm.
- Docker Desktop with Docker Compose, running before database startup.
- Git to clone the repository.

### 1. Get the code and install dependencies

```sh
git clone <repository-url>
cd khanrakshak
npm install
npm run install:all
```

`npm install` installs the root development tool; `npm run install:all` installs the backend and frontend dependencies.

### 2. Configure the backend

Create the local environment file from the example.

**Windows PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS or Linux**

```sh
cp backend/.env.example backend/.env
```

The example is configured for the included Docker database (`localhost:5432`). Its demo credentials are for local development only; use managed secrets and a restricted database account for any deployed environment. Do not commit `backend/.env`.

### 3. Start PostgreSQL and the app

```sh
npm run db:up
npm run dev
```

On its first start with an empty Docker volume, PostgreSQL runs the SQL files in `backend/seed` in filename order and loads the demo data. The development command starts the API and Vite client together.

- Web application: `http://localhost:5173` (Vite may choose the next free port).
- API health check: `http://localhost:4000/health`.
- API base: `http://localhost:4000/api`.

The health endpoint confirms the Express process is running. Dashboard data also requires a reachable PostgreSQL database.

### Database port conflicts

If another local PostgreSQL server is already using port `5432`, either stop that service or change the host-side port mapping in `docker-compose.yml` from `5432:5432` to `5433:5432`. Then update `DATABASE_URL` in `backend/.env` to use port `5433`. Keep the container-side port at `5432`.

### Existing database installations

Docker initialization scripts run only when the database volume is first created. For an existing project database, apply the additive upgrade script when needed:

```sh
docker compose exec -T db psql -U khanrakshak -d khanrakshak -f /docker-entrypoint-initdb.d/03_upgrade_existing_installations.sql
```

Avoid deleting the Docker database volume unless you intend to erase its local data.

### Build check

```sh
npm run build --prefix frontend
```

## Demo Dataset

The seed scripts create three subsidiaries, ten mines, twenty contractors, forty compliance records, sixty inspections, corrective actions, and field reports. Some records are deliberately expired or overdue so the risk and regulator workflows have meaningful examples. The data is synthetic and will not reflect current real-world mine status.

## API Reference

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check that the API process is running. |
| `/api/mines` | Mine listing and mine record operations. |
| `/api/compliance` | Compliance record operations. |
| `/api/inspections` | Inspection operations, including logging an inspection. |
| `/api/corrective-actions` | Corrective action operations. |
| `GET /api/dashboard` | Portfolio summary counts. |
| `GET /api/risk/:mineId` | Mine-level score, flags, anomaly indicators, and forecast. |
| `/api/field-reports` | List and create field reports. |
| `/api/notifications` | List alerts; `PATCH /:id/read` acknowledges an alert. |
| `/api/subsidiaries`, `/api/contractors` | Registry operations. |

## Repository Layout

```text
backend/
	seed/                 PostgreSQL schema, demo data, upgrade script
	src/routes/            Express API endpoints
	src/risk/              Risk rules and trend/anomaly helpers
	src/jobs/              Scheduled alert generation
frontend/
	public/                PWA assets and product screenshots
	src/pages/             Mine, corporate, regulator, and field views
	src/api/               API client and offline report queue
docker-compose.yml       Local PostgreSQL service
```

## Team

**Team name:** Debug Dynasty 404

- Saiesh Upardekar
- Sambhav Savant
- Saisha Dessai
- Anuja Patil
- Sayyam Agrekar
- Reshab Dessai

## Important Limitations

- The current build is a hackathon prototype using synthetic records.
- External government, mine-management, and regulator integrations are not configured.
- Risk indicators are illustrative and require validation against domain-approved data and methods before operational use.
