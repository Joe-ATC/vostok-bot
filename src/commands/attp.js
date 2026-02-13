const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { botName } = require("../config/settings");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const attp = async (sock, remoteJid, msg, args) => {
    try {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Por favor ingresa el texto para el sticker.\n💡 *Ejemplo:* `!attp hola mundo`" 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: "⏳ _Generando sticker animado, espera un momento..._" }, { quoted: msg });

        // Usamos una API gratuita para generar el GIF de texto animado
        const url = `https://api.erdwpe.com/api/maker/attp?text=${encodeURIComponent(text)}`;
        
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Metadatos
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const requester = msg.pushName || "Usuario";
        const exifPack = `${toSmallCaps(botName)}`;
        const exifAuthor = `${toSmallCaps(requester)}\n📅 ${dateStr}\n⏰ ${timeStr}`;

        const stickerObj = new Sticker(buffer, {
            pack: exifPack,
            author: exifAuthor,
            type: StickerTypes.FULL,
            categories: ["✨", "🌈"],
            id: msg.key.id,
            quality: 50
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Sticker enviado con éxito."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Error al generar el sticker animado. Intenta con un texto más corto o inténtalo más tarde." 
        }, { quoted: msg });
    }
};

module.exports = attp;
