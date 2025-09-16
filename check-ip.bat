@echo off
echo Checking current IP address...
echo.

REM Get current IP using ipconfig
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set ip=%%a
    set ip=!ip: =!
    echo Current IP: !ip!
    goto :found_ip
)

:found_ip
echo.
echo If this IP is different from what you expected, your IP has changed.
echo The DNS server will automatically detect and use the correct IP.
echo.
echo To test the DNS server, run:
echo nslookup dailymeeting.ocp
echo.
echo To start the application, run:
echo start-dailymeeting.bat
echo.
pause 