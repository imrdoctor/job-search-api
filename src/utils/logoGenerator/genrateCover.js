import { createCanvas } from "canvas";
import path from "path";
import fs from "fs";

const getRandomColor = (isDark) => {
    const range = isDark ? [0, 155] : [155, 255];
    const rand = () => Math.floor(Math.random() * (range[1] - range[0])) + range[0];
    return `rgb(${rand()}, ${rand()}, ${rand()})`;
};

export const generateDefaultCover = async (companyName) => {
    const canvas = createCanvas(600, 300), ctx = canvas.getContext("2d");
    const isDarkBackground = Math.random() > 0.5;
    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
    gradient.addColorStop(0, getRandomColor(isDarkBackground));
    gradient.addColorStop(1, getRandomColor(isDarkBackground));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 300);

    let fontSize = 50;
    let text1 = companyName.toUpperCase();
    let text2 = "";

    if (text1.length > 25) {
        const words = text1.split(" ");
        if (words.length > 1) {
            const midIndex = Math.ceil(words.length / 2);
            text1 = words.slice(0, midIndex).join(" ");
            text2 = words.slice(midIndex).join(" ");
            fontSize = 40;
        } else {
            text1 = text1.slice(0, 22) + "...";
            fontSize = 40;
        }
    } else if (text1.length > 15) {
        fontSize = 40;
    }

    ctx.fillStyle = isDarkBackground ? "#ffffff" : "#000000";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text1, 300, text2 ? 130 : 150);

    if (text2) {
        ctx.fillText(text2, 300, 180);
    }

    const dir = path.resolve("temp/generated");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.resolve(dir, `cover_${Date.now()}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    return filePath;
};