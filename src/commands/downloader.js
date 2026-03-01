const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const logger = require("../utils/logger");
const { fetchDownloadData } = require("../services/downloadService");

const downloader = async (sock, remoteJid, msg, args) => {
    try {
        const url = args[0];
        if (!url) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Ingresa el link que deseas descargar.")} ⌟\n\n🌻 *Ejemplo:* !dl https://www.youtube.com/watch?v=...`
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, {
            text: `◢ 📥 *${toSmallCaps("Procesando Descarga")}* ◣\n\n⌞ ${toScript("Estamos extrayendo el contenido, por favor espera.")} ⌟`
        }, { quoted: msg });

        const { title, duration, source, best } = await fetchDownloadData(url);

        if (best.video) {
            await sock.sendMessage(remoteJid, {
                video: { url: best.video.url },
                caption: `『 ${toBoldSerif("Vostok Downloader")} 』 💮\n\n` +
                    `🌸 *${toSmallCaps("Título:")}* ${title}\n` +
                    `🌸 *${toSmallCaps("Fuente:")}* ${source}\n` +
                    `🌸 *${toSmallCaps("Duración:")}* ${duration || "N/A"}\n\n` +
                    `🏵️ ${toBoldSerif("Powered by GR-API")} 🏵️`,
                mimetype: "video/mp4",
                fileName: `${title}.mp4`
            }, { quoted: msg });
        } else if (best.audio) {
            await sock.sendMessage(remoteJid, {
                audio: { url: best.audio.url },
                mimetype: "audio/mp4",
                fileName: `${title}.mp3`,
                caption: `『 ${toBoldSerif("Vostok Audio")} 』 💮\n\n` +
                    `🌸 *${toSmallCaps("Título:")}* ${title}\n` +
                    `🌸 *${toSmallCaps("Fuente:")}* ${source}\n\n` +
                    `🏵️ ${toBoldSerif("Powered by GR-API")} 🏵️`
            }, { quoted: msg });
        } else {
            throw new Error("download_service_empty_media");
        }

        logger.info({ source, remoteJid }, "download_completed");
    } catch (err) {
        logger.error({ err: err.message, remoteJid }, "download_failed");
        await sock.sendMessage(remoteJid, {
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo procesar este link. Asegúrate de que la API esté encendida.")} ⌟`
        }, { quoted: msg });
    }
};

module.exports = downloader;
