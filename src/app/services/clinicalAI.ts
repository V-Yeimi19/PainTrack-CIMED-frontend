import Groq from "groq-sdk";
import type { Patient, PainRecord } from "@/app/types";

export interface ClinicalRecommendation {
  urgency: "alta" | "media" | "baja";
  appointmentRecommendation: string;
  diagnosticSuggestions: string[];
  treatmentSuggestions: string[];
  observations: string;
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

export async function getClinicalRecommendations(
  patient: Patient,
  records: PainRecord[],
  stats: {
    avgPain: string;
    maxPain: number;
    minPain: number;
    mostFrequentType: string;
    mostFrequentClassification: string;
    mostAffectedLocation: string;
    trend: number;
    adherence: string;
  }
): Promise<ClinicalRecommendation> {
  const recentRecords = records.slice(-10).map((r) => ({
    fecha: new Date(r.date).toLocaleDateString("es-ES"),
    nivel: r.painLevel,
    ubicacion: r.location,
    tipo: r.type,
    clasificacion: r.painClassification ?? "Sin clasificar",
  }));

  const systemPrompt = `Eres un asistente de apoyo clínico especializado en dolor crónico. Tu rol es analizar datos de pacientes y generar recomendaciones estructuradas para el médico tratante. IMPORTANTE: no diagnosticas ni prescribes de forma definitiva; solo ofreces sugerencias de apoyo a la decisión clínica, en español.
Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown, sin bloques de código.`;

  const userPrompt = `Analiza los siguientes datos del paciente y genera recomendaciones clínicas:

DATOS DEL PACIENTE:
- Nombre: ${patient.name}
- Edad: ${patient.age} años | Sexo: ${patient.gender}
- Peso: ${patient.weight} kg | Talla: ${patient.height} m
- Patologías conocidas: ${patient.pathology?.join(", ") || "Ninguna registrada"}
- Tratamiento actual: ${patient.treatment?.join(", ") || "Ninguno registrado"}
- Medicamentos activos: ${patient.medications?.filter((m) => m.active).map((m) => `${m.name} ${m.dosage}`).join(", ") || "Ninguno"}

ESTADÍSTICAS DE DOLOR:
- Promedio: ${stats.avgPain}/10 | Máximo: ${stats.maxPain}/10 | Mínimo: ${stats.minPain}/10
- Ubicación más afectada: ${stats.mostAffectedLocation}
- Tipo más frecuente: ${stats.mostFrequentType}
- Clasificación más frecuente: ${stats.mostFrequentClassification}
- Tendencia reciente: ${stats.trend > 0 ? "+" : ""}${stats.trend.toFixed(1)} puntos
- Adherencia al registro: ${stats.adherence}%

ÚLTIMOS REGISTROS:
${recentRecords.map((r) => `  • ${r.fecha}: Nivel ${r.nivel}/10 — ${r.ubicacion} — ${r.tipo} — ${r.clasificacion}`).join("\n")}

Responde con este JSON exacto:
{
  "urgency": "alta" | "media" | "baja",
  "appointmentRecommendation": "recomendación sobre cita (máx 120 caracteres)",
  "diagnosticSuggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
  "treatmentSuggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
  "observations": "observación clínica general (máx 200 caracteres)"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Respuesta no válida del modelo");

  return JSON.parse(jsonMatch[0]) as ClinicalRecommendation;
}
