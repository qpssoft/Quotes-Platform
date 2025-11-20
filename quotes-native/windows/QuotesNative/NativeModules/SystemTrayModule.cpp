#include "pch.h"
#include "SystemTrayModule.h"
#include <winrt/Windows.UI.Notifications.h>
#include <winrt/Windows.Data.Xml.Dom.h>

using namespace winrt;
using namespace Windows::UI::Notifications;
using namespace Windows::Data::Xml::Dom;

namespace QuotesNative
{
    void SystemTrayModule::Initialize(winrt::Microsoft::ReactNative::ReactContext const& reactContext) noexcept
    {
        m_reactContext = reactContext;
    }

    void SystemTrayModule::ShowNotification(std::string title, std::string message) noexcept
    {
        try
        {
            // Convert std::string to winrt::hstring
            auto titleWide = winrt::to_hstring(title);
            auto messageWide = winrt::to_hstring(message);

            // Create toast XML
            std::wstring toastXml = L"<toast>"
                L"<visual>"
                L"<binding template='ToastGeneric'>"
                L"<text>" + titleWide.c_str() + L"</text>"
                L"<text>" + messageWide.c_str() + L"</text>"
                L"</binding>"
                L"</visual>"
                L"<actions>"
                L"<action content='View' arguments='view' />"
                L"<action content='Dismiss' arguments='dismiss' />"
                L"</actions>"
                L"</toast>";

            // Load XML
            XmlDocument toastDoc;
            toastDoc.LoadXml(winrt::hstring(toastXml));

            // Create notification
            ToastNotification toast(toastDoc);
            
            // Set expiration time (5 seconds)
            auto now = winrt::clock::now();
            toast.ExpirationTime(now + std::chrono::seconds(5));

            // Show notification
            ToastNotificationManager::CreateToastNotifier().Show(toast);
        }
        catch (...)
        {
            // Log error
            OutputDebugStringA("SystemTrayModule::ShowNotification - Error showing toast notification\n");
        }
    }

    void SystemTrayModule::ShowBadgeNotification(int count) noexcept
    {
        try
        {
            // Create badge XML
            std::wstring badgeXml = L"<badge value='" + std::to_wstring(count) + L"'/>";

            // Load XML
            XmlDocument badgeDoc;
            badgeDoc.LoadXml(winrt::hstring(badgeXml));

            // Create badge notification
            BadgeNotification badge(badgeDoc);

            // Update badge
            BadgeUpdateManager::CreateBadgeUpdaterForApplication().Update(badge);
        }
        catch (...)
        {
            OutputDebugStringA("SystemTrayModule::ShowBadgeNotification - Error showing badge\n");
        }
    }

    void SystemTrayModule::ClearBadgeNotification() noexcept
    {
        try
        {
            BadgeUpdateManager::CreateBadgeUpdaterForApplication().Clear();
        }
        catch (...)
        {
            OutputDebugStringA("SystemTrayModule::ClearBadgeNotification - Error clearing badge\n");
        }
    }

    void SystemTrayModule::ShowTrayIcon(std::string iconPath) noexcept
    {
        // System tray icon requires Win32 NotifyIcon API
        // This is a placeholder - full implementation requires COM registration
        OutputDebugStringA("SystemTrayModule::ShowTrayIcon - Not implemented (requires Win32 NotifyIcon API)\n");
    }

    void SystemTrayModule::HideTrayIcon() noexcept
    {
        OutputDebugStringA("SystemTrayModule::HideTrayIcon - Not implemented\n");
    }
}
