const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  delay,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const readline = require("readline");
const chalk = require("chalk");
const { say, render } = require("cfonts");
const gradient = require("gradient-string");
const path = require("path");

const logger = P({ level: "silent" });

// High-fidelity Cyberpunk Gradients
const cyberGradient = gradient(["#00FFFF", "#8A2BE2", "#FF00FF", "#00FFFF"]);
const rainbowGradient = gradient(["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]);
const vaporwaveGradient = gradient(["#FF00FF", "#7000FF", "#00D1FF"]);
const fireGradient = gradient(["#FF4D00", "#FF0055", "#FF00FF"]);
const pinkGradient = vaporwaveGradient; // Alias for compatibility
const blueGradient = cyberGradient;     // Alias for compatibility
const goldGradient = gradient(["#FFD700", "#FFF8DC", "#FFD700"]);
const silverGradient = gradient(["#E0E0E0", "#FFFFFF", "#E0E0E0"]);

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
};

const stripAnsi = (str) => (str || "").replace(/\x1B\[[0-9;]*m/g, "");
const UI_WIDTH = 74;

function drawBox(content, grad) {
  // 3 spaces + ╭ + (UI_WIDTH - 5) dashes + ╮ = UI_WIDTH
  const dashes = UI_WIDTH - 5;
  console.log(grad(`   ╭${"─".repeat(dashes)}╮`));
  const lines = Array.isArray(content) ? content : [content];
  lines.forEach(line => {
    const plain = stripAnsi(line);
    // 3 spaces + │ + space + content + padding + space + │ = UI_WIDTH
    // 3 + 1 + 1 + plain.length + padding + 1 + 1 = 7 + plain.length + padding
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

  // Using render().string to correctly capture the ASCII art as a string
  const titleRaw = render("VOSTOK", logoOptions).string;
  const subtitleRaw = render("CORE", logoOptions).string;

  // FIRE Gradient (Orange to Red)
  const fireGrad = gradient(["#FFA500", "#FF4500", "#FF0000"]);

  // Apply Fire gradient to clean ASCII text
  console.log(fireGrad.multiline(stripAnsi(titleRaw)));
  console.log(fireGrad.multiline(stripAnsi(subtitleRaw)));

  // 1. Tagline Section
  drawBox(chalk.bold(rainbowGradient(" ◣  BOT DE ASISTENCIA Y ENTRETENIMIENTO, DISFRUTA SU USO :]  ◥ ")), cyberGradient);

  // 2. System Info Section
  const info = [
    ` ${goldGradient(" ESTATUS: ")} ${chalk.bold(cyberGradient("OPERATIVO"))}    |    ${goldGradient("PROPIETARIO: ")} ${chalk.bold(cyberGradient("GR-&&"))}`,
    ` ${goldGradient(" UPTIME:  ")} ${chalk.bold(cyberGradient(new Date().toLocaleTimeString()))}  |    ${goldGradient(" VERSION:     ")} ${chalk.bold(cyberGradient("V-2.1.0"))}`
  ];
  drawBox(info, fireGradient);
  console.log("");
}

let selectedMethod = null;
let lastQr = null;

// --- Global Commands & Utilities ---
const toSmallCaps = (text) => {
  const caps = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", i: "ɪ",
    j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ",
    s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
  };
  return text.toLowerCase().split("").map(c => caps[c] || c).join("");
};

const prefix = "!";

const commands = {
  menu: async (sock, remoteJid, msg) => {
    const header = `🔮 *【 ᴠᴏsᴛᴏᴋ-ᴄᴏʀᴇ ʙᴏᴛ 】* 🔮\n`;
    const line = `╭────────────────────╮\n`;
    const end = `╰────────────────────╯\n`;
    const star = `✨ `;

    let menu = `${header}${line}`;
    menu += `│ 🌸 *ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ* 🌸\n`;
    menu += `│ ${star}${toSmallCaps("!ᴍᴇɴᴜ")} _- Menú principal_\n`;
    menu += `│ ${star}${toSmallCaps("!ᴘɪɴɢ")} _- Velocidad bot_\n`;
    menu += `│ ${star}${toSmallCaps("!sᴛᴀᴛs")} _- Datos sistema_\n`;
    menu += `│ ${star}${toSmallCaps("!ᴏᴡɴᴇʀ")} _- Creador bot_\n`;
    menu += `${line}`;
    menu += `│ 🛠️ *ᴜᴛɪʟɪᴅᴀᴅᴇs* 🛠️\n`;
    menu += `│ ${star}${toSmallCaps("!sᴛɪᴄᴋᴇʀ")} _- Crear stickers_\n`;
    menu += `${end}`;
    menu += `\n🌟 *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʀ-&&* 🌟`;

    await sock.sendMessage(remoteJid, { 
      image: { url: path.join(__dirname, "assets", "menu", "vostok.jpg") },
      caption: menu 
    });
  },

  ping: async (sock, remoteJid, msg) => {
    const start = Date.now();
    await sock.sendMessage(remoteJid, { text: "🚀 _Calculando latencia..._" });
    const latency = Date.now() - start;
    await sock.sendMessage(remoteJid, { 
      text: `📡 *Woshh!* \n✨ Latencia: *${latency}ms*` 
    });
  },

  stats: async (sock, remoteJid, msg) => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    let statsMess = `📊 *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs ᴠᴏsᴛᴏᴋ* 📊\n\n`;
    statsMess += `✨ *ᴍᴇᴍᴏʀɪᴀ:* ${used.toFixed(2)} MB\n`;
    statsMess += `✨ *ᴜᴘᴛɪᴍᴇ:* ${hours}h ${mins}m\n`;
    statsMess += `✨ *ᴘʟᴀᴛᴀғᴏʀᴍᴀ:* ${process.platform}\n`;
    statsMess += `✨ *ɴᴏᴅᴇ:* ${process.version}`;

    await sock.sendMessage(remoteJid, { text: statsMess });
  },

  owner: async (sock, remoteJid, msg) => {
    const ownerMsg = `👑 *ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ ᴅᴇʟ ᴅᴜᴇɴ̃ᴏ* 👑\n\n`;
    ownerMsg += `✨ *ᴄʀᴇᴀᴅᴏʀ:* GR-&&\n`;
    ownerMsg += `✨ *ᴘʀᴏʏᴇᴄᴛᴏ:* Vostok-Core V-2.1.0\n`;
    ownerMsg += `✨ *ᴇsᴛᴀᴅᴏ:* Operativo 🚀\n\n`;
    ownerMsg += `🔮 _"Innovación y Potencia en un solo Bot."_`;

    await sock.sendMessage(remoteJid, { 
      text: ownerMsg,
      mentions: [remoteJid] 
    });
  }
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  displayLogo();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    getMessage: async (key) => {
      return {
        conversation: "hello",
      };
    },
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      lastQr = qr;
      // If user already selected method 1 OR is about to, show the QR
      if (selectedMethod === "1") {
        displayLogo();
        drawBox(chalk.bold(pinkGradient("ESCANEA EL SIGUIENTE CÓDIGO QR:")), cyberGradient);
        console.log("");
        qrcode.generate(qr, { small: true });
        console.log("");
      }
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom
          ? lastDisconnect.error.output.statusCode !==
            DisconnectReason.loggedOut
          : true;
      
      console.log(chalk.red.bold("\n[!] Conexión cerrada."));
      if (shouldReconnect) {
        console.log(chalk.blue("[+] Intentando reconectar...\n"));
        startBot();
      }
    } else if (connection === "open") {
      displayLogo();
      drawBox([
        "",
        chalk.bold(pinkGradient("   ¡ESTADO: ")) + chalk.bgCyan.black.bold(" CONECTADO ") + chalk.bold(pinkGradient(" ! 🎉")),
        ""
      ], cyberGradient);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Pairing Code Logic
  if (!sock.authState.creds.registered) {
    if (!selectedMethod) {
      drawBox([
        chalk.bold(rainbowGradient("          VINCULACIÓN DE DISPOSITIVO          ")),
        "",
        chalk.cyan("  1. Código QR                                "),
        chalk.cyan("  2. Código de vinculación (Pairing Code)     ")
      ], cyberGradient);
      
      const prompt = chalk.bold(pinkGradient("   >> Selecciona una opción (1/2): "));
      const ans = await question(prompt);
      selectedMethod = ans.trim();
    }

    if (selectedMethod === "2") {
      const phoneNumber = await question(
        chalk.bold(blueGradient("   >> Ingresa tu número (ej: 521234567890): "))
      );
      const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
      
      if (cleanedNumber) {
        console.log(chalk.magentaBright("\n   [!] Generando código de vinculación..."));
        await delay(3000);
        const code = await sock.requestPairingCode(cleanedNumber);
        
        drawBox(goldGradient(" TU CÓDIGO ES: ") + chalk.bgMagenta.white.bold(` ${code} `), rainbowGradient);
        
        drawBox([
          chalk.gray(" 1. Abre WhatsApp > Dispositivos vinculados    "),
          chalk.gray(" 2. Vincular con el número de teléfono         "),
          chalk.gray(" 3. Ingresa el código de arriba                ")
        ], vaporwaveGradient);
      } else {
        console.log(chalk.red.bold("\n   [ERROR] Número inválido. Reinicia el bot."));
        process.exit(1);
      }
    } else if (selectedMethod === "1") {
      if (lastQr) {
        displayLogo();
        drawBox(chalk.bold(pinkGradient("ESCANEA EL SIGUIENTE CÓDIGO QR:")), cyberGradient);
        console.log("");
        qrcode.generate(lastQr, { small: true });
        console.log("");
      } else {
        console.log(chalk.magentaBright("\n   [!] Esperando código QR..."));
      }
    }
  }

  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const remoteJid = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!text.startsWith(prefix)) return;

      const args = text.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      console.log(
        chalk.hex("#DDA0DD")(`[${new Date().toLocaleTimeString()}] `) +
        chalk.hex("#FF00FF").bold(`Comando: ${commandName} `) +
        chalk.hex("#8A2BE2")(`de ${remoteJid.split('@')[0]}`)
      );

      if (commands[commandName]) {
        await commands[commandName](sock, remoteJid, msg, args);
      } else if (commandName === "help") {
        await commands.menu(sock, remoteJid, msg);
      }
    } catch (err) {
      console.error(chalk.red("Error al manejar mensaje:"), err);
    }
  });
}

startBot();
