const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const tagall = async (sock, remoteJid, msg, args) => {
    try {
        // Verificar si es un grupo
        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Este comando solo puede ser usado en grupos." 
            }, { quoted: msg });
        }

        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata.participants;
        const message = args.join(" ") || "¡Atención a todos!";

        const divider = "━━━━━━━━━━━━━━━━━━━━";
        let tagMsg = `📣 *【 ${toSmallCaps("Mencion General")} 】* 📣\n\n`;
        tagMsg += `💬 *Mensaje:* ${message}\n\n`;
        tagMsg += `${divider}\n`;

        const mentions = [];
        participants.forEach((mem, i) => {
            tagMsg += `✨ @${mem.id.split('@')[0]}${(i + 1) % 2 === 0 ? '\n' : '  '}`;
            mentions.push(mem.id);
        });

        tagMsg += `\n${divider}\n`;
        tagMsg += `👤 *sᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ:* @${msg.key.participant.split('@')[0]}`;

        await sock.sendMessage(remoteJid, { 
            text: tagMsg, 
            mentions: [...mentions, msg.key.participant] 
        }, { quoted: msg });

        console.log(chalk.green("[TAGALL] Mención enviada con éxito en el grupo."));

    } catch (err) {
        console.error(chalk.red("[TAGALL Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un error al intentar mencionar a todos. Asegúrate de que el bot tenga los permisos necesarios." 
        }, { quoted: msg });
    }
};

module.exports = tagall;
