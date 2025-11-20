#pragma once

#include "pch.h"
#include "NativeModules.h"
#include <map>

namespace QuotesNative
{
    REACT_MODULE(GlobalShortcutsModule);
    struct GlobalShortcutsModule
    {
        REACT_INIT(Initialize);
        void Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept;

        REACT_METHOD(RegisterShortcut);
        void RegisterShortcut(std::string shortcutId, std::string key, bool ctrl, bool shift, bool alt, bool win) noexcept;

        REACT_METHOD(UnregisterShortcut);
        void UnregisterShortcut(std::string shortcutId) noexcept;

        REACT_METHOD(UnregisterAllShortcuts);
        void UnregisterAllShortcuts() noexcept;

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext{ nullptr };
        std::map<std::string, int> m_registeredHotkeys;
        int m_nextHotkeyId = 1;

        // Win32 API for global hotkeys
        static LRESULT CALLBACK HotkeyWndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
        HWND m_messageWindow = nullptr;
    };
}
