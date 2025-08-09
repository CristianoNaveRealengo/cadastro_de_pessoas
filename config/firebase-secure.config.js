// ==============================================
// CONFIGURAÇÃO SEGURA DO FIREBASE
// ==============================================

/**
 * Sistema de configuração seguro para Firebase
 * - Usa variáveis de ambiente quando disponível
 * - Fallback para configuração local em desenvolvimento
 * - Validação de configurações obrigatórias
 * - Integração com sistema avançado de detecção de ambiente
 */

// Importar detector de ambiente
import { environmentDetector } from './environment-detector.js';

class FirebaseConfigManager {
	constructor() {
		this.config = null;
		this.environmentInfo = environmentDetector.getEnvironmentInfo();
		this.isProduction = this.environmentInfo.isProduction;
		this.init();
	}

	/**
	 * Detecta o ambiente usando o sistema avançado
	 * @deprecated Use environmentDetector diretamente
	 */
	detectEnvironment() {
		console.warn('⚠️ detectEnvironment() está obsoleto. Use environmentDetector.getEnvironmentInfo()');
		return this.environmentInfo.isProduction;
	}

	init() {
		const { type } = this.environmentInfo;

		// Carregar configuração baseada no tipo de ambiente
		switch (type) {
			case 'production':
				this.loadProductionConfig();
				break;
			case 'staging':
				this.loadStagingConfig();
				break;
			case 'test':
				this.loadTestConfig();
				break;
			case 'development':
			case 'local-file':
			default:
				this.loadDevelopmentConfig();
				break;
		}

		this.validateConfig();
		this.logConfigurationStatus();
	}

	loadProductionConfig() {
		// Em produção, usar variáveis de ambiente ou configuração do servidor
		this.config = {
			apiKey: this.getEnvVar("FIREBASE_API_KEY"),
			authDomain: this.getEnvVar("FIREBASE_AUTH_DOMAIN"),
			projectId: this.getEnvVar("FIREBASE_PROJECT_ID"),
			storageBucket: this.getEnvVar("FIREBASE_STORAGE_BUCKET"),
			messagingSenderId: this.getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
			appId: this.getEnvVar("FIREBASE_APP_ID"),
		};

		console.log(
			"🔒 Configuração de produção carregada (variáveis de ambiente)"
		);
	}

	loadDevelopmentConfig() {
		// Em desenvolvimento, usar configuração local (apenas para desenvolvimento)
		this.config = {
			apiKey: "AIzaSyA9kLichJN3xSUBPUyaVDH_hJUwn2SL4GM",
			authDomain: "appcadastrodepessoas-2c20b.firebaseapp.com",
			projectId: "appcadastrodepessoas-2c20b",
			storageBucket: "appcadastrodepessoas-2c20b.firebasestorage.app",
			messagingSenderId: "789674139888",
			appId: "1:789674139888:web:0e21d7ba75c10bd6086235",
		};

		console.log("🛠️ Configuração de desenvolvimento carregada");
		console.warn(
			"⚠️ ATENÇÃO: Usando chaves de desenvolvimento. Configure variáveis de ambiente para produção!"
		);
	}

	/**
	 * Carrega configuração para ambiente de staging
	 */
	loadStagingConfig() {
		// Em staging, usar variáveis de ambiente com fallback para desenvolvimento
		this.config = {
			apiKey: this.getEnvVar("FIREBASE_API_KEY_STAGING") || this.getEnvVar("FIREBASE_API_KEY"),
			authDomain: this.getEnvVar("FIREBASE_AUTH_DOMAIN_STAGING") || this.getEnvVar("FIREBASE_AUTH_DOMAIN"),
			projectId: this.getEnvVar("FIREBASE_PROJECT_ID_STAGING") || this.getEnvVar("FIREBASE_PROJECT_ID"),
			storageBucket: this.getEnvVar("FIREBASE_STORAGE_BUCKET_STAGING") || this.getEnvVar("FIREBASE_STORAGE_BUCKET"),
			messagingSenderId: this.getEnvVar("FIREBASE_MESSAGING_SENDER_ID_STAGING") || this.getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
			appId: this.getEnvVar("FIREBASE_APP_ID_STAGING") || this.getEnvVar("FIREBASE_APP_ID"),
		};

		console.log("🎭 Configuração de staging carregada");
	}

