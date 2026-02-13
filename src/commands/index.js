const { toSmallCaps } = require("../utils/helpers");
const { botName, ownerName, githubUrl, version: botVer } = require("../config/settings");
const path = require("path");
const chalk = require("chalk");
const sticker = require("./sticker");
const attp = require("./attp");
const toimg = require("./toimg");
const tts = require("./tts");
const tagall = require("./tagall");
const pinterest = require("./pinterest");

const menu = async (sock, remoteJid, msg, args, pushName) => {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const userJid = msg.key.participant || msg.key.remoteJid;

        const divider = `━━━━━━━━━━━━━━━━━━━━`;
        
        let menuContent = `🔮 *【 ${toSmallCaps(botName)} 】* 🔮\n\n`;
        
        menuContent += `🔹 *ᴜsᴜᴀʀɪᴏ:* @${userJid.split('@')[0]}\n`;
        menuContent += `📅 *ғᴇᴄʜᴀ:* ${dateStr}\n`;
        menuContent += `⏰ *ʜᴏʀᴀ:* ${timeStr}\n`;
        menuContent += `🚀 *ᴠᴇʀsɪᴏɴ:* ${botVer}\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `🌸  *ɪ ɴ ғ ᴏ ʀ ᴍ ᴀ ᴄ ɪ ᴏ ɴ*\n`;
        menuContent += `${divider}\n`;
        menuContent += `✨ *${toSmallCaps("!menu")}* ➟ _Menú principal_\n`;
        menuContent += `✨ *${toSmallCaps("!ping")}* ➟ _Velocidad del bot_\n`;
        menuContent += `✨ *${toSmallCaps("!stats")}* ➟ _Rendimiento del sistema_\n`;
        menuContent += `✨ *${toSmallCaps("!creador")}* ➟ _Info del desarrollador_\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `🛠️  *ᴜ ᴛ ɪ ʟ ɪ ᴅ ᴀ ᴅ ᴇ s*\n`;
        menuContent += `${divider}\n`;
        menuContent += `✨ *${toSmallCaps("!sticker")}* ➟ _Crear stickers_\n`;
        menuContent += `✨ *${toSmallCaps("!attp")}* ➟ _Sticker de texto (Minimalista)_\n`;
        menuContent += `✨ *${toSmallCaps("!toimg")}* ➟ _Sticker a imagen_\n`;
        menuContent += `✨ *${toSmallCaps("!tts")}* ➟ _Texto a voz (Normal/Jorge)_\n`;
        menuContent += `✨ *${toSmallCaps("!pinterest")}* ➟ _Buscar imágenes_\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `👥  *ɢ ʀ ᴜ ᴘ ᴏ s*\n`;
        menuContent += `${divider}\n`;
        menuContent += `✨ *${toSmallCaps("!tagall")}* ➟ _Mencionar a todos_\n\n`;

        menuContent += `${divider}\n`;
        menuContent += `❓  *ᴀ ʏ ᴜ ᴅ ᴀ*\n`;
        menuContent += `${divider}\n`;
        menuContent += `✨ *${toSmallCaps("!preguntas")}* ➟ _Preguntas frecuentes_\n\n`;
        
        menuContent += `🌟 *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʀ-&&* 🌟`;

        await sock.sendMessage(remoteJid, { 
            image: { url: path.join(process.cwd(), "assets", "menu", "vostok.jpg") },
            caption: menuContent,
            mentions: [userJid]
        }, { quoted: msg });
    } catch (err) {
        console.error(chalk.red("[Menu Error]"), err);
    }
};

const preguntas = async (sock, remoteJid, msg) => {
    try {
        const userJid = msg.key.participant || msg.key.remoteJid;
        const divider = `━━━━━━━━━━━━━━━━━━━━`;

        let faq = `❓ *【 ${toSmallCaps("Preguntas Frecuentes")} 】* ❓\n\n`;

        const questions = [
            ["¿Qué es Vostok-Core?", "Es un bot multi-funcional diseñado para optimizar la interacción en WhatsApp."],
            ["¿Es seguro usarlo?", "Sí, el bot utiliza una conexión cifrada punto a punto a través de Baileys."],
            ["¿Cómo hago un sticker?", "Envía una imagen o video corto (max 10s) con el comando !sticker."],
            ["¿Por qué no responde?", "Puede ser por falta de conexión o sesión caída. Es normal debido a que está en una fase de prueba."],
            ["¿Funciona en grupos?", "Sí, está optimizado para funcionar tanto en chats privados como grupales."],
            ["¿Cómo veo mi latencia?", "Usa el comando !ping para ver la velocidad de respuesta."],
            ["¿Quién es el creador?", "Puedes ver la info del desarrollador usando el comando !creador."],
            ["¿El bot es gratuito?", "El bot es open source, por lo tanto: SI. Aunque puede que existen costos por servicios especificos"],
            ["¿Cómo actualizo el bot?", "Mantente al tanto del repositorio oficial en GitHub para nuevos cambios."],
            ["¿Qué hago si hay un bug?", "Reporta cualquier error directamente al desarrollador para una pronta solución."]
        ];

        questions.forEach(([q, a], i) => {
            faq += `*${i + 1}. ${q}*\n└ ${a}\n\n`;
        });

        faq += `${divider}\n`;
        faq += `👤 *sᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ:* @${userJid.split('@')[0]}`;

        await sock.sendMessage(remoteJid, { 
            text: faq,
            mentions: [userJid]
        }, { quoted: msg });
    } catch (err) {
        console.error(chalk.red("[Preguntas Error]"), err);
    }
};

const ping = async (sock, remoteJid, msg) => {
    try {
        const start = Date.now();
        const { key } = await sock.sendMessage(remoteJid, { text: "🚀 _Calculando latencia..._" }, { quoted: msg });
        const latency = Date.now() - start;
        await sock.sendMessage(remoteJid, { 
            text: `📡 *Woshh!* \n✨ Latencia: *${latency}ms*`,
            edit: key
        });
    } catch (err) {
        console.error(chalk.red("[Ping Error]"), err);
    }
};

const stats = async (sock, remoteJid, msg) => {
    try {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);

        let statsMess = `📊 *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs ᴠᴏsᴛᴏᴋ* 📊\n\n`;
        statsMess += `✨ *ᴍᴇᴍᴏʀɪᴀ:* ${used.toFixed(2)} MB\n`;
        statsMess += `✨ *ᴜᴘᴛɪᴍᴇ:* ${hours}h ${mins}m\n`;
        statsMess += `✨ *ᴘʟᴀᴛᴀғᴏʀᴍᴀ:* ${process.platform}\n`;
        statsMess += `✨ *ɴᴏᴅᴇ:* ${process.version}`;

        await sock.sendMessage(remoteJid, { text: statsMess }, { quoted: msg });
    } catch (err) {
        console.error(chalk.red("[Stats Error]"), err);
    }
};

const creador = async (sock, remoteJid, msg) => {
    try {
        const userJid = msg.key.participant || msg.key.remoteJid;
        const divider = `────────────────────`;

        let msgText = `💻 *【 ${toSmallCaps("Developer Info")} 】* 💻\n\n`;
        
        msgText += `👤 *ɴᴏᴍʙʀᴇ:* ${ownerName}\n`;
        msgText += `🚀 *ᴘᴇʀғɪʟ:* Programador Experimentado\n`;
        msgText += `🌐 *ᴀʀᴇᴀ:* Apps y Webs\n`;
        msgText += `🔗 *ɢɪᴛʜᴜʙ:* ${githubUrl}\n\n`;
        
        msgText += `${divider}\n`;
        msgText += `👤 *sᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ:* @${userJid.split('@')[0]}\n`;
        msgText += `${divider}`;

        await sock.sendMessage(remoteJid, { 
            image: { url: path.join(process.cwd(), "assets", "fun", "creador.png") },
            caption: msgText,
            mentions: [userJid] 
        }, { quoted: msg });
    } catch (err) {
        console.error(chalk.red("[Creador Error]"), err);
    }
};

module.exports = {
    menu,
    ping,
    stats,
    creador,
    sticker,
    preguntas,
    attp,
    toimg,
    tts,
    tagall,
    pinterest,
};
