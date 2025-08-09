/**
 * Firebase ERR_BLOCKED_BY_CLIENT - Sistema de Correção Automática
 * 
 * Este script implementa soluções automáticas para resolver o erro
 * ERR_BLOCKED_BY_CLIENT que ocorre quando bloqueadores de anúncios
 * ou configurações de rede interferem na conexão com o Firebase.
 * 
 * Autor: Sistema de Segurança Firebase
 * Data: 2024
 */

// Configurações globais para correção do erro
const FIREBASE_FIX_CONFIG = {
    // Configurações de retry
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    
    // Timeouts personalizados
    connectionTimeout: 15000,
    operationTimeout: 30000,
    
    // Endpoints alternativos
    alternativeEndpoints: {
        firestore: 'https://firestore.googleapis.com',
        auth: 'https://identitytoolkit.googleapis.com',
        storage: 'https://storage.googleapis.com'
    },
    
    // Configurações de fallback
    enableOfflineMode: true,
    enableRestFallback: true,
    enableLocalCache: true
};

/**
 * Classe principal para correção do erro ERR_BLOCKED_BY_CLIENT
 */
class FirebaseBlockedClientFix {
    constructor() {
        this.retryCount = 0;
        this.isBlocked = false;
        this.fallbackActive = false;
        this.diagnosticData = {};
        
        this.initializeErrorHandling();
        this.setupNetworkMonitoring();
    }

    /**
     * Inicializa o sistema de tratamento de erros
     */
    initializeErrorHandling() {
        // Interceptar erros de rede
        window.addEventListener('error', (event) => {
            if (this.isFirebaseNetworkError(event)) {
                this.handleBlockedClientError(event);
            }
        });

        // Interceptar erros não capturados
        window.addEventListener('unhandledrejection', (event) => {
            if (this.isFirebaseNetworkError(event.reason)) {
                this.handleBlockedClientError(event.reason);
            }
        });

        console.log('🛡️ Sistema de correção ERR_BLOCKED_BY_CLIENT inicializado');
    }

    /**
     * Configura monitoramento de rede
     */
    setupNetworkMonitoring() {
        // Monitorar mudanças na conectividade
        window.addEventListener('online', () => {
            console.log('🌐 Conexão restaurada - testando Firebase...');
            this.testFirebaseConnectivity();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Conexão perdida - ativando modo offline');
            this.activateOfflineMode();
        });
    }

    /**
     * Verifica se o erro é relacionado ao Firebase sendo bloqueado
     */
    isFirebaseNetworkError(error) {
        if (!error) return false;
        
        const errorString = error.toString().toLowerCase();
        const errorMessage = error.message ? error.message.toLowerCase() : '';
        
        const blockedIndicators = [
            'err_blocked_by_client',
            'net::err_blocked_by_client',
            'network request failed',
            'failed to fetch',
            'cors error',
            'firestore',
            'googleapis.com'
        ];
        
        return blockedIndicators.some(indicator => 
            errorString.includes(indicator) || errorMessage.includes(indicator)
        );
    }

    /**
     * Manipula o erro ERR_BLOCKED_BY_CLIENT
     */
    async handleBlockedClientError(error) {
        console.warn('🚨 Erro ERR_BLOCKED_BY_CLIENT detectado:', error);
        
        this.isBlocked = true;
        this.logDiagnosticInfo(error);
        
        // Tentar soluções automáticas em sequência
        const solutions = [
            () => this.clearBrowserCache(),
            () => this.switchToRestAPI(),
            () => this.useAlternativeEndpoints(),
            () => this.implementRetryWithBackoff(),
            () => this.activateOfflineMode()
        ];
        
        for (const solution of solutions) {
            try {
                const success = await solution();
                if (success) {
                    console.log('✅ Solução aplicada com sucesso');
                    this.isBlocked = false;
                    return true;
                }
            } catch (solutionError) {
                console.warn('⚠️ Solução falhou:', solutionError);
            }
        }
        
        // Se todas as soluções falharam, mostrar instruções ao usuário
        this.showUserInstructions();
        return false;
    }

    /**
     * Registra informações de diagnóstico
     */
    logDiagnosticInfo(error) {
        this.diagnosticData = {
            timestamp: new Date().toISOString(),
            error: error.toString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            online: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language,
            platform: navigator.platform,
            retryCount: this.retryCount
        };
        
        console.log('📊 Dados de diagnóstico:', this.diagnosticData);
    }

    /**
     * Limpa cache do navegador programaticamente
     */
    async clearBrowserCache() {
        console.log('🧹 Tentando limpar cache do navegador...');
        
        try {
            // Limpar Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                console.log('🔄 Service Workers limpos');
            }
            
            // Limpar storage local
            if (typeof Storage !== 'undefined') {
                const firebaseKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes('firebase')) {
                        firebaseKeys.push(key);
                    }
                }
                
