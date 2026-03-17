const { toSmallCaps, toBoldSerif, toScript } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "preguntas",
    aliases: ["faq", "ayudame"],
    category: "general",
    execute: async (sock, remoteJid, msg) => {
        try {
            const userJid = msg.key.participant || msg.key.remoteJid;
            const divider = `❀━━━━━━━━━━━━━━━━━━❀`;

            let faq = `❀ *${toBoldSerif("Preguntas Frecuentes")}* ❀\n\n`;

            const questions = [
                ["¿Cómo le hablo al bot?", "Deberás usar peticiones que inicien con un símbolo especial conocido como 'prefijo'."],
                ["¿Qué es el prefijo?", "En este caso es el símbolo '!'. Funciona como aviso para que el sistema empiece a leer y procesar tu orden."],
                ["¿Cómo solicito algo?", "Escribe el prefijo seguido directamente de tu necesidad. Por ejemplo: '!nombredelaaccion'."],
                ["¿Funciona en privado y en grupos?", "Sí, está diseñado para ambas vías, aunque ciertas interacciones están reservadas exclusivamente para grupos."],
                ["¿Qué pasa con la administración?", "El núcleo está programado para verificar jerarquías. Nadie que no sea administrador del chat podrá usar funciones restrictivas."],
                ["¿Y si escribo algo mal?", "La arquitectura de enrutamiento ignorará la palabra si no coincide con las ya establecidas, o devolverá un aviso en caso de uso incompleto."],
                ["¿Dónde conozco todo lo que hace?", "Despliega su menú principal dentro de la conversación para analizar sus capacidades actuales."]
            ];

            questions.forEach(([q, a], i) => {
                faq += `🌸 *${i + 1}. ${toSmallCaps(q)}*\n⌞ ${toScript(a)}\n\n`;
            });

            faq += `${divider}\n`;
            faq += `💮 *${toSmallCaps("Solicitado por:")}* @${userJid.split('@')[0]}`;

            await sock.sendMessage(remoteJid, { 
                text: faq,
                mentions: [userJid]
            }, { quoted: msg });
        } catch (err) {
            console.error(chalk.red("[Preguntas Error]"), err);
        }
    }
};
