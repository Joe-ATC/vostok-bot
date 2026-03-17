const { toSmallCaps, toBoldSerif, toScript } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "ping",
    aliases: ["velocidad"],
    category: "general",
    execute: async (sock, remoteJid, msg) => {
        try {
            const start = Date.now();
            const { key } = await sock.sendMessage(remoteJid, { text: "🌸 _Midiendo latencia..._" }, { quoted: msg });
            const latency = Date.now() - start;
            await sock.sendMessage(remoteJid, { 
                text: `💮 *${toBoldSerif("Estatus")}*\n\n🌻 ${toSmallCaps("Velocidad:")} *${latency}ms*\n🌺 ${toSmallCaps("Estado:")} *${toScript("Operativo")}*`,
                edit: key
            });
        } catch (err) {
            console.error(chalk.red("[Ping Error]"), err);
        }
    }
};
