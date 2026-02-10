import { locationMap } from "./bodyZones";
import { PainRecord } from "@/app/types";
import frontalSvgUrl from "@/app/assets/body/Cuerpo-frontal.svg";
import posteriorSvgUrl from "@/app/assets/body/Cuerpo-posterior.svg";

type Props = {
  records: PainRecord[];
  onZoneClick?: (zone: string, records: PainRecord[]) => void;
};

// Paleta térmica según intensidad (0–1)
const getThermalGradient = (value: number) => {
  if (value >= 0.85) return { inner: "#ffffff", mid: "#ff2200", outer: "#aa0000" };
  if (value >= 0.7)  return { inner: "#ffee00", mid: "#ff4400", outer: "#cc0000" };
  if (value >= 0.5)  return { inner: "#ffff66", mid: "#ff8800", outer: "#dd4400" };
  if (value >= 0.3)  return { inner: "#bbffbb", mid: "#ffdd00", outer: "#ff8800" };
  if (value > 0)     return { inner: "#00ccff", mid: "#00ee88", outer: "#88dd00" };
  return { inner: "transparent", mid: "transparent", outer: "transparent" };
};

type ZoneDef = { id: string; name: string; cx: number; cy: number; rx: number; ry: number };

// ═══════════════════════════════════════════════════════════════
// FRONTAL — viewBox real del SVG: 352 × 815
// ═══════════════════════════════════════════════════════════════
const FRONT_ZONES: ZoneDef[] = [
  // Cabeza y cuello
  { id: "head",           name: "Cabeza",              cx: 170, cy: 60,  rx: 26, ry: 32 },
  // Hombros
  { id: "left_shoulder",  name: "Hombro izquierdo",    cx: 108, cy: 138, rx: 30, ry: 25 },
  { id: "right_shoulder", name: "Hombro derecho",      cx: 244, cy: 138, rx: 30, ry: 25 },
  // Pecho
  { id: "chest",          name: "Pecho",               cx: 176, cy: 215, rx: 58, ry: 50 },
  // Bíceps
  { id: "left_biceps",    name: "Bíceps izquierdo",    cx: 78,  cy: 210, rx: 16, ry: 38 },
  { id: "right_biceps",   name: "Bíceps derecho",      cx: 274, cy: 210, rx: 16, ry: 38 },
  // Codos
  { id: "left_elbow",     name: "Codo izquierdo",      cx: 58,  cy: 300, rx: 16, ry: 20 },
  { id: "right_elbow",    name: "Codo derecho",        cx: 294, cy: 300, rx: 16, ry: 20 },
  // Antebrazos
  { id: "left_forearm",   name: "Antebrazo izquierdo", cx: 46,  cy: 355, rx: 13, ry: 32 },
  { id: "right_forearm",  name: "Antebrazo derecho",   cx: 306, cy: 355, rx: 13, ry: 32 },
  // Muñecas
  { id: "left_wrist",     name: "Muñeca izquierda",    cx: 36,  cy: 405, rx: 12, ry: 14 },
  { id: "right_wrist",    name: "Muñeca derecha",      cx: 316, cy: 405, rx: 12, ry: 14 },
  // Manos
  { id: "left_hand",      name: "Palma izquierda",     cx: 28,  cy: 448, rx: 14, ry: 20 },
  { id: "right_hand",     name: "Palma derecha",       cx: 324, cy: 448, rx: 14, ry: 20 },
  // Cadera
  { id: "hip",            name: "Cadera",              cx: 176, cy: 390, rx: 58, ry: 32 },
  // Rodillas
  { id: "left_knee",      name: "Rodilla izquierda",   cx: 145, cy: 560, rx: 22, ry: 26 },
  { id: "right_knee",     name: "Rodilla derecha",     cx: 195, cy: 560, rx: 22, ry: 26 },
  // Tobillos
  { id: "left_ankle",     name: "Tobillo izquierdo",   cx: 152, cy: 695, rx: 14, ry: 16 },
  { id: "right_ankle",    name: "Tobillo derecho",     cx: 200, cy: 695, rx: 14, ry: 16 },
  // Empeines
  { id: "left_instep",    name: "Empeine izquierdo",   cx: 148, cy: 740, rx: 14, ry: 10 },
  { id: "right_instep",   name: "Empeine derecho",     cx: 204, cy: 740, rx: 14, ry: 10 },
  // Plantas
  { id: "left_foot",      name: "Planta izquierda",    cx: 145, cy: 770, rx: 18, ry: 10 },
  { id: "right_foot",     name: "Planta derecha",      cx: 207, cy: 770, rx: 18, ry: 10 },
];

