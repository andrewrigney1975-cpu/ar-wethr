// Renders the app icons for the desktop and Android builds:
//   build/icon.png (512x512) for electron-builder
//   android/app/src/main/res/mipmap-*/ic_launcher*.png for Capacitor
// The artwork matches the icon drawn at runtime in setupPwa() in
// weather-app.html -- update both together. Run with: npm run icon
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RES = path.join(ROOT, "android", "app", "src", "main", "res");

// Launcher icons are 48dp; adaptive icon layers are 108dp.
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

// Runs in the renderer. shape: "square" (rounded rect), "round" (circle) or
// "foreground" (artwork only on transparent, sized for an adaptive icon's
// 66dp safe zone within its 108dp canvas).
function draw(size, shape) {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ictx = c.getContext("2d");

  if (shape === "foreground") {
    // Map the 192-unit artwork onto the middle 72dp of the 108dp layer.
    const s = (size * 72 / 108) / 192;
    ictx.translate(size * 18 / 108, size * 18 / 108);
    ictx.scale(s, s);
  } else {
    ictx.scale(size / 192, size / 192);
    const grad = ictx.createLinearGradient(0, 0, 192, 192);
    grad.addColorStop(0, "#5aa9ff"); grad.addColorStop(1, "#0f172a");
    ictx.fillStyle = grad;
    ictx.beginPath();
    if (shape === "round") ictx.arc(96, 96, 96, 0, Math.PI * 2);
    else ictx.roundRect(0, 0, 192, 192, 42);
    ictx.fill();
    if (shape === "round") {
      // Shrink the artwork slightly so the rays clear the circle's edge.
      ictx.translate(96, 96); ictx.scale(0.86, 0.86); ictx.translate(-96, -96);
    }
  }

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

  async function render(file, size, shape) {
    const dataUrl = await win.webContents.executeJavaScript(
      "(" + draw.toString() + ")(" + size + ", " + JSON.stringify(shape) + ")");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log("Wrote " + path.relative(ROOT, file));
  }

  await render(path.join(ROOT, "build", "icon.png"), 512, "square");

  if (fs.existsSync(RES)) {
    for (const [name, scale] of Object.entries(DENSITIES)) {
      const dir = path.join(RES, "mipmap-" + name);
      await render(path.join(dir, "ic_launcher.png"), 48 * scale, "square");
      await render(path.join(dir, "ic_launcher_round.png"), 48 * scale, "round");
      await render(path.join(dir, "ic_launcher_foreground.png"), 108 * scale, "foreground");
    }
  }

  app.quit();
});
