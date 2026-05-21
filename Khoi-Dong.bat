@echo off
chcp 65001 >nul
title Mo Website QLTC
setlocal
cd /d "%~dp0"

REM Doi link ben duoi neu ban muon mo thang trang khac:
REM Vi du:
REM   http://localhost:8000/dashboard.html
REM   http://localhost:8000/login.html
REM   http://localhost:8000/transactions.html
set "PORT=8000"
set "WEBSITE_URL=http://localhost:%PORT%/index.html"

echo.
echo  ========================================
echo    QLTC - Mo website tu dong
echo  ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:%PORT%/' -UseBasicParsing -TimeoutSec 1; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  [OK] Server dang chay san.
    goto :OPEN_BROWSER
)

where node >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  Dang khoi dong server bang Node.js trong he thong...
    start "QLTC Server" /min cmd /c node "%~dp0server.js" %PORT% --no-open
    goto :WAIT_SERVER
)

if exist "%~dp0node-portable\node.exe" (
    echo  Dang khoi dong server bang Node.js portable...
    start "QLTC Server" /min cmd /c "%~dp0node-portable\node.exe" "%~dp0server.js" %PORT% --no-open
    goto :WAIT_SERVER
)

echo  [LOI] Khong tim thay Node.js.
echo  Hay chay start.bat lan dau de cai Node portable, hoac cai Node.js tu https://nodejs.org/
echo.
pause
exit /b 1

:WAIT_SERVER
echo  Dang doi server san sang...
timeout /t 2 /nobreak >nul

:OPEN_BROWSER
echo  Dang mo: %WEBSITE_URL%
start "" "%WEBSITE_URL%"
echo.
echo  Da mo website. Ban co the dong cua so nay.
timeout /t 3 /nobreak >nul
exit /b 0