	/**
	 * Carrega configuração para ambiente de teste
	 */
	loadTestConfig() {
		// Em teste, usar configuração específica ou emuladores
		this.config = {
			apiKey: this.getEnvVar("FIREBASE_API_KEY_TEST") || "test-api-key",
			authDomain: this.getEnvVar("FIREBASE_AUTH_DOMAIN_TEST") || "localhost",
			projectId: this.getEnvVar("FIREBASE_PROJECT_ID_TEST") || "test-project",
			storageBucket: this.getEnvVar("FIREBASE_STORAGE_BUCKET_TEST") || "test-bucket",
			messagingSenderId: this.getEnvVar("FIREBASE_MESSAGING_SENDER_ID_TEST") || "123456789",
			appId: this.getEnvVar("FIREBASE_APP_ID_TEST") || "test-app-id",
		};

		console.log("🧪 Configuração de teste carregada (emuladores)");
	}

	getEnvVar(name) {
		// Tentar obter de diferentes fontes
		return (
			process?.env?.[name] ||
			window?.[name] ||
			this.getMetaTag(name) ||
			this.getFromLocalStorage(name)
		);
	}

	getMetaTag(name) {
		// Buscar em meta tags (configuração via HTML)
		const meta = document.querySelector(`meta[name="${name}"]`);
		return meta?.getAttribute("content");
	}

	getFromLocalStorage(name) {
		// Buscar no localStorage (configuração local temporária)
		return localStorage.getItem(`config_${name}`);
	}

	validateConfig() {
		const required = ["apiKey", "authDomain", "projectId", "appId"];
		const missing = required.filter((key) => !this.config[key]);

		if (missing.length > 0) {
			const error = `❌ Configurações Firebase obrigatórias não encontradas: ${missing.join(
				", "
			)}`;
			console.error(error);

			if (this.isProduction) {
				throw new Error(error);
			} else {
				console.warn(
					"⚠️ Continuando em modo de desenvolvimento com configurações incompletas"
				);
			}
		}

		console.log("✅ Configuração Firebase validada com sucesso");
	}

	getConfig() {
		return { ...this.config }; // Retornar cópia para evitar modificações
	}

	// Método para configurar variáveis em tempo de execução (desenvolvimento)
	setConfigVar(name, value) {
		if (!this.isProduction) {
			localStorage.setItem(`config_${name}`, value);
			console.log(`🔧 Variável ${name} configurada localmente`);
		} else {
			console.warn("⚠️ Não é possível alterar configurações em produção");
		}
	}

	// Método para limpar configurações locais
	clearLocalConfig() {
		const keys = Object.keys(localStorage).filter((key) =>
			key.startsWith("config_")
		);
		keys.forEach((key) => localStorage.removeItem(key));
		console.log("🧹 Configurações locais limpas");
	}

	/**
	 * Registra o status da configuração no console
	 */
	logConfigurationStatus() {
		const { type, executionContext, availableFeatures } = this.environmentInfo;
		const emoji = this.getEnvironmentEmoji(type);

		console.log(`${emoji} Firebase configurado para ambiente: ${type.toUpperCase()}`);

		// Informações de contexto
		if (executionContext.isPWA) {
			console.log('📱 Executando como PWA');
		}

		if (executionContext.isElectron) {
			console.log('⚡ Executando no Electron');
		}

		// Avisos de segurança
		if (type === 'insecure-production') {
			console.error('🚨 CRÍTICO: Aplicação em produção sem HTTPS!');
		}

		if (!availableFeatures.secureContext && type === 'production') {
			console.warn('⚠️ Contexto inseguro detectado em produção');
		}

		// Recursos disponíveis importantes
		if (!availableFeatures.serviceWorker) {
			console.warn('⚠️ Service Workers não disponíveis');
		}

		if (!availableFeatures.crypto) {
			console.warn('⚠️ Web Crypto API não disponível');
		}
	}

	/**
	 * Obtém emoji representativo do ambiente
	 * @param {string} type - Tipo do ambiente
	 * @returns {string} Emoji
	 */
	getEnvironmentEmoji(type) {
		const emojis = {
			production: '🚀',
			staging: '🎭',
			development: '🛠️',
			test: '🧪',
			'local-file': '📁',
			'insecure-production': '🚨'
		};

		return emojis[type] || '❓';
	}

