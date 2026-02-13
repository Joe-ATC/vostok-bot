const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const toimg = async (sock, remoteJid, msg) => {
    try {
        // Verificar si es una respuesta a un mensaje
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg || !quotedMsg.stickerMessage) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Responde a un sticker estático con el comando `!toimg`." 
            }, { quoted: msg });
        }

        const stickerMessage = quotedMsg.stickerMessage;

        // Validar que no sea un sticker animado
        if (stickerMessage.isAnimated) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Este comando solo funciona con stickers estáticos (imágenes), no con stickers animados (videos/gifs)." 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: "⏳ _Convirtiendo sticker a imagen..._" }, { quoted: msg });

        // Descargar el contenido del sticker
        const stream = await downloadContentFromMessage(stickerMessage, "sticker");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Enviar la imagen resultante
        await sock.sendMessage(remoteJid, { 
            image: buffer, 
            caption: `✨ *Sᴛɪᴄᴋᴇʀ Cᴏɴᴠᴇʀᴛɪᴅᴏ* ✨\n\n🚀 *${toSmallCaps("Vostok Bot")}*`
        }, { quoted: msg });

        console.log(chalk.green("[TOIMG] Conversión realizada con éxito."));

    } catch (err) {
        console.error(chalk.red("[TOIMG Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un error al intentar convertir el sticker a imagen. Asegúrate de que el sticker sea válido." 
        }, { quoted: msg });
    }
};

module.exports = toimg;
