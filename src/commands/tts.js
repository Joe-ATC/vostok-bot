const axios = require("axios");
const gtts = require("google-tts-api");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const tts = async (sock, remoteJid, msg, args) => {
    try {
        if (args.length === 0) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* Por favor ingresa el texto.\n💡 *Ejemplo:* `!tts hola mundo` o `!tts jorge hola mundo`" 
            }, { quoted: msg });
        }

        let voice = "google";
        let text = args.join(" ");

        // Detectar si el primer argumento es una voz específica
        const voices = ["jorge", "loquendo", "diego", "google", "siri", "zira"];
        const firstArg = args[0].toLowerCase();

        if (voices.includes(firstArg)) {
            voice = firstArg;
            text = args.slice(1).join(" ");
            if (voice === "loquendo") voice = "jorge";
        }

        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: `❌ *Error:* Por favor ingresa el texto para la voz de *${voice}*.` 
            }, { quoted: msg });
        }

        if (text.length > 300) {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* El texto es demasiado largo (máx 300 caracteres)." 
            }, { quoted: msg });
        }

        await sock.sendMessage(remoteJid, { text: `🎙️ _Generando audio (${voice})..._` }, { quoted: msg });

        let audioUrl;
        if (voice === "google") {
            audioUrl = gtts.getAudioUrl(text, {
                lang: 'es',
                slow: false,
                host: 'https://translate.google.com',
            });
        } else if (voice === "jorge" || voice === "diego") {
            // Usar API de Loquendo
            audioUrl = `https://api.agatz.xyz/api/loquendo?message=${encodeURIComponent(text)}&voice=${voice}`;
        } else {
            // Fallback a google si la voz no está implementada aún
            audioUrl = gtts.getAudioUrl(text, { lang: 'es' });
        }

        await sock.sendMessage(remoteJid, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: msg });

        console.log(chalk.green(`[TTS] Audio generado (${voice}) con éxito.`));

    } catch (err) {
        console.error(chalk.red("[TTS Error]"), err);
        await sock.sendMessage(remoteJid, { 
            text: "❌ Hubo un error al generar el audio. Inténtalo de nuevo más tarde." 
        }, { quoted: msg });
    }
};

module.exports = tts;
