const { toSmallCaps, toBoldSerif } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "stats",
    aliases: ["estadisticas", "info"],
    category: "general",
    execute: async (sock, remoteJid, msg) => {
        try {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);

            let statsMess = `『 ${toBoldSerif("Rendimiento")} 』 🌺\n\n`;
            statsMess += `🌸 *${toSmallCaps("Memoria:")}* ${used.toFixed(2)} MB\n`;
            statsMess += `🌸 *${toSmallCaps("Uptime:")}* ${hours}h ${mins}m\n`;
            statsMess += `🌸 *${toSmallCaps("Sistema:")}* ${process.platform}\n`;
            statsMess += `🌸 *${toSmallCaps("Motor:")}* Node ${process.version}`;

            await sock.sendMessage(remoteJid, { text: statsMess }, { quoted: msg });
        } catch (err) {
            console.error(chalk.red("[Stats Error]"), err);
        }
    }
};
