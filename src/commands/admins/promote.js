const { jidNormalizedUser } = require("@whiskeysockets/baileys");
const { toSmallCaps, toBoldSerif, toScript } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "promote",
    aliases: ["daradmin", "admin"],
    category: "admins",
    execute: async (sock, remoteJid, msg) => {
        try {
            if (!remoteJid.endsWith('@g.us')) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("Este comando es exclusivo para grupos.")} ⌟` 
                }, { quoted: msg });
            }

            const metadata = await sock.groupMetadata(remoteJid);
            const userJid = jidNormalizedUser(msg.key.participant || msg.key.remoteJid);
            
            const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const isUserAdmin = admins.some(p => jidNormalizedUser(p.id) === userJid);

            if (!isUserAdmin) {
                console.log(chalk.yellow(`[PROMOTE] Usuario no detectado como admin local, procediendo.`));
            }

            const botNumber = jidNormalizedUser(sock.user.id);
            const isBotAdmin = admins.some(p => jidNormalizedUser(p.id) === botNumber);

            if (!isBotAdmin) {
                console.log(chalk.yellow(`[PROMOTE] Bot no detectado como admin local, intentando ejecución.`));
            }

            // Borrar el mensaje del comando para limpieza
            await sock.sendMessage(remoteJid, { delete: msg.key }).catch(() => {});

            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
            const mentionedJids = quotedMsg?.mentionedJid || [];
            let targetJid = null;

            if (quotedMsg && quotedMsg.participant) {
                targetJid = jidNormalizedUser(quotedMsg.participant);
            } else if (mentionedJids.length > 0) {
                targetJid = jidNormalizedUser(mentionedJids[0]);
            } else {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Por favor, responda o mencione al usuario.")} ⌟` 
                }, { quoted: msg });
            }

            if (targetJid === botNumber) {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("Yo ya soy administrador del grupo.")} ⌟` 
                }, { quoted: msg });
            }

            const targetParticipant = metadata.participants.find(p => jidNormalizedUser(p.id) === targetJid);

            if (targetParticipant && targetParticipant.admin === 'superadmin') {
                return await sock.sendMessage(remoteJid, { 
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("El usuario ya es el creador del grupo.")} ⌟` 
                }, { quoted: msg });
            }

            await sock.groupParticipantsUpdate(remoteJid, [targetJid], "promote");
            
            await sock.sendMessage(remoteJid, { 
                text: `💮 *${toSmallCaps("NUEVO ADMIN")}* 💮\n\n⌞ @${targetJid.split("@")[0]} ahora tiene permisos de administración. ⌟`,
                mentions: [targetJid]
            });

        } catch (err) {
            console.error(chalk.red("[PROMOTE Error]"), err);
            await sock.sendMessage(remoteJid, { 
                text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Ocurrió un error al intentar modificar los roles del grupo.")} ⌟` 
            }, { quoted: msg });
        }
    }
};
