@echo off
echo Setting up hosts file entry for dailymeeting.ocp
echo This will add the entry to your hosts file so you can access the app without port

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script needs to be run as Administrator
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if the entry already exists
findstr /c:"172.23.6.194 dailymeeting.ocp" C:\Windows\System32\drivers\etc\hosts >nul
if %errorLevel% equ 0 (
    echo Hosts entry already exists!
    echo You can now access: http://dailymeeting.ocp
    pause
    exit /b 0
)

REM Add the entry to hosts file
echo 172.23.6.194 dailymeeting.ocp >> C:\Windows\System32\drivers\etc\hosts

echo.
echo Hosts file updated successfully!
echo.
echo Now you can access the application at:
echo http://dailymeeting.ocp
echo.
echo Share this script with others on your network so they can access it too.
pause 