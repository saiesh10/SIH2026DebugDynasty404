import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:4000";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [mines, setMines] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/dashboard`),
      fetch(`${API_BASE}/api/mines`)
    ])
      .then(async ([dashboardResponse, minesResponse]) => {
        if (!dashboardResponse.ok || !minesResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const dashboardData = await dashboardResponse.json();
        const minesData = await minesResponse.json();

        return { dashboardData, minesData };
      })
      .then(({ dashboardData, minesData }) => {
        setDashboard(dashboardData);
        setMines(minesData);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">KHAN<span>RAKSHAK</span></div>
          <div className="subtitle">
            Coal Mine Governance & Compliance
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">COMMAND CENTER</p>
            <h1>Mine Compliance Dashboard</h1>
            <p className="hero-text">
              Centralized visibility across mines, compliance, inspections,
              and corrective actions.
            </p>
          </div>
        </section>

        {error && <div className="error">{error}</div>}

        {!dashboard && !error && (
          <div className="loading">Loading dashboard...</div>
        )}

        {dashboard && (
          <>
            <section className="stats-grid">
              <StatCard
                label="TOTAL MINES"
                value={dashboard.mines.total_mines}
                detail="Registered mine sites"
                tone="blue"
              />

              <StatCard
                label="VALID COMPLIANCE"
                value={dashboard.compliance.valid}
                detail={`${dashboard.compliance.expired} expired - ${dashboard.compliance.pending_renewal} pending renewal`}
                tone="green"
              />

              <StatCard
                label="HIGH-RISK INSPECTIONS"
                value={dashboard.inspections.high}
                detail={`${dashboard.inspections.medium} medium - ${dashboard.inspections.low} low`}
                tone="red"
              />

              <StatCard
                label="OPEN ACTIONS"
                value={dashboard.corrective_actions.open}
                detail={`${dashboard.corrective_actions.in_progress} in progress - ${dashboard.corrective_actions.closed} closed`}
                tone="amber"
              />
            </section>

            <section className="panel-grid">
              <div className="panel">
                <div className="panel-header">
                  <h2>Compliance Overview</h2>
                  <span>All mines</span>
                </div>

                <div className="metric-row">
                  <span>Valid</span>
                  <strong className="green-text">
                    {dashboard.compliance.valid}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Pending Renewal</span>
                  <strong className="amber-text">
                    {dashboard.compliance.pending_renewal}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Expired</span>
                  <strong className="red-text">
                    {dashboard.compliance.expired}
                  </strong>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2>Inspection Severity</h2>
                  <span>Recorded findings</span>
                </div>

                <div className="metric-row">
                  <span>High</span>
                  <strong className="red-text">
                    {dashboard.inspections.high}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Medium</span>
                  <strong className="amber-text">
                    {dashboard.inspections.medium}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Low</span>
                  <strong className="green-text">
                    {dashboard.inspections.low}
                  </strong>
                </div>
              </div>
            </section>

            <section className="panel mines-panel">
              <div className="panel-header">
                <h2>Registered Mines</h2>
                <span>{mines.length} mine sites</span>
              </div>

              <div className="mine-list">
                {mines.map((mine) => (
                  <div className="mine-row" key={mine.id}>
                    <div>
                      <strong>{mine.name}</strong>
                      <span>{mine.subsidiary_name}</span>
                    </div>

                    <div className="coordinates">
                      {mine.latitude}, {mine.longitude}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, tone }) {
  return (
    <div className={`stat-card ${tone || ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

export default App;
