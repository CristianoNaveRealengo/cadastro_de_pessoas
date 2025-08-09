// ==============================================
// CONFIGURAÇÃO SEGURA DO FIREBASE
// ==============================================

/**
 * Sistema de configuração seguro para Firebase
 * - Usa variáveis de ambiente quando disponível
 * - Fallback para configuração local em desenvolvimento
 * - Validação de configurações obrigatórias
 */

class FirebaseConfigManager {
	constructor() {
		this.config = null;
		this.isProduction = this.detectEnvironment();
		this.init();
	}

	detectEnvironment() {
		// Detectar se está em produção
		return (
			window.location.protocol === "https:" &&
			!window.location.hostname.includes("localhost") &&
			!window.location.hostname.includes("127.0.0.1") &&
			!window.location.hostname.includes("file://")
		);
	}

	init() {
		if (this.isProduction) {
			this.loadProductionConfig();
		} else {
			this.loadDevelopmentConfig();
		}

		this.validateConfig();
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

	// Obter informações de segurança
	getSecurityInfo() {
		return {
			environment: this.isProduction ? "production" : "development",
			configSource: this.isProduction
				? "environment_variables"
				: "local_development",
			isSecure: this.isProduction,
			protocol: window.location.protocol,
			hostname: window.location.hostname,
		};
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

	// Comandos úteis para desenvolvimento
	window.configDebug = {
		info: () => firebaseConfigManager.getSecurityInfo(),
		setVar: (name, value) =>
			firebaseConfigManager.setConfigVar(name, value),
		clear: () => firebaseConfigManager.clearLocalConfig(),
		reload: () => {
			firebaseConfigManager.init();
			return firebaseConfigManager.getConfig();
		},
	};

	console.log("🛠️ Debug de configuração disponível:");
	console.log("💡 Use configDebug.info() para ver informações");
	console.log(
		'💡 Use configDebug.setVar("FIREBASE_API_KEY", "nova_chave") para testar'
	);
}

export default firebaseConfig;
