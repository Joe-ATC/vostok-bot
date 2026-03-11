require("dotenv").config({ quiet: true });

const asPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const settings = {
    prefix: process.env.BOT_PREFIX || "!",
    botName: process.env.BOT_NAME || "VOSTOK-CORE BOT",
    ownerName: process.env.BOT_OWNER_NAME || "DEREK",
    ownerNumber: process.env.BOT_OWNER_NUMBER || "521234567890",
    githubUrl: process.env.BOT_GITHUB_URL || "github.com/Joe-ATC",
    sessionPath: process.env.BOT_SESSION_PATH || "auth_info_baileys",
    version: process.env.BOT_VERSION || "3.0.0",
    logLevel: process.env.LOG_LEVEL || "info",
    requestTimeoutMs: asPositiveInt(process.env.REQUEST_TIMEOUT_MS, 15000),
    requestRetryCount: asPositiveInt(process.env.REQUEST_RETRY_COUNT, 2),
    downloadApiUrl: process.env.DOWNLOAD_API_URL || "http://localhost:3000/api/download"
};

const validateSettings = () => {
    if (!settings.prefix || settings.prefix.trim().length === 0) {
        throw new Error("BOT_PREFIX cannot be empty");
    }
    if (!/^https?:\/\//i.test(settings.downloadApiUrl)) {
        throw new Error("DOWNLOAD_API_URL must be a valid http/https URL");
    }
};

module.exports = {
    ...settings,
    validateSettings
};
