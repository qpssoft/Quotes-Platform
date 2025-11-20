#include "pch.h"
#include "AutoLaunchModule.h"
#include <Windows.h>
#include <string>

namespace QuotesNative
{
    void AutoLaunchModule::Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept
    {
        m_reactContext = reactContext;
    }

    void AutoLaunchModule::EnableAutoLaunch() noexcept
    {
        try
        {
            // Get executable path
            wchar_t exePath[MAX_PATH];
            GetModuleFileNameW(nullptr, exePath, MAX_PATH);

            // Open registry key
            HKEY hKey;
            LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, REGISTRY_KEY.c_str(), 0, KEY_WRITE, &hKey);
            
            if (result == ERROR_SUCCESS)
            {
                // Set registry value
                result = RegSetValueExW(hKey, APP_NAME.c_str(), 0, REG_SZ, 
                    reinterpret_cast<const BYTE*>(exePath), 
                    static_cast<DWORD>((wcslen(exePath) + 1) * sizeof(wchar_t)));
                
                RegCloseKey(hKey);

                if (result == ERROR_SUCCESS)
                {
                    OutputDebugStringA("AutoLaunchModule::EnableAutoLaunch - Success\n");
                }
                else
                {
                    OutputDebugStringA("AutoLaunchModule::EnableAutoLaunch - Failed to set registry value\n");
                }
            }
            else
            {
                OutputDebugStringA("AutoLaunchModule::EnableAutoLaunch - Failed to open registry key\n");
            }
        }
        catch (...)
        {
            OutputDebugStringA("AutoLaunchModule::EnableAutoLaunch - Exception\n");
        }
    }

    void AutoLaunchModule::DisableAutoLaunch() noexcept
    {
        try
        {
            // Open registry key
            HKEY hKey;
            LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, REGISTRY_KEY.c_str(), 0, KEY_WRITE, &hKey);
            
            if (result == ERROR_SUCCESS)
            {
                // Delete registry value
                result = RegDeleteValueW(hKey, APP_NAME.c_str());
                RegCloseKey(hKey);

                if (result == ERROR_SUCCESS || result == ERROR_FILE_NOT_FOUND)
                {
                    OutputDebugStringA("AutoLaunchModule::DisableAutoLaunch - Success\n");
                }
                else
                {
                    OutputDebugStringA("AutoLaunchModule::DisableAutoLaunch - Failed to delete registry value\n");
                }
            }
            else
            {
                OutputDebugStringA("AutoLaunchModule::DisableAutoLaunch - Failed to open registry key\n");
            }
        }
        catch (...)
        {
            OutputDebugStringA("AutoLaunchModule::DisableAutoLaunch - Exception\n");
        }
    }

    void AutoLaunchModule::IsAutoLaunchEnabled(winrt::Microsoft::ReactNative::ReactPromise<bool> promise) noexcept
    {
        try
        {
            // Open registry key
            HKEY hKey;
            LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, REGISTRY_KEY.c_str(), 0, KEY_READ, &hKey);
            
            if (result == ERROR_SUCCESS)
            {
                // Query registry value
                wchar_t value[MAX_PATH];
                DWORD valueSize = sizeof(value);
                result = RegQueryValueExW(hKey, APP_NAME.c_str(), nullptr, nullptr, 
                    reinterpret_cast<LPBYTE>(value), &valueSize);
                
                RegCloseKey(hKey);

                if (result == ERROR_SUCCESS)
                {
                    promise.Resolve(true);
                }
                else
                {
                    promise.Resolve(false);
                }
            }
            else
            {
                promise.Resolve(false);
            }
        }
        catch (...)
        {
            OutputDebugStringA("AutoLaunchModule::IsAutoLaunchEnabled - Exception\n");
            promise.Reject("Error checking auto-launch status");
        }
    }
}
