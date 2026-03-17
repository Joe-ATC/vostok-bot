const readline = require("readline");

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
};

const toSmallCaps = (text = "") => {
    const caps = {
        a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", i: "ɪ",
        j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ",
        s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ"
    };
    return String(text)
        .toLowerCase()
        .split("")
        .map((c) => caps[c] || c)
        .join("");
};

const toFullWidth = (text = "") => {
    return String(text)
        .split("")
        .map((ch) => {
            const code = ch.charCodeAt(0);
            if (code >= 33 && code <= 126) {
                return String.fromCharCode(code + 65248);
            }
            return ch;
        })
        .join("");
};

const toMono = (text = "") => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const monoLower = [..."𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"];
    const monoUpper = [..."𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉"];
    const monoNums = [..."𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"];

    return String(text)
        .split("")
        .map((ch) => {
            const li = lower.indexOf(ch);
            if (li >= 0) return monoLower[li];
            const ui = upper.indexOf(ch);
            if (ui >= 0) return monoUpper[ui];
            const ni = nums.indexOf(ch);
            if (ni >= 0) return monoNums[ni];
            return ch;
        })
        .join("");
};

const toBoldSerif = (text = "") => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const boldLower = [..."𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳"];
    const boldUpper = [..."𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝚉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙"];

    return String(text)
        .split("")
        .map((ch) => {
            const li = lower.indexOf(ch);
            if (li >= 0) return boldLower[li];
            const ui = upper.indexOf(ch);
            if (ui >= 0) return boldUpper[ui];
            return ch;
        })
        .join("");
};

const toScript = (text = "") => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const scriptLower = [..."𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻"];
    const scriptUpper = [..."𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡"];

    return String(text)
        .split("")
        .map((ch) => {
            const li = lower.indexOf(ch);
            if (li >= 0) return scriptLower[li];
            const ui = upper.indexOf(ch);
            if (ui >= 0) return scriptUpper[ui];
            return ch;
        })
        .join("");
};

module.exports = {
    question,
    toSmallCaps,
    toFullWidth,
    toMono,
    toBoldSerif,
    toScript
};
