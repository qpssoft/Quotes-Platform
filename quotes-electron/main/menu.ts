import { Menu, MenuItemConstructorOptions, app, BrowserWindow } from 'electron';

/**
 * MenuManager - Manages native application menu
 * 
 * Features:
 * - Platform-specific menu (macOS vs Windows/Linux)
 * - Standard menu items (File, Edit, View, Window, Help)
 * - Custom actions and shortcuts
 */
export class MenuManager {
  private mainWindow: BrowserWindow;
  private menu: Menu | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * Create and set the application menu
   */
  create(): void {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
      // App Menu (macOS only)
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                {
                  label: 'Preferences...',
                  accelerator: 'Cmd+,',
                  click: () => this.openSettings(),
                },
                { type: 'separator' as const },
                { role: 'services' as const },
                { type: 'separator' as const },
                { role: 'hide' as const },
                { role: 'hideOthers' as const },
                { role: 'unhide' as const },
                { type: 'separator' as const },
                { role: 'quit' as const },
              ],
            },
          ]
        : []),

      // File Menu
      {
        label: 'File',
        submenu: [
          {
            label: 'New Quote Collection',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.newCollection(),
          },
          { type: 'separator' },
          ...(isMac
            ? []
            : [
                {
                  label: 'Settings',
                  accelerator: 'Ctrl+,',
                  click: () => this.openSettings(),
                },
                { type: 'separator' as const },
              ]),
          isMac ? { role: 'close' as const } : { role: 'quit' as const },
        ],
      },

      // Edit Menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' as const },
          { role: 'redo' as const },
          { type: 'separator' as const },
          { role: 'cut' as const },
          { role: 'copy' as const },
          { role: 'paste' as const },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' as const },
                { role: 'delete' as const },
                { role: 'selectAll' as const },
                { type: 'separator' as const },
                {
                  label: 'Speech',
                  submenu: [
                    { role: 'startSpeaking' as const },
                    { role: 'stopSpeaking' as const },
                  ],
                },
              ]
            : [
                { role: 'delete' as const },
                { type: 'separator' as const },
                { role: 'selectAll' as const },
              ]),
        ],
      },

      // View Menu
      {
        label: 'View',
        submenu: [
          {
            label: 'Show Next Quote',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: () => this.nextQuote(),
          },
          {
            label: 'Toggle Rotation',
            accelerator: 'CmdOrCtrl+Shift+P',
            click: () => this.toggleRotation(),
          },
          {
            label: 'Show Overlay',
            accelerator: 'CmdOrCtrl+Shift+Q',
            click: () => this.showOverlay(),
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },

      // Window Menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac
            ? [
                { type: 'separator' as const },
                { role: 'front' as const },
                { type: 'separator' as const },
                { role: 'window' as const },
              ]
            : [{ role: 'close' as const }]),
        ],
      },

      // Help Menu
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              const { shell } = await import('electron');
              await shell.openExternal('https://github.com/your-repo/buddhist-quotes');
            },
          },
          {
            label: 'Documentation',
            click: async () => {
              const { shell } = await import('electron');
              await shell.openExternal('https://github.com/your-repo/buddhist-quotes/wiki');
            },
          },
          { type: 'separator' },
          {
            label: 'Report Issue',
            click: async () => {
              const { shell } = await import('electron');
              await shell.openExternal('https://github.com/your-repo/buddhist-quotes/issues');
            },
          },
        ],
      },
    ];

    this.menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.menu);

    console.log('✓ Application menu created');
  }

  /**
   * Update menu (e.g., after preferences change)
   */
  update(): void {
    if (this.menu) {
      Menu.setApplicationMenu(this.menu);
    }
  }

  /**
   * Remove application menu
   */
  remove(): void {
    Menu.setApplicationMenu(null);
    this.menu = null;
  }

  // ============================================================================
  // Menu Action Handlers
  // ============================================================================

  private openSettings(): void {
    console.log('Menu: Open settings');
    this.mainWindow.webContents.send('navigate:settings');
    this.mainWindow.show();
  }

  private newCollection(): void {
    console.log('Menu: New collection');
    this.mainWindow.webContents.send('collection:new');
  }

  private nextQuote(): void {
    console.log('Menu: Next quote');
    this.mainWindow.webContents.send('rotation:next');
  }

  private toggleRotation(): void {
    console.log('Menu: Toggle rotation');
    this.mainWindow.webContents.send('rotation:toggle');
  }

  private showOverlay(): void {
    console.log('Menu: Show overlay');
    this.mainWindow.webContents.send('overlay:show');
  }
}
