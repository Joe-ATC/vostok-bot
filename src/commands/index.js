const { toSmallCaps, toBoldSerif, toMono, toScript } = require("../utils/helpers");
const { botName, ownerName, githubUrl, version: botVer } = require("../config/settings");
const path = require("path");
const chalk = require("chalk");
const sticker = require("./sticker");

const menu = async (sock, remoteJid, msg, args, pushName) => {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const userJid = msg.key.participant || msg.key.remoteJid;

        const divider = `❀✿━━━━━━━━━━━━━━━━━━✿❀`;
        
        let menuContent = `『 ${toBoldSerif(botName)} 』 🌸\n\n`;
        
        menuContent += `💮 ${toSmallCaps("Usuario:")} @${userJid.split('@')[0]}\n`;
        menuContent += `💮 ${toSmallCaps("Fecha:")} ${dateStr}\n`;
        menuContent += `💮 ${toSmallCaps("Hora:")} ${timeStr}\n`;
        menuContent += `💮 ${toSmallCaps("Version:")} ${botVer}\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `   🌸  *${toBoldSerif("I N F O R M A C I O N")}*\n`;
        menuContent += `${divider}\n`;
        menuContent += `🌻 *${toMono("!menu")}* ⌞ ${toScript("Menú principal")} ⌟\n`;
        menuContent += `🌻 *${toMono("!ping")}* ⌞ ${toScript("Estatus")} ⌟\n`;
        menuContent += `🌻 *${toMono("!stats")}* ⌞ ${toScript("Rendimiento")} ⌟\n`;
        menuContent += `🌻 *${toMono("!creador")}* ⌞ ${toScript("Desarrollador")} ⌟\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `   🌻  *${toBoldSerif("U T I L I D A D E S")}*\n`;
        menuContent += `${divider}\n`;
        menuContent += `🌸 *${toMono("!sticker")}* ⌞ ${toScript("Crear sticker")} ⌟\n\n`;
        
        menuContent += `${divider}\n`;
        menuContent += `     *${toBoldSerif("A Y U D A")}*\n`;
        menuContent += `${divider}\n`;
        menuContent += `🌺 *${toMono("!preguntas")}* ⌞ ${toScript("FAQs")} ⌟\n\n`;
        
        menuContent += `🏵️ ${toBoldSerif("Powered by GR-&&")} 🏵️`;

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
        const divider = `❀━━━━━━━━━━━━━━━━━━❀`;

        let faq = `❀ *${toBoldSerif("Preguntas Frecuentes")}* ❀\n\n`;

        const questions = [
            ["¿Qué es Vostok-Core?", "Un bot elegante y funcional para WhatsApp."],
            ["¿Es seguro?", "Sí, utiliza cifrado punto a punto vía Baileys."],
            ["¿Stickes?", "Envía imagen/video con !sticker."],
            ["¿No responde?", "Revisa el estado de conexión del servidor."],
            ["¿Latencia?", "Usa !ping para ver la velocidad."],
            ["¿Creador?", "Usa !creador para información del autor."],
            ["¿Costo?", "Es software libre y gratuito."],
            ["¿Actualización?", "Sigue el repositorio oficial en GitHub."],
            ["¿Errores?", "Reporta fallos al desarrollador para soporte."]
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
};

const ping = async (sock, remoteJid, msg) => {
    try {
        const start = Date.now();
        const { key } = await sock.sendMessage(remoteJid, { text: "🌸 _Midiendo latencia..._" }, { quoted: msg });
        const latency = Date.now() - start;
        await sock.sendMessage(remoteJid, { 
            text: `💮 *${toBoldSerif("Estatus")}*\n\n🌻 ${toSmallCaps("Velocidad:")} *${latency}ms*\n🌺 ${toSmallCaps("Estado:")} *${toScript("Operativo")}*`,
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

        let statsMess = `『 ${toBoldSerif("Rendimiento")} 』 🌺\n\n`;
        statsMess += `🌸 *${toSmallCaps("Memoria:")}* ${used.toFixed(2)} MB\n`;
        statsMess += `🌸 *${toSmallCaps("Uptime:")}* ${hours}h ${mins}m\n`;
        statsMess += `🌸 *${toSmallCaps("Sistema:")}* ${process.platform}\n`;
        statsMess += `🌸 *${toSmallCaps("Motor:")}* Node ${process.version}`;

        await sock.sendMessage(remoteJid, { text: statsMess }, { quoted: msg });
    } catch (err) {
        console.error(chalk.red("[Stats Error]"), err);
    }
};

const creador = async (sock, remoteJid, msg) => {
    try {
        const userJid = msg.key.participant || msg.key.remoteJid;
        const divider = `❀━━━━━━━━━━━━━━━━━━❀`;

        let msgText = `『 ${toBoldSerif("Developer Info")} 』 💮\n\n`;
        
        msgText += `🌸 *${toSmallCaps("Nombre:")}* ${ownerName}\n`;
        msgText += `🌸 *${toSmallCaps("Rol:")}* ${toScript("Software Developer")} \n`;
        msgText += `🌸 *${toSmallCaps("Github:")}* ${githubUrl}\n\n`;
        
        msgText += `${divider}\n`;
        msgText += `💮 *${toSmallCaps("Solicitado por:")}* @${userJid.split('@')[0]}`;

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
};
