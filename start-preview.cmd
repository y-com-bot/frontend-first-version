@echo off
chcp 65001 >nul
cd /d "%~dp0"
if "%~1"=="--server" goto server
if exist "校园助手-双击打开.html" (
  start "" "校园助手-双击打开.html"
  exit /b 0
)
if exist "standalone\校园助手-双击打开.html" (
  start "" "standalone\校园助手-双击打开.html"
  exit /b 0
)
:server
where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js。请使用预览包中的“校园助手-双击打开.html”，或先安装 Node.js。
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo 当前是源码目录，尚未生成页面。请先执行 npm ci 和 npm run build。
  echo 如果只想体验界面，请下载预览包，双击其中的 HTML 文件。
  pause
  exit /b 1
)
node scripts\serve.mjs --open
echo.
echo 预览服务已停止。请查看上方提示；窗口仍然打开不代表服务正在运行。
pause
