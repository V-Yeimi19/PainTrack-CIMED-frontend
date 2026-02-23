import { locationMap } from "./bodyZones";
import { PainRecord } from "@/app/types";
import frontalSvgUrl from "@/app/assets/body/Cuerpo-frontal.svg";
import posteriorSvgUrl from "@/app/assets/body/Cuerpo-posterior.svg";
import frontBodyImg from "@/app/assets/body/Gemini_Generated_Image_wu6v41wu6v41wu6v.png";
import backBodyImg from "@/app/assets/body/Gemini_Generated_Image_pvl9gopvl9gopvl9.png";

type Props = {
  records: PainRecord[];
  onZoneClick?: (zone: string, records: PainRecord[]) => void;
};

// URLs de las imágenes PNG con fondo transparente (para máscara alpha)
const FRONT_MASK_URL = "/images/cuerpo/Gemini_Generated_Image_wu6v41wu6v41wu6v.png";
const BACK_MASK_URL = "/images/cuerpo/Gemini_Generated_Image_pvl9gopvl9gopvl9.png";

// Paleta térmica según intensidad normalizada (0–1)
const getThermalColor = (value: number) => {
  if (value >= 0.85) return { inner: "#ffffff", mid: "#ff2200", outer: "#cc0000" };
  if (value >= 0.7)  return { inner: "#ffee00", mid: "#ff4400", outer: "#cc0000" };
  if (value >= 0.5)  return { inner: "#ffff66", mid: "#ff8800", outer: "#dd4400" };
  if (value >= 0.3)  return { inner: "#bbffbb", mid: "#ffdd00", outer: "#ff8800" };
  if (value > 0)     return { inner: "#00ccff", mid: "#00ee88", outer: "#88dd00" };
  return { inner: "transparent", mid: "transparent", outer: "transparent" };
};

type ZoneDef = { id: string; name: string; cx: number; cy: number; rx: number; ry: number };

// ═══════════════════════════════════════════════════════════════
// FRONTAL — 352 × 815 (coincide con PNG y SVG)
// ═══════════════════════════════════════════════════════════════
const FRONT_ZONES: ZoneDef[] = [
  { id: "head",           name: "Cabeza",              cx: 170, cy: 60,  rx: 26, ry: 32 },
  { id: "left_shoulder",  name: "Hombro izquierdo",    cx: 108, cy: 138, rx: 30, ry: 25 },
  { id: "right_shoulder", name: "Hombro derecho",      cx: 244, cy: 138, rx: 30, ry: 25 },
  { id: "chest",          name: "Pecho",               cx: 176, cy: 215, rx: 58, ry: 50 },
  { id: "left_biceps",    name: "Bíceps izquierdo",    cx: 78,  cy: 210, rx: 16, ry: 38 },
  { id: "right_biceps",   name: "Bíceps derecho",      cx: 274, cy: 210, rx: 16, ry: 38 },
  { id: "left_elbow",     name: "Codo izquierdo",      cx: 58,  cy: 300, rx: 16, ry: 20 },
  { id: "right_elbow",    name: "Codo derecho",        cx: 294, cy: 300, rx: 16, ry: 20 },
  { id: "left_forearm",   name: "Antebrazo izquierdo", cx: 46,  cy: 355, rx: 13, ry: 32 },
  { id: "right_forearm",  name: "Antebrazo derecho",   cx: 306, cy: 355, rx: 13, ry: 32 },
  { id: "left_wrist",     name: "Muñeca izquierda",    cx: 36,  cy: 405, rx: 12, ry: 14 },
  { id: "right_wrist",    name: "Muñeca derecha",      cx: 316, cy: 405, rx: 12, ry: 14 },
  { id: "left_hand",      name: "Palma izquierda",     cx: 28,  cy: 448, rx: 14, ry: 20 },
  { id: "right_hand",     name: "Palma derecha",       cx: 324, cy: 448, rx: 14, ry: 20 },
  { id: "hip",            name: "Cadera",              cx: 176, cy: 390, rx: 58, ry: 32 },
  { id: "left_knee",      name: "Rodilla izquierda",   cx: 145, cy: 560, rx: 22, ry: 26 },
  { id: "right_knee",     name: "Rodilla derecha",     cx: 195, cy: 560, rx: 22, ry: 26 },
  { id: "left_ankle",     name: "Tobillo izquierdo",   cx: 152, cy: 695, rx: 14, ry: 16 },
  { id: "right_ankle",    name: "Tobillo derecho",     cx: 200, cy: 695, rx: 14, ry: 16 },
  { id: "left_instep",    name: "Empeine izquierdo",   cx: 148, cy: 740, rx: 14, ry: 10 },
  { id: "right_instep",   name: "Empeine derecho",     cx: 204, cy: 740, rx: 14, ry: 10 },
  { id: "left_foot",      name: "Planta izquierda",    cx: 145, cy: 770, rx: 18, ry: 10 },
  { id: "right_foot",     name: "Planta derecha",      cx: 207, cy: 770, rx: 18, ry: 10 },
];

