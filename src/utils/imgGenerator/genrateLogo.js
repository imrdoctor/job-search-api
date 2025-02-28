import { createCanvas } from "canvas";
import path from "path";
import fs from "fs";

const getRandomColor = (isDark) => {
    const range = isDark ? [0, 155] : [155, 255];
    const rand = () => Math.floor(Math.random() * (range[1] - range[0])) + range[0];
    return `rgb(${rand()}, ${rand()}, ${rand()})`;
};

export const generateDefaultLogo = async (companyName) => {
    const canvas = createCanvas(300, 300), ctx = canvas.getContext("2d");

    const initials = companyName
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const isDarkBackground = Math.random() > 0.5;
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, getRandomColor(isDarkBackground));
    gradient.addColorStop(1, getRandomColor(isDarkBackground));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);

    ctx.fillStyle = isDarkBackground ? "#ffffff" : "#000000";
    ctx.font = "bold 100px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, 150, 150);

    const dir = path.resolve("temp/generated");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.resolve(dir, `logo_${Date.now() + 1 * 60 * 1000}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    return filePath;
};