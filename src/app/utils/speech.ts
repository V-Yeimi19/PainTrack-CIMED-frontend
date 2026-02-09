/**
 * Utilidad para síntesis de voz con soporte para Azure Speech Services (TTS neural)
 * y fallback a Web Speech API
 */

// Configuración de Azure Speech (puede venir de variables de entorno)
const AZURE_SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus';

// Referencias globales para cancelar audio en reproducción
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Sintetiza texto a voz usando Azure Speech Services (TTS neural)
 * @param text - Texto a sintetizar
 * @param lang - Idioma (default: 'es-ES')
 */
export async function speakNatural(text: string, lang: string = 'es-ES'): Promise<void> {
  // Cancelar cualquier audio en reproducción antes de iniciar uno nuevo
  stopAllSpeech();
  
  // Verificar que existe la API key de Azure
  if (!AZURE_SPEECH_KEY) {
    console.error('Azure Speech API Key no configurada. Por favor, configura VITE_AZURE_SPEECH_KEY en el archivo .env');
    return;
  }
  
  // Usar solo Azure Speech Services
  try {
    await speakWithAzure(text, lang);
  } catch (error) {
    console.error('Error con Azure Speech:', error);
    // No usar fallback, solo mostrar error
  }
}

/**
 * Detiene cualquier audio o síntesis de voz en reproducción
 */
export function stopAllSpeech(): void {
  // Detener audio de Azure si está reproduciéndose
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  
  // Detener Web Speech API si está reproduciéndose
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  currentUtterance = null;
}

/**
 * Sintetiza texto usando Microsoft Azure Speech Services (TTS neural)
 * Esta es la opción más natural, especialmente para español LATAM
 */
async function speakWithAzure(text: string, lang: string): Promise<void> {
  // Usar Azure Speech Services REST API
  const tokenUrl = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  
  // Obtener token de acceso
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Length': '0'
    }
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Error obteniendo token de Azure');
  }
  
  const accessToken = await tokenResponse.text();
  
  // Endpoint de síntesis de voz
  const ttsUrl = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  // Seleccionar voz neural en español (las más naturales)
  // Para español LATAM: es-MX-DaliaNeural, es-AR-ElenaNeural, es-CO-SalomeNeural
  // Para español España: es-ES-ElviraNeural, es-ES-AlvaroNeural
  // Usar voz LATAM por defecto (más natural para usuarios de LATAM)
  const voiceName = lang.startsWith('es-MX') ? 'es-MX-DaliaNeural' :
                    lang.startsWith('es-AR') ? 'es-AR-ElenaNeural' :
                    lang.startsWith('es-CO') ? 'es-CO-SalomeNeural' :
                    lang.startsWith('es-ES') ? 'es-ES-ElviraNeural' :
                    'es-MX-DaliaNeural'; // Default: español LATAM (más natural)
  
  // SSML para síntesis con voz neural
  // Usar el idioma correcto según la voz seleccionada
  const voiceLang = voiceName.startsWith('es-MX') ? 'es-MX' :
                    voiceName.startsWith('es-AR') ? 'es-AR' :
                    voiceName.startsWith('es-CO') ? 'es-CO' :
                    voiceName.startsWith('es-ES') ? 'es-ES' :
                    'es-MX'; // Default LATAM
  
  // SSML optimizado para máxima naturalidad y expresividad
  // Parámetros ajustados para sonar como voz humana real:
  // - rate más lento (0.80) = más pausado y natural
  // - pitch más alto (+12%) = más expresivo y cálido
  // - contour = variación de tono más natural durante la frase
  // - pausas naturales al inicio y final
  const ssml = `
    <speak version='1.0' xml:lang='${voiceLang}'>
      <voice xml:lang='${voiceLang}' xml:gender='Female' name='${voiceName}'>
        <prosody rate='0.80' pitch='+12%' volume='+5%' contour='(0%,+5%) (25%,+15%) (50%,+10%) (75%,+12%) (100%,+5%)'>
          <break time='100ms'/>
          ${text}
          <break time='150ms'/>
        </prosody>
      </voice>
    </speak>
  `;
  
  const audioResponse = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'User-Agent': 'PainTrack-CIMED'
    },
    body: ssml
  });
  
  if (!audioResponse.ok) {
    throw new Error(`Error en Azure TTS: ${audioResponse.statusText}`);
  }
  
  // Reproducir el audio
  const audioBlob = await audioResponse.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  // Guardar referencia del audio actual
  currentAudio = audio;
  
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      resolve();
    };
    audio.onerror = (error) => {
      currentAudio = null;
      reject(error);
    };
    audio.onpause = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };
    audio.play().catch(reject);
  });
}

/**
 * Sintetiza texto usando Web Speech API (fallback)
 * Busca las mejores voces disponibles en el sistema
 */
function speakWithWebSpeech(text: string, lang: string): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Tu navegador no soporta Text-to-Speech');
    return;
  }
  
  const synth = window.speechSynthesis;
  // Ya se canceló en stopAllSpeech, pero por seguridad cancelamos de nuevo
  synth.cancel();
  
  // Reducir delay para respuesta más rápida
  setTimeout(() => {
    const voices = synth.getVoices();
    
    // Prioridad 1: Voces neurales específicas de Google (las más naturales)
    // Prioridad 2: Voces específicas de Microsoft conocidas por ser naturales
    // Prioridad 3: Cualquier voz de Google
    // Prioridad 4: Cualquier voz de Microsoft
    // Prioridad 5: Otras voces en español
    const voice =
      voices.find(v => v.name.includes("Neural") && v.lang.startsWith("es")) ||
      voices.find(v => (v.name.includes("Helena") || v.name.includes("Dalia") || v.name.includes("Sabina")) && v.lang.startsWith("es")) ||
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("es")) ||
      voices.find(v => v.name.includes("Microsoft") && v.lang.startsWith("es")) ||
      voices.find(v => v.lang.startsWith("es"));
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = lang;
    // Parámetros más naturales: velocidad más lenta y tono ligeramente más alto
    utterance.rate = 0.85; // Más lento = más natural
    utterance.pitch = 1.1; // Ligeramente más alto = más expresivo
    utterance.volume = 1;
    
    // Guardar referencia del utterance actual
    currentUtterance = utterance;
    
    utterance.onend = () => {
      currentUtterance = null;
    };
    
    utterance.onerror = () => {
      currentUtterance = null;
    };
    
    synth.speak(utterance);
  }, 50); // Reducido de 150ms a 50ms para respuesta más rápida
}
