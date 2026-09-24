// Renders build/icon.png (512x512) for electron-builder. The artwork matches
// the icon drawn at runtime in setupPwa() in weather-app.html -- update both
// together. Run with: npm run icon
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SIZE = 512;

function draw(size) {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ictx = c.getContext("2d");
  ictx.scale(size / 192, size / 192);

  const grad = ictx.createLinearGradient(0, 0, 192, 192);
  grad.addColorStop(0, "#5aa9ff"); grad.addColorStop(1, "#0f172a");
  ictx.fillStyle = grad;
  ictx.beginPath(); ictx.roundRect(0, 0, 192, 192, 42); ictx.fill();

  const sunX = 122, sunY = 66, sunR = 26;
  ictx.fillStyle = "#ffd76a";
  ictx.beginPath(); ictx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ictx.fill();
  ictx.strokeStyle = "#ffd76a"; ictx.lineWidth = 6; ictx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r1 = sunR + 10, r2 = sunR + 20;
    ictx.beginPath();
    ictx.moveTo(sunX + Math.cos(a) * r1, sunY + Math.sin(a) * r1);
    ictx.lineTo(sunX + Math.cos(a) * r2, sunY + Math.sin(a) * r2);
    ictx.stroke();
  }

  ictx.fillStyle = "#ffffff";
  const cy = 128;
  ictx.beginPath();
  ictx.arc(76, cy - 6, 30, 0, Math.PI * 2);
  ictx.arc(112, cy - 14, 24, 0, Math.PI * 2);
  ictx.arc(140, cy - 2, 22, 0, Math.PI * 2);
  ictx.fill();
  ictx.beginPath();
  ictx.roundRect(46, cy - 4, 116, 34, 17);
  ictx.fill();

  return c.toDataURL("image/png");
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL("about:blank");
  const dataUrl = await win.webContents.executeJavaScript("(" + draw.toString() + ")(" + SIZE + ")");
  const out = path.join(__dirname, "..", "build", "icon.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log("Wrote " + out);
  app.quit();
});
