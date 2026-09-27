export function evaluateRiskRules({
  complianceRecords = [],
  correctiveActions = [],
  inspections = [],
  contractorPermits = [],
  inspectionCadenceDays = 30,
  now = new Date()
}) {
  const flags = [];

  const expiredClearances = complianceRecords.filter(
    (record) => record.status === "expired"
  );

  if (expiredClearances.length > 0) {
    flags.push({
      type: "expired_clearance",
      severity: "high",
      count: expiredClearances.length,
      message: `${expiredClearances.length} compliance clearance(s) expired`
    });
  }

  const overdueOpenActions = correctiveActions.filter((action) => {
    if (action.status !== "open" || !action.due_date) {
      return false;
    }

    return new Date(action.due_date) < now;
  });

  if (overdueOpenActions.length >= 2) {
    flags.push({
      type: "overdue_corrective_actions",
      severity: "high",
      count: overdueOpenActions.length,
      message: `${overdueOpenActions.length} open corrective actions are past due`
    });
  }

  const inspectionDates = inspections
    .map((inspection) => new Date(inspection.inspection_date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a);

  if (inspectionDates.length > 0) {
    const latestInspection = inspectionDates[0];
    const daysSinceInspection =
      (now - latestInspection) / (1000 * 60 * 60 * 24);

    if (daysSinceInspection > inspectionCadenceDays) {
      flags.push({
        type: "inspection_cadence",
        severity: "medium",
        days_since_inspection: Math.floor(daysSinceInspection),
        cadence_days: inspectionCadenceDays,
        message: "Inspection frequency is below the required cadence"
      });
    }
  }

  const lapsedPermits = contractorPermits.filter(
    (permit) =>
      permit.expiry_date &&
      new Date(permit.expiry_date) < now
  );

  if (lapsedPermits.length > 0) {
    flags.push({
      type: "lapsed_contractor_permit",
      severity: "high",
      count: lapsedPermits.length,
      message: `${lapsedPermits.length} contractor permit(s) have lapsed`
    });
  }

  return flags;
}
