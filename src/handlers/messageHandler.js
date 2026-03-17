const { prefix } = require("../config/settings");
const { commands, loadCommands } = require("./commandLoader");
const { handleAntiDelete } = require("./antiDeleteHandler");
const chalk = require("chalk");

// Cargar la primera vez
loadCommands();

const extractText = (msg) => {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ""
    );
};

const handleSingleMessage = async (msg, sock) => {
    if (!msg || !msg.key || !msg.message || msg.key.fromMe) {
        return;
    }

    const remoteJid = msg.key.remoteJid;
    const text = extractText(msg);
    const textTrimmed = text.trim();
    const textLower = textTrimmed.toLowerCase();

    let isCommand = textTrimmed.startsWith(prefix);
    let commandName = "";
    let args = [];

    if (isCommand) {
        args = textTrimmed.slice(prefix.length).trim().split(/ +/);
        commandName = args.shift().toLowerCase();
    } else if (textLower === "s" || textLower === "sticker") {
        // Excepción especial para ejecutar el creador de stickers sin prefijo.
        isCommand = true;
        commandName = "sticker";
        args = [];
    }

    if (!isCommand) return;

    console.log(
        chalk.hex("#FFB7C5")(`🌸 [${new Date().toLocaleTimeString()}] `) +
        chalk.hex("#FF69B4").bold(`𝗖𝗢𝗠𝗔𝗡𝗗𝗢: ${commandName} `) +
        chalk.hex("#DDA0DD")(`de ${remoteJid.split("@")[0]}`)
    );

    const command = commands.get(commandName);

    if (command || commandName === "help") {
        await sock.sendMessage(remoteJid, {
            react: { text: "🌸", key: msg.key }
        }).catch(() => {});

        const cmdToRun = command || commands.get("menu");
        if (cmdToRun && cmdToRun.execute) {
            const pushName = msg.pushName || "Usuario";
            try {
                await cmdToRun.execute(sock, remoteJid, msg, args, pushName);
            } catch (err) {
                console.error(chalk.red(`[Error ejecutando comando ${commandName}]:`), err);
                await sock.sendMessage(remoteJid, { text: "🌸 Ocurrió un error al ejecutar este comando." }, { quoted: msg });
            }
        }
    }
};

const handleMessages = async (m, sock) => {
    try {
        if (!m?.messages || !Array.isArray(m.messages) || m.messages.length === 0) {
            return;
        }

        for (const msg of m.messages) {
            const remoteJid = msg?.key?.remoteJid || "";
            if (remoteJid === "status@broadcast") continue;
            await handleSingleMessage(msg, sock);
        }

        // Ejecutar función secreta Anti-Delete
        await handleAntiDelete(sock, m);
    } catch (err) {
        console.error(chalk.red("🌸 Error al manejar mensaje:"), err);
        if (String(err).includes("SessionError") || String(err).includes("no session")) {
            console.log(chalk.yellowBright("\n💮 [!] Error critico de sesion."));
            console.log(chalk.yellowBright("💮 [!] Accion recomendada: eliminar carpeta de enlace y vincular nuevamente.\n"));
        }
    }
};

module.exports = {
    handleMessages
};