                firebaseKeys.forEach(key => localStorage.removeItem(key));
                console.log(`🗑️ ${firebaseKeys.length} chaves Firebase removidas do localStorage`);
            }
            
            // Tentar usar Cache API
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const cacheName of cacheNames) {
                    if (cacheName.includes('firebase') || cacheName.includes('firestore')) {
                        await caches.delete(cacheName);
                        console.log(`🗂️ Cache ${cacheName} removido`);
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
            return false;
        }
    }

    /**
     * Muda para usar REST API em vez de WebSocket
     */
    async switchToRestAPI() {
        console.log('🔄 Mudando para REST API...');
        
        try {
            // Configurar Firebase para usar REST em vez de WebSocket
            if (window.firebase && window.firebase.firestore) {
                const firestore = window.firebase.firestore();
                
                // Desabilitar conexão em tempo real
                await firestore.disableNetwork();
                
                // Configurar para usar apenas REST
                firestore.settings({
                    experimentalForceLongPolling: true,
                    merge: true
                });
                
                // Reabilitar rede com nova configuração
                await firestore.enableNetwork();
                
                console.log('✅ Firebase configurado para usar REST API');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao configurar REST API:', error);
            return false;
        }
    }

    /**
     * Usa endpoints alternativos
     */
    async useAlternativeEndpoints() {
        console.log('🌐 Testando endpoints alternativos...');
        
        const { alternativeEndpoints } = FIREBASE_FIX_CONFIG;
        
        for (const [service, endpoint] of Object.entries(alternativeEndpoints)) {
            try {
                const response = await fetch(`${endpoint}/v1/projects`, {
                    method: 'HEAD',
                    mode: 'cors',
                    cache: 'no-cache'
                });
                
                if (response.ok || response.status === 401 || response.status === 403) {
                    console.log(`✅ Endpoint alternativo ${service} funcionando: ${endpoint}`);
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ Endpoint alternativo ${service} falhou:`, error);
            }
        }
        
        return false;
    }

    /**
     * Implementa retry com backoff exponencial
     */
    async implementRetryWithBackoff() {
        console.log('⏱️ Implementando retry com backoff...');
        
        const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = FIREBASE_FIX_CONFIG;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Calcular delay com backoff exponencial
                const delay = Math.min(
                    baseDelay * Math.pow(backoffMultiplier, attempt - 1),
                    maxDelay
                );
                
                console.log(`🔄 Tentativa ${attempt}/${maxRetries} - aguardando ${delay}ms...`);
                
                await this.sleep(delay);
                
                // Testar conectividade
                const isConnected = await this.testFirebaseConnectivity();
                if (isConnected) {
                    console.log(`✅ Conexão restaurada na tentativa ${attempt}`);
                    this.retryCount = attempt;
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ Tentativa ${attempt} falhou:`, error);
            }
        }
        
        console.error(`❌ Todas as ${maxRetries} tentativas falharam`);
        return false;
    }

    /**
     * Ativa modo offline
     */
    async activateOfflineMode() {
        console.log('📴 Ativando modo offline...');
        
        try {
            if (window.firebase && window.firebase.firestore) {
                const firestore = window.firebase.firestore();
                
                // Habilitar persistência offline
                await firestore.enablePersistence({
                    synchronizeTabs: true
                });
                
                console.log('✅ Modo offline ativado com persistência');
                
                // Mostrar notificação ao usuário
                this.showOfflineNotification();
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao ativar modo offline:', error);
            return false;
        }
    }

    /**
     * Testa conectividade com Firebase
     */
    async testFirebaseConnectivity() {
        try {
            const testEndpoint = 'https://firestore.googleapis.com/v1/projects/test';
            
            const response = await fetch(testEndpoint, {
                method: 'HEAD',
                mode: 'cors',
                cache: 'no-cache',
                signal: AbortSignal.timeout(FIREBASE_FIX_CONFIG.connectionTimeout)
            });
            
            // Qualquer resposta (mesmo 401/403) indica que a conexão funciona
            return response.status < 500;
        } catch (error) {
            console.warn('🔍 Teste de conectividade falhou:', error);
            return false;
        }
    }

    /**
     * Mostra instruções para o usuário
     */
    showUserInstructions() {
        const instructions = {
            title: '🚨 Erro de Conectividade Firebase',
            message: 'Detectamos que sua conexão com o Firebase está sendo bloqueada.',
            solutions: [
                '1. Desabilite temporariamente bloqueadores de anúncios (uBlock Origin, AdBlock Plus)',
                '2. Adicione *.googleapis.com à lista de sites permitidos',
                '3. Teste em uma aba privada/incógnita',
                '4. Verifique se sua rede corporativa não está bloqueando o acesso',
                '5. Tente usar uma rede diferente (dados móveis)'
            ],
            technicalInfo: this.diagnosticData
        };
        
        // Mostrar modal ou notificação
        this.displayUserModal(instructions);
        
        // Log para desenvolvedores
        console.group('🔧 Instruções para Desenvolvedores');
        console.log('Erro ERR_BLOCKED_BY_CLIENT detectado');
        console.log('Soluções automáticas falharam');
        console.log('Dados de diagnóstico:', this.diagnosticData);
        console.log('Abra tools/fix-blocked-client-error.html para diagnóstico detalhado');
        console.groupEnd();
    }

    /**
     * Exibe modal com instruções para o usuário
     */
    displayUserModal(instructions) {
        // Verificar se já existe um modal
        if (document.getElementById('firebase-error-modal')) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'firebase-error-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                margin: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">🚨</div>
                    <h2 style="margin: 0; color: #dc2626; font-size: 20px;">${instructions.title}</h2>
                </div>
                
                <p style="color: #374151; margin-bottom: 20px; line-height: 1.5;">
                    ${instructions.message}
                </p>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">Soluções:</h3>
                    <ul style="color: #4b5563; line-height: 1.6; padding-left: 20px;">
                        ${instructions.solutions.map(solution => `<li style="margin-bottom: 8px;">${solution}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Fechar</button>
                    <button onclick="window.open('tools/fix-blocked-client-error.html', '_blank')" style="
                        background: #dc2626;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Diagnóstico Detalhado</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remover modal automaticamente após 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    /**
     * Mostra notificação de modo offline
     */
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">📴</span>
                <div>
                    <strong>Modo Offline Ativo</strong><br>
                    <small>Dados serão sincronizados quando a conexão for restaurada</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover notificação após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Função utilitária para sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtém relatório de diagnóstico
     */
    getDiagnosticReport() {
        return {
            ...this.diagnosticData,
            isBlocked: this.isBlocked,
            fallbackActive: this.fallbackActive,
            retryCount: this.retryCount,
            config: FIREBASE_FIX_CONFIG
        };
    }

    /**
     * Força teste de conectividade
     */
    async forceConnectivityTest() {
        console.log('🔍 Forçando teste de conectividade...');
        
        const isConnected = await this.testFirebaseConnectivity();
        
        if (isConnected) {
            console.log('✅ Conectividade Firebase OK');
            this.isBlocked = false;
        } else {
            console.warn('❌ Firebase ainda está bloqueado');
            this.isBlocked = true;
        }
        
        return isConnected;
    }
}

// Função para interceptar e corrigir erros do Firebase automaticamente
function interceptFirebaseErrors() {
    // Interceptar fetch para Firebase
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            // Se a resposta falhou e é para Firebase, tentar correção
            if (!response.ok && args[0] && args[0].includes('googleapis.com')) {
                console.warn('🔍 Erro detectado em requisição Firebase:', response.status);
                
                if (window.firebaseBlockedClientFix) {
                    await window.firebaseBlockedClientFix.handleBlockedClientError({
                        message: `HTTP ${response.status} - ${args[0]}`,
                        status: response.status,
                        url: args[0]
                    });
                }
            }
            
            return response;
        } catch (error) {
            // Se é erro de rede para Firebase, tentar correção
            if (args[0] && args[0].includes('googleapis.com')) {
                console.warn('🚨 Erro de rede detectado para Firebase:', error);
                
                if (window.firebaseBlockedClientFix) {
                    await window.firebaseBlockedClientFix.handleBlockedClientError(error);
                }
            }
            
            throw error;
        }
    };
}

// Inicialização automática
function initializeFirebaseBlockedClientFix() {
    // Criar instância global
    window.firebaseBlockedClientFix = new FirebaseBlockedClientFix();
    
    // Interceptar erros
    interceptFirebaseErrors();
    
    // Adicionar funções utilitárias globais
    window.testFirebaseConnectivity = () => {
        return window.firebaseBlockedClientFix.forceConnectivityTest();
    };
    
    window.getFirebaseDiagnostic = () => {
        return window.firebaseBlockedClientFix.getDiagnosticReport();
    };
    
    window.clearFirebaseCache = () => {
        return window.firebaseBlockedClientFix.clearBrowserCache();
    };
    
    console.log('🛡️ Sistema de correção ERR_BLOCKED_BY_CLIENT ativo');
    console.log('💡 Use testFirebaseConnectivity() para testar manualmente');
    console.log('📊 Use getFirebaseDiagnostic() para ver dados de diagnóstico');
}

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseBlockedClientFix);
} else {
    initializeFirebaseBlockedClientFix();
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FirebaseBlockedClientFix,
        FIREBASE_FIX_CONFIG,
        initializeFirebaseBlockedClientFix
    };
}

// Exportar para ES6 modules
if (typeof window !== 'undefined') {
    window.FirebaseBlockedClientFix = FirebaseBlockedClientFix;
    window.FIREBASE_FIX_CONFIG = FIREBASE_FIX_CONFIG;
}