import React, { useEffect, useState } from "react";
import {
  getMines,
  getCompliance,
  getCorrectiveActions
} from "../api/index.js";

function MineOfficialDashboard() {
  const [mines, setMines] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getMines(),
      getCompliance(),
      getCorrectiveActions()
    ])
      .then(([minesData, complianceData, actionsData]) => {
        setMines(minesData);
        setCompliance(complianceData);
        setActions(actionsData);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!mines.length && !compliance.length && !actions.length) {
    return <div className="loading">Loading mine official dashboard...</div>;
  }

  const openActions = actions.filter(
    (action) => action.status === "open"
  );

  const upcomingExpiries = compliance.filter(
    (record) => record.status === "pending_renewal"
  );

  const expired = compliance.filter(
    (record) => record.status === "expired"
  );

  const valid = compliance.filter(
    (record) => record.status === "valid"
  );

  return (
    <section className="mine-strata">
      <aside className="legend-rail">
        <div className="legend-title">SITE LEDGER</div>
        <div className="legend-item">
          <span className="legend-mark ferrous"></span>
          Compliance
        </div>
        <div className="legend-item">
          <span className="legend-mark signal"></span>
          Corrective Action
        </div>
        <div className="legend-item">
          <span className="legend-mark hazard"></span>
          Expired
        </div>
      </aside>

      <div className="mine-content">
        <div className="panel-header">
          <div>
            <div className="eyebrow">MINE OFFICIAL / SITE CONTROL</div>
            <h2>Mine Governance Ledger</h2>
          </div>
          <span>LIVE REGISTER</span>
        </div>

        <div className="status-grid">
          <div className="status-cell">
            <span className="status-label">REGISTERED MINES</span>
            <strong>{mines.length}</strong>
            <small>Active mine records</small>
          </div>

          <div className="status-cell">
            <span className="status-label">VALID COMPLIANCE</span>
            <strong>{valid.length}</strong>
            <small>Current clearances</small>
          </div>

          <div className="status-cell warning">
            <span className="status-label">PENDING RENEWAL</span>
            <strong>{upcomingExpiries.length}</strong>
            <small>Renewal attention</small>
          </div>

          <div className="status-cell danger">
            <span className="status-label">EXPIRED</span>
            <strong>{expired.length}</strong>
            <small>Immediate review</small>
          </div>
        </div>

        <div className="ledger-panel">
          <div className="ledger-heading">
            <span>OPEN CORRECTIVE ACTIONS</span>
            <strong>{openActions.length}</strong>
          </div>

          {openActions.length === 0 ? (
            <div className="ledger-empty">
              No open corrective actions.
            </div>
          ) : (
            openActions.slice(0, 8).map((action) => (
              <div className="ledger-row" key={action.id}>
                <div>
                  <strong>{action.mine_name}</strong>
                  <span>{action.description}</span>
                </div>
                <div className="ledger-meta">
                  <span>{action.due_date}</span>
                  <b>OPEN</b>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default MineOfficialDashboard;
