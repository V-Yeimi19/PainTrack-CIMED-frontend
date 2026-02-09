export const locationMap: Record<string, string> = {
  // Mapeo de ubicaciones específicas
  "pecho": "chest",
  "espalda alta": "upper_back",
  "espalda baja": "lower_back",
  "cadera": "hip",

  "hombro izquierdo": "left_shoulder",
  "hombro derecho": "right_shoulder",

  "biceps izquierdo": "left_biceps",
  "biceps derecho": "right_biceps",

  "antebrazo izquierdo": "left_forearm",
  "antebrazo derecho": "right_forearm",

  "muñeca izquierda": "left_wrist",
  "muñeca derecha": "right_wrist",

  "palma izquierda": "left_hand",
  "palma derecha": "right_hand",

  "codo izquierdo": "left_elbow",
  "codo derecho": "right_elbow",

  "rodilla izquierda": "left_knee",
  "rodilla derecha": "right_knee",

  "tobillo izquierdo": "left_ankle",
  "tobillo derecho": "right_ankle",

  "talon izquierdo": "left_heel",
  "talon derecho": "right_heel",

  "planta izquierda": "left_foot",
  "planta derecha": "right_foot",

  "empeine izquierdo": "left_instep",
  "empeine derecho": "right_instep",

  "muslo posterior izquierdo": "left_thigh_back",
  "muslo posterior derecho": "right_thigh_back",

  "dorso izquierdo": "left_back_side",
  "dorso derecho": "right_back_side",

  // Mapeo de ubicaciones genéricas (para compatibilidad con datos existentes)
  "Pecho": "chest",
  "Espalda": "upper_back", // Por defecto mapea a espalda alta
  "Rodillas": "left_knee", // Por defecto mapea a rodilla izquierda (se podría mejorar)
  "Piernas": "left_knee", // Por defecto mapea a rodilla
  "Brazos": "left_shoulder", // Por defecto mapea a hombro
};
