const { toSmallCaps, toBoldSerif, toMono, toScript } = require("../../utils/helpers");
const { botName, version: botVer } = require("../../config/settings");
const path = require("path");
const chalk = require("chalk");

module.exports = {
    name: "menu",
    aliases: ["help", "ayuda"],
    category: "general",
    execute: async (sock, remoteJid, msg, args, pushName) => {
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
            menuContent += `🌸 *${toMono("!sticker")}* (s) ⌞ ${toScript("Crear sticker")} ⌟\n`;
            menuContent += `🌸 *${toMono("!tts")}* ⌞ ${toScript("Texto a voz")} ⌟\n`;
            menuContent += `🌸 *${toMono("!toimg")}* ⌞ ${toScript("Sticker a img")} ⌟\n\n`;

            menuContent += `${divider}\n`;
            menuContent += `   🌻  *${toBoldSerif("A D M I N I S T R A C I O N")}*\n`;
            menuContent += `${divider}\n`;
            menuContent += `💮 *${toMono("!tagall")}* ⌞ ${toScript("Mencionar todos")} ⌟\n`;
            menuContent += `💮 *${toMono("!kick")}* ⌞ ${toScript("Eliminar usuario")} ⌟\n`;
            menuContent += `💮 *${toMono("!promote")}* ⌞ ${toScript("Dar admin")} ⌟\n`;
            menuContent += `💮 *${toMono("!demote")}* ⌞ ${toScript("Quitar admin")} ⌟\n\n`;
            
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
    }
};
