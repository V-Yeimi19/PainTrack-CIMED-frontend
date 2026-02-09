import { getHeatColor } from "./heatColors";
import { locationMap } from "./bodyZones";
import { PainRecord } from "@/app/types";

type Props = {
  records: PainRecord[];
  onZoneClick?: (zone: string, records: PainRecord[]) => void;
};

export default function BodyHeatmap({ records, onZoneClick }: Props) {

  const intensitySum: Record<string, number> = {};

  records.forEach(r => {
    const mapped = locationMap[r.location];
    if (!mapped) return;

    intensitySum[mapped] =
      (intensitySum[mapped] || 0) + r.painLevel;
  });

  const max = Math.max(...Object.values(intensitySum), 1);

  const intensity: Record<string, number> = {};
  Object.entries(intensitySum).forEach(([z, val]) => {
    intensity[z] = val / max;
  });

  const zoneRecords = (zoneId: string) =>
    records.filter(r => locationMap[r.location] === zoneId);

  const fill = (zoneId: string) =>
    getHeatColor(intensity[zoneId] || 0);

  // Componente para una zona de calor individual
  const HeatZone = ({
    top,
    left,
    width,
    height,
    borderRadius = "50%",
    zoneId,
    zoneName
  }: {
    top: string;
    left: string;
    width: string;
    height: string;
    borderRadius?: string;
    zoneId: string;
    zoneName: string;
  }) => {
    const hasData = intensity[zoneId] > 0;
    if (!hasData) return null;

    return (
      <div
        className="absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-50"
        style={{
          top,
          left,
          width,
          height,
          backgroundColor: fill(zoneId),
          opacity: 0.8,
          borderRadius,
          border: '2px solid rgba(0,0,0,0.3)',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => onZoneClick?.(zoneName, zoneRecords(zoneId))}
        title={`${zoneName}: ${zoneRecords(zoneId).length} registros`}
      />
    );
  };

  return (
    <div className="flex gap-8 justify-center flex-wrap items-start">

      {/* ===== VISTA FRONTAL ===== */}
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Vista Frontal</h3>
        <div className="relative w-80 h-[550px] border-2 border-gray-300 rounded-lg shadow-lg bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          {/* Imagen del cuerpo */}
          <img
            src="/images/cuerpo/mujer_front-removebg-preview.png"
            alt="Cuerpo frontal"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Zonas de calor superpuestas */}
          {/* Cabeza - top 8% */}
          <HeatZone top="8%" left="50%" width="60px" height="60px" zoneId="head" zoneName="Cabeza" />

          {/* Hombros - top 18% */}
          <HeatZone top="18%" left="32%" width="55px" height="55px" zoneId="left_shoulder" zoneName="Hombro izquierdo" />
          <HeatZone top="18%" left="68%" width="55px" height="55px" zoneId="right_shoulder" zoneName="Hombro derecho" />

          {/* Pecho - top 30% */}
          <HeatZone top="32%" left="50%" width="110px" height="120px" borderRadius="20px" zoneId="chest" zoneName="Pecho" />

          {/* Codos - top 38% */}
          <HeatZone top="38%" left="18%" width="40px" height="40px" zoneId="left_elbow" zoneName="Codo izquierdo" />
          <HeatZone top="38%" left="82%" width="40px" height="40px" zoneId="right_elbow" zoneName="Codo derecho" />

          {/* Muñecas - top 52% */}
          <HeatZone top="52%" left="14%" width="32px" height="32px" zoneId="left_wrist" zoneName="Muñeca izquierda" />
          <HeatZone top="52%" left="86%" width="32px" height="32px" zoneId="right_wrist" zoneName="Muñeca derecha" />

          {/* Manos - top 58% */}
          <HeatZone top="58%" left="12%" width="35px" height="40px" borderRadius="40%" zoneId="left_hand" zoneName="Palma izquierda" />
          <HeatZone top="58%" left="88%" width="35px" height="40px" borderRadius="40%" zoneId="right_hand" zoneName="Palma derecha" />

          {/* Cadera - top 48% */}
          <HeatZone top="48%" left="50%" width="120px" height="60px" borderRadius="50%" zoneId="hip" zoneName="Cadera" />

          {/* Rodillas - top 72% */}
          <HeatZone top="72%" left="43%" width="50px" height="55px" zoneId="left_knee" zoneName="Rodilla izquierda" />
          <HeatZone top="72%" left="57%" width="50px" height="55px" zoneId="right_knee" zoneName="Rodilla derecha" />

          {/* Tobillos - top 92% */}
          <HeatZone top="92%" left="43%" width="35px" height="35px" zoneId="left_ankle" zoneName="Tobillo izquierdo" />
          <HeatZone top="92%" left="57%" width="35px" height="35px" zoneId="right_ankle" zoneName="Tobillo derecho" />

          {/* Pies - top 97% */}
          <HeatZone top="97%" left="42%" width="38px" height="25px" borderRadius="30%" zoneId="left_foot" zoneName="Planta izquierda" />
          <HeatZone top="97%" left="58%" width="38px" height="25px" borderRadius="30%" zoneId="right_foot" zoneName="Planta derecha" />
        </div>
      </div>

      {/* ===== VISTA POSTERIOR (ESPALDA) ===== */}
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Vista Posterior</h3>
        <div className="relative w-80 h-[550px] border-2 border-gray-300 rounded-lg shadow-lg bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          {/* Imagen del cuerpo */}
          <img
            src="/images/cuerpo/mujer_back-removebg-preview.png"
            alt="Cuerpo posterior"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Zonas de calor superpuestas */}
          {/* Cabeza posterior - top 8% */}
          <HeatZone top="8%" left="50%" width="60px" height="60px" zoneId="head" zoneName="Cabeza" />

          {/* Hombros posteriores - top 18% */}
          <HeatZone top="18%" left="32%" width="55px" height="55px" zoneId="left_shoulder" zoneName="Hombro izquierdo" />
          <HeatZone top="18%" left="68%" width="55px" height="55px" zoneId="right_shoulder" zoneName="Hombro derecho" />

          {/* Espalda alta - top 28% */}
          <HeatZone top="28%" left="50%" width="110px" height="90px" borderRadius="20px" zoneId="upper_back" zoneName="Espalda alta" />

          {/* Espalda baja (lumbar) - top 42% */}
          <HeatZone top="42%" left="50%" width="110px" height="80px" borderRadius="20px" zoneId="lower_back" zoneName="Espalda baja" />

          {/* Codos posteriores - top 38% */}
          <HeatZone top="38%" left="18%" width="40px" height="40px" zoneId="left_elbow" zoneName="Codo izquierdo" />
          <HeatZone top="38%" left="82%" width="40px" height="40px" zoneId="right_elbow" zoneName="Codo derecho" />

          {/* Cadera posterior - top 52% */}
          <HeatZone top="52%" left="50%" width="120px" height="50px" borderRadius="50%" zoneId="hip" zoneName="Cadera" />

          {/* Muslos posteriores - top 62% */}
          <HeatZone top="62%" left="41%" width="50px" height="90px" borderRadius="25px" zoneId="left_thigh_back" zoneName="Muslo posterior izquierdo" />
          <HeatZone top="62%" left="59%" width="50px" height="90px" borderRadius="25px" zoneId="right_thigh_back" zoneName="Muslo posterior derecho" />

          {/* Rodillas posteriores - top 75% */}
          <HeatZone top="75%" left="43%" width="45px" height="45px" zoneId="left_knee" zoneName="Rodilla izquierda" />
          <HeatZone top="75%" left="57%" width="45px" height="45px" zoneId="right_knee" zoneName="Rodilla derecha" />

          {/* Talones - top 94% */}
          <HeatZone top="94%" left="43%" width="40px" height="35px" borderRadius="40%" zoneId="left_heel" zoneName="Talón izquierdo" />
          <HeatZone top="94%" left="57%" width="40px" height="35px" borderRadius="40%" zoneId="right_heel" zoneName="Talón derecho" />

          {/* Plantas de los pies - top 98% */}
          <HeatZone top="98%" left="42%" width="38px" height="20px" borderRadius="30%" zoneId="left_foot" zoneName="Planta izquierda" />
          <HeatZone top="98%" left="58%" width="38px" height="20px" borderRadius="30%" zoneId="right_foot" zoneName="Planta derecha" />
        </div>
      </div>
    </div>
  );
}
