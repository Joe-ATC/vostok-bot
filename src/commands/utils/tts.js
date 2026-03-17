const gtts = require("google-tts-api");
const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "tts",
    aliases: ["voz", "habla"],
    category: "utils",
    execute: async (sock, remoteJid, msg, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Proporciona el texto que deseas convertir")} ⌟\n\n🌻 *${toBoldSerif("Opciones de voz:")}*\n🌸 ${toMono("!tts jorge")} [texto]\n🌸 ${toMono("!tts diego")} [texto]\n🌸 ${toMono("!tts google")} [texto]` 
                }, { quoted: msg });
            }

            let voice = "google";
            let text = args.join(" ");

            const voices = ["jorge", "loquendo", "diego", "google", "siri", "zira"];
            const firstArg = args[0].toLowerCase();

            if (voices.includes(firstArg)) {
                voice = firstArg;
                text = args.slice(1).join(" ");
                if (voice === "loquendo") voice = "jorge";
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

            await sock.sendMessage(remoteJid, { react: { text: "🎙️", key: msg.key } });

            let audioUrl;
            if (voice === "google") {
                audioUrl = gtts.getAudioUrl(text, {
                    lang: 'es',
                    slow: false,
                    host: 'https://translate.google.com',
                });
            } else if (voice === "jorge" || voice === "diego") {
                audioUrl = `https://api.agatz.xyz/api/loquendo?message=${encodeURIComponent(text)}&voice=${voice}`;
            } else {
                audioUrl = gtts.getAudioUrl(text, { lang: 'es' });
            }

            await sock.sendMessage(remoteJid, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: msg });

            console.log(chalk.green(`[TTS] ${voice} completado.`));

        } catch (err) {
            console.error(chalk.red("[TTS Error]"), err);
            await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Hubo un problema al generar el audio solicitado.")} ⌟` 
            }, { quoted: msg });
        }
    }
};
