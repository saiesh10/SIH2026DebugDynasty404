import React, { useEffect, useMemo, useState } from "react";
import { getCompliance, getInspections } from "../api/index.js";

function RegulatorDashboard() {
  const [compliance, setCompliance] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getCompliance(),
      getInspections()
    ])
      .then(([complianceData, inspectionData]) => {
        setCompliance(complianceData);
        setInspections(inspectionData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const violations = useMemo(() => {
    const expired = compliance
      .filter((record) => record.status === "expired")
      .map((record) => ({
        id: `compliance-${record.id}`,
        mine_name: record.mine_name,
        type: "expired_compliance",
        description: record.type,
        date: record.expiry_date,
        severity: "high"
      }));

    const highSeverity = inspections
      .filter((inspection) => inspection.severity === "high")
      .map((inspection) => ({
        id: `inspection-${inspection.id}`,
        mine_name: inspection.mine_name,
        type: "high_severity_inspection",
        description: inspection.category,
        date: inspection.inspection_date,
        severity: "high"
      }));

    return [...expired, ...highSeverity].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [compliance, inspections]);

  const filteredViolations =
    filter === "all"
      ? violations
      : violations.filter((violation) => violation.type === filter);

  const expiredCount = compliance.filter(
    (record) => record.status === "expired"
  ).length;

  const highInspectionCount = inspections.filter(
    (inspection) => inspection.severity === "high"
  ).length;

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!compliance.length && !inspections.length) {
    return <div className="loading">Loading regulator dashboard...</div>;
  }

  return (
    <section className="regulator-strata">
      <aside className="legend-rail regulator-rail">
        <div className="legend-title">REGULATOR VIEW</div>

        <div className="legend-item">
          <span className="legend-mark hazard"></span>
          Violation
        </div>

        <div className="legend-item">
          <span className="legend-mark signal"></span>
          Inspection
        </div>

        <div className="legend-item">
          <span className="legend-mark ferrous"></span>
          Compliance
        </div>
      </aside>

      <div className="regulator-content">
        <div className="panel-header">
          <div>
            <div className="eyebrow">REGULATOR / READ ONLY</div>
            <h2>Compliance Inspection Ledger</h2>
          </div>
          <span>TRACEABLE REGISTER</span>
        </div>

        <div className="regulator-status-grid">
          <div className="regulator-status">
            <span>TOTAL VIOLATIONS</span>
            <strong>{violations.length}</strong>
          </div>

          <div className="regulator-status danger">
            <span>EXPIRED COMPLIANCE</span>
            <strong>{expiredCount}</strong>
          </div>

          <div className="regulator-status warning">
            <span>HIGH-SEVERITY INSPECTIONS</span>
            <strong>{highInspectionCount}</strong>
          </div>
        </div>

        <div className="regulator-toolbar">
          <span>FILTER REGISTER</span>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All Violations</option>
            <option value="expired_compliance">
              Expired Compliance
            </option>
            <option value="high_severity_inspection">
              High Severity Inspection
            </option>
          </select>
        </div>

        <div className="regulator-ledger">
          {filteredViolations.map((violation) => (
            <div className="regulator-row" key={violation.id}>
              <div className="ledger-date">
                <strong>{violation.date}</strong>
                <span>{violation.type.replaceAll("_", " ")}</span>
              </div>

              <div className="regulator-mine">
                <strong>{violation.mine_name}</strong>
                <span>{violation.description}</span>
              </div>

              <div className="violation-stamp">
                {violation.severity.toUpperCase()}
              </div>
            </div>
          ))}

          {filteredViolations.length === 0 && (
            <div className="ledger-empty">
              No violations match the selected filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RegulatorDashboard;
