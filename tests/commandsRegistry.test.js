const test = require("node:test");
const assert = require("node:assert/strict");

const commands = require("../src/commands/index");

test("expone comandos clave del bot", () => {
    const expected = [
        "menu",
        "ping",
        "stats",
        "creador",
        "sticker",
        "preguntas",
        "fbmp4",
        "pinmp4",
        "download",
        "attp",
        "toimg"
    ];

    for (const commandName of expected) {
        assert.equal(typeof commands[commandName], "function");
    }
});
