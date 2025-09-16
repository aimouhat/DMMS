@echo off
echo Setting up nginx reverse proxy for dailymeeting.ocp

REM Check if nginx is installed
where nginx >nul 2>nul
if %errorlevel% neq 0 (
    echo nginx is not installed. Please install nginx first.
    echo You can download it from: http://nginx.org/en/download.html
    echo Or use chocolatey: choco install nginx
    pause
    exit /b 1
)

echo nginx is installed. Configuring...

REM Copy nginx configuration
copy nginx.conf "C:\nginx\conf\sites-available\dailymeeting.ocp.conf"

REM Create symbolic link to enable the site
if not exist "C:\nginx\conf\sites-enabled" mkdir "C:\nginx\conf\sites-enabled"
mklink "C:\nginx\conf\sites-enabled\dailymeeting.ocp.conf" "C:\nginx\conf\sites-available\dailymeeting.ocp.conf"

REM Update main nginx.conf to include sites-enabled
echo include sites-enabled/*.conf; >> "C:\nginx\conf\nginx.conf"

echo Configuration complete!
echo.
echo To start nginx, run: nginx
echo To stop nginx, run: nginx -s stop
echo To reload nginx, run: nginx -s reload
echo.
echo Now others can access: http://dailymeeting.ocp
pause 