import React, { useEffect, useState } from "react";
import {
  getMines,
  getCompliance,
  getCorrectiveActions,
  getInspections,
  createInspection
} from "../api/index.js";

function MineOfficialDashboard() {
  const [mines, setMines] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [actions, setActions] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [selectedMineId, setSelectedMineId] = useState("");
  const [form, setForm] = useState({
    inspector_name: "",
    inspection_date: new Date().toISOString().slice(0, 10),
    category: "safety",
    findings: "",
    severity: "medium"
  });
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    Promise.all([
      getMines(),
      getCompliance(),
      getCorrectiveActions(),
      getInspections()
    ])
      .then(([minesData, complianceData, actionsData, inspectionsData]) => {
        setMines(minesData);
        setCompliance(complianceData);
        setActions(actionsData);
        setInspections(inspectionsData);
        setSelectedMineId(String(minesData[0]?.id || ""));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!mines.length && !compliance.length && !actions.length && !inspections.length) {
    return <div className="loading">Loading mine official dashboard...</div>;
  }

  const selectedMine = mines.find((mine) => mine.id === Number(selectedMineId));
  const mineCompliance = compliance.filter((record) => record.mine_id === Number(selectedMineId));
  const openActions = actions.filter(
    (action) => action.mine_id === Number(selectedMineId) && action.status === "open"
  );
  const mineInspections = inspections.filter(
    (inspection) => inspection.mine_id === Number(selectedMineId)
  );
  const upcomingExpiries = mineCompliance.filter((record) => record.status === "pending_renewal");
  const expired = mineCompliance.filter((record) => record.status === "expired");
  const valid = mineCompliance.filter((record) => record.status === "valid");

  async function logInspection(event) {
    event.preventDefault();
    if (!selectedMine) return;
    setFormMessage("");
    try {
      const inspection = await createInspection({
        ...form,
        mine_id: selectedMine.id
      });
      setInspections((current) =>
        [{ ...inspection, mine_id: selectedMine.id, mine_name: selectedMine.name }, ...current]
      );
      setForm((current) => ({ ...current, findings: "" }));
      setFormMessage("Inspection logged.");
    } catch (submitError) {
      setFormMessage(submitError.message);
    }
  }

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
          <label className="mine-picker">
            <span>ACTIVE SITE</span>
            <select
              value={selectedMineId}
              onChange={(event) => setSelectedMineId(event.target.value)}
              aria-label="Select mine site"
            >
              {mines.map((mine) => (
                <option key={mine.id} value={mine.id}>{mine.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="status-grid">
          <div className="status-cell">
            <span className="status-label">SITE CLEARANCES</span>
            <strong>{mineCompliance.length}</strong>
            <small>{selectedMine?.name || "Selected site"}</small>
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
                  <strong>{action.due_date < new Date().toISOString().slice(0, 10) ? "OVERDUE" : "DUE"}</strong>
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

        <section className="site-register">
          <div className="ledger-heading">
            <span>STATUTORY COMPLIANCE</span>
            <strong>{mineCompliance.length}</strong>
          </div>
          {mineCompliance.length === 0 ? (
            <div className="ledger-empty">No clearances are recorded for this mine. Add its current statutory documents.</div>
          ) : mineCompliance.map((record) => (
            <div className="compliance-row" key={record.id}>
              <div>
                <strong>{record.type.replaceAll("_", " ")}</strong>
                <span>{record.responsible_officer || "Officer not assigned"}</span>
              </div>
              <span>{new Date(record.expiry_date).toLocaleDateString("en-IN")}</span>
              <b className={`compliance-status ${record.status}`}>{record.status.replaceAll("_", " ")}</b>
            </div>
          ))}
        </section>

        <section className="site-register">
          <div className="ledger-heading">
            <span>INSPECTION LEDGER</span>
            <strong>{mineInspections.length}</strong>
          </div>
          {mineInspections.length === 0 ? (
            <div className="ledger-empty">No inspections are recorded for this mine.</div>
          ) : mineInspections.map((inspection) => (
            <div className="inspection-row" key={inspection.id}>
              <time>{new Date(inspection.inspection_date).toLocaleDateString("en-IN")}</time>
              <div>
                <strong>{inspection.category} inspection</strong>
                <span>{inspection.findings || "No findings recorded"}</span>
              </div>
              <b className={`severity-label ${inspection.severity}`}>{inspection.severity}</b>
            </div>
          ))}
        </section>

        <form className="inspection-form" onSubmit={logInspection}>
          <div className="ledger-heading"><span>LOG INSPECTION</span></div>
          <div className="inspection-fields">
            <label>
              Inspector
              <input
                value={form.inspector_name}
                onChange={(event) => setForm({ ...form, inspector_name: event.target.value })}
                required
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={form.inspection_date}
                onChange={(event) => setForm({ ...form, inspection_date: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="safety">Safety</option>
                <option value="environment">Environment</option>
                <option value="labour">Labour</option>
              </select>
            </label>
            <label>
              Severity
              <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="inspection-findings">
              Findings
              <textarea
                value={form.findings}
                onChange={(event) => setForm({ ...form, findings: event.target.value })}
                rows="3"
                required
              />
            </label>
          </div>
          <div className="inspection-submit">
            <button type="submit">Log inspection</button>
            {formMessage && <span role="status">{formMessage}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}

export default MineOfficialDashboard;
