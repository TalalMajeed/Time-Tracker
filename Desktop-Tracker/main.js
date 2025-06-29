const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        icon: path.join(__dirname, "assets/icon.png"), // Optional: add an icon
        titleBarStyle: "default",
        show: false, // Don't show until ready
        resizable: true,
        minWidth: 800,
        minHeight: 600,
    });

    // Load the app
    if (isDev) {
        // Load from React dev server
        mainWindow.loadURL("http://localhost:3000");
        // Open DevTools
        mainWindow.webContents.openDevTools();
    } else {
        // Load the built React app
        mainWindow.loadFile(path.join(__dirname, "build/index.html"));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    // Emitted when the window is closed
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
