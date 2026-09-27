export function detectZScoreAnomalies(values = [], threshold = 2) {
  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  const numericValues = values
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (numericValues.length < 2) {
    return [];
  }

  const mean =
    numericValues.reduce((sum, value) => sum + value, 0) /
    numericValues.length;

  const variance =
    numericValues.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    ) / numericValues.length;

  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation === 0) {
    return [];
  }

  return numericValues
    .map((value, index) => {
      const zScore = (value - mean) / standardDeviation;

      return {
        index,
        value,
        z_score: Number(zScore.toFixed(3)),
        anomalous: Math.abs(zScore) >= threshold
      };
    })
    .filter((result) => result.anomalous);
}
export function buildSyntheticMineSeries(seed = 0) {
  const base = 10 + seed;

  if (seed % 3 === 0) {
    return [base, base + 1, base - 1, base + 2, base, base + 9];
  }

  return [
    base,
    base + 1,
    base - 1,
    base + 2,
    base,
    base + 1
  ];
}
