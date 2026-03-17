const gradient = require('gradient-string');
const { render } = require('cfonts');
const chalk = require('chalk');

// Floral & Elegant Gradients
const floralGradient = gradient(["#FFB7C5", "#FF69B4", "#DA70D6", "#9370DB"]); // Soft pink to purple
const goldenFlare = gradient(["#FFD700", "#FFF8DC", "#FFD700"]);
const springGradient = gradient(["#00FF7F", "#7FFF00", "#ADFF2F", "#FFFF00"]); // Greens to Yellow
const violetSky = gradient(["#EE82EE", "#DA70D6", "#BA55D3", "#9370DB"]);

const stripAnsi = (str) => (str || "").replace(/\x1B\[[0-9;]*m/g, "");
const UI_WIDTH = 74;

function drawBox(content, grad = floralGradient) {
    const dashes = UI_WIDTH - 6;
    console.log(grad(`   ❀${"━".repeat(dashes)}❀`));
    const lines = Array.isArray(content) ? content : [content];
    lines.forEach(line => {
        const plain = stripAnsi(line);
        const padding = (UI_WIDTH - 7) - plain.length;
        console.log(grad("   ┃ ") + line + " ".repeat(Math.max(0, padding)) + grad(" ┃"));
    });
    console.log(grad(`   ✿${"━".repeat(dashes)}✿`));
}

function displayLogo() {
    console.clear();
    const logoOptions = {
        font: "block",
        align: "left",
        colors: ["white"], 
        background: "transparent",
        letterSpacing: 1,
        lineHeight: 1,
        space: false,
        maxLength: "0",
    };

    const titleRaw = render("VOSTOK", logoOptions).string;
    const subtitleRaw = render("CORE", logoOptions).string;

    console.log(floralGradient.multiline(stripAnsi(titleRaw)));
    console.log(floralGradient.multiline(stripAnsi(subtitleRaw)));

    drawBox(chalk.bold(floralGradient("     🌸  V O S T O K - B O T   🌸 ")), violetSky);

    const info = [
        ` 🌻 ${goldenFlare("ESTATUS:")} ${chalk.bold(floralGradient("OPERATIVO"))}    |    🌻 ${goldenFlare("DESARROLLADOR:")} ${chalk.bold(floralGradient("GR-&&"))}`,
        ` 🌺 ${goldenFlare("HORA:")}    ${chalk.bold(floralGradient(new Date().toLocaleTimeString()))}  |   🌺 ${goldenFlare("VER:")}   ${chalk.bold(floralGradient("V-3.0.0"))}`
    ];
    drawBox(info, floralGradient);
    console.log("");
}

module.exports = {
    floralGradient,
    goldenFlare,
    springGradient,
    violetSky,
    stripAnsi,
    drawBox,
    displayLogo,
    // Maintain old ones for compatibility
    cyberGradient: violetSky,
    rainbowGradient: floralGradient,
    vaporwaveGradient: floralGradient,
    fireGradient: floralGradient,
    pinkGradient: floralGradient,
    blueGradient: violetSky,
    goldGradient: goldenFlare,
    silverGradient: goldenFlare
};
