const path = require("path");

// Permite personalizar algunos valores mediante variables de entorno (útil para Termux / entornos Docker)
const env = (key, fallback) => process.env[key] || fallback;

module.exports = {
    prefix: env("BOT_PREFIX", "!"),
    botName: env("BOT_NAME", "VOSTOK-CORE BOT"),
    ownerName: env("OWNER_NAME", "DEREK"),
    ownerNumber: env("OWNER_NUMBER", "521234567890"), // Cambia esto
    githubUrl: env("GITHUB_URL", "https://github.com/Joe-ATC/vostok-bot"),
    // Se usa la ruta absoluta para evitar problemas al ejecutar desde un directorio distinto (p. ej. Termux)
    sessionPath: path.resolve(env("SESSION_PATH", "auth_info_baileys")),
    version: env("BOT_VERSION", "3.0.0")
};
