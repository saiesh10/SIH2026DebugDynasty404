import React, { useState } from "react";
import { createFieldReport } from "../api/index.js";

function FieldReport() {
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("safety_observation");
  const [observation, setObservation] = useState("");
  const [message, setMessage] = useState("");

  function captureLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setMessage("Location captured.");
      },
      () => {
        setMessage("Unable to capture location.");
      }
    );
  }

  async function prepareReport(event) {
    event.preventDefault();

    if (!location) {
      setMessage("Capture location before preparing the field report.");
      return;
    }

    if (!observation.trim()) {
      setMessage("Enter an observation before preparing the report.");
      return;
    }

    try {
      await createFieldReport({
        mine_id: 1,
        latitude: location.latitude,
        longitude: location.longitude,
        category,
        observation
      });

      setMessage("Field report synchronized successfully.");
      setObservation("");
    } catch (error) {
      setMessage(`Unable to synchronize field report: ${error.message}`);
    }
  }

  return (
    <section className="field-strata">
      <aside className="legend-rail field-rail">
        <div className="legend-title">FIELD PWA</div>
        <div className="legend-item"><span className="legend-mark ferrous"></span>Location</div>
        <div className="legend-item"><span className="legend-mark signal"></span>Observation</div>
        <div className="legend-item"><span className="legend-mark hazard"></span>Incident</div>
      </aside>

      <div className="field-content">
        <div className="panel-header">
          <div>
            <div className="eyebrow">FIELD / OFFLINE-FIRST CAPTURE</div>
            <h2>Field Inspection Report</h2>
          </div>
          <span>READY FOR SYNC</span>
        </div>

        <form className="field-form" onSubmit={prepareReport}>
          <div className="field-location">
            <div>
              <span className="field-label">GPS LOCATION</span>
              <strong>
                {location
                  ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                  : "Location not captured"}
              </strong>
            </div>

            <button type="button" onClick={captureLocation}>
              {location ? "Recapture Location" : "Capture Location"}
            </button>
          </div>

          <div className="field-section">
            <label className="field-label" htmlFor="category">REPORT CATEGORY</label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="safety_observation">Safety Observation</option>
              <option value="incident">Incident</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>

          <div className="field-section">
            <label className="field-label" htmlFor="observation">FIELD OBSERVATION</label>
            <textarea
              id="observation"
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Record the site observation, incident details, or attendance note..."
              rows="7"
            />
          </div>

          <div className="field-submit">
            <button type="submit">Prepare Field Report</button>
            <span className="field-status">
              {location ? "GPS LOCKED" : "GPS REQUIRED"}
            </span>
          </div>
        </form>

        {message && <div className="field-message">{message}</div>}
      </div>
    </section>
  );
}

export default FieldReport;
