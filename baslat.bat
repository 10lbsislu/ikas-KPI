@echo off
chcp 65001 >nul
title PAKYUREK KPI Panosu
cd /d "%~dp0"

echo ===================================================
echo   PAKYUREK KPI Panosu baslatiliyor...
echo ===================================================
echo.

REM Uretim derlemesi yoksa once derle
if not exist ".next" (
  echo Ilk calistirma: uretim surumu derleniyor, lutfen bekleyin...
  call npm run build
)

echo.
echo Sunucu aciliyor. Bu pencereyi KAPATMAYIN.
echo.
echo   Bu bilgisayarda:  http://localhost:3000
echo   Agdaki digerleri:  http://[BU-PC-IP]:3000   (IP icin: ipconfig)
echo.

call npm start
pause
