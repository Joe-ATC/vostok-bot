const axios = require("axios");
const { toSmallCaps, toBoldSerif, toScript } = require("../utils/helpers");
const chalk = require("chalk");

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

        const url = `https://api.agatz.xyz/api/pinterest?message=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        
        if (response.data.status !== 200 || !response.data.data || response.data.data.length === 0) {
            throw new Error("No results");
        }

        const results = response.data.data;
        const randomImage = results[Math.floor(Math.random() * results.length)];

        await sock.sendMessage(remoteJid, { 
            image: { url: randomImage }, 
            caption: `『 ${toBoldSerif("Resultado Pinterest")} 』 🌸\n\n🌻 *${toSmallCaps("Búsqueda:")}* ${query}`
        }, { quoted: msg });

        console.log(chalk.green("[PINTEREST] Search finished."));

    } catch (err) {
        console.error(chalk.red("[PINTEREST Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se encontraron imágenes para esta búsqueda.")} ⌟` 
        }, { quoted: msg });
    }
};

module.exports = pinterest;
