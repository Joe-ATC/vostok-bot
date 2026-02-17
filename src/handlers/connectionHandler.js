const { DisconnectReason } = require("@whiskeysockets/baileys");
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const { displayLogo, drawBox, floralGradient } = require("../utils/ui");

const reconnectionState = {
    attempts: 0,
    maxAttempts: 5
};

const handleConnectionUpdate = async (update, sock, startBot, state) => {
    if (state.currentSocket && sock !== state.currentSocket) {
        return;
    }

    const { connection, lastDisconnect, qr } = update;

    if (qr && !state.isConnected) {
        if (state.lastQr !== qr) {
            state.lastQr = qr;
            if (state.selectedMethod === "1") {
                displayLogo();
                drawBox(chalk.bold("🌸 ESCANEA EL SIGUIENTE CÓDIGO QR 🌸"), floralGradient);
                console.log("");
                qrcode.generate(qr, { small: true });
                console.log("");
                console.log(chalk.gray("   💮 Esperando escaneo floral..."));
            }
        }
    }

    if (connection === "open") {
        state.isConnected = true;
        state.lastQr = null;
        reconnectionState.attempts = 0;
        displayLogo();
        console.log("   " + chalk.bold(floralGradient("   ESTADO: ")) + chalk.bgMagenta.white.bold(" CONECTADO ") + chalk.bold(floralGradient(" 🌸")));
        console.log("");
        return;
    }

    if (connection !== "close") {
        return;
    }

    state.isConnected = false;
    const error = lastDisconnect?.error;
    const statusCode = error?.output?.statusCode || error?.output?.payload?.statusCode;
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

    console.log(chalk.red.bold(`\n💮 [!] Conexión cerrada. Código: ${statusCode || "Oculto"}`));
    if (error) console.log(chalk.gray(`    Razón: ${error.message || "Desconocida"}`));

    if (statusCode === DisconnectReason.loggedOut) {
        console.log(chalk.red.bold("🌻 [!] SESIÓN CERRADA: Borra la carpeta de sesión para reiniciar."));
        process.exit(1);
    }

    if (!shouldReconnect) {
        return;
    }

    if (state.reconnectTimer) {
        return;
    }

    if (reconnectionState.attempts >= reconnectionState.maxAttempts) {
        console.log(chalk.red.bold("🌺 [!] Máximo de reintentos alcanzado. Bot detenido."));
        process.exit(1);
    }

    const waitTime = Math.min(10000, 1000 * Math.pow(2, reconnectionState.attempts));
    console.log(chalk.blue(`🌸 [+] Reconectando en ${waitTime / 1000}s... (${reconnectionState.attempts + 1}/${reconnectionState.maxAttempts})`));
    reconnectionState.attempts++;

    state.reconnectTimer = setTimeout(async () => {
        state.reconnectTimer = null;
        await startBot();
    }, waitTime);
};

module.exports = {
    handleConnectionUpdate
};
