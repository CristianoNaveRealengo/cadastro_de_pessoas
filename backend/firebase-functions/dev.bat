@echo off
echo ========================================
echo   NAVE Backend - Desenvolvimento Local
echo ========================================
echo.

echo [1/3] Verificando dependencias...
cd functions
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias.
        pause
        exit /b 1
    )
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/3] Verificando configuracao do Firebase...
firebase --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Firebase CLI nao encontrado.
    echo Instale com: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo     Servidor Local Iniciado!
echo ========================================
echo.
echo URL Base: http://localhost:5001/nave-project-dev/us-central1
echo.
echo Endpoints disponiveis:
echo - POST   /createRecord
echo - PUT    /updateRecord?id=ID
echo - GET    /getRecords
echo - GET    /getRecord?id=ID
echo - DELETE /deleteRecord?id=ID
echo - GET    /getStatistics
echo - POST   /validateData
echo - POST   /backupData
echo - GET    /healthCheck
echo.
echo Interface do Emulador: http://localhost:4000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

firebase emulators:start --only functions,ui --project nave-project-dev

echo.
echo Servidor parado.
pause