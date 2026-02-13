const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { botName } = require("../config/settings");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const attp = async (sock, remoteJid, msg, args) => {
    try {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Por favor ingresa el texto para el sticker.\n💡 *Ejemplo:* `!attp hola mundo 😊`" 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: "⏳ _Generando sticker premium (Arial/Roboto)..._" }, { quoted: msg });

        // Usamos placehold.co para generar una imagen limpia con fuente Roboto/Arial
        // Es compatible con el estilo minimalista que pediste (Texto negro, Fondo blanco)
        // Intentamos codificar correctamente los emojis
        const encodedText = encodeURIComponent(text);
        
        // Probamos una API que suele manejar mejor los emojis para stickers (Fallback si placehold no rinde con emojis)
        // Pero intentaremos primero con el estilo solicitado.
        const url = `https://placehold.co/512x512/ffffff/000000/png?text=${encodedText}&font=roboto`;
        
        // Si el usuario quiere emojis, a veces es mejor usar APIs de stickers dedicadas
        // Pero seguiremos tu instrucción de estilo minimalista.
        
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
            quality: 100 // Máxima calidad para texto
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Sticker premium generado con éxito."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un fallo al generar el sticker. Intenta con un texto más breve o sin caracteres especiales extraños." 
        }, { quoted: msg });
    }
};

module.exports = attp;
