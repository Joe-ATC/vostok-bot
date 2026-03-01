const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { botName } = require("../config/settings");
const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const logger = require("../utils/logger");
const { bufferToWebp, videoToWebp } = require("../utils/sticker");

async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

const sticker = async (sock, remoteJid, msg) => {
    try {
        const type = Object.keys(msg.message)[0];
        const isQuotedImage = type === "extendedTextMessage" && msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isQuotedVideo = type === "extendedTextMessage" && msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        const isImage = type === "imageMessage";
        const isVideo = type === "videoMessage";

        let mediaMessage = null;
        let mediaType = null;

        if (isImage) {
            mediaMessage = msg.message.imageMessage;
            mediaType = "image";
        } else if (isVideo) {
            mediaMessage = msg.message.videoMessage;
            mediaType = "video";
        } else if (isQuotedImage) {
            mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            mediaType = "image";
        } else if (isQuotedVideo) {
            mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
            mediaType = "video";
        }

        if (!mediaMessage) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Información")}* 🌸\n\n⌞ ${toScript("Por favor, responda a una imagen o video corto.")} ⌟`
            }, { quoted: msg });
        }

        if (mediaType === "video" && mediaMessage.seconds > 10) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("El video no debe superar los 10 segundos.")} ⌟`
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, {
            text: `💮 *${toSmallCaps("Procesando...")}*`
        }, { quoted: msg });

        const buffer = await downloadMedia(mediaMessage, mediaType);
        const stickerBuffer = mediaType === "video"
            ? await videoToWebp(buffer)
            : await bufferToWebp(buffer);

        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        logger.info({ remoteJid, mediaType, pack: botName }, "sticker_sent");
    } catch (err) {
        logger.error({ err: err.message, remoteJid }, "sticker_failed");
        await sock.sendMessage(remoteJid, {
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo completar la creación del sticker.")} ⌟`
        }, { quoted: msg });
    }
};

module.exports = sticker;
