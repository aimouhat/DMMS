@echo off
echo Starting Daily Meeting Manager with DNS Server
echo =============================================

REM Check if running as administrator (needed for DNS server on port 53)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script needs to be run as Administrator
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Starting DNS server in background...
start "DNS Server" cmd /c "python local-dns-server.py"

echo Waiting for DNS server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Vite development server...
echo.
echo Your application will be available at:
echo http://dailymeeting.ocp
echo.
echo Others on the network can use the same URL!
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start Vite server
npm run dev

echo.
echo Stopping servers...
taskkill /f /im python.exe >nul 2>&1
echo Done!
pause 