const test = require("node:test");
const assert = require("node:assert/strict");

const settingsModulePath = require.resolve("../src/config/settings");

const loadSettings = () => {
    delete require.cache[settingsModulePath];
    return require("../src/config/settings");
};

test("valida configuración por defecto", () => {
    const settings = loadSettings();
    assert.doesNotThrow(() => settings.validateSettings());
});

test("falla si DOWNLOAD_API_URL no es válido", () => {
    const previous = process.env.DOWNLOAD_API_URL;
    process.env.DOWNLOAD_API_URL = "invalid-url";

    try {
        const settings = loadSettings();
        assert.throws(
            () => settings.validateSettings(),
            /DOWNLOAD_API_URL/
        );
    } finally {
        if (typeof previous === "undefined") {
            delete process.env.DOWNLOAD_API_URL;
        } else {
            process.env.DOWNLOAD_API_URL = previous;
        }
        loadSettings();
    }
});
