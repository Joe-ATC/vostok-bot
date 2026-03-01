const { prefix } = require("../config/settings");
const commands = require("../commands/index");
const logger = require("../utils/logger");

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
    const commandName = (args.shift() || "").toLowerCase();
    if (!commandName) return;

    logger.info({ commandName, remoteJid }, "command_received");

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
        logger.error({ err: err.message }, "message_handling_failed");
        if (String(err).includes("SessionError") || String(err).includes("no session")) {
            logger.warn("session_error_detected_relink_recommended");
        }
    }
};

module.exports = {
    handleMessages
};
