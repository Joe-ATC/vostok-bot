const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const chalk = require("chalk");

const toimg = async (sock, remoteJid, msg) => {
    try {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg || !quotedMsg.stickerMessage) {
            return await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Responde a un sticker estático con este comando.")} ⌟` 
            }, { quoted: msg });
        }

        const stickerMessage = quotedMsg.stickerMessage;

        if (stickerMessage.isAnimated) {
            return await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("Este comando no es compatible con stickers animados.")} ⌟` 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { 
            text: `💮 *${toSmallCaps("Convirtiendo...")}*` 
        }, { quoted: msg });

        const stream = await downloadContentFromMessage(stickerMessage, "sticker");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await sock.sendMessage(remoteJid, { 
            image: buffer, 
            caption: `『 ${toBoldSerif("Sticker Convertido")} 』 🌸`
        }, { quoted: msg });

        console.log(chalk.green("[TOIMG] Success."));
    } catch (err) {
        console.error(chalk.red("[TOIMG Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo realizar la conversión a imagen.")} ⌟` 
        }, { quoted: msg });
    }
};

module.exports = toimg;
