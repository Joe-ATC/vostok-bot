const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const ffmpegStatic = require("ffmpeg-static");
const fluentFfmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
fluentFfmpeg.setFfmpegPath(ffmpegStatic);

const { botName } = require("../config/settings");
const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const chalk = require("chalk");

async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

const sticker = async (sock, remoteJid, msg) => {
    let tempPath = null;
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
        const now = new Date();
        const requester = msg.pushName || "Usuario";
        const exifPack = toSmallCaps(botName);
        const exifAuthor = `${toSmallCaps(requester)}\n${now.toLocaleDateString()}`;

        let stickerSource = buffer;
        if (mediaType === "video") {
            const tempFileName = `${crypto.randomBytes(16).toString("hex")}.mp4`;
            tempPath = path.join(os.tmpdir(), tempFileName);
            await fs.promises.writeFile(tempPath, buffer);
            stickerSource = tempPath;
        }

        const stickerObj = new Sticker(stickerSource, {
            pack: exifPack,
            author: exifAuthor,
            type: StickerTypes.FULL,
            id: msg.key.id,
            quality: 40
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[Sticker] Enviado exitosamente."));
    } catch (err) {
        console.error(chalk.red("[Sticker Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo completar la creación del sticker.")} ⌟` 
        }, { quoted: msg });
    } finally {
        if (tempPath) {
            try { await fs.promises.unlink(tempPath); } catch (_) {}
        }
    }
};

module.exports = sticker;
