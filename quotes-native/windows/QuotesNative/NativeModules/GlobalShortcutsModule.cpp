#include "pch.h"
#include "GlobalShortcutsModule.h"

namespace QuotesNative
{
    // Win32 modifier constants
    const UINT MOD_CONTROL_KEY = 0x0002;
    const UINT MOD_SHIFT_KEY = 0x0004;
    const UINT MOD_ALT_KEY = 0x0001;
    const UINT MOD_WIN_KEY = 0x0008;
    const UINT MOD_NOREPEAT = 0x4000;

    void GlobalShortcutsModule::Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept
    {
        m_reactContext = reactContext;
    }

    void GlobalShortcutsModule::RegisterShortcut(std::string shortcutId, std::string key, bool ctrl, bool shift, bool alt, bool win) noexcept
    {
        try
        {
            // Build modifiers
            UINT modifiers = MOD_NOREPEAT;
            if (ctrl) modifiers |= MOD_CONTROL_KEY;
            if (shift) modifiers |= MOD_SHIFT_KEY;
            if (alt) modifiers |= MOD_ALT_KEY;
            if (win) modifiers |= MOD_WIN_KEY;

            // Convert key to virtual key code (simple mapping for common keys)
            UINT vk = 0;
            if (key.length() == 1)
            {
                char c = std::toupper(key[0]);
                if (c >= 'A' && c <= 'Z')
                {
                    vk = c; // VK_A to VK_Z are 0x41 to 0x5A
                }
                else if (c >= '0' && c <= '9')
                {
                    vk = c; // VK_0 to VK_9 are 0x30 to 0x39
                }
            }

            if (vk == 0)
            {
                OutputDebugStringA(("GlobalShortcutsModule::RegisterShortcut - Unsupported key: " + key + "\n").c_str());
                return;
            }

            // Check if already registered
            if (m_registeredHotkeys.find(shortcutId) != m_registeredHotkeys.end())
            {
                UnregisterShortcut(shortcutId);
            }

            // Assign hotkey ID
            int hotkeyId = m_nextHotkeyId++;
            m_registeredHotkeys[shortcutId] = hotkeyId;

            // Register global hotkey (use nullptr for system-wide hotkeys)
            if (RegisterHotKey(nullptr, hotkeyId, modifiers, vk))
            {
                OutputDebugStringA(("GlobalShortcutsModule::RegisterShortcut - Registered: " + shortcutId + "\n").c_str());
            }
            else
            {
                OutputDebugStringA(("GlobalShortcutsModule::RegisterShortcut - Failed to register: " + shortcutId + "\n").c_str());
                m_registeredHotkeys.erase(shortcutId);
            }
        }
        catch (...)
        {
            OutputDebugStringA("GlobalShortcutsModule::RegisterShortcut - Exception\n");
        }
    }

    void GlobalShortcutsModule::UnregisterShortcut(std::string shortcutId) noexcept
    {
        try
        {
            auto it = m_registeredHotkeys.find(shortcutId);
            if (it != m_registeredHotkeys.end())
            {
                UnregisterHotKey(nullptr, it->second);
                m_registeredHotkeys.erase(it);
                OutputDebugStringA(("GlobalShortcutsModule::UnregisterShortcut - Unregistered: " + shortcutId + "\n").c_str());
            }
        }
        catch (...)
        {
            OutputDebugStringA("GlobalShortcutsModule::UnregisterShortcut - Exception\n");
        }
    }

    void GlobalShortcutsModule::UnregisterAllShortcuts() noexcept
    {
        try
        {
            for (const auto& pair : m_registeredHotkeys)
            {
                UnregisterHotKey(nullptr, pair.second);
            }
            m_registeredHotkeys.clear();
            OutputDebugStringA("GlobalShortcutsModule::UnregisterAllShortcuts - All shortcuts unregistered\n");
        }
        catch (...)
        {
            OutputDebugStringA("GlobalShortcutsModule::UnregisterAllShortcuts - Exception\n");
        }
    }

    LRESULT CALLBACK GlobalShortcutsModule::HotkeyWndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
    {
        if (msg == WM_HOTKEY)
        {
            // TODO: Emit event to React Native
            OutputDebugStringA("GlobalShortcutsModule - Hotkey pressed\n");
        }
        return DefWindowProc(hwnd, msg, wParam, lParam);
    }
}
