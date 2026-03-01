const pino = require("pino");
const { logLevel } = require("../config/settings");

const logger = pino({
    level: logLevel,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
