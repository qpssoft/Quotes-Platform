#pragma once

#include "pch.h"
#include "NativeModules.h"

namespace QuotesNative
{
    REACT_MODULE(AutoLaunchModule);
    struct AutoLaunchModule
    {
        REACT_INIT(Initialize);
        void Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept;

        REACT_METHOD(EnableAutoLaunch);
        void EnableAutoLaunch() noexcept;

        REACT_METHOD(DisableAutoLaunch);
        void DisableAutoLaunch() noexcept;

        REACT_METHOD(IsAutoLaunchEnabled);
        void IsAutoLaunchEnabled(winrt::Microsoft::ReactNative::ReactPromise<bool> promise) noexcept;

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext{ nullptr };
        const std::wstring REGISTRY_KEY = L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
        const std::wstring APP_NAME = L"BuddhistQuotes";
    };
}
