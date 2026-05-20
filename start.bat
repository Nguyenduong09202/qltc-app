@echo off
chcp 65001 >nul
title QLTC - Quan ly Tai chinh
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo  ========================================
echo    QLTC - Quan ly Tai chinh Ca nhan
echo  ========================================
echo.

REM -- 1) Uu tien Node.js da cai san trong he thong --
where node >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  [OK] Phat hien Node.js trong he thong.
    goto :RUN_SYSTEM
)

REM -- 2) Kiem tra Node portable da co san trong thu muc project --
set "NODE_DIR=%~dp0node-portable"
set "NODE_EXE=%NODE_DIR%\node.exe"
if exist "%NODE_EXE%" (
    echo  [OK] Su dung Node.js portable co san.
    goto :RUN_PORTABLE
)

REM -- 3) Chua co Node - Tai ve ban portable --
echo  Khong tim thay Node.js.
echo  Se tu dong tai ban portable (~30MB, can internet lan dau).
echo.
choice /C YN /M "  Tiep tuc tai Node.js portable"
if errorlevel 2 (
    echo.
    echo  Da huy. Ban co the cai Node.js tu https://nodejs.org/
    pause
    exit /b 1
)

set "NODE_VERSION=v20.18.0"
set "NODE_FOLDER=node-%NODE_VERSION%-win-x64"
set "NODE_URL=https://nodejs.org/dist/%NODE_VERSION%/%NODE_FOLDER%.zip"
set "ZIP_FILE=%TEMP%\node-portable.zip"

echo.
echo  Dang tai Node.js %NODE_VERSION%...
echo  URL: %NODE_URL%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ProgressPreference='SilentlyContinue';" ^
    "try { Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [LOI] Khong tai duoc Node.js.
    echo  Kiem tra ket noi internet va thu lai, hoac cai thu cong tu https://nodejs.org/
    pause
    exit /b 1
)

echo  Dang giai nen...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Expand-Archive -LiteralPath '%ZIP_FILE%' -DestinationPath '%~dp0_node_tmp' -Force"

if not exist "%~dp0_node_tmp\%NODE_FOLDER%\node.exe" (
    echo  [LOI] Giai nen that bai.
    pause
    exit /b 1
)

move "%~dp0_node_tmp\%NODE_FOLDER%" "%NODE_DIR%" >nul
rmdir /S /Q "%~dp0_node_tmp" 2>nul
del "%ZIP_FILE%" 2>nul

echo  [OK] Da cai Node.js portable vao: %NODE_DIR%
echo.

:RUN_PORTABLE
echo  Khoi dong server...
echo.
"%NODE_EXE%" "%~dp0server.js" 8000
goto :END

:RUN_SYSTEM
echo  Khoi dong server...
echo.
node "%~dp0server.js" 8000

:END
echo.
echo  Server da dung. Nhan phim bat ky de dong cua so.
pause >nul
