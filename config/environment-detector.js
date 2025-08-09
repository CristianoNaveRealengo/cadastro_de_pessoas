// ==============================================
// SISTEMA DE DETECÇÃO AUTOMÁTICA DE AMBIENTE
// ==============================================

/**
 * Sistema avançado de detecção de ambiente para aplicações web
 * - Detecta automaticamente produção, desenvolvimento, teste e staging
 * - Identifica contextos específicos (PWA, Electron, Mobile, etc.)
 * - Fornece informações detalhadas sobre o ambiente de execução
 * - Suporte a configurações personalizadas por ambiente
 */

class EnvironmentDetector {
	constructor() {
		this.environmentInfo = this.detectEnvironment();
		this.initializeEnvironmentSpecificFeatures();
	}

	/**
	 * Detecta o ambiente atual baseado em múltiplos fatores
	 * @returns {Object} Informações completas do ambiente
	 */
	detectEnvironment() {
		const location = window.location;
		const userAgent = navigator.userAgent;
		const hostname = location.hostname;
		const protocol = location.protocol;
		const port = location.port;

		// Detecção básica de ambiente
		const isLocalhost = this.isLocalhostEnvironment(hostname);
		const isHttps = protocol === 'https:';
		const isDevelopmentPort = this.isDevelopmentPort(port);
		const isFileProtocol = protocol === 'file:';

		// Detecção de ambiente específico
		const environmentType = this.determineEnvironmentType({
			isLocalhost,
			isHttps,
			isDevelopmentPort,
			isFileProtocol,
			hostname
		});

		// Detecção de contexto de execução
		const executionContext = this.detectExecutionContext(userAgent);

		// Detecção de recursos disponíveis
		const availableFeatures = this.detectAvailableFeatures();

		return {
			// Informações básicas
			type: environmentType,
			isProduction: environmentType === 'production',
			isDevelopment: environmentType === 'development',
			isStaging: environmentType === 'staging',
			isTest: environmentType === 'test',

			// Detalhes técnicos
			protocol,
			hostname,
			port,
			isSecure: isHttps,
			isLocalhost,

			// Contexto de execução
			executionContext,

			// Recursos disponíveis
			availableFeatures,

			// Timestamp da detecção
			detectedAt: new Date().toISOString(),

			// Configurações recomendadas
			recommendedConfig: this.getRecommendedConfig(environmentType)
		};
	}

	/**
	 * Verifica se está executando em localhost
	 * @param {string} hostname - Nome do host
	 * @returns {boolean} True se for localhost
	 */
	isLocalhostEnvironment(hostname) {
		const localhostPatterns = [
			'localhost',
			'127.0.0.1',
			'0.0.0.0',
			'::1',
			'[::1]'
		];

		return localhostPatterns.some(pattern => 
			hostname.includes(pattern)
		) || hostname.endsWith('.local');
	}

	/**
	 * Verifica se a porta indica ambiente de desenvolvimento
	 * @param {string} port - Número da porta
	 * @returns {boolean} True se for porta de desenvolvimento
	 */
	isDevelopmentPort(port) {
		const developmentPorts = [
			'3000', '3001', '3002', // React, Next.js
			'4200', '4201', // Angular
			'5000', '5001', '5173', // Vite, Flask
			'8000', '8001', '8080', '8081', // Desenvolvimento geral
			'9000', '9001' // Webpack dev server
		];

		return developmentPorts.includes(port);
	}