// ═══════════════════════════════════════════════════════════════
// POSTERIOR — 253 × 747 (coincide con PNG y SVG)
// ═══════════════════════════════════════════════════════════════
const BACK_ZONES: ZoneDef[] = [
  { id: "head",                 name: "Cabeza",                    cx: 125, cy: 45,  rx: 20, ry: 28 },
  { id: "left_shoulder",        name: "Hombro izquierdo",          cx: 76,  cy: 118, rx: 24, ry: 22 },
  { id: "right_shoulder",       name: "Hombro derecho",            cx: 176, cy: 118, rx: 24, ry: 22 },
  { id: "upper_back",           name: "Espalda alta",              cx: 126, cy: 178, rx: 44, ry: 36 },
  { id: "lower_back",           name: "Espalda baja",              cx: 126, cy: 262, rx: 42, ry: 36 },
  { id: "left_back_side",       name: "Dorso izquierdo",           cx: 82,  cy: 218, rx: 18, ry: 44 },
  { id: "right_back_side",      name: "Dorso derecho",             cx: 170, cy: 218, rx: 18, ry: 44 },
  { id: "left_elbow",           name: "Codo izquierdo",            cx: 34,  cy: 268, rx: 14, ry: 18 },
  { id: "right_elbow",          name: "Codo derecho",              cx: 218, cy: 268, rx: 14, ry: 18 },
  { id: "hip",                  name: "Cadera",                    cx: 126, cy: 338, rx: 46, ry: 26 },
  { id: "left_thigh_back",      name: "Muslo posterior izquierdo", cx: 108, cy: 410, rx: 22, ry: 46 },
  { id: "right_thigh_back",     name: "Muslo posterior derecho",   cx: 144, cy: 410, rx: 22, ry: 46 },
  { id: "left_knee",            name: "Rodilla izquierda",         cx: 95,  cy: 520, rx: 18, ry: 22 },
  { id: "right_knee",           name: "Rodilla derecha",           cx: 115, cy: 520, rx: 18, ry: 22 },
  { id: "left_heel",            name: "Talón izquierdo",           cx: 105, cy: 618, rx: 14, ry: 16 },
  { id: "right_heel",           name: "Talón derecho",             cx: 147, cy: 618, rx: 14, ry: 16 },
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

  /* ── Vista con imagen estática + zonas clickeables ── */
  const renderStaticView = (
    zones: ZoneDef[],
    imgSrc: string,
    label: string,
    prefix: string,
    vbW: number,
    vbH: number
  ) => (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-bold text-gray-700 mb-3">{label}</h3>
      <div className="relative w-80 h-[550px] border-2 border-gray-200 rounded-lg shadow-lg bg-white overflow-hidden">

        {/* ── Imagen estática del cuerpo ── */}
        <img
          src={imgSrc}
          alt={label}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* ── ZONAS DE CLIC invisibles ── */}
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          {zones.map(zone => (
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

  /* ── Mapa de calor dinámico (deshabilitado temporalmente) ──
  const renderView = (
    zones: ZoneDef[],
    svgUrl: string,
    maskUrl: string,
    label: string,
    prefix: string,
    vbW: number,
    vbH: number
  ) => {
    const activeZones = zones.filter(z => (intensity[z.id] || 0) > 0);

    const maskStyle: React.CSSProperties = {
      WebkitMaskImage: `url(${maskUrl})`,
      maskImage: `url(${maskUrl})`,
      WebkitMaskSize: "contain",
      maskSize: "contain" as string,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat" as string,
      WebkitMaskPosition: "center",
      maskPosition: "center" as string,
    };

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-700 mb-3">{label}</h3>
        <div className="relative w-80 h-[550px] border-2 border-gray-200 rounded-lg shadow-lg bg-white overflow-hidden">
          <div className="absolute inset-0" style={maskStyle}>
            <svg
              viewBox={`0 0 ${vbW} ${vbH}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id={`base-${prefix}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2266ff" />
                  <stop offset="8%"   stopColor="#00aacc" />
                  <stop offset="20%"  stopColor="#33cc88" />
                  <stop offset="45%"  stopColor="#66dd55" />
                  <stop offset="65%"  stopColor="#88ee44" />
                  <stop offset="80%"  stopColor="#55cc66" />
                  <stop offset="95%"  stopColor="#0088cc" />
                  <stop offset="100%" stopColor="#2266ff" />
                </linearGradient>

                <filter id={`blur-${prefix}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="22" />
                </filter>

                {activeZones.map(zone => {
                  const v = intensity[zone.id] || 0;
                  const { inner, mid, outer } = getThermalColor(v);
                  return (
                    <radialGradient
                      key={`grad-${prefix}-${zone.id}`}
                      id={`grad-${prefix}-${zone.id}`}
                      cx="50%" cy="50%" r="50%"
                    >
                      <stop offset="0%"   stopColor={inner} stopOpacity="1"   />
                      <stop offset="30%"  stopColor={mid}   stopOpacity="0.9" />
                      <stop offset="65%"  stopColor={outer}  stopOpacity="0.6" />
                      <stop offset="100%" stopColor={outer}  stopOpacity="0"   />
                    </radialGradient>
                  );
                })}
              </defs>

              <rect x="0" y="0" width={vbW} height={vbH} fill={`url(#base-${prefix})`} />

              <g filter={`url(#blur-${prefix})`}>
                {activeZones.map(zone => (
                  <ellipse
                    key={`heat-${prefix}-${zone.id}`}
                    cx={zone.cx}
                    cy={zone.cy}
                    rx={zone.rx * 2.5}
                    ry={zone.ry * 2.5}
                    fill={`url(#grad-${prefix}-${zone.id})`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <img
            src={svgUrl as string}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity: 0.35 }}
          />

          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            {zones.map(zone => (
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
  */

  return (
    <div className="flex gap-8 justify-center flex-wrap items-start">
      {renderStaticView(FRONT_ZONES, frontBodyImg as string, "Vista Frontal",   "front", 352, 815)}
      {renderStaticView(BACK_ZONES,  backBodyImg as string,  "Vista Posterior", "back",  253, 747)}
    </div>
  );
}
