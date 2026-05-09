const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createTrayIcon() {
  // Create a simple 16x16 cat icon using nativeImage from data URL
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="17" r="9" fill="#FF9F43"/>
    <circle cx="16" cy="12" r="6" fill="#FF9F43"/>
    <polygon points="10,9 9,2 15,8" fill="#FF9F43"/><polygon points="12,7 10,4 14,7" fill="#FFB3BA"/>
    <polygon points="22,9 23,2 17,8" fill="#FF9F43"/><polygon points="20,7 22,4 18,7" fill="#FFB3BA"/>
    <circle cx="14" cy="11.5" r="1.8" fill="#333"/><circle cx="18" cy="11.5" r="1.8" fill="#333"/>
    <circle cx="16" cy="14" r="1.2" fill="#FF6B6B"/>
    <ellipse cx="16" cy="19" rx="5" ry="4" fill="#FFF5E0"/>
  </svg>`;
  const icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
  return icon.resize({ width: 16, height: 16 });
}

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 220;
  const winH = 280;

  win = new BrowserWindow({
    width: winW,
    height: winH,
    x: screenWidth - winW - 80,
    y: screenHeight - winH - 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile('index.html');

  // Prevent title change
  win.on('page-title-updated', (e) => e.preventDefault());
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('桌面小猫');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏猫咪',
      click: () => {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

// IPC handlers
ipcMain.on('move-window-by', (event, { dx, dy }) => {
  if (win) {
    const [x, y] = win.getPosition();
    win.setPosition(x + dx, y + dy);
  }
});

ipcMain.on('move-window-to', (event, { x, y }) => {
  if (win) {
    win.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.handle('get-screen-size', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

ipcMain.handle('get-window-size', () => {
  if (win) {
    const [w, h] = win.getSize();
    return { width: w, height: h };
  }
  return { width: 220, height: 280 };
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Don't quit; keep running in tray
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
