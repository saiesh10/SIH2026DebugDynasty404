import React, { useState } from "react";
import "./App.css";

import MineOfficialDashboard from "./pages/MineOfficialDashboard.jsx";
import CorporateDashboard from "./pages/CorporateDashboard.jsx";
import RegulatorDashboard from "./pages/RegulatorDashboard.jsx";
import FieldReport from "./pages/FieldReport.jsx";

function App() {
  const [view, setView] = useState("mine");

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">
            KHAN<span>RAKSHAK</span>
          </div>
          <div className="subtitle">
            Coal Mine Governance & Compliance
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          type="button"
          className={view === "mine" ? "active" : ""}
          onClick={() => setView("mine")}
        >
          Mine Official
        </button>

        <button
          type="button"
          className={view === "corporate" ? "active" : ""}
          onClick={() => setView("corporate")}
        >
          Corporate
        </button>

        <button
          type="button"
          className={view === "regulator" ? "active" : ""}
          onClick={() => setView("regulator")}
        >
          Regulator
        </button>

        <button
          type="button"
          className={view === "field" ? "active" : ""}
          onClick={() => setView("field")}
        >
          Field Report
        </button>
      </nav>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">KHANRAKSHAK</p>
            <h1>Coal Mine Governance & Compliance</h1>
            <p className="hero-text">
              Integrated compliance, inspection, risk, and field reporting.
            </p>
          </div>
        </section>

        {view === "mine" && <MineOfficialDashboard />}
        {view === "corporate" && <CorporateDashboard />}
        {view === "regulator" && <RegulatorDashboard />}
        {view === "field" && <FieldReport />}
      </main>
    </div>
  );
}

export default App;
