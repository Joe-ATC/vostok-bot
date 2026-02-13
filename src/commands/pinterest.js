const axios = require("axios");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const pinterest = async (sock, remoteJid, msg, args) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Por favor ingresa el término de búsqueda.\n💡 *Ejemplo:* `!pinterest paisajes neon`" 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: "🔍 _Buscando imagen en Pinterest..._" }, { quoted: msg });

        // Intentamos con una API estable de la comunidad
        const url = `https://api.agatz.xyz/api/pinterest?message=${encodeURIComponent(query)}`;
        
        const response = await axios.get(url);
        
        if (response.data.status !== 200 || !response.data.data || response.data.data.length === 0) {
            throw new Error("No se encontraron resultados.");
        }

        // Seleccionamos una imagen aleatoria de los resultados
        const results = response.data.data;
        const randomImage = results[Math.floor(Math.random() * results.length)];

        await sock.sendMessage(remoteJid, { 
            image: { url: randomImage }, 
            caption: `✨ *Rᴇsᴜʟᴛᴀᴅᴏ ᴅᴇ Pɪɴᴛᴇʀᴇsᴛ* ✨\n\n📌 *Búsqueda:* ${query}\n🚀 *${toSmallCaps("Vostok Bot")}*`
        }, { quoted: msg });

        console.log(chalk.green("[PINTEREST] Imagen enviada con éxito."));

    } catch (err) {
        console.error(chalk.red("[PINTEREST Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ No pude encontrar imágenes para esa búsqueda. Intenta con otras palabras clave." 
        }, { quoted: msg });
    }
};

module.exports = pinterest;
