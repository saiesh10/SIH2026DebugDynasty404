import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function Compliance() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/compliance`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load compliance records");
        }
        return response.json();
      })
      .then(setRecords)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Compliance Records</h2>
        <span>{records.length} records</span>
      </div>

      <div className="mine-list">
        {records.map((record) => (
          <div className="mine-row" key={record.id}>
            <div>
              <strong>{record.mine_name}</strong>
              <span>
                {record.type} - Officer: {record.responsible_officer}
              </span>
            </div>

            <div className="coordinates">
              {record.status} - Expires:{" "}
              {new Date(record.expiry_date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Compliance;

