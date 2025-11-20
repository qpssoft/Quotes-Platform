#pragma once

#include "pch.h"
#include "NativeModules.h"

namespace QuotesNative
{
    REACT_MODULE(MenuModule);
    struct MenuModule
    {
        REACT_INIT(Initialize);
        void Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept;

        REACT_METHOD(CreateMenu);
        void CreateMenu(std::string menuJson) noexcept;

        REACT_METHOD(ShowContextMenu);
        void ShowContextMenu(double x, double y, std::string menuJson) noexcept;

        REACT_METHOD(UpdateMenuItem);
        void UpdateMenuItem(std::string menuId, std::string itemId, std::string property, std::string value) noexcept;

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext{ nullptr };
    };
}