	/**
	 * Obter informações de segurança (versão aprimorada)
	 */
	getSecurityInfo() {
		return {
			// Informações básicas
			environment: this.environmentInfo.type,
			isProduction: this.environmentInfo.isProduction,
			isSecure: this.environmentInfo.isSecure,

			// Fonte da configuração
			configSource: this.getConfigSource(),

			// Informações de rede
			protocol: this.environmentInfo.protocol,
			hostname: this.environmentInfo.hostname,
			port: this.environmentInfo.port,

			// Contexto de execução
			executionContext: this.environmentInfo.executionContext,

			// Recursos de segurança
			securityFeatures: {
				secureContext: this.environmentInfo.availableFeatures.secureContext,
				crypto: this.environmentInfo.availableFeatures.crypto,
				serviceWorker: this.environmentInfo.availableFeatures.serviceWorker
			},

			// Configurações recomendadas
			recommendedConfig: this.environmentInfo.recommendedConfig,

			// Timestamp
			detectedAt: this.environmentInfo.detectedAt
		};
	}

	/**
	 * Determina a fonte da configuração
	 * @returns {string} Fonte da configuração
	 */
	getConfigSource() {
		const { type } = this.environmentInfo;

		switch (type) {
			case 'production':
				return 'environment_variables';
			case 'staging':
				return 'staging_environment';
			case 'test':
				return 'test_configuration';
			case 'development':
			case 'local-file':
			default:
				return 'local_development';
		}
	}
}

// Criar instância global
const firebaseConfigManager = new FirebaseConfigManager();

// Exportar configuração
export const firebaseConfig = firebaseConfigManager.getConfig();
export const configManager = firebaseConfigManager;

// Disponibilizar globalmente para debug (apenas em desenvolvimento)
if (!firebaseConfigManager.isProduction) {
	window.firebaseConfigManager = firebaseConfigManager;

	// Comandos úteis para desenvolvimento (versão aprimorada)
	window.configDebug = {
		// Informações básicas
		info: () => firebaseConfigManager.getSecurityInfo(),
		config: () => firebaseConfigManager.getConfig(),
		environment: () => firebaseConfigManager.environmentInfo,

		// Manipulação de configuração
		setVar: (name, value) => firebaseConfigManager.setConfigVar(name, value),
		clear: () => firebaseConfigManager.clearLocalConfig(),
		reload: () => {
			firebaseConfigManager.init();
			return firebaseConfigManager.getConfig();
		},

		// Testes de ambiente
		testEnvironment: () => {
			const info = firebaseConfigManager.environmentInfo;
			console.table({
				'Tipo de Ambiente': info.type,
				'É Produção': info.isProduction,
				'É Seguro (HTTPS)': info.isSecure,
				'É PWA': info.executionContext.isPWA,
				'Navegador': info.executionContext.browser,
				'Sistema Operacional': info.executionContext.os,
				'Service Worker': info.availableFeatures.serviceWorker,
				'Web Crypto': info.availableFeatures.crypto
			});
			return info;
		},

		// Simulação de ambientes
		simulateProduction: () => {
			console.warn('🚨 Simulando ambiente de produção...');
			// Temporariamente alterar para produção
			firebaseConfigManager.environmentInfo = {
				...firebaseConfigManager.environmentInfo,
				type: 'production',
				isProduction: true
			};
			firebaseConfigManager.init();
			console.log('✅ Ambiente simulado. Use configDebug.reload() para restaurar.');
		},

		// Verificação de recursos
		checkFeatures: () => {
			const features = firebaseConfigManager.environmentInfo.availableFeatures;
			console.log('🔍 Recursos disponíveis:');
			Object.entries(features).forEach(([feature, available]) => {
				const status = available ? '✅' : '❌';
				console.log(`${status} ${feature}: ${available}`);
			});
			return features;
		}
	};

	console.log("🛠️ Debug de configuração Firebase disponível:");
	console.log("💡 Use configDebug.info() para ver informações completas");
	console.log("💡 Use configDebug.testEnvironment() para testar detecção");
	console.log("💡 Use configDebug.checkFeatures() para verificar recursos");
	console.log('💡 Use configDebug.setVar("FIREBASE_API_KEY", "nova_chave") para testar');
	console.log('💡 Use envDebug.info() para informações detalhadas do ambiente');
}

export default firebaseConfig;
