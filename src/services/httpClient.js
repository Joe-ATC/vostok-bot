const axios = require("axios");
const {
    requestTimeoutMs,
    requestRetryCount
} = require("../config/settings");

const isTransientHttpError = (error) => {
    if (!error || !error.response) return true;
    const status = error.response.status;
    return status >= 500 || status === 429;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const httpGet = async (url, options = {}) => {
    const retries = Number.isInteger(options.retries)
        ? options.retries
        : requestRetryCount;
    const timeout = options.timeoutMs || requestTimeoutMs;

    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await axios.get(url, {
                params: options.params,
                timeout,
                validateStatus: (status) => status >= 200 && status < 300
            });
        } catch (error) {
            lastError = error;
            if (attempt === retries || !isTransientHttpError(error)) {
                break;
            }
            await delay(250 * (attempt + 1));
        }
    }
    throw lastError;
};

module.exports = {
    httpGet
};
