const gradient = require('gradient-string');
const { render } = require('cfonts');
const chalk = require('chalk');

// Gradients
const cyberGradient = gradient(["#00FFFF", "#8A2BE2", "#FF00FF", "#00FFFF"]);
const rainbowGradient = gradient(["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]);
const vaporwaveGradient = gradient(["#FF00FF", "#7000FF", "#00D1FF"]);
const fireGradient = gradient(["#FF4D00", "#FF0055", "#FF00FF"]);
const pinkGradient = vaporwaveGradient; // Alias
const blueGradient = cyberGradient;     // Alias
const goldGradient = gradient(["#FFD700", "#FFF8DC", "#FFD700"]);
const silverGradient = gradient(["#E0E0E0", "#FFFFFF", "#E0E0E0"]);

const stripAnsi = (str) => (str || "").replace(/\x1B\[[0-9;]*m/g, "");
const UI_WIDTH = 74;

function drawBox(content, grad) {
    const dashes = UI_WIDTH - 5;
    console.log(grad(`   ╭${"─".repeat(dashes)}╮`));
    const lines = Array.isArray(content) ? content : [content];
    lines.forEach(line => {
        const plain = stripAnsi(line);
        const padding = (UI_WIDTH - 7) - plain.length;
        console.log(grad("   │ ") + line + " ".repeat(Math.max(0, padding)) + grad(" │"));
    });
    console.log(grad(`   ╰${"─".repeat(dashes)}╯`));
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

    const fireGrad = gradient(["#FFA500", "#FF4500", "#FF0000"]);

    console.log(fireGrad.multiline(stripAnsi(titleRaw)));
    console.log(fireGrad.multiline(stripAnsi(subtitleRaw)));

    drawBox(chalk.bold(rainbowGradient(" ◣  BOT DE ASISTENCIA Y ENTRETENIMIENTO, DISFRUTA SU USO :]  ◥ ")), cyberGradient);

    const info = [
        ` ${goldGradient(" ESTATUS: ")} ${chalk.bold(cyberGradient("OPERATIVO"))}    |    ${goldGradient("PROPIETARIO: ")} ${chalk.bold(cyberGradient("GR-&&"))}`,
        ` ${goldGradient(" UPTIME:  ")} ${chalk.bold(cyberGradient(new Date().toLocaleTimeString()))}  |    ${goldGradient(" VERSION:     ")} ${chalk.bold(cyberGradient("V-2.1.0"))}`
    ];
    drawBox(info, fireGradient);
    console.log("");
}

module.exports = {
    cyberGradient,
    rainbowGradient,
    vaporwaveGradient,
    fireGradient,
    pinkGradient,
    blueGradient,
    goldGradient,
    silverGradient,
    stripAnsi,
    drawBox,
    displayLogo
};
