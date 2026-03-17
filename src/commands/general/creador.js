const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../../utils/helpers");
const { ownerName, githubUrl } = require("../../config/settings");
const chalk = require("chalk");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    name: "creador",
    aliases: ["developer", "dev"],
    category: "general",
    execute: async (sock, remoteJid, msg) => {
        try {
            const userJid = msg.key.participant || msg.key.remoteJid;
            const divider = `❀━━━━━━━━━━━━━━━━━━❀`;

            // Primer mensaje ("enviando...")
            const sentMsg = await sock.sendMessage(remoteJid, {
                text: `🌸 ${toMono("[■□□□□□□□□□] Extrayendo base de datos...")}`
            }, { quoted: msg });

            const key = sentMsg.key;

            // Animación de carga
            await sleep(600);
            await sock.sendMessage(remoteJid, {
                text: `🌸 ${toMono("[■■■■□□□□□□] Desencriptando archivos...")}`,
                edit: key
            });

            await sleep(600);
            await sock.sendMessage(remoteJid, {
                text: `🌸 ${toMono("[■■■■■■■□□□] Obteniendo información...")}`,
                edit: key
            });

            await sleep(600);
            await sock.sendMessage(remoteJid, {
                text: `🌸 ${toMono("[■■■■■■■■■■] ¡Acceso Concedido!")}`,
                edit: key
            });

            await sleep(600);

            let msgText = `『 ${toBoldSerif("Developer Info")} 』 💮\n\n`;
            msgText += `🌸 *${toSmallCaps("Nombre:")}* ${ownerName}\n`;
            msgText += `🌸 *${toSmallCaps("Rol:")}* ${toScript("Software Developer")} \n`;
            msgText += `🌸 *${toSmallCaps("Github:")}* ${githubUrl}\n\n`;
            msgText += `${divider}\n`;
            msgText += `💮 *${toSmallCaps("Solicitado por:")}* @${userJid.split('@')[0]}`;

            await sock.sendMessage(remoteJid, {
                text: msgText,
                mentions: [userJid],
                edit: key
            });
        } catch (err) {
            console.error(chalk.red("[Creador Error]"), err);
        }
    }
};
