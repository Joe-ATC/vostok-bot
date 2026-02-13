const gtts = require("google-tts-api");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const tts = async (sock, remoteJid, msg, args) => {
    try {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Por favor ingresa el texto que quieres convertir a voz.\n💡 *Ejemplo:* `!tts hola como están`" 
            }, { quoted: msg });
        }

        if (text.length > 200) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* El texto es demasiado largo. El límite es de 200 caracteres." 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: "🎙️ _Generando nota de voz..._" }, { quoted: msg });

        // Obtener la URL del audio (idioma español por defecto)
        const url = gtts.getAudioUrl(text, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
        });

        // Enviar el audio como nota de voz (PTT)
        await sock.sendMessage(remoteJid, { 
            audio: { url: url }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: msg });

        console.log(chalk.green("[TTS] Audio enviado con éxito."));

    } catch (err) {
        console.error(chalk.red("[TTS Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un error al generar el audio. Inténtalo de nuevo más tarde." 
        }, { quoted: msg });
    }
};

module.exports = tts;
