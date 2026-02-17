const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../utils/helpers");
const chalk = require("chalk");

const tagall = async (sock, remoteJid, msg, args) => {
    try {
        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("Este comando es de uso exclusivo en grupos.")} ⌟` 
            }, { quoted: msg });
        }

        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata.participants;
        const message = args.join(" ") || "¡Atención a todos!";

        const divider = "❀✿━━━━━━━━━━━━━━━━━━━━✿❀";
        let tagMsg = `『 ${toBoldSerif("Mención General")} 』 🌸\n\n`;
        tagMsg += `🌻 *${toBoldSerif("Mensaje:")}* ${message}\n\n`;
        tagMsg += `${divider}\n`;

        const mentions = [];
        participants.forEach((mem, i) => {
            tagMsg += `🌸 ${toMono(`@${mem.id.split('@')[0]}`)}${(i + 1) % 2 === 0 ? '\n' : '  '}`;
            mentions.push(mem.id);
        });

        tagMsg += `\n${divider}\n`;
        tagMsg += `🏵️ *${toSmallCaps("Solicitado:")}* @${msg.key.participant.split('@')[0]}`;

        await sock.sendMessage(remoteJid, { 
            text: tagMsg, 
            mentions: [...mentions, msg.key.participant] 
        }, { quoted: msg });

        console.log(chalk.green("[TAGALL] Broadcase sent."));

    } catch (err) {
        console.error(chalk.red("[TAGALL Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo completar la mención general.")} ⌟` 
        }, { quoted: msg });
    }
};

module.exports = tagall;
