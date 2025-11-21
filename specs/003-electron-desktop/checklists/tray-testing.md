# System Tray Testing Checklist

## Phase 2 - System Tray Integration

### T204: Test Tray Features

#### Tray Icon Display
- [ ] Tray icon appears in system tray on app launch
- [ ] Icon displays correctly (Windows taskbar, macOS menu bar, Linux system tray)
- [ ] Tooltip shows "Buddhist Quotes" on hover
- [ ] Fallback works when icon files are missing

#### Tray Menu
- [ ] Right-click shows context menu
- [ ] Menu items display correctly:
  - [ ] Show/Hide (toggles based on window state)
  - [ ] Separator
  - [ ] Pause/Resume Rotation (toggles based on state)
  - [ ] Next Quote
  - [ ] Separator
  - [ ] Settings
  - [ ] Separator
  - [ ] Quit

#### Window Interactions
- [ ] Left-click tray icon shows window (if hidden)
- [ ] Left-click tray icon hides window (if shown)
- [ ] Window close button hides to tray (doesn't quit)
- [ ] Window reopens at same position/size after hide
- [ ] Window gains focus when shown from tray

#### Menu Actions
- [ ] "Show" menu item shows window and focuses it
- [ ] "Hide" menu item hides window
- [ ] "Pause Rotation" sends IPC message to renderer
- [ ] "Resume Rotation" sends IPC message to renderer
- [ ] "Next Quote" sends IPC message to renderer
- [ ] "Settings" shows window and navigates to settings
- [ ] "Quit" exits application completely
- [ ] Cmd+Q / Ctrl+Q keyboard shortcut works

#### Status Updates
- [ ] Tooltip updates to "Buddhist Quotes - Playing"
- [ ] Tooltip updates to "Buddhist Quotes - Paused"
- [ ] Menu updates when rotation status changes
- [ ] Menu items toggle correctly (Pause ↔ Resume)

#### Cross-Platform
- [ ] Windows: Icon appears in taskbar system tray
- [ ] macOS: Icon appears in menu bar (top-right)
- [ ] Linux: Icon appears in system tray
- [ ] Platform-specific keyboard shortcuts work (Cmd on macOS, Ctrl on Windows/Linux)

#### Edge Cases
- [ ] Tray persists when all windows closed
- [ ] App quits properly when selecting "Quit" from menu
- [ ] App quits properly with Cmd+Q / Ctrl+Q
- [ ] Multiple rapid clicks on tray icon don't cause issues
- [ ] Menu stays open when item hovered

## Test Results

**Platform Tested**: _____________  
**Date**: _____________  
**Tester**: _____________

**Issues Found**:
1. 
2. 
3. 

**Notes**:


