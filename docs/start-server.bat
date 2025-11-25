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
    echo [ERRO] Python não encontrado!
    echo.
    echo Por favor, instale o Python em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
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
