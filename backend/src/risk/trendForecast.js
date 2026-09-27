export function bucketHighSeverityByMonth(inspections, bucketDays = 30, bucketCount = 6, now = new Date()) {
  const buckets = new Array(bucketCount).fill(0);

  inspections.forEach((inspection) => {
    if (inspection.severity !== "high") return;
    const inspectionDate = new Date(inspection.inspection_date);
    const daysAgo = Math.floor((now - inspectionDate) / (1000 * 60 * 60 * 24));
    const bucketIndex = bucketCount - 1 - Math.floor(daysAgo / bucketDays);
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      buckets[bucketIndex] += 1;
    }
  });

  return buckets;
}

export function linearTrendSlope(series) {
  const n = series.length;
  if (n < 2) return 0;

  const xMean = (n - 1) / 2;
  const yMean = series.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  series.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  });

  return denominator === 0 ? 0 : numerator / denominator;
}

export function projectDaysToThreshold({
  currentScore,
  slope,
  threshold = 60,
  pointsPerHighSeverityInspection = 20,
  bucketDays = 30
}) {
  if (slope <= 0 || currentScore >= threshold) {
    return null;
  }

  const scoreGainPerBucket = slope * pointsPerHighSeverityInspection;
  const bucketsNeeded = (threshold - currentScore) / scoreGainPerBucket;
  return Math.max(1, Math.round(bucketsNeeded * bucketDays));
}
