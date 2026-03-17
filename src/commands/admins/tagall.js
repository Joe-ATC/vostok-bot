const { jidNormalizedUser } = require("@whiskeysockets/baileys");
const { toSmallCaps, toBoldSerif, toScript, toMono } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "tagall",
    aliases: ["todos", "mencionar"],
    category: "admins",
    execute: async (sock, remoteJid, msg, args) => {
        try {
            if (!remoteJid.endsWith('@g.us')) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("Este comando es de uso exclusivo en grupos.")} ⌟` 
                }, { quoted: msg });
            }

            const metadata = await sock.groupMetadata(remoteJid);
            const userJid = jidNormalizedUser(msg.key.participant || msg.key.remoteJid);
            
            const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const isUserAdmin = admins.some(p => jidNormalizedUser(p.id) === userJid);

            if (!isUserAdmin) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Denegado")}* 🌸\n\n⌞ ${toScript("Solo los administradores pueden usar este comando.")} ⌟` 
                }, { quoted: msg });
            }

            const botNumber = jidNormalizedUser(sock.user.id);
            const isBotAdmin = admins.some(p => jidNormalizedUser(p.id) === botNumber);

            const participants = metadata.participants;
            const mentions = participants.map(mem => mem.id);
            
            let messageText = args.join(" ");
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quotedMsg) {
                messageText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || messageText;
            }

            if (!messageText) {
                messageText = "¡Atención a todos los miembros del grupo!";
            }

            const divider = "❀✿━━━━━━━━━━━━━━━━━━━━✿❀";
            let tagMsg = `『 ${toBoldSerif("Aviso Importante")} 』 🌸\n\n`;
            tagMsg += `⌞ ${messageText} ⌟\n\n`;
            tagMsg += `${divider}\n`;
            tagMsg += `🏵️ *${toSmallCaps("Enviado por:")}* @${userJid.split('@')[0]}`;

            await sock.sendMessage(remoteJid, { 
                text: tagMsg, 
                mentions: mentions 
            });

            // Borrado Final (Modo Fantasma) - Se ejecuta al final para no interferir con la mención
            setTimeout(async () => {
                try {
                    await sock.sendMessage(remoteJid, { delete: msg.key });
                } catch (e) {
                    console.error(chalk.yellow("[TAGALL Cleanup] No se pudo eliminar el mensaje original."));
                }
            }, 1000);

            console.log(chalk.green("[TAGALL] Ghost Broadcast sent."));

        } catch (err) {
            console.error(chalk.red("[TAGALL Error]"), err);
            await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("No se pudo completar la mención general.")} ⌟` 
            }, { quoted: msg });
        }
    }
};
