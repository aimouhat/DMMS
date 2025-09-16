@echo off
echo Setting up DNS client configuration for dailymeeting.ocp
echo This will configure your network to use the local DNS server

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script needs to be run as Administrator
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Please enter the IP address of the machine running the DNS server:
echo (This is the machine hosting the dailymeeting.ocp application)
set /p dns_server_ip="DNS Server IP: "

if "%dns_server_ip%"=="" (
    echo No IP address provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Configuring network adapter to use %dns_server_ip% as DNS server...

REM Get the active network adapter
for /f "tokens=1,2 delims=:" %%a in ('netsh interface ip show config ^| findstr "Configuration for"') do (
    set adapter_name=%%b
    goto :found_adapter
)

:found_adapter
set adapter_name=%adapter_name: =%

REM Set the DNS server
netsh interface ip set dns name="%adapter_name%" static %dns_server_ip%

if %errorLevel% equ 0 (
    echo.
    echo DNS configuration successful!
    echo.
    echo You can now access: http://dailymeeting.ocp
    echo.
    echo Note: You may need to flush your DNS cache:
    echo ipconfig /flushdns
    echo.
    echo To restore your original DNS settings later, run:
    echo netsh interface ip set dns name="%adapter_name%" dhcp
) else (
    echo.
    echo Failed to configure DNS. Please try manually:
    echo 1. Open Network and Sharing Center
    echo 2. Change adapter settings
    echo 3. Right-click your network adapter
    echo 4. Properties -> Internet Protocol Version 4 -> Properties
    echo 5. Use the following DNS server addresses: %dns_server_ip%
)

pause 