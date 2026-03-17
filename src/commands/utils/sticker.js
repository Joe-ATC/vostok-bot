const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

let ffmpegStatic;
try {
    ffmpegStatic = require("ffmpeg-static");
} catch (err) {
    ffmpegStatic = null;
}

const fluentFfmpeg = require("fluent-ffmpeg");

// En entornos como Termux/ARM, ffmpeg-static puede no estar disponible.
// Se intenta usar el binario incluido, y si no, se deja que fluent-ffmpeg lo encuentre en PATH.
if (ffmpegStatic) {
    try {
        fluentFfmpeg.setFfmpegPath(ffmpegStatic);
    } catch (err) {
        // Ignorar: fluent-ffmpeg buscará en PATH
    }
}

const { botName } = require("../../config/settings");
const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../../utils/helpers");
const chalk = require("chalk");

async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

module.exports = {
    name: "sticker",
    aliases: ["s", "stiker", "pegatina"],
    category: "utils",
    execute: async (sock, remoteJid, msg, args) => {
        let tempPath = null;
        try {
            const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
            const type = Object.keys(targetMessage)[0];

            let mediaMessage = null;
            let mediaType = null;
            let isVideoUrl = false;

            if (type === "imageMessage") {
                mediaMessage = targetMessage.imageMessage;
                mediaType = "image";
            } else if (type === "videoMessage") {
                mediaMessage = targetMessage.videoMessage;
                mediaType = "video";
            } else if (type === "documentMessage" && targetMessage.documentMessage.mimetype.includes("image")) {
                mediaMessage = targetMessage.documentMessage;
                mediaType = "document";
            }

            // Detección de URL en los argumentos
            let imageUrl = null;
            if (args.length > 0 && args[0].startsWith("http")) {
                imageUrl = args[0];
            }

            if (!mediaMessage && !imageUrl) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Información")}* 🌸\n\n⌞ ${toScript("Para usar esto, envía o responde a una imagen, video, GIF o manda una URL.")} ⌟\n\n🌻 *${toSmallCaps("Atajo:")}* ${toScript("¡Simplemente responde a cualquier foto con la letra")} *s* ${toScript("o")} *!s*` 
                }, { quoted: msg });
            }

            if (mediaType === "video" && mediaMessage.seconds > 10) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("El video o GIF no debe superar los 10 segundos.")} ⌟` 
                }, { quoted: msg });
            }

            // Opciones del Usuario (-crop o -fit)
            const isCrop = args.includes("-crop");
            const isFit = args.includes("-fit");
            let sType = StickerTypes.FULL; 
            if (isCrop) sType = StickerTypes.CROPPED;

            // Reacción de carga ("Procesando")
            await sock.sendMessage(remoteJid, { react: { text: "⏳", key: msg.key } });

            // Metadatos Elegantes
            const now = new Date();
            const dateStr = now.toLocaleDateString("es-ES", { day: '2-digit', month: 'short' });
            const timeStr = now.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
            
            const requester = msg.pushName || "Usuario";
            const exifPack = `『 ${toBoldSerif(botName)} 』\n⌞ ${toSmallCaps("Solicitado:")} ${toScript(requester)} ⌟`;
            const exifAuthor = `\n[ ${toMono(`${dateStr} - ${timeStr}`)} ]`;

            let stickerSource = null;

            if (imageUrl) {
                stickerSource = imageUrl;
            } else {
                let dlType = mediaType === "document" ? "document" : mediaType;
                const buffer = await downloadMedia(mediaMessage, dlType);
                
                if (mediaType === "video") {
                    const tempFileName = `${crypto.randomBytes(16).toString("hex")}.mp4`;
                    tempPath = path.join(os.tmpdir(), tempFileName);
                    await fs.promises.writeFile(tempPath, buffer);
                    stickerSource = tempPath;
                } else {
                    stickerSource = buffer;
                }
            }

            const stickerQuality = mediaType === "video" ? 25 : 60;

            const stickerObj = new Sticker(stickerSource, {
                pack: exifPack,
                author: exifAuthor,
                type: sType,
                id: msg.key.id,
                quality: stickerQuality
            });

            const stickerBuffer = await stickerObj.toBuffer();
            
            await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
            
            // Reacción de finalizado
            await sock.sendMessage(remoteJid, { react: { text: "✅", key: msg.key } });
            console.log(chalk.green("[Sticker] Enviado exitosamente."));

        } catch (err) {
            console.error(chalk.red("[Sticker Error]"), err);
            await sock.sendMessage(remoteJid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Hubo un fallo crítico al renderizar el sticker. Intenta con archivo más ligero.")} ⌟` 
            }, { quoted: msg });
        } finally {
            if (tempPath) {
                try { await fs.promises.unlink(tempPath); } catch (_) {}
            }
        }
    }
};