	/**
	 * Determina o tipo de ambiente baseado nos indicadores
	 * @param {Object} indicators - Indicadores do ambiente
	 * @returns {string} Tipo do ambiente
	 */
	determineEnvironmentType({ isLocalhost, isHttps, isDevelopmentPort, isFileProtocol, hostname }) {
		// Ambiente de arquivo local
		if (isFileProtocol) {
			return 'local-file';
		}

		// Ambiente de desenvolvimento
		if (isLocalhost || isDevelopmentPort) {
			return 'development';
		}

		// Ambiente de teste
		if (hostname.includes('test') || hostname.includes('qa')) {
			return 'test';
		}

		// Ambiente de staging
		if (hostname.includes('staging') || hostname.includes('stage') || hostname.includes('dev')) {
			return 'staging';
		}

		// Ambiente de produção (HTTPS obrigatório)
		if (isHttps) {
			return 'production';
		}

		// Ambiente inseguro (HTTP em produção)
		return 'insecure-production';
	}

	/**
	 * Detecta o contexto de execução da aplicação
	 * @param {string} userAgent - User agent do navegador
	 * @returns {Object} Informações do contexto de execução
	 */
	detectExecutionContext(userAgent) {
		return {
			// Tipo de aplicação
			isPWA: this.isPWAContext(),
			isElectron: userAgent.includes('Electron'),
			isWebView: userAgent.includes('wv') || userAgent.includes('WebView'),

			// Plataforma
			isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
			isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
			isDesktop: !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),

			// Navegador
			browser: this.detectBrowser(userAgent),

			// Sistema operacional
			os: this.detectOperatingSystem(userAgent)
		};
	}

	/**
	 * Verifica se está executando como PWA
	 * @returns {boolean} True se for PWA
	 */
	isPWAContext() {
		return (
			window.matchMedia('(display-mode: standalone)').matches ||
			window.navigator.standalone === true ||
			document.referrer.includes('android-app://')
		);
	}

	/**
	 * Detecta o navegador utilizado
	 * @param {string} userAgent - User agent
	 * @returns {string} Nome do navegador
	 */
	detectBrowser(userAgent) {
		if (userAgent.includes('Chrome')) return 'Chrome';
		if (userAgent.includes('Firefox')) return 'Firefox';
		if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
		if (userAgent.includes('Edge')) return 'Edge';
		if (userAgent.includes('Opera')) return 'Opera';
		return 'Unknown';
	}

	/**
	 * Detecta o sistema operacional
	 * @param {string} userAgent - User agent
	 * @returns {string} Nome do sistema operacional
	 */
	detectOperatingSystem(userAgent) {
		if (userAgent.includes('Windows')) return 'Windows';
		if (userAgent.includes('Mac')) return 'macOS';
		if (userAgent.includes('Linux')) return 'Linux';
		if (userAgent.includes('Android')) return 'Android';
		if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
		return 'Unknown';
	}

	/**
	 * Detecta recursos disponíveis no ambiente
	 * @returns {Object} Recursos disponíveis
	 */
	detectAvailableFeatures() {
		return {
			// APIs do navegador
			serviceWorker: 'serviceWorker' in navigator,
			pushNotifications: 'PushManager' in window,
			geolocation: 'geolocation' in navigator,
			camera: 'mediaDevices' in navigator,
			offlineStorage: 'localStorage' in window,
			indexedDB: 'indexedDB' in window,

			// Recursos de segurança
			crypto: 'crypto' in window && 'subtle' in window.crypto,
			secureContext: window.isSecureContext,

			// Recursos de rede
			onlineStatus: 'onLine' in navigator,
			connection: 'connection' in navigator,

			// Recursos de performance
			performanceAPI: 'performance' in window,
			webWorkers: 'Worker' in window
		};
	}

	/**
	 * Obtém configurações recomendadas para o ambiente
	 * @param {string} environmentType - Tipo do ambiente
	 * @returns {Object} Configurações recomendadas
	 */
	getRecommendedConfig(environmentType) {
		const configs = {
			production: {
				debugMode: false,
				logging: 'error',
				caching: true,
				minification: true,
				securityLevel: 'high',
				analytics: true
			},
			staging: {
				debugMode: true,
				logging: 'warn',
				caching: true,
				minification: true,
				securityLevel: 'medium',
				analytics: false
			},
			development: {
				debugMode: true,
				logging: 'debug',
				caching: false,
				minification: false,
				securityLevel: 'low',
				analytics: false
			},
			test: {
				debugMode: true,
				logging: 'info',
				caching: false,
				minification: false,
				securityLevel: 'medium',
				analytics: false
			}
		};

		return configs[environmentType] || configs.development;
	}

	/**
	 * Inicializa recursos específicos do ambiente
	 */
	initializeEnvironmentSpecificFeatures() {
		const { type, recommendedConfig } = this.environmentInfo;

		// Configurar logging baseado no ambiente
		this.configureLogging(recommendedConfig.logging);

		// Configurar debug mode
		if (recommendedConfig.debugMode) {
			this.enableDebugMode();
		}

		// Avisos de segurança
		if (type === 'insecure-production') {
			console.error('🚨 AVISO DE SEGURANÇA: Aplicação em produção sem HTTPS!');
		}

		// Log de inicialização
		this.logEnvironmentInfo();
	}

	/**
	 * Configura o sistema de logging
	 * @param {string} level - Nível de logging
	 */
	configureLogging(level) {
		const levels = {
			error: ['error'],
			warn: ['error', 'warn'],
			info: ['error', 'warn', 'info'],
			debug: ['error', 'warn', 'info', 'log', 'debug']
		};

		const allowedMethods = levels[level] || levels.error;

		// Desabilitar métodos de console não permitidos
		['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
			if (!allowedMethods.includes(method)) {
				console[method] = () => {};
			}
		});
	}

	/**
	 * Habilita modo de debug
	 */
	enableDebugMode() {
		// Disponibilizar informações globalmente
		window.environmentInfo = this.environmentInfo;
		window.environmentDetector = this;

		// Comandos úteis para debug
		window.envDebug = {
			info: () => this.getEnvironmentInfo(),
			reload: () => {
				this.environmentInfo = this.detectEnvironment();
				return this.environmentInfo;
			},
			features: () => this.environmentInfo.availableFeatures,
			context: () => this.environmentInfo.executionContext
		};
	}

	/**
	 * Registra informações do ambiente no console
	 */
	logEnvironmentInfo() {
		const { type, isProduction, executionContext } = this.environmentInfo;
		const emoji = this.getEnvironmentEmoji(type);

		console.log(`${emoji} Ambiente detectado: ${type.toUpperCase()}`);
		
		if (!isProduction) {
			console.log('🛠️ Modo de desenvolvimento ativo');
			console.log('💡 Use envDebug.info() para ver detalhes completos');
		}

		if (executionContext.isPWA) {
			console.log('📱 Executando como PWA');
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
	 * Obtém informações completas do ambiente
	 * @returns {Object} Informações do ambiente
	 */
	getEnvironmentInfo() {
		return { ...this.environmentInfo };
	}

	/**
	 * Verifica se está em um ambiente específico
	 * @param {string} environmentType - Tipo do ambiente
	 * @returns {boolean} True se for o ambiente especificado
	 */
	isEnvironment(environmentType) {
		return this.environmentInfo.type === environmentType;
	}

	/**
	 * Verifica se um recurso está disponível
	 * @param {string} featureName - Nome do recurso
	 * @returns {boolean} True se o recurso estiver disponível
	 */
	isFeatureAvailable(featureName) {
		return this.environmentInfo.availableFeatures[featureName] || false;
	}

	/**
	 * Obtém configuração recomendada para uma chave específica
	 * @param {string} configKey - Chave da configuração
	 * @returns {*} Valor da configuração
	 */
	getRecommendedConfigValue(configKey) {
		return this.environmentInfo.recommendedConfig[configKey];
	}
}

// Criar instância global
const environmentDetector = new EnvironmentDetector();

// Exportar para uso em módulos
export { environmentDetector, EnvironmentDetector };
export default environmentDetector;

// Disponibilizar globalmente
window.environmentDetector = environmentDetector;