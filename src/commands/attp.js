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

        await sock.sendMessage(remoteJid, { text: "⏳ _Generando sticker minimalista..._" }, { quoted: msg });

        // Usamos dummyimage.com para generar una imagen limpia de texto (negro sobre blanco)
        // No requiere sharp localmente, lo cual mejora la compatibilidad
        const url = `https://dummyimage.com/600x600/ffffff/000000.png?text=${encodeURIComponent(text)}`;
        
        // Metadatos del sticker
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const requester = msg.pushName || "Usuario";
        const exifPack = `${toSmallCaps(botName)}`;
        const exifAuthor = `${toSmallCaps(requester)}\n📅 ${dateStr}\n⏰ ${timeStr}`;

        const stickerObj = new Sticker(url, {
            pack: exifPack,
            author: exifAuthor,
            type: StickerTypes.FULL,
            categories: ["✨", "📝"],
            id: msg.key.id,
            quality: 80
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Sticker generado via API externa (Minimalista)."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un fallo al generar el sticker. Intenta con un texto más breve." 
        }, { quoted: msg });
    }
};

module.exports = attp;
