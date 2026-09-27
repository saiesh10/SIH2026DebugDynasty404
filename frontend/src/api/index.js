const API_BASE = "http://localhost:4000";

export async function getDashboard() {
  const response = await fetch(`${API_BASE}/api/dashboard`);

  if (!response.ok) {
    throw new Error("Failed to load dashboard data");
  }

  return response.json();
}

export async function getMines() {
  const response = await fetch(`${API_BASE}/api/mines`);

  if (!response.ok) {
    throw new Error("Failed to load mines");
  }

  return response.json();
}

export async function getCompliance() {
  const response = await fetch(`${API_BASE}/api/compliance`);

  if (!response.ok) {
    throw new Error("Failed to load compliance records");
  }

  return response.json();
}

export async function getMineRisk(mineId) {
  const response = await fetch(`${API_BASE}/api/risk/${mineId}`);

  if (!response.ok) {
    throw new Error(`Failed to load risk for mine ${mineId}`);
  }

  return response.json();
}

export async function getInspections() {
  const response = await fetch(`${API_BASE}/api/inspections`);

  if (!response.ok) {
    throw new Error("Failed to load inspections");
  }

  return response.json();
}

export async function getCorrectiveActions() {
  const response = await fetch(`${API_BASE}/api/corrective-actions`);

  if (!response.ok) {
    throw new Error("Failed to load corrective actions");
  }

  return response.json();
}
export async function createFieldReport(report) {
  const response = await fetch("http://localhost:4000/api/field-reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(report)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create field report");
  }
  return data;
}
