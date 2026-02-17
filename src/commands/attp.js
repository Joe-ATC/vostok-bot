const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { botName } = require("../config/settings");
const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const chalk = require("chalk");

const attp = async (sock, remoteJid, msg, args) => {
    try {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Escribe el texto que deseas convertir.")} ⌟\n\n🌻 *Ejemplo:* !attp Hola mundo` 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { 
            text: `💮 *${toSmallCaps("Generando sticker...")}*` 
        }, { quoted: msg });

        const encodedText = encodeURIComponent(text.trim());
        const whiteBackground = "https://i.imgur.com/8M2N5p4.png";
        const url = `https://api.memegen.link/images/custom/_/${encodedText}.png?background=${whiteBackground}&font=notosans-bold`;
        
        const now = new Date();
        const requester = msg.pushName || "Usuario";
        const exifPack = toSmallCaps(botName);
        const exifAuthor = `${toSmallCaps(requester)}\n${now.toLocaleDateString()}`;

        const stickerObj = new Sticker(url, {
            pack: exifPack,
            author: exifAuthor,
            type: StickerTypes.FULL,
            id: msg.key.id,
            quality: 100 
        });

        const stickerBuffer = await stickerObj.toBuffer();
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        console.log(chalk.green("[ATTP] Completado con éxito."));

    } catch (err) {
        console.error(chalk.red("[ATTP Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Hubo un fallo al generar el sticker de texto.")} ⌟` 
        }, { quoted: msg });
    }
};

module.exports = attp;