// ═══════════════════════════════════════════════════════════════
// POSTERIOR — viewBox real del SVG: 253 × 747
// ═══════════════════════════════════════════════════════════════
const BACK_ZONES: ZoneDef[] = [
  // Cabeza
  { id: "head",                 name: "Cabeza",                    cx: 125, cy: 45,  rx: 20, ry: 28 },
  // Hombros
  { id: "left_shoulder",        name: "Hombro izquierdo",          cx: 76,  cy: 118, rx: 24, ry: 22 },
  { id: "right_shoulder",       name: "Hombro derecho",            cx: 176, cy: 118, rx: 24, ry: 22 },
  // Espalda
  { id: "upper_back",           name: "Espalda alta",              cx: 126, cy: 178, rx: 44, ry: 36 },
  { id: "lower_back",           name: "Espalda baja",              cx: 126, cy: 262, rx: 42, ry: 36 },
  // Dorso (costados de la espalda)
  { id: "left_back_side",       name: "Dorso izquierdo",           cx: 82,  cy: 218, rx: 18, ry: 44 },
  { id: "right_back_side",      name: "Dorso derecho",             cx: 170, cy: 218, rx: 18, ry: 44 },
  // Codos
  { id: "left_elbow",           name: "Codo izquierdo",            cx: 34,  cy: 268, rx: 14, ry: 18 },
  { id: "right_elbow",          name: "Codo derecho",              cx: 218, cy: 268, rx: 14, ry: 18 },
  // Cadera
  { id: "hip",                  name: "Cadera",                    cx: 126, cy: 338, rx: 46, ry: 26 },
  // Muslos posteriores
  { id: "left_thigh_back",      name: "Muslo posterior izquierdo", cx: 108, cy: 410, rx: 22, ry: 46 },
  { id: "right_thigh_back",     name: "Muslo posterior derecho",   cx: 144, cy: 410, rx: 22, ry: 46 },
  // Rodillas
  { id: "left_knee",            name: "Rodilla izquierda",         cx: 95, cy: 520, rx: 18, ry: 22 },
  { id: "right_knee",           name: "Rodilla derecha",           cx: 115, cy: 520, rx: 18, ry: 22 },
  // Talones
  { id: "left_heel",            name: "Talón izquierdo",           cx: 105, cy: 618, rx: 14, ry: 16 },
  { id: "right_heel",           name: "Talón derecho",             cx: 147, cy: 618, rx: 14, ry: 16 },
  // Plantas
  { id: "left_foot",            name: "Planta izquierda",          cx: 103, cy: 655, rx: 12, ry: 10 },
  { id: "right_foot",           name: "Planta derecha",            cx: 149, cy: 655, rx: 12, ry: 10 },
];

export default function BodyHeatmap({ records, onZoneClick }: Props) {

  const intensitySum: Record<string, number> = {};
  records.forEach(r => {
    const mapped = locationMap[r.location];
    if (!mapped) return;
    intensitySum[mapped] = (intensitySum[mapped] || 0) + r.painLevel;
  });

  const max = Math.max(...Object.values(intensitySum), 1);
  const intensity: Record<string, number> = {};
  Object.entries(intensitySum).forEach(([z, val]) => {
    intensity[z] = val / max;
  });

  const zoneRecords = (zoneId: string) =>
    records.filter(r => locationMap[r.location] === zoneId);

  const renderView = (
    zones: ZoneDef[],
    svgUrl: string,
    label: string,
    prefix: string,
    vbW: number,
    vbH: number
  ) => {
    const activeZones = zones.filter(z => (intensity[z.id] || 0) > 0);

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-700 mb-3">{label}</h3>
        <div className="relative w-80 h-[550px] border-2 border-gray-200 rounded-lg shadow-lg bg-white overflow-hidden">

          {/* ── IMAGEN CORPORAL visible debajo ── */}
          <img
            src={svgUrl as string}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity: 0.55 }}
          />

          {/* ── CAPA TÉRMICA — gradientes radiales SVG encima ── */}
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <filter id={`blur-${prefix}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="18" />
              </filter>

              {activeZones.map(zone => {
                const v = intensity[zone.id] || 0;
                const { inner, mid, outer } = getThermalGradient(v);
                return (
                  <radialGradient
                    key={`grad-${prefix}-${zone.id}`}
                    id={`grad-${prefix}-${zone.id}`}
                    cx="50%" cy="50%" r="50%"
                  >
                    <stop offset="0%"   stopColor={inner} stopOpacity="1"   />
                    <stop offset="35%"  stopColor={mid}   stopOpacity="0.9" />
                    <stop offset="70%"  stopColor={outer}  stopOpacity="0.5" />
                    <stop offset="100%" stopColor={outer}  stopOpacity="0"   />
                  </radialGradient>
                );
              })}
            </defs>

            {/* Gradientes térmicos con desenfoque gaussiano */}
            <g filter={`url(#blur-${prefix})`}>
              {activeZones.map(zone => (
                <ellipse
                  key={`heat-${prefix}-${zone.id}`}
                  cx={zone.cx}
                  cy={zone.cy}
                  rx={zone.rx * 2}
                  ry={zone.ry * 2}
                  fill={`url(#grad-${prefix}-${zone.id})`}
                />
              ))}
            </g>

            {/* Zonas de clic invisibles */}
            {activeZones.map(zone => (
              <ellipse
                key={`click-${prefix}-${zone.id}`}
                cx={zone.cx}
                cy={zone.cy}
                rx={zone.rx * 2}
                ry={zone.ry * 2}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={() => onZoneClick?.(zone.name, zoneRecords(zone.id))}
              >
                <title>{zone.name}: {zoneRecords(zone.id).length} registros</title>
              </ellipse>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-8 justify-center flex-wrap items-start">
      {renderView(FRONT_ZONES, frontalSvgUrl as string, "Vista Frontal",   "front", 352, 815)}
      {renderView(BACK_ZONES,  posteriorSvgUrl as string, "Vista Posterior", "back",  253, 747)}
    </div>
  );
}
