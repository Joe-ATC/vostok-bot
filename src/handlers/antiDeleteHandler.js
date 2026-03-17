const chalk = require("chalk");
const { toBoldSerif, toScript, toMono } = require("../utils/helpers");

// Almacén temporal de mensajes para detectar eliminaciones
const messageStore = new Map();

/**
 * Limpia el almacén de mensajes periódicamente para evitar consumo excesivo de RAM
 */
setInterval(() => {
    const now = Date.now();
    for (const [id, msg] of messageStore.entries()) {
        // Eliminar mensajes con más de 1 hora de antigüedad
        if (now - msg.timestamp > 3600000) {
            messageStore.delete(id);
        }
    }
}, 600000); // Cada 10 minutos

const handleAntiDelete = async (sock, update) => {
    try {
        // 1. Almacenar mensajes nuevos
        if (update.type === "notify" || update.type === "append") {
            for (const msg of update.messages) {
                if (!msg.message || msg.key.fromMe) continue;
                
                // Evitar mensajes de sistema o protocolos
                if (msg.message?.protocolMessage) continue;

                messageStore.set(msg.key.id, {
                    msg,
                    timestamp: Date.now()
                });
            }
        }

        // 2. Detectar mensajes eliminados
        // Baileys emite eliminaciones en messages.upsert con protocolMessage.type === 0 (REVOKE)
        for (const msg of update.messages) {
            const protocolMsg = msg.message?.protocolMessage;
            if (protocolMsg && protocolMsg.type === 0) { // 0 es REVOKE/Eliminar para todos
                const deletedId = protocolMsg.key.id;
                const remoteJid = msg.key.remoteJid;

                // Solo funcionar en grupos o chats no restringidos/archivos (JIDs estándar)
                if (!remoteJid || remoteJid === "status@broadcast") continue;

                const original = messageStore.get(deletedId);
                if (!original) continue;

                const originalMsg = original.msg;
                const participant = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // Extraer el contenido del mensaje borrado
                let deletedText = originalMsg.message?.conversation || 
                                originalMsg.message?.extendedTextMessage?.text || 
                                originalMsg.message?.imageMessage?.caption || 
                                originalMsg.message?.videoMessage?.caption;

                // --- FILTRO GHOST MODE ---
                // Si el mensaje es un comando que el bot borra automáticamente, no lo reportamos
                if (deletedText) {
                    const { prefix } = require("../config/settings");
                    const cleanText = deletedText.trim().toLowerCase();
                    const ghostCommands = ["tagall", "todos", "mencionar", "kick", "ban", "expulsar", "promote", "daradmin", "admin", "demote", "quitaradmin", "degradar", "s", "sticker"];
                    
                    const isGhostCommand = ghostCommands.some(cmd => 
                        cleanText.startsWith(prefix + cmd) || 
                        cleanText === "s" || 
                        cleanText === "sticker"
                    );

                    if (isGhostCommand) {
                        messageStore.delete(deletedId);
                        continue;
                    }
                }
                // -------------------------

                // Si es solo multimedia sin texto, avisar el tipo
                if (!deletedText) {
                    if (originalMsg.message?.imageMessage) deletedText = "📷 [Imagen]";
                    else if (originalMsg.message?.videoMessage) deletedText = "🎥 [Video / GIF]";
                    else if (originalMsg.message?.audioMessage) deletedText = "🎙️ [Nota de voz / Audio]";
                    else if (originalMsg.message?.stickerMessage) deletedText = "🏷️ [Sticker]";
                    else if (originalMsg.message?.documentMessage) deletedText = "📄 [Documento]";
                    else deletedText = "❌ [Tipo de mensaje no soportado]";
                }

                const divider = "❀✿━━━━━━━━━━━━━━━━━━━━✿❀";
                let response = `『 ${toBoldSerif("Anti-Delete Detective")} 』 🕵️‍♂️🌸\n\n`;
                response += `💮 *${toBoldSerif("Usuario:")}* @${participant.split("@")[0]}\n`;
                response += `💮 *${toBoldSerif("Mensaje:")}* ${deletedText}\n\n`;
                response += `${divider}\n`;
                response += `⌞ ${toScript("Vostok-Bot lo vio todo...")} ⌟`;

                await sock.sendMessage(remoteJid, { 
                    text: response, 
                    mentions: [participant] 
                }, { quoted: originalMsg });

                // Ya lo reportamos, podemos borrarlo del almacén
                messageStore.delete(deletedId);
            }
        }
    } catch (err) {
        // Error silencioso para no interrumpir el flujo del bot
        console.error(chalk.red("[Anti-Delete Error]:"), err);
    }
};

module.exports = { handleAntiDelete };
