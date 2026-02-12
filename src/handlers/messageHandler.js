const { prefix } = require("../config/settings");
const commands = require("../commands/index");
const chalk = require("chalk");

const handleMessages = async (m, sock) => {
    try {
        // Defensive validation
        if (!m?.messages || !Array.isArray(m.messages) || m.messages.length === 0) {
            return;
        }
        
        const msg = m.messages[0];
        
        // Validate message structure
        if (!msg || !msg.key || !msg.message || msg.key.fromMe) {
            return;
        }

        const remoteJid = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        console.log(
            chalk.hex("#DDA0DD")(`[${new Date().toLocaleTimeString()}] `) +
            chalk.hex("#FF00FF").bold(`Comando: ${commandName} `) +
            chalk.hex("#8A2BE2")(`de ${remoteJid.split('@')[0]}`)
        );

        if (commands[commandName] || commandName === "help") {
            // Reaccionar al comando
            await sock.sendMessage(remoteJid, { 
                react: { text: "⚡", key: msg.key } 
            }).catch(() => {});

            const cmd = commands[commandName] || commands.menu;
            const pushName = msg.pushName || "Usuario";
            await cmd(sock, remoteJid, msg, args, pushName);
        }
    } catch (err) {
        console.error(chalk.red("Error al manejar mensaje:"), err);
        if (String(err).includes("SessionError") || String(err).includes("no session")) {
            console.log(chalk.yellowBright("\n[!] Error crítico de sesión (SessionError)."));
            console.log(chalk.yellowBright("[!] Posible solución: Borra la carpeta 'auth_info_baileys' y vuelve a vincular el bot.\n"));
        }
    }
};

module.exports = {
    handleMessages
};
