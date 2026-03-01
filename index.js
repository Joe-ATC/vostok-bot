const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const chalk = require("chalk");

const { sessionPath, validateSettings } = require("./src/config/settings");
const { displayLogo, drawBox, floralGradient } = require("./src/utils/ui");
const { question } = require("./src/utils/helpers");
const { handleConnectionUpdate } = require("./src/handlers/connectionHandler");
const { handleMessages } = require("./src/handlers/messageHandler");
const logger = require("./src/utils/logger");

process.on("uncaughtException", (err) => {
    logger.fatal({ err: err?.stack || err?.message || String(err) }, "uncaught_exception");
    console.error(chalk.red("\n[✖] ERROR CRITICO (Uncaught):"));
    console.error(chalk.red(`   ${err.message}`));
});

process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason: String(reason) }, "unhandled_rejection");
    console.error(chalk.red("\n[✖] PROMESA NO MANEJADA:"));
    console.error(chalk.red(`   Razón: ${reason}`));
});

let globalSock = null;

const state = {
    selectedMethod: null,
    lastQr: null,
    isConnected: false,
    reconnectTimer: null,
    isStarting: false,
    currentSocket: null
};

async function closeSocketIfNeeded() {
    if (!globalSock) return;
    try {
        await globalSock.end();
    } catch (err) {
        logger.warn({ err: err.message }, "socket_close_failed");
    } finally {
        globalSock = null;
        state.currentSocket = null;
    }
}

async function startBot() {
    if (state.isStarting) {
        return;
    }
    state.isStarting = true;

    try {
        if (state.reconnectTimer) {
            clearTimeout(state.reconnectTimer);
            state.reconnectTimer = null;
        }

        await closeSocketIfNeeded();

        const { state: authState, saveCreds } = await useMultiFileAuthState(sessionPath);

        let version = [2, 3000, 1015901307];
        try {
            const { version: latestVersion } = await fetchLatestBaileysVersion();
            version = latestVersion;
        } catch (err) {
            logger.warn({ err: err.message }, "baileys_latest_version_unavailable_using_fallback");
            console.log(chalk.yellow("   [!] No se pudo obtener la última versión de Baileys, usando fallback."));
        }

        displayLogo();

        if (!authState.creds.registered && !state.selectedMethod) {
            drawBox([
                chalk.bold(floralGradient("       🌸  VINCULACIÓN DE DISPOSITIVO  🌸       ")),
                "",
                chalk.white("  1. Código QR (RECOMENDADO) 💮                "),
                chalk.white("  2. Código de vinculación (Pairing Code) 💮    ")
            ], floralGradient);

            const ans = await question(chalk.bold(floralGradient("   🌻 >> Selecciona una opción (1/2): ")));
            state.selectedMethod = ans.trim();
        }

        if (authState.creds.registered) {
            logger.info("active_session_detected");
            console.log(chalk.greenBright("   🌸 [ESTADO] Sesión activa encontrada."));
        } else {
            logger.info("starting_new_pairing");
            console.log(chalk.yellowBright("   💮 [ESTADO] Iniciando nueva vinculación..."));
        }

        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: authState.creds,
                keys: makeCacheableSignalKeyStore(authState.keys, logger)
            },
            browser: ["Windows", "Chrome", "110.0.5481.178"],
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            emitOwnEvents: true,
            retryRequestDelayMs: 5000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            getMessage: async () => undefined
        });

        globalSock = sock;
        state.currentSocket = sock;

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", (update) => {
            handleConnectionUpdate(update, sock, startBot, state);
        });

        sock.ev.on("messages.upsert", (m) => {
            handleMessages(m, sock);
        });

        if (!sock.authState.creds.registered && state.selectedMethod === "2") {
            try {
                const phoneNumber = await question(
                    chalk.bold(floralGradient("   🌻 >> Ingresa tu número (ej: 521234567890): "))
                );
                const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");

                if (cleanedNumber && cleanedNumber.length >= 10) {
                    console.log(chalk.magentaBright("\n   💮 [SOPORTE] Generando código floral..."));
                    await delay(5000);
                    const code = await sock.requestPairingCode(cleanedNumber);

                    drawBox(floralGradient(" TU CÓDIGO FLORAL ES: ") + chalk.bgMagenta.white.bold(` ${code} `), floralGradient);
                } else {
                    console.log(chalk.red.bold("\n   [ERROR] Número inválido. Reinicia y usa formato correcto."));
                    process.exit(1);
                }
            } catch (err) {
                logger.error({ err: err.message }, "pairing_code_generation_failed");
                console.error(chalk.red("\n   [ERROR] No se pudo generar el código:"), err.message);
                console.log(chalk.yellow("   [!] Intenta de nuevo o usa el método QR."));
            }
        }
    } finally {
        state.isStarting = false;
    }
}

process.on("SIGINT", async () => {
    logger.info("shutdown_signal_received");
    console.log(chalk.yellow("\n[!] Bot apagado correctamente."));
    if (globalSock) {
        try {
            await globalSock.end();
        } catch (e) {
            logger.warn({ err: String(e) }, "socket_close_on_shutdown_failed");
        }
    }
    state.currentSocket = null;
    process.exit(0);
});

try {
    validateSettings();
    startBot();
} catch (err) {
    logger.fatal({ err: err.message }, "invalid_configuration");
    console.error(chalk.red(`[CONFIG ERROR] ${err.message}`));
    process.exit(1);
}
