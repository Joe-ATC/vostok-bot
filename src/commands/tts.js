const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../utils/helpers");
const logger = require("../utils/logger");
const {
    AVAILABLE_VOICES,
    normalizeVoice,
    buildTtsAudioUrl
} = require("../services/ttsService");

const tts = async (sock, remoteJid, msg, args) => {
    try {
        if (args.length === 0) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Proporciona el texto que deseas convertir")} ⌟\n\n🌻 *${toBoldSerif("Opciones de voz:")}*\n🌸 ${toMono("!tts jorge")} [texto]\n🌸 ${toMono("!tts diego")} [texto]`
            }, { quoted: msg });
        }

        let voice = "google";
        let text = args.join(" ");
        const firstArg = args[0].toLowerCase();

        if (AVAILABLE_VOICES.includes(firstArg)) {
            voice = firstArg;
            text = args.slice(1).join(" ");
        }

        if (!text) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript(`Falta el texto para la voz de ${voice}.`)} ⌟`
            }, { quoted: msg });
        }

        if (text.length > 300) {
            return await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Límite")}* 🌸\n\n⌞ ${toScript("El texto excede el máximo de 300 caracteres.")} ⌟`
            }, { quoted: msg });
        }

        const normalizedVoice = normalizeVoice(voice);
        await sock.sendMessage(remoteJid, {
            text: `🎙️ *${toSmallCaps(`Generando audio ${normalizedVoice}...`)}*`
        }, { quoted: msg });

        const audioUrl = buildTtsAudioUrl(voice, text);

        await sock.sendMessage(remoteJid, {
            audio: { url: audioUrl },
            mimetype: "audio/mp4",
            ptt: true
        }, { quoted: msg });

        logger.info({ remoteJid, voice: normalizedVoice }, "tts_completed");
    } catch (err) {
        logger.error({ err: err.message, remoteJid }, "tts_failed");
        await sock.sendMessage(remoteJid, {
            text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Hubo un problema al generar el audio solicitado.")} ⌟`
        }, { quoted: msg });
    }
};

module.exports = tts;
