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

        await sock.sendMessage(remoteJid, { text: "⏳ _Generando sticker premium con emojis..._" }, { quoted: msg });

        // Usamos api.memegen.link que tiene un excelente soporte para emojis y fuentes modernas
        // Estética: Texto negro sobre fondo blanco (minimalista)
        // El texto se coloca en la parte superior ('_') para que se vea centrado/limpio
        const encodedText = encodeURIComponent(text.trim());
        const whiteBackground = "https://i.imgur.com/8M2N5p4.png"; // Imagen blanca pura
        
        const url = `https://api.memegen.link/images/custom/_/${encodedText}.png?background=${whiteBackground}&font=notosans-bold`;
        
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
            quality: 100 
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Sticker premium (Memegen) generado con éxito."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un fallo al generar el sticker con emojis. Intenta con un texto más breve." 
        }, { quoted: msg });
    }
};

module.exports = attp;
