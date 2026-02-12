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
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

/**
 * Download media from Baileys message
 */
async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

const sticker = async (sock, remoteJid, msg) => {
    let tempPath = null;
    try {
        const type = Object.keys(msg.message)[0];
        const isQuotedImage = type === 'extendedTextMessage' && msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isQuotedVideo = type === 'extendedTextMessage' && msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        const isImage = type === 'imageMessage';
        const isVideo = type === 'videoMessage';

        let mediaMessage = null;
        let mediaType = null;

        if (isImage) {
            mediaMessage = msg.message.imageMessage;
            mediaType = 'image';
        } else if (isVideo) {
            mediaMessage = msg.message.videoMessage;
            mediaType = 'video';
        } else if (isQuotedImage) {
            mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            mediaType = 'image';
        } else if (isQuotedVideo) {
            mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
            mediaType = 'video';
        }

        if (!mediaMessage) {
            return await sock.sendMessage(remoteJid, { text: "❌ *Error:* Responde a una imagen, gif o video corto con el comando !sticker" }, { quoted: msg });
        }

        const isGif = mediaMessage.gifPlayback;
        if (mediaType === 'video' && mediaMessage.seconds > 10) {
            return await sock.sendMessage(remoteJid, { text: "❌ *Error:* El video/gif debe durar menos de 10 segundos." }, { quoted: msg });
        }

        console.log(chalk.cyan(`[Sticker] Descargando multimedia...`));
        await sock.sendMessage(remoteJid, { text: "⏳ _Procesando tu sticker, por favor espera..._" }, { quoted: msg });

        const buffer = await downloadMedia(mediaMessage, mediaType);
        
        // Metadata
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const requester = msg.pushName || "Usuario";
        const exifPack = `${toSmallCaps(botName)}`;
        const exifAuthor = `${toSmallCaps(requester)}\n📅 ${dateStr}\n⏰ ${timeStr}`;

        let stickerSource = buffer;

        if (mediaType === 'video') {
            const tempFileName = crypto.randomBytes(16).toString('hex') + '.mp4';
            tempPath = path.join(os.tmpdir(), tempFileName);
            fs.writeFileSync(tempPath, buffer);
            stickerSource = tempPath;
        }

        const stickerObj = new Sticker(stickerSource, {
            pack: exifPack,
            author: exifAuthor,
            type: StickerTypes.FULL,
            categories: ["🤩", "✨"],
            id: msg.key.id,
            quality: 40
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[Sticker] Sticker enviado con éxito."));

    } catch (err) {
        console.error(chalk.red("[Sticker Error]"), err);
        let errorMsg = "❌ Error al crear el sticker.";
        if (err.message?.includes("ffmpeg")) errorMsg = "❌ Error en el motor de video.";
        await sock.sendMessage(remoteJid, { text: errorMsg }, { quoted: msg });
    } finally {
        if (tempPath && fs.existsSync(tempPath)) {
            try { fs.unlinkSync(tempPath); } catch(e) {}
        }
    }
};

module.exports = sticker;
