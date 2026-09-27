import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000";

function RiskView() {
  const [risks, setRisks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/mines`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load mines");
        }
        return response.json();
      })
      .then(async (mines) => {
        const results = await Promise.all(
          mines.map(async (mine) => {
            const response = await fetch(`${API_BASE}/api/risk/${mine.id}`);

            if (!response.ok) {
              throw new Error(`Failed to load risk for ${mine.name}`);
            }

            return response.json();
          })
        );

        setRisks(results);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="panel mines-panel">
      <div className="panel-header">
        <h2>Mine Risk Overview</h2>
        <span>{risks.length} mines assessed</span>
      </div>

      <div className="mine-list">
        {risks.map((risk) => (
          <div className="mine-row" key={risk.mine.id}>
            <div>
              <strong>{risk.mine.name}</strong>
              <span>
                Risk score: {risk.risk_score} - Level: {risk.risk_level}
              </span>
            </div>

            <div className="coordinates">
              High inspections: {risk.inspections.high}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RiskView;
