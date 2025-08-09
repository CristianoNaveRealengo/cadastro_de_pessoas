/**
 * Script para Diagnosticar e Corrigir Problemas de Inicialização da Criptografia
 * 
 * Problema identificado: "Chave de criptografia não inicializada"
 * Causa: Sistema de criptografia sendo usado antes da inicialização da chave
 * 
 * @author Sistema de Correção
 * @version 1.0.0
 */

class EncryptionInitializationFixer {
    constructor() {
        this.diagnosticResults = [];
        this.fixResults = [];
        this.isInitialized = false;
    }

    /**
     * Executa diagnóstico completo do sistema de criptografia
     */
    async runDiagnostic() {
        console.log('🔍 Iniciando diagnóstico do sistema de criptografia...');
        this.diagnosticResults = [];

        // 1. Verificar se o sistema de criptografia está carregado
        this.checkEncryptionSystemLoaded();

        // 2. Verificar se o Firebase Auth está disponível
        this.checkFirebaseAuth();

        // 3. Verificar se há usuário logado
        this.checkCurrentUser();

        // 4. Verificar se a chave está inicializada
        this.checkEncryptionKey();

        // 5. Verificar ordem de carregamento dos scripts
        this.checkScriptLoadOrder();

        // 6. Verificar se há dados pendentes de criptografia
        this.checkPendingData();

        return this.diagnosticResults;
    }

