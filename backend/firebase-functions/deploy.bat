@echo off
echo ========================================
echo    NAVE Backend - Deploy Script
echo ========================================
echo.

echo [1/4] Verificando dependencias...
cd functions
if not exist node_modules (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas.
)

echo.
echo [2/4] Verificando configuracao do Firebase...
firebase projects:list
if %errorlevel% neq 0 (
    echo ERRO: Firebase CLI nao configurado ou usuario nao logado.
    echo Execute: firebase login
    pause
    exit /b 1
)

echo.
echo [3/4] Testando funcoes localmente...
echo Iniciando emulador para teste...
echo (Pressione Ctrl+C para parar o emulador e continuar)
firebase emulators:start --only functions --project nave-project-dev

echo.
echo [4/4] Fazendo deploy para producao...
set /p deploy_confirm="Deseja fazer deploy para producao? (s/N): "
if /i "%deploy_confirm%"=="s" (
    echo Fazendo deploy...
    firebase deploy --only functions --project nave-project-dev
    echo.
    echo ========================================
    echo     Deploy concluido com sucesso!
    echo ========================================
    echo.
    echo Funcoes disponiveis:
    echo - createRecord
    echo - updateRecord  
    echo - getRecords
    echo - getRecord
    echo - deleteRecord
    echo - getStatistics
    echo - validateData
    echo - backupData
    echo - healthCheck
    echo.
) else (
    echo Deploy cancelado pelo usuario.
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul