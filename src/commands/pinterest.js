const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const logger = require("../utils/logger");
const { fetchPinterestImage } = require("../services/pinterestService");

const pinterest = async (sock, remoteJid, msg, args) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Ingresa el término que deseas buscar.")} ⌟\n\n🌻 *Ejemplo:* !pinterest neon aesthetics`
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, {
            text: `🏵️ *${toSmallCaps("Buscando...")}*`
        }, { quoted: msg });

        const randomImage = await fetchPinterestImage(query);

        await sock.sendMessage(remoteJid, {
            image: { url: randomImage },
            caption: `『 ${toBoldSerif("Resultado Pinterest")} 』 🌸\n\n🌻 *${toSmallCaps("Búsqueda:")}* ${query}`
        }, { quoted: msg });

        logger.info({ remoteJid, query }, "pinterest_completed");
    } catch (err) {
        logger.error({ err: err.message, remoteJid }, "pinterest_failed");
        await sock.sendMessage(remoteJid, {
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se encontraron imágenes para esta búsqueda.")} ⌟`
        }, { quoted: msg });
    }
};

module.exports = pinterest;
