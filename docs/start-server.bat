@echo off
echo ========================================
echo  Iniciando Servidor de Estudos ALEGO
echo ========================================
echo.
echo Iniciando servidor HTTP na porta 8000...
echo.

cd /d "%~dp0"

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Python não encontrado. Tentando alternativa com PowerShell...
    echo.
    echo Iniciando servidor PowerShell embutido (não requer Python)...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
    exit /b 0
)

echo Servidor iniciado com sucesso!
echo.
echo Acesse: http://localhost:8000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

python server.py

pause
