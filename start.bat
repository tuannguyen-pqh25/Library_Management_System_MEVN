@echo off
chcp 65001 >nul
title [CT449] Khởi động Hệ thống Quản Lý Mượn Sách

echo ======================================================================
echo          HỆ THỐNG QUẢN LÝ MƯỢN SÁCH (MEVN STACK - CT449)
echo ======================================================================
echo.

echo [1/4] Đang khởi động Redis Server (Port 6379)...
if exist "D:\Tools\Redis\redis-server.exe" (
    start "[REDIS 6379] Redis Server" cmd /k "title [REDIS 6379] Redis Server && cd /d D:\Tools\Redis && redis-server.exe"
    echo   + Da khoi chay Redis Server tu D:\Tools\Redis thanh cong.
) else (
    where redis-server >nul 2>&1
    if not errorlevel 1 (
        start "[REDIS 6379] Redis Server" cmd /k "title [REDIS 6379] Redis Server && redis-server"
        echo   + Da khoi chay redis-server trong cua so rieng.
    ) else (
        echo   ! Khong tim thay redis-server - Backend se tu dong dung che do Fallback.
    )
)

echo.
echo [2/4] Đang khởi động Backend API (Port 3000)...
start "[BACKEND 3000] Quan Ly Muon Sach" cmd /k "title [BACKEND 3000] Quan Ly Muon Sach && cd /d "%~dp0BACKEND" && npm start"

echo [3/4] Đang khởi động Giao diện Độc giả - user-web (Port 5173)...
start "[USER-WEB 5173] Quan Ly Muon Sach" cmd /k "title [USER-WEB 5173] Quan Ly Muon Sach && cd /d "%~dp0frontend\user-web" && npm run dev"

echo [4/4] Đang khởi động Giao diện Quản trị - admin-web (Port 5174)...
start "[ADMIN-WEB 5174] Quan Ly Muon Sach" cmd /k "title [ADMIN-WEB 5174] Quan Ly Muon Sach && cd /d "%~dp0frontend\admin-web" && npm run dev"

echo.
echo ======================================================================
echo   ĐÃ KHỞI CHẠY THÀNH CÔNG TOÀN BỘ HỆ THỐNG!
echo   * Redis Cache : redis://127.0.0.1:6379
echo   * Backend API : http://localhost:3000
echo   * User Web    : http://localhost:5173
echo   * Admin Web   : http://localhost:5174
echo ======================================================================
echo.
timeout /t 4 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 5 >nul
start http://localhost:5173
start http://localhost:5174
exit
