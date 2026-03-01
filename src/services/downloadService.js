const { downloadApiUrl } = require("../config/settings");
const { httpGet } = require("./httpClient");

const fetchDownloadData = async (mediaUrl) => {
    const response = await httpGet(downloadApiUrl, {
        params: { url: mediaUrl }
    });

    const data = response.data || {};
    if (data.status !== "success" || !data.best) {
        throw new Error("download_service_invalid_response");
    }

    return data;
};

module.exports = {
    fetchDownloadData
};
