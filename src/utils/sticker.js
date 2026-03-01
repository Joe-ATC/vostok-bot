const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const ffmpegPath = require("ffmpeg-static");
const fluentFfmpeg = require("fluent-ffmpeg");

fluentFfmpeg.setFfmpegPath(ffmpegPath);

const IMAGE_QUALITY = 80;

const bufferToWebp = async (buffer) => {
    return sharp(buffer)
        .rotate()
        .resize(512, 512, {
            fit: "inside",
            withoutEnlargement: true
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();
};

const videoToWebp = async (videoBuffer) => {
    const baseName = crypto.randomBytes(16).toString("hex");
    const inputPath = path.join(os.tmpdir(), `${baseName}.mp4`);
    const outputPath = path.join(os.tmpdir(), `${baseName}.webp`);
    await fs.promises.writeFile(inputPath, videoBuffer);

    try {
        await new Promise((resolve, reject) => {
            fluentFfmpeg(inputPath)
                .outputOptions([
                    "-vcodec libwebp",
                    "-vf scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",
                    "-lossless 0",
                    "-compression_level 6",
                    "-q:v 60",
                    "-loop 0",
                    "-an",
                    "-vsync 0",
                    "-t 10"
                ])
                .format("webp")
                .save(outputPath)
                .on("end", resolve)
                .on("error", reject);
        });

        return await fs.promises.readFile(outputPath);
    } finally {
        await Promise.allSettled([
            fs.promises.unlink(inputPath),
            fs.promises.unlink(outputPath)
        ]);
    }
};

module.exports = {
    bufferToWebp,
    videoToWebp
};
