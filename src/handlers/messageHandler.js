const { prefix } = require("../config/settings");
const commands = require("../commands/index");
const chalk = require("chalk");

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
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(
        chalk.hex("#FFB7C5")(`🌸 [${new Date().toLocaleTimeString()}] `) +
        chalk.hex("#FF69B4").bold(`𝗖𝗢𝗠𝗔𝗡𝗗𝗢: ${commandName} `) +
        chalk.hex("#DDA0DD")(`de ${remoteJid.split("@")[0]}`)
    );

    if (commands[commandName] || commandName === "help") {
        await sock.sendMessage(remoteJid, {
            react: { text: "🌸", key: msg.key }
        }).catch(() => {});

        const cmd = commands[commandName] || commands.menu;
        const pushName = msg.pushName || "Usuario";
        await cmd(sock, remoteJid, msg, args, pushName);
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
