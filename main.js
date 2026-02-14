const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
    Menu.setApplicationMenu(null);

    const win = new BrowserWindow({
        width: 425,
        height: 530,
        minWidth: 400,
        minHeight: 500,
        resizable: false,
        frame: false,
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.on("close-app", () => {
    app.quit();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
