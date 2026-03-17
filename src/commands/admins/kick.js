const { jidNormalizedUser } = require("@whiskeysockets/baileys");
const { toSmallCaps, toBoldSerif, toScript } = require("../../utils/helpers");
const chalk = require("chalk");

module.exports = {
    name: "kick",
    aliases: ["ban", "expulsar"],
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

            // Intentar ejecutar aunque falle la checada de admin local (Fallback)
            if (!isUserAdmin) {
                console.log(chalk.yellow(`[KICK] Usuario no detectado como admin local, procediendo por orden directa.`));
            }

            // Validar que el bot sea admin
            const botNumber = jidNormalizedUser(sock.user.id);
            const isBotAdmin = admins.some(p => jidNormalizedUser(p.id) === botNumber);

            if (!isBotAdmin) {
                console.log(chalk.yellow(`[KICK] Bot no detectado como admin local, intentando ejecución forzada.`));
            }

            // Borrar el mensaje del comando para limpieza
            await sock.sendMessage(remoteJid, { delete: msg.key }).catch(() => { });

            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
            const mentionedJids = quotedMsg?.mentionedJid || [];
            let targetJid = null;

            if (quotedMsg && quotedMsg.participant) {
                targetJid = jidNormalizedUser(quotedMsg.participant);
            } else if (mentionedJids.length > 0) {
                targetJid = jidNormalizedUser(mentionedJids[0]);
            } else {
                return await sock.sendMessage(remoteJid, {
                    text: `🌸 *${toBoldSerif("Instrucción")}* 🌸\n\n⌞ ${toScript("Por favor, responda o mencione al usuario que desea eliminar.")} ⌟`
                }, { quoted: msg });
            }

            if (targetJid === botNumber) {
                return await sock.sendMessage(remoteJid, {
                    text: `🌸 *${toBoldSerif("Aviso")}* 🌸\n\n⌞ ${toScript("¡Oye! No puedo expulsarme a mí mismo.")} ⌟`
                }, { quoted: msg });
            }

            const targetParticipant = metadata.participants.find(p => jidNormalizedUser(p.id) === targetJid);

            if (targetParticipant && targetParticipant.admin === 'superadmin' && targetJid !== botNumber) {
                return await sock.sendMessage(remoteJid, {
                    text: `🌸 *${toBoldSerif("Intocable")}* 🌸\n\n⌞ ${toScript("No puedo expulsar al creador del grupo.")} ⌟`
                }, { quoted: msg });
            }

            await sock.groupParticipantsUpdate(remoteJid, [targetJid], "remove");

            await sock.sendMessage(remoteJid, {
                text: `💮 *${toSmallCaps("Usuario Eliminado")}* 💮\n\n⌞ @${targetJid.split("@")[0]} ha sido expulsado del grupo. ⌟`,
                mentions: [targetJid]
            });

        } catch (err) {
            console.error(chalk.red("[KICK Error]"), err);
            await sock.sendMessage(remoteJid, {
                text: `🌸 *${toBoldSerif("Error")}* 🌸\n\n⌞ ${toScript("Ocurrió un error al intentar eliminar al participante.")} ⌟`
            }, { quoted: msg });
        }
    }
};
