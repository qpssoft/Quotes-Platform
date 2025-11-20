#pragma once

#include "pch.h"
#include "NativeModules.h"

namespace QuotesNative
{
    REACT_MODULE(SystemTrayModule);
    struct SystemTrayModule
    {
        REACT_INIT(Initialize);
        void Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept;

        REACT_METHOD(ShowNotification);
        void ShowNotification(std::string title, std::string message) noexcept;

        REACT_METHOD(ShowBadgeNotification);
        void ShowBadgeNotification(int count) noexcept;

        REACT_METHOD(ClearBadgeNotification);
        void ClearBadgeNotification() noexcept;

        REACT_METHOD(ShowTrayIcon);
        void ShowTrayIcon(std::string iconPath) noexcept;

        REACT_METHOD(HideTrayIcon);
        void HideTrayIcon() noexcept;

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext{ nullptr };
    };
}
