const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
  DisconnectReason,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const P = require("pino");
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const path = require("path");

// imports locales
const { sessionPath } = require("./src/config/settings");
const { displayLogo, drawBox, rainbowGradient, cyberGradient, pinkGradient, blueGradient, vaporwaveGradient, goldGradient } = require("./src/utils/ui");
const { question, toSmallCaps } = require("./src/utils/helpers");
const { handleConnectionUpdate } = require("./src/handlers/connectionHandler");
const { handleMessages } = require("./src/handlers/messageHandler");

// ese we xd
process.on('uncaughtException', (err) => {
    console.error(chalk.red('\n[✖] ERROR CRÍTICO (Uncaught):'));
    console.error(chalk.red(`   ${err.message}`));
    console.error(chalk.gray(err.stack));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('\n[✖] PROMESA NO MANEJADA:'));
    console.error(chalk.red(`   Razón: ${reason}`));
});

const logger = P({ level: "silent" });
let globalSock = null;

// Share state
const state = {
    selectedMethod: null,
    lastQr: null,
    isConnected: false
};

async function startBot() {
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
        chalk.bold(rainbowGradient("          VINCULACIÓN DE DISPOSITIVO          ")),
        "",
        chalk.cyan("  1. Código QR (RECOMENDADO)                   "),
        chalk.cyan("  2. Código de vinculación (Pairing Code)      ")
      ], cyberGradient);
      
      const ans = await question(chalk.bold(pinkGradient("   >> Selecciona una opción (1/2): ")));
      state.selectedMethod = ans.trim();
  }

  if (authState.creds.registered) {
    console.log(chalk.greenBright("   [♻️] Sesión activa encontrada. Conectando..."));
  } else {
    console.log(chalk.yellowBright("   [!] Iniciando vinculación nueva..."));
  }

  // 2. Socket Configuration
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    // Modern Browser UA for better compatibility
    browser: ["Windows", "Chrome", "110.0.5481.178"], 
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    emitOwnEvents: true,
    retryRequestDelayMs: 5000,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    getMessage: async (key) => {
        return undefined; 
    },
  });

  globalSock = sock;

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
              chalk.bold(blueGradient("   >> Ingresa tu número (ej: 521234567890): "))
          );
          const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
          
          if (cleanedNumber && cleanedNumber.length >= 10) {
              console.log(chalk.magentaBright("\n   [!] Solicitando código de vinculación..."));
              
              // Importante: Esperar un poco a que el socket esté listo
              await delay(5000);
              
              const code = await sock.requestPairingCode(cleanedNumber);
              
              drawBox(goldGradient(" TU CÓDIGO ES: ") + chalk.bgMagenta.white.bold(` ${code} `), rainbowGradient);
              
              drawBox([
                  chalk.gray(" 1. Abre WhatsApp > Dispositivos vinculados    "),
                  chalk.gray(" 2. Vincular con el número de teléfono         "),
                  chalk.gray(" 3. Ingresa tu código ahora mismo              "),
                  "",
                  chalk.yellow(" ⚠️  No cierres el bot hasta que diga CONECTADO   ")
              ], vaporwaveGradient);
          } else {
              console.log(chalk.red.bold("\n   [ERROR] Número inválido. Reinicia y usa formato correcto."));
              process.exit(1);
          }
      } catch (err) {
          console.error(chalk.red("\n   [ERROR] No se pudo generar el código:"), err.message);
          console.log(chalk.yellow("   [!] Intenta de nuevo o usa el método QR."));
      }
  }
}

process.on('SIGINT', async () => {
    console.log(chalk.yellow("\n[!] Bot apagado correctamente."));
    if (globalSock) try { await globalSock.end(); } catch(e){}
    process.exit(0);
});

startBot();
