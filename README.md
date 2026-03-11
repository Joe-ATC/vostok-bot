# bot_zte

Bot de WhatsApp basado en Baileys con arquitectura modular de comandos.

## Requisitos

- Node.js 20+
- npm 10+
- FFmpeg (ya resuelto por `ffmpeg-static`)

## Instalación

```bash
npm install
```

## Configuración

1. Crear `.env` a partir de `.env.example`.
2. Ajustar valores de propietario, prefijo y endpoints.

Variables clave:

- `BOT_PREFIX`
- `BOT_SESSION_PATH`
- `DOWNLOAD_API_URL`
- `LOG_LEVEL`
- `REQUEST_TIMEOUT_MS`
- `REQUEST_RETRY_COUNT`

## Ejecución

```bash
node index.js
```

## Tests

```bash
npm test
```

## Arquitectura

- `index.js`: bootstrap del socket y wiring de handlers.
- `src/handlers`: manejo de eventos de conexión y mensajes.
- `src/commands`: comandos del bot (presentación + coordinación).
- `src/services`: integración con APIs externas de descarga.
- `src/config/settings.js`: configuración y validación de entorno.
- `src/utils/logger.js`: logging estructurado con Pino.
