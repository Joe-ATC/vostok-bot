const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizeVoice,
    buildTtsAudioUrl
} = require("../src/services/ttsService");

test("normaliza voz loquendo a jorge", () => {
    assert.equal(normalizeVoice("loquendo"), "jorge");
    assert.equal(normalizeVoice("google"), "google");
});

test("construye URL para voz agatz", () => {
    const url = buildTtsAudioUrl("diego", "hola mundo");
    assert.match(url, /\/loquendo\?/);
    assert.match(url, /voice=diego/);
});

test("construye URL para voz google", () => {
    const url = buildTtsAudioUrl("google", "hola mundo");
    assert.match(url, /^https?:\/\//);
    assert.match(url, /translate\.google/);
});
