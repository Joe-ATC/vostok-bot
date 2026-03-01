const { agatzApiBaseUrl } = require("../config/settings");

const AVAILABLE_VOICES = ["jorge", "loquendo", "diego", "google", "siri", "zira"];

const normalizeVoice = (voice) => {
    if (voice === "loquendo") return "jorge";
    return voice;
};

const buildTtsAudioUrl = (voice, text) => {
    const selectedVoice = normalizeVoice(voice);

    if (selectedVoice === "google" || selectedVoice === "siri" || selectedVoice === "zira") {
        const params = new URLSearchParams({
            ie: "UTF-8",
            tl: "es",
            client: "tw-ob",
            q: text
        });
        return `https://translate.google.com/translate_tts?${params.toString()}`;
    }

    return `${agatzApiBaseUrl}/loquendo?message=${encodeURIComponent(text)}&voice=${selectedVoice}`;
};

module.exports = {
    AVAILABLE_VOICES,
    normalizeVoice,
    buildTtsAudioUrl
};
