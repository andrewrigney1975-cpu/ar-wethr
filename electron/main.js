const { app, BrowserWindow, shell, session, nativeTheme } = require("electron");
const path = require("path");

// Only these permissions are granted to the page; everything else is denied.
const ALLOWED_PERMISSIONS = new Set(["geolocation", "fullscreen"]);

function isExternal(url) {
  return /^https?:/i.test(url);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 500,
    title: "Wethr",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0f172a" : "#f2f5fa",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.once("ready-to-show", () => win.show());

  // Links with target="_blank" open in the user's default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  // Never navigate the app window itself away from the bundled page.
  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      if (isExternal(url)) shell.openExternal(url);
    }
  });

  win.loadFile(path.join(__dirname, "..", "weather-app.html"));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.has(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => ALLOWED_PERMISSIONS.has(permission));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
