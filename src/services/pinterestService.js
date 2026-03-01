const { agatzApiBaseUrl } = require("../config/settings");
const { httpGet } = require("./httpClient");

const fetchPinterestImage = async (query) => {
    const response = await httpGet(`${agatzApiBaseUrl}/pinterest`, {
        params: { message: query }
    });

    const data = response.data || {};
    if (data.status !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error("pinterest_no_results");
    }

    const results = data.data;
    return results[Math.floor(Math.random() * results.length)];
};

module.exports = {
    fetchPinterestImage
};
