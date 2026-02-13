const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiApiKey, botName } = require("../config/settings");
const { toSmallCaps } = require("../utils/helpers");
const chalk = require("chalk");

const ia = async (sock, remoteJid, msg, args, pushName) => {
    try {
        if (!geminiApiKey || geminiApiKey === "TU_API_KEY_AQUI") {
            return await sock.sendMessage(remoteJid, { 
                text: "❌ *Error:* No has configurado tu API Key de Gemini en `src/config/settings.js`." 
            }, { quoted: msg });
        }

        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(remoteJid, { 
                text: "💡 *Ejemplo de uso:* `!ia ¿cómo funciona el motor de un coche?`" 
            }, { quoted: msg });
        }

        // Mostrar estado de "escribiendo"
        await sock.sendPresenceUpdate('composing', remoteJid);
        
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        // Usamos gemini-1.5-flash que es el estándar actual
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Configurar el prompt del sistema para darle personalidad
        const prompt = `Actúa como ${botName}, un asistente virtual inteligente, servicial y divertido para WhatsApp. 
        El usuario que te habla se llama ${pushName}. 
        Responde de forma clara y concisa, usando emojis de vez en cuando. 
        Pregunta del usuario: ${query}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const divider = `━━━━━━━━━━━━━━━━━━━━`;
        let aiResponse = `🤖 *【 ${toSmallCaps("Gemini AI")} 】* 🤖\n\n`;
        aiResponse += `${text}\n\n`;
        aiResponse += `${divider}\n`;
        aiResponse += `✨ *${toSmallCaps("Powered by Google Gemini")}*`;

        await sock.sendMessage(remoteJid, { 
            text: aiResponse,
            mentions: [msg.key.participant || msg.key.remoteJid]
        }, { quoted: msg });

    } catch (err) {
        console.error(chalk.red("[IA Error]"), err);
        let errorMsg = "❌ Error al conectar con la IA.";
        if (err.message?.includes("API_KEY_INVALID")) {
            errorMsg = "❌ *Error:* Tu API Key de Gemini no es válida.";
        }
        await sock.sendMessage(remoteJid, { text: errorMsg }, { quoted: msg });
    }
};

module.exports = ia;
