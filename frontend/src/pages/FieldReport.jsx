import React, { useEffect, useState } from "react";
import { createFieldReport, getMines } from "../api/index.js";
import {
  enqueueReport,
  getQueuedReports,
  removeQueuedReport
} from "../api/offlineQueue.js";

function distanceBetween(first, second) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function FieldReport() {
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("safety_observation");
  const [observation, setObservation] = useState("");
  const [photo, setPhoto] = useState("");
  const [mines, setMines] = useState([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cachedMines = localStorage.getItem("khanrakshak-mines");
    if (cachedMines) {
      try {
        setMines(JSON.parse(cachedMines));
      } catch {
        localStorage.removeItem("khanrakshak-mines");
      }
    }

    getMines()
      .then((data) => {
        setMines(data);
        localStorage.setItem("khanrakshak-mines", JSON.stringify(data));
      })
      .catch(() => {});

    getQueuedReports()
      .then((reports) => setQueuedCount(reports.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function syncQueuedReports() {
      try {
        const reports = await getQueuedReports();
        for (const report of reports) {
          try {
            await createFieldReport(report);
            await removeQueuedReport(report.queued_at);
          } catch {
            break;
          }
        }
        setQueuedCount((await getQueuedReports()).length);
      } catch {
        setMessage("Offline report storage is unavailable in this browser.");
      }
    }

    window.addEventListener("online", syncQueuedReports);
    if (navigator.onLine) {
      syncQueuedReports();
    }
    return () => window.removeEventListener("online", syncQueuedReports);
  }, []);

  function captureLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coordinates);
        const nearestMine = mines
          .map((mine) => ({
            ...mine,
            distance: distanceBetween(coordinates, mine)
          }))
          .sort((first, second) => first.distance - second.distance)[0];
        setMessage(
          nearestMine
            ? `Location captured. Nearest mine: ${nearestMine.name}.`
            : "Location captured. Mine records are not available yet."
        );
      },
      () => {
        setMessage("Unable to capture location.");
      }
    );
  }

  function capturePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhoto("");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Choose a photo smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function prepareReport(event) {
    event.preventDefault();

    if (!location || mines.length === 0) {
      setMessage("Capture location after mine records have loaded.");
      return;
    }

    if (!observation.trim()) {
      setMessage("Enter an observation before preparing the report.");
      return;
    }

    try {
      const nearestMine = mines.reduce((nearest, mine) => {
        const distance = distanceBetween(location, mine);
        return !nearest || distance < nearest.distance
          ? { mine, distance }
          : nearest;
      }, null);
      const report = {
        mine_id: nearestMine.mine.id,
        latitude: location.latitude,
        longitude: location.longitude,
        category,
        observation,
        photo_url: photo
      };

      if (!navigator.onLine) {
        await enqueueReport(report);
        setQueuedCount((count) => count + 1);
        setMessage(`Saved offline for ${nearestMine.mine.name}; it will sync when connected.`);
      } else {
        try {
          await createFieldReport(report);
          setMessage(`Field report synchronized for ${nearestMine.mine.name}.`);
        } catch {
          await enqueueReport(report);
          setQueuedCount((count) => count + 1);
          setMessage("Connection failed. Field report saved offline for syncing.");
        }
      }
      setObservation("");
      setPhoto("");
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

          <div className="field-section">
            <label className="field-label" htmlFor="photo">SITE PHOTO</label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={capturePhoto}
            />
            {photo && <img className="field-photo-preview" src={photo} alt="Selected site report" />}
          </div>

          <div className="field-submit">
            <button type="submit">Log field report</button>
            <span className="field-status">{queuedCount} waiting to sync</span>
          </div>
        </form>

        {message && <div className="field-message">{message}</div>}
      </div>
    </section>
  );
}

export default FieldReport;
