const test = require("node:test");
const assert = require("node:assert/strict");

const { commands, loadCommands } = require("../src/handlers/commandLoader");
const { handleMessages } = require("../src/handlers/messageHandler");

test("procesa todos los mensajes del upsert", async () => {
    // Asegurar que exista un comando ping fake en el Map de comandos para esta prueba
    commands.set("ping", {
        name: "ping",
        execute: async () => {
            pingCalls++;
        }
    });

    let pingCalls = 0;

    const sends = [];
    const sock = {
        sendMessage: async (jid, payload) => {
            sends.push({ jid, payload });
            return { key: { id: "mock-id" } };
        }
    };

    const upsert = {
        messages: [
            {
                key: { remoteJid: "111@s.whatsapp.net", fromMe: false, id: "A" },
                message: { conversation: "!ping" }
            },
            {
                key: { remoteJid: "222@s.whatsapp.net", fromMe: false, id: "B" },
                message: { conversation: "!ping" }
            }
        ]
    };

    await handleMessages(upsert, sock);

    assert.equal(pingCalls, 2);
    assert.equal(sends.length, 2); // 2 de reaccion

    // Limpieza
    commands.delete("ping");
});

test("ignora mensajes sin prefijo", async () => {
    const sends = [];
    const sock = {
        sendMessage: async (jid, payload) => {
            sends.push({ jid, payload });
            return { key: { id: "mock-id" } };
        }
    };

    const upsert = {
        messages: [
            {
                key: { remoteJid: "111@s.whatsapp.net", fromMe: false, id: "A" },
                message: { conversation: "hola" }
            }
        ]
    };

    await handleMessages(upsert, sock);
    assert.equal(sends.length, 0);
});
