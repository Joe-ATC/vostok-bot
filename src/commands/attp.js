const sharp = require("sharp");
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

        await sock.sendMessage(remoteJid, { text: "⏳ _Generando sticker de texto, espera un momento..._" }, { quoted: msg });

        // Función para dividir el texto en líneas (word wrap simple)
        const wrapText = (str, maxLen) => {
            const words = str.split(' ');
            let lines = [];
            let currentLine = '';

            words.forEach(word => {
                if ((currentLine + word).length < maxLen) {
                    currentLine += (currentLine ? ' ' : '') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            });
            lines.push(currentLine);
            return lines;
        };

        const lines = wrapText(text, 15);
        const fontSize = lines.length > 5 ? 30 : 45;
        const lineHeight = fontSize * 1.2;
        const startY = (512 - (lines.length * lineHeight)) / 2 + (fontSize / 1.5);

        // Generar el SVG con fondo blanco y texto negro
        let textSvg = "";
        lines.forEach((line, i) => {
            textSvg += `<text x="50%" y="${startY + (i * lineHeight)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="black" text-anchor="middle">${line}</text>`;
        });

        const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white" rx="30" ry="30" />
            ${textSvg}
        </svg>
        `;

        // Convertir SVG a Buffer de imagen usando Sharp (instalado anteriormente)
        const buffer = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        // Metadatos del sticker
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
            categories: ["✨", "📝"],
            id: msg.key.id,
            quality: 80
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Sticker de texto generado localmente con éxito."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Error al generar el sticker de texto. Intenta con algo más corto." 
        }, { quoted: msg });
    }
};

module.exports = attp;
