export const getHeatColor = (value: number) => {
  // value: 0–1
  if (value >= 0.85) return "#aa0303ff";
  if (value >= 0.7) return "#ff0000";
  if (value >= 0.5) return "#ff7a00";
  if (value >= 0.3) return "#ffd000";
  if (value > 0) return "#7bd389";
  return "#e5e7eb";
};
