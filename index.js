const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const P = require("pino");
const chalk = require("chalk");

// imports locales
const { sessionPath } = require("./src/config/settings");
const { displayLogo, drawBox, floralGradient, goldenFlare, springGradient, violetSky } = require("./src/utils/ui");
const { question } = require("./src/utils/helpers");
const { handleConnectionUpdate } = require("./src/handlers/connectionHandler");
const { handleMessages } = require("./src/handlers/messageHandler");

// ese we xd
process.on('uncaughtException', (err) => {
    console.error(chalk.red('\n[✖] ERROR CRÍTICO (Uncaught):'));
    console.error(chalk.red(`   ${err.message}`));
    console.error(chalk.gray(err.stack));
});

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('\n[✖] PROMESA NO MANEJADA:'));
    console.error(chalk.red(`   Razón: ${reason}`));
});

const logger = P({ level: "silent" });
let globalSock = null;

// Share state
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
        console.log(chalk.gray(`[i] No se pudo cerrar socket previo: ${err.message}`));
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
  
  let version = [2, 3000, 1015901307]; // Fallback version
  try {
      const { version: latestVersion } = await fetchLatestBaileysVersion();
      version = latestVersion;
  } catch (err) {
      console.log(chalk.yellow("   [!] No se pudo obtener la última versión de Baileys, usando fallback."));
  }

  displayLogo();

  // 1. Connection Method Selection
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
    console.log(chalk.greenBright("   🌸 [ESTADO] Sesión activa encontrada."));
  } else {
    console.log(chalk.yellowBright("   💮 [ESTADO] Iniciando nueva vinculación..."));
  }

  // 2. Socket Configuration
  const getDefaultBrowser = () => {
      const termux = !!process.env.TERMUX_VERSION;
      if (process.env.BOT_BROWSER_JSON) {
          try {
              return JSON.parse(process.env.BOT_BROWSER_JSON);
          } catch {
              // ignore and fall back
          }
      }

      if (termux) {
          return ["Android", "Termux", "11.0.0"];
      }

      if (process.platform === "win32") {
          return ["Windows", "Chrome", "110.0.5481.178"];
      }

      if (process.platform === "darwin") {
          return ["Macintosh", "Safari", "16.0.0"];
      }

      return ["Ubuntu", "Chrome", "110.0.5481.178"];
  };

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    browser: getDefaultBrowser(),
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    emitOwnEvents: true,
    retryRequestDelayMs: 5000,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    getMessage: async () => {
        return undefined; 
    },
  });

  globalSock = sock;
  state.currentSocket = sock;

  // Event Handlers
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
      handleConnectionUpdate(update, sock, startBot, state);
  });

  sock.ev.on("messages.upsert", (m) => {
      handleMessages(m, sock);
  });

  // 3. Handle Pairing Code if requested
  if (!sock.authState.creds.registered && state.selectedMethod === "2") {
      try {
          const phoneNumber = await question(
              chalk.bold(floralGradient("   🌻 >> Ingresa tu número (ej: 521234567890): "))
          );
          const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
          
          if (cleanedNumber && cleanedNumber.length >= 10) {
              console.log(chalk.magentaBright("\n   💮 [SOPORTE] Generando código floral..."));
              
              // Importante: Esperar un poco a que el socket esté listo
              await delay(5000);
              
              const code = await sock.requestPairingCode(cleanedNumber);
              
              drawBox(floralGradient(" TU CÓDIGO FLORAL ES: ") + chalk.bgMagenta.white.bold(` ${code} `), floralGradient);
              
              drawBox([
                  chalk.white(" 1. Abre WhatsApp > Dispositivos vinculados    "),
                  chalk.white(" 2. Vincular con el número de teléfono         "),
                  chalk.white(" 3. Ingresa tu código ahora mismo              "),
                  "",
                  chalk.yellow(" ⚠️  No cierres el bot durante el proceso        ")
              ], floralGradient);
          } else {
              console.log(chalk.red.bold("\n   [ERROR] Número inválido. Reinicia y usa formato correcto."));
              process.exit(1);
          }
      } catch (err) {
          console.error(chalk.red("\n   [ERROR] No se pudo generar el código:"), err.message);
          console.log(chalk.yellow("   [!] Intenta de nuevo o usa el método QR."));
      }
  }
  } finally {
      state.isStarting = false;
  }
}

process.on('SIGINT', async () => {
    console.log(chalk.yellow("\n[!] Bot apagado correctamente."));
    if (globalSock) try { await globalSock.end(); } catch(e){}
    state.currentSocket = null;
    process.exit(0);
});

startBot();