    /**
     * Verifica se o sistema de criptografia está carregado
     */
    checkEncryptionSystemLoaded() {
        const result = {
            test: 'Sistema de Criptografia Carregado',
            status: 'unknown',
            details: [],
            solution: null
        };

        if (window.dataEncryption) {
            result.status = 'success';
            result.details.push('✅ window.dataEncryption está disponível');
            result.details.push(`✅ Algoritmo: ${window.dataEncryption.algorithm}`);
            result.details.push(`✅ Campos sensíveis: ${window.dataEncryption.sensitiveFields.length}`);
        } else {
            result.status = 'error';
            result.details.push('❌ window.dataEncryption não está disponível');
            result.solution = 'Verificar se o script data-encryption.js está carregado';
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Verifica se o Firebase Auth está disponível
     */
    checkFirebaseAuth() {
        const result = {
            test: 'Firebase Auth Disponível',
            status: 'unknown',
            details: [],
            solution: null
        };

        if (window.auth) {
            result.status = 'success';
            result.details.push('✅ window.auth está disponível');
            result.details.push(`✅ App: ${window.auth.app?.name || 'N/A'}`);
        } else {
            result.status = 'error';
            result.details.push('❌ window.auth não está disponível');
            result.solution = 'Verificar se o Firebase Auth foi inicializado';
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Verifica se há usuário logado
     */
    checkCurrentUser() {
        const result = {
            test: 'Usuário Autenticado',
            status: 'unknown',
            details: [],
            solution: null
        };

        if (window.auth && window.auth.currentUser) {
            result.status = 'success';
            result.details.push('✅ Usuário está logado');
            result.details.push(`✅ Email: ${window.auth.currentUser.email}`);
            result.details.push(`✅ UID: ${window.auth.currentUser.uid.substring(0, 8)}...`);
        } else {
            result.status = 'warning';
            result.details.push('⚠️ Nenhum usuário logado');
            result.solution = 'Fazer login antes de usar criptografia';
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Verifica se a chave de criptografia está inicializada
     */
    checkEncryptionKey() {
        const result = {
            test: 'Chave de Criptografia',
            status: 'unknown',
            details: [],
            solution: null
        };

        if (window.dataEncryption) {
            if (window.dataEncryption.encryptionKey) {
                result.status = 'success';
                result.details.push('✅ Chave de criptografia inicializada');
                this.isInitialized = true;
            } else {
                result.status = 'error';
                result.details.push('❌ Chave de criptografia NÃO inicializada');
                result.solution = 'Inicializar chave com email do usuário';
            }
        } else {
            result.status = 'error';
            result.details.push('❌ Sistema de criptografia não disponível');
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Verifica ordem de carregamento dos scripts
     */
    checkScriptLoadOrder() {
        const result = {
            test: 'Ordem de Carregamento dos Scripts',
            status: 'unknown',
            details: [],
            solution: null
        };

        const requiredOrder = [
            'data-encryption.js',
            'encryption-integration.js'
        ];

        const scripts = Array.from(document.querySelectorAll('script[src]'))
            .map(script => script.src.split('/').pop())
            .filter(src => requiredOrder.includes(src));

        if (scripts.length === requiredOrder.length) {
            result.status = 'success';
            result.details.push('✅ Scripts de criptografia carregados');
            result.details.push(`✅ Ordem: ${scripts.join(' → ')}`);
        } else {
            result.status = 'warning';
            result.details.push('⚠️ Alguns scripts podem não estar carregados');
            result.details.push(`📋 Encontrados: ${scripts.join(', ')}`);
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Verifica se há dados pendentes de criptografia
     */
    checkPendingData() {
        const result = {
            test: 'Dados Pendentes',
            status: 'unknown',
            details: [],
            solution: null
        };

        if (window.appData && window.appData.records) {
            const totalRecords = window.appData.records.length;
            const encryptedRecords = window.appData.records.filter(r => r._encrypted).length;
            const unencryptedRecords = totalRecords - encryptedRecords;

            result.details.push(`📊 Total de registros: ${totalRecords}`);
            result.details.push(`🔐 Registros criptografados: ${encryptedRecords}`);
            result.details.push(`📝 Registros não criptografados: ${unencryptedRecords}`);

            if (unencryptedRecords > 0) {
                result.status = 'warning';
                result.solution = 'Migrar dados não criptografados';
            } else {
                result.status = 'success';
            }
        } else {
            result.status = 'info';
            result.details.push('ℹ️ Nenhum dado encontrado');
        }

        this.diagnosticResults.push(result);
    }

    /**
     * Aplica correções automáticas
     */
    async applyFixes() {
        console.log('🔧 Aplicando correções automáticas...');
        this.fixResults = [];

        // 1. Inicializar chave se usuário estiver logado
        await this.fixEncryptionKey();

        // 2. Configurar listeners adequados
        await this.fixAuthListeners();

        // 3. Migrar dados se necessário
        await this.fixDataMigration();

        return this.fixResults;
    }

    /**
     * Corrige inicialização da chave de criptografia
     */
    async fixEncryptionKey() {
        const result = {
            fix: 'Inicialização da Chave de Criptografia',
            status: 'unknown',
            details: [],
            error: null
        };

        try {
            if (!window.dataEncryption) {
                result.status = 'error';
                result.details.push('❌ Sistema de criptografia não disponível');
                this.fixResults.push(result);
                return;
            }

            if (!window.auth || !window.auth.currentUser) {
                result.status = 'warning';
                result.details.push('⚠️ Usuário não está logado');
                result.details.push('💡 Aguardando login para inicializar chave');
                this.fixResults.push(result);
                return;
            }

            const userEmail = window.auth.currentUser.email;
            
            // Inicializar chave
            await window.dataEncryption.initializeKey(userEmail);
            
            // Testar criptografia
            const testResult = await window.dataEncryption.testEncryption();
            
            if (testResult) {
                result.status = 'success';
                result.details.push('✅ Chave de criptografia inicializada');
                result.details.push(`✅ Usuário: ${userEmail}`);
                result.details.push('✅ Teste de criptografia passou');
                this.isInitialized = true;
            } else {
                result.status = 'error';
                result.details.push('❌ Falha no teste de criptografia');
            }

        } catch (error) {
            result.status = 'error';
            result.error = error.message;
            result.details.push(`❌ Erro: ${error.message}`);
        }

        this.fixResults.push(result);
    }

    /**
     * Configura listeners de autenticação adequados
     */
    async fixAuthListeners() {
        const result = {
            fix: 'Configuração de Listeners de Auth',
            status: 'unknown',
            details: [],
            error: null
        };

        try {
            if (!window.auth) {
                result.status = 'error';
                result.details.push('❌ Firebase Auth não disponível');
                this.fixResults.push(result);
                return;
            }

            // Configurar listener para mudanças de autenticação
            window.auth.onAuthStateChanged(async (user) => {
                if (user && window.dataEncryption && !window.dataEncryption.encryptionKey) {
                    try {
                        console.log('🔐 Inicializando criptografia para usuário logado:', user.email);
                        await window.dataEncryption.initializeKey(user.email);
                        
                        const testResult = await window.dataEncryption.testEncryption();
                        if (testResult) {
                            console.log('✅ Criptografia inicializada automaticamente');
                            this.showEncryptionStatus(true);
                        }
                    } catch (error) {
                        console.error('❌ Erro na inicialização automática:', error);
                        this.showEncryptionStatus(false);
                    }
                }
            });

            result.status = 'success';
            result.details.push('✅ Listener de autenticação configurado');
            result.details.push('✅ Inicialização automática ativada');

        } catch (error) {
            result.status = 'error';
            result.error = error.message;
            result.details.push(`❌ Erro: ${error.message}`);
        }

        this.fixResults.push(result);
    }

    /**
     * Migra dados não criptografados
     */
    async fixDataMigration() {
        const result = {
            fix: 'Migração de Dados',
            status: 'unknown',
            details: [],
            error: null
        };

        try {
            if (!this.isInitialized) {
                result.status = 'warning';
                result.details.push('⚠️ Chave não inicializada, pulando migração');
                this.fixResults.push(result);
                return;
            }

            if (!window.appData || !window.appData.records) {
                result.status = 'info';
                result.details.push('ℹ️ Nenhum dado para migrar');
                this.fixResults.push(result);
                return;
            }

            const unencryptedRecords = window.appData.records.filter(r => !r._encrypted);
            
            if (unencryptedRecords.length === 0) {
                result.status = 'success';
                result.details.push('✅ Todos os dados já estão criptografados');
                this.fixResults.push(result);
                return;
            }

            // Fazer backup
            const backupKey = `personalRecords_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(window.appData.records));
            
            result.details.push(`💾 Backup criado: ${backupKey}`);
            result.details.push(`📊 Migrando ${unencryptedRecords.length} registros`);

            // Migrar dados
            for (let i = 0; i < unencryptedRecords.length; i++) {
                const record = unencryptedRecords[i];
                await window.dataEncryption.encryptRecord(record);
                result.details.push(`✅ Registro ${i + 1}/${unencryptedRecords.length} migrado`);
            }

            // Salvar dados migrados
            if (window.saveData) {
                await window.saveData();
                result.details.push('💾 Dados migrados salvos');
            }

            result.status = 'success';
            result.details.push('✅ Migração concluída com sucesso');

        } catch (error) {
            result.status = 'error';
            result.error = error.message;
            result.details.push(`❌ Erro na migração: ${error.message}`);
        }

        this.fixResults.push(result);
    }

    /**
     * Mostra status da criptografia na interface
     */
    showEncryptionStatus(isActive) {
        // Criar ou atualizar indicador visual
        let indicator = document.getElementById('encryptionStatus');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'encryptionStatus';
            indicator.className = 'fixed top-4 left-4 z-50 px-3 py-2 rounded-lg text-sm font-medium';
            document.body.appendChild(indicator);
        }

        if (isActive) {
            indicator.className = 'fixed top-4 left-4 z-50 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200';
            indicator.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>Criptografia Ativa';
        } else {
            indicator.className = 'fixed top-4 left-4 z-50 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200';
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Criptografia Inativa';
        }

        // Remover após 5 segundos
        setTimeout(() => {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 5000);
    }

    /**
     * Força inicialização da criptografia
     */
    async forceInitialization() {
        console.log('🚀 Forçando inicialização da criptografia...');
        
        try {
            if (!window.auth || !window.auth.currentUser) {
                throw new Error('Usuário não está logado');
            }

            if (!window.dataEncryption) {
                throw new Error('Sistema de criptografia não disponível');
            }

            const userEmail = window.auth.currentUser.email;
            
            // Forçar inicialização
            await window.dataEncryption.initializeKey(userEmail);
            
            // Testar
            const testResult = await window.dataEncryption.testEncryption();
            
            if (testResult) {
                console.log('✅ Inicialização forçada bem-sucedida');
                this.showEncryptionStatus(true);
                return { success: true, message: 'Criptografia inicializada com sucesso' };
            } else {
                throw new Error('Falha no teste de criptografia');
            }

        } catch (error) {
            console.error('❌ Erro na inicialização forçada:', error);
            this.showEncryptionStatus(false);
            return { success: false, message: error.message };
        }
    }

    /**
     * Gera relatório completo
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            diagnostic: this.diagnosticResults,
            fixes: this.fixResults,
            summary: {
                totalTests: this.diagnosticResults.length,
                passedTests: this.diagnosticResults.filter(r => r.status === 'success').length,
                failedTests: this.diagnosticResults.filter(r => r.status === 'error').length,
                warningTests: this.diagnosticResults.filter(r => r.status === 'warning').length,
                totalFixes: this.fixResults.length,
                successfulFixes: this.fixResults.filter(r => r.status === 'success').length,
                failedFixes: this.fixResults.filter(r => r.status === 'error').length
            }
        };

        return report;
    }
}

// Disponibilizar globalmente
window.EncryptionInitializationFixer = EncryptionInitializationFixer;

console.log('🔧 Sistema de correção de criptografia carregado');