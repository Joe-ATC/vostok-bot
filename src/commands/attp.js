const axios = require("axios");
const { toBoldSerif, toScript } = require("../utils/helpers");
const logger = require("../utils/logger");
const { bufferToWebp } = require("../utils/sticker");

const attp = async (sock, remoteJid, msg, args) => {
    try {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Escribe el texto que deseas convertir.")} ⌟\n\n🌻 *Ejemplo:* !attp Hola mundo`
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, {
            text: "💮 *Generando sticker...*"
        }, { quoted: msg });

        const encodedText = encodeURIComponent(text.trim());
        const whiteBackground = "https://i.imgur.com/8M2N5p4.png";
        const imageUrl = `https://api.memegen.link/images/custom/_/${encodedText}.png?background=${whiteBackground}&font=notosans-bold`;

        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000
        });

        const stickerBuffer = await bufferToWebp(Buffer.from(response.data));
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        logger.info({ remoteJid }, "attp_completed");
    } catch (err) {
        logger.error({ err: err.message, remoteJid }, "attp_failed");
        await sock.sendMessage(remoteJid, {
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Hubo un fallo al generar el sticker de texto.")} ⌟`
        }, { quoted: msg });
    }
};

module.exports = attp;
