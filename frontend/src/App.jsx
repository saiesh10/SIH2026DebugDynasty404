import React, { useEffect, useState } from "react";
import "./App.css";
import { getNotifications, markNotificationRead } from "./api/index.js";

import MineOfficialDashboard from "./pages/MineOfficialDashboard.jsx";
import CorporateDashboard from "./pages/CorporateDashboard.jsx";
import RegulatorDashboard from "./pages/RegulatorDashboard.jsx";
import FieldReport from "./pages/FieldReport.jsx";

function App() {
  const [view, setView] = useState("mine");
  const [notifications, setNotifications] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshNotifications = () => {
      getNotifications()
        .then((data) => {
          if (active) setNotifications(data);
        })
        .catch(() => {});
    };

    refreshNotifications();
    const interval = window.setInterval(refreshNotifications, 60000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function acknowledgeNotification(notificationId) {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch {
      // Keep the alert visible so it can be acknowledged after the API recovers.
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand-lockup">
            <img className="brand-mark" src="/khanrakshak-mark.svg" alt="" aria-hidden="true" />
            <div>
              <div className="brand">
                KHAN<span>RAKSHAK</span>
              </div>
              <div className="subtitle">
                Coal Mine Governance & Compliance
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="status">
            <span className="status-dot"></span>
            System Online
          </div>
          <div className="notification-control">
            <button
              className="notification-toggle"
              type="button"
              aria-expanded={alertsOpen}
              onClick={() => setAlertsOpen((open) => !open)}
            >
              Alerts <span>{unreadCount}</span>
            </button>
            {alertsOpen && (
              <div className="notification-popover">
                <div className="notification-heading">Mine alerts</div>
                {notifications.length === 0 ? (
                  <p className="notification-empty">No alerts recorded.</p>
                ) : notifications.map((notification) => (
                  <div className={`notification-row ${notification.read_at ? "read" : ""}`} key={notification.id}>
                    <div>
                      <strong>{notification.mine_name || "Mine"}</strong>
                      <p>{notification.message}</p>
                    </div>
                    {!notification.read_at && (
                      <button
                        type="button"
                        onClick={() => acknowledgeNotification(notification.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
