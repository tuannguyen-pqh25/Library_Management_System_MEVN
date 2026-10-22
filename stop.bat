@echo off
chcp 65001 >nul
title [CT449] Dừng Hệ thống Quản Lý Mượn Sách

echo ======================================================================
echo          ĐANG DỪNG TOÀN BỘ HỆ THỐNG QUẢN LÝ MƯỢN SÁCH
echo ======================================================================
echo.

echo [1/2] Đang giải phóng các cổng Port 3000, 5173, 5174, 6379 (Redis)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000, 5173, 5174, 6379 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $procId = $_.OwningProcess; Write-Host ('  - Dung tien trinh PID: ' + $procId + ' (Port ' + $_.LocalPort + ')'); Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }"

:: Phương án dự phòng qua netstat (đảm bảo sạch sẽ 100%)
for %%P in (3000 5173 5174 6379) do (
    for /f "tokens=5" %%a in ('netstat -aon -p tcp ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo [2/2] Đang đóng các cửa sổ Terminal dự án...
taskkill /F /FI "WINDOWTITLE eq *Quan Ly Muon Sach*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *Redis Server*" >nul 2>&1
taskkill /F /IM redis-server.exe >nul 2>&1

echo.
echo ======================================================================
echo   HỆ THỐNG ĐÃ ĐƯỢC TẮT TOÀN BỘ VÀ GIẢI PHÓNG TÀI NGUYÊN!
echo ======================================================================
echo.
timeout /t 3 >nul
exit
