const { app, BrowserWindow, ipcMain: ipc } = require("electron");
const { Builder, By } = require("selenium-webdriver");

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let client;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    process.env.NODE_ENV === "production"
      ? "resources/app/build/index.html"
      : "http://localhost:3000"
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  client = await new Builder().forBrowser("chrome").build();
  client.get("https://messenger.com/");

  let loggedIn = false;

  async function checkLogin() {
    try {
      const loginButton = await client.findElement(By.css("[aria-label='Conversations']"));
      mainWindow.webContents.send("loggedin", { loggedIn: true });
    } catch (ex) {
      mainWindow.webContents.send("loggedin", { loggedIn: false });
    }
  }

  setInterval(checkLogin, 5000);

  ipc.on("checklogin", (event, arg) => {
    checkLogin();
  });

  ipc.on("login", async (e, arg) => {
    try {
      const user = await client.findElement(By.id("email"));
      const pass = await client.findElement(By.id("pass"));
      await user.clear();
      await pass.clear();
      await user.sendKeys(arg.user);
      await pass.sendKeys(arg.pass + "\n");
    } catch (ex) {
      console.log("Failed to login.", ex);
    }
  });

  ipc.on("sendMessage", async (_, message) => {
    try {
      const editor = await client.findElement(By.css("[contenteditable]"));
      editor.sendKeys(message + "\n");
    } catch (ex) {
      console.log("Failed to send", message, ex);
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
