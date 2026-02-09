# Configuración de Síntesis de Voz (TTS)

## 🎯 Opciones Disponibles

### 🥇 Opción PRO: Azure Speech Services (TTS Neural)

**La más natural** - Suena como voz humana real, similar a Duolingo o asistentes virtuales.

#### Configuración:

1. **Obtener API Key de Azure:**
   - Ve a https://portal.azure.com
   - Crea un recurso "Speech Services"
   - Copia la **clave** y la **región** (ej: `eastus`, `westus`, `southcentralus`)

2. **Configurar variables de entorno:**
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega:
     ```
     VITE_AZURE_SPEECH_KEY=tu_api_key_aqui
     VITE_AZURE_SPEECH_REGION=eastus
     ```

3. **Reiniciar el servidor de desarrollo**

#### Voces disponibles:
- **Español LATAM:** `es-MX-DaliaNeural`, `es-AR-ElenaNeural`, `es-CO-SalomeNeural`
- **Español España:** `es-ES-ElviraNeural`, `es-ES-AlvaroNeural`

### 🥈 Opción Intermedia: Web Speech API (Fallback automático)

Si no configuras Azure Speech, la app usa automáticamente **Web Speech API** con las mejores voces disponibles en el sistema:

- Prioriza voces de Google y Microsoft
- Busca voces neurales si están disponibles
- Funciona sin configuración adicional

## 📝 Notas

- **Azure Speech** requiere API key pero suena mucho más natural
- **Web Speech API** funciona sin configuración pero puede sonar más robótico
- La app usa automáticamente Azure si está configurado, sino usa Web Speech API
- Las voces neurales de Azure son las más naturales para español LATAM

## 🔒 Seguridad

⚠️ **Importante:** Para producción, se recomienda usar un backend para proteger la API key de Azure. Las variables de entorno en el frontend son visibles en el código del cliente.
