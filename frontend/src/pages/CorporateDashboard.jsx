import React, { useEffect, useState } from "react";
import {
  getDashboard,
  getMines,
  getMineRisk
} from "../api/index.js";

function CorporateDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [risks, setRisks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getMines()
    ])
      .then(async ([dashboardData, mines]) => {
        const riskData = await Promise.all(
          mines.map((mine) => getMineRisk(mine.id))
        );

        setDashboard(dashboardData);
        setRisks(riskData);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!dashboard) {
    return <div className="loading">Loading corporate dashboard...</div>;
  }

  return (
    <section className="corporate-strata">
      <aside className="legend-rail corporate-rail">
        <div className="legend-title">CORPORATE CONTROL</div>

        <div className="legend-item">
          <span className="legend-mark ferrous"></span>
          Risk
        </div>

        <div className="legend-item">
          <span className="legend-mark signal"></span>
          Attention
        </div>

        <div className="legend-item">
          <span className="legend-mark hazard"></span>
          Critical
        </div>
      </aside>

      <div className="corporate-content">
        <div className="panel-header">
          <div>
            <div className="eyebrow">CORPORATE / CROSS-MINE CONTROL</div>
            <h2>Portfolio Risk Register</h2>
          </div>
          <span>LIVE RISK MODEL</span>
        </div>

        <div className="corporate-metrics">
          <div className="corporate-metric">
            <span>MINES</span>
            <strong>{dashboard.mines.total_mines}</strong>
          </div>

          <div className="corporate-metric">
            <span>VALID COMPLIANCE</span>
            <strong>{dashboard.compliance.valid}</strong>
          </div>

          <div className="corporate-metric">
            <span>EXPIRED</span>
            <strong className="danger-text">
              {dashboard.compliance.expired}
            </strong>
          </div>

          <div className="corporate-metric">
            <span>OPEN ACTIONS</span>
            <strong>{dashboard.corrective_actions.open}</strong>
          </div>
        </div>

        <div className="risk-register">
          <div className="risk-register-header">
            <span>MINE RISK / RULE + MODEL SIGNAL</span>
            <strong>{risks.length} MINES</strong>
          </div>

          {risks.map((risk) => {
            const gaugeValue = Math.min(risk.risk_score, 120);
            const gaugeDegrees = (gaugeValue / 120) * 180;

            return (
              <div className="risk-row" key={risk.mine.id}>
                <div className="risk-mine">
                  <strong>{risk.mine.name}</strong>
                  <span>
                    {risk.risk_flags?.length || 0} rule flags; {" "}
                    {risk.anomaly_model?.anomalies?.length || 0} model anomalies
                  </span>
                </div>

                <div className="risk-gauge">
                  <div
                    className="risk-dial"
                    style={{
                      "--gauge-degrees": `${gaugeDegrees}deg`
                    }}
                  >
                    <div className="risk-dial-inner">
                      <strong>{risk.risk_score}</strong>
                      <span>RISK</span>
                    </div>
                  </div>
                </div>

                <div className={`risk-level ${risk.risk_level}`}>
                  {risk.risk_level.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CorporateDashboard;
