/**
 * Sistema Completo de Rate Limiting para Prevenção de Abuso
 * Controla e limita ações dos usuários para prevenir ataques e uso excessivo
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

class RateLimitingSystem {
	constructor() {
		this.limits = new Map(); // Armazena limites por usuário/IP
		this.violations = new Map(); // Armazena violações
		this.blockedUsers = new Map(); // Usuários temporariamente bloqueados

		// Configurações de rate limiting
		this.config = {
			enabled: true,
			strictMode: false, // Modo rigoroso para ambientes sensíveis
			cleanupInterval: 5 * 60 * 1000, // Limpeza a cada 5 minutos
			maxViolations: 3, // Máximo de violações antes do bloqueio
			blockDuration: 15 * 60 * 1000, // 15 minutos de bloqueio
			warningThreshold: 0.8, // Avisar quando atingir 80% do limite
		};

		// Definição de limites por ação
		this.actionLimits = {
			// Autenticação
			LOGIN_ATTEMPT: {
				max: 5,
				window: 15 * 60 * 1000, // 15 minutos
				severity: "HIGH",
				blockOnExceed: true,
				message:
					"Muitas tentativas de login. Tente novamente em 15 minutos.",
			},

			// Operações de dados
			CREATE_RECORD: {
				max: 20,
				window: 60 * 60 * 1000, // 1 hora
				severity: "MEDIUM",
				blockOnExceed: false,
				message:
					"Limite de criação de registros excedido. Aguarde 1 hora.",
			},

			UPDATE_RECORD: {
				max: 50,
				window: 60 * 60 * 1000, // 1 hora
				severity: "MEDIUM",
				blockOnExceed: false,
				message: "Limite de atualizações excedido. Aguarde 1 hora.",
			},

			DELETE_RECORD: {
				max: 10,
				window: 60 * 60 * 1000, // 1 hora
				severity: "HIGH",
				blockOnExceed: true,
				message:
					"Limite de exclusões excedido. Operação bloqueada por 15 minutos.",
			},

			// Busca e consultas
			SEARCH_RECORDS: {
				max: 100,
				window: 60 * 60 * 1000, // 1 hora
				severity: "LOW",
				blockOnExceed: false,
				message:
					"Muitas buscas realizadas. Aguarde antes de continuar.",
			},

			// Exportação de dados
			EXPORT_DATA: {
				max: 5,
				window: 24 * 60 * 60 * 1000, // 24 horas
				severity: "HIGH",
				blockOnExceed: true,
				message: "Limite diário de exportações excedido.",
			},

			IMPORT_DATA: {
				max: 3,
				window: 24 * 60 * 60 * 1000, // 24 horas
				severity: "HIGH",
				blockOnExceed: true,
				message: "Limite diário de importações excedido.",
			},

			// Operações de sistema
			SESSION_EXTEND: {
				max: 10,
				window: 60 * 60 * 1000, // 1 hora
				severity: "LOW",
				blockOnExceed: false,
				message:
					"Muitas extensões de sessão. Aguarde antes de tentar novamente.",
			},

			// Ações gerais da interface
			UI_INTERACTION: {
				max: 1000,
				window: 60 * 60 * 1000, // 1 hora
				severity: "LOW",
				blockOnExceed: false,
				message:
					"Atividade muito intensa detectada. Reduza a velocidade.",
			},

			// API calls gerais
			API_CALL: {
				max: 200,
				window: 60 * 60 * 1000, // 1 hora
				severity: "MEDIUM",
				blockOnExceed: false,
				message:
					"Limite de requisições excedido. Aguarde antes de continuar.",
			},
		};

		this.initialize();
		console.log("🚦 Sistema de Rate Limiting inicializado");
	}

	/**
	 * Inicializa o sistema de rate limiting
	 */
	initialize() {
		this.startCleanupTimer();
		this.loadPersistedData();
		this.setupEventListeners();

		// Log de inicialização
		this.logRateLimit({
			action: "SYSTEM_INIT",
			message: "Sistema de Rate Limiting inicializado",
			limits: Object.keys(this.actionLimits).length,
		});
	}

	/**
	 * Verifica se uma ação é permitida
	 * @param {string} action - Tipo de ação
	 * @param {string} userId - ID do usuário (opcional)
	 * @param {string} ipAddress - IP do usuário (opcional)
	 * @returns {Object} Resultado da verificação
	 */
	checkLimit(action, userId = null, ipAddress = null) {
		if (!this.config.enabled) {
			return { allowed: true, remaining: Infinity };
		}

		const identifier = this.getIdentifier(userId, ipAddress);
		const limit = this.actionLimits[action];

		if (!limit) {
			console.warn(`⚠️ Limite não definido para ação: ${action}`);
			return { allowed: true, remaining: Infinity };
		}

		// Verificar se usuário está bloqueado
		if (this.isUserBlocked(identifier)) {
			const blockInfo = this.blockedUsers.get(identifier);
			return {
				allowed: false,
				blocked: true,
				reason: "USER_BLOCKED",
				message: `Usuário bloqueado até ${new Date(
					blockInfo.until
				).toLocaleTimeString()}`,
				retryAfter: blockInfo.until - Date.now(),
			};
		}

		// Obter histórico de ações
		const userLimits = this.limits.get(identifier) || new Map();
		const actionHistory = userLimits.get(action) || [];

		// Limpar ações antigas
		const now = Date.now();
		const validActions = actionHistory.filter(
			(timestamp) => now - timestamp < limit.window
		);

		// Verificar se excedeu o limite
		if (validActions.length >= limit.max) {
			this.handleLimitExceeded(action, identifier, limit);

			return {
				allowed: false,
				exceeded: true,
				reason: "RATE_LIMIT_EXCEEDED",
				message: limit.message,
				current: validActions.length,
				max: limit.max,
				resetTime: Math.min(...validActions) + limit.window,
				retryAfter: Math.min(...validActions) + limit.window - now,
			};
		}

		// Verificar se está próximo do limite (aviso)
		const remaining = limit.max - validActions.length;
		const warningThreshold = Math.floor(
			limit.max * this.config.warningThreshold
		);

		if (validActions.length >= warningThreshold) {
			this.showWarning(action, identifier, remaining, limit);
		}

		return {
			allowed: true,
			remaining: remaining,
			resetTime: now + limit.window,
			warning: validActions.length >= warningThreshold,
		};
	}

	/**
	 * Registra uma ação realizada
	 * @param {string} action - Tipo de ação
	 * @param {string} userId - ID do usuário
	 * @param {string} ipAddress - IP do usuário
	 * @returns {boolean} Se a ação foi registrada com sucesso
	 */
	recordAction(action, userId = null, ipAddress = null) {
		if (!this.config.enabled) {
			return true;
		}

		const identifier = this.getIdentifier(userId, ipAddress);
		const now = Date.now();

		// Verificar limite antes de registrar
		const limitCheck = this.checkLimit(action, userId, ipAddress);
		if (!limitCheck.allowed) {
			return false;
		}

		// Registrar a ação
		if (!this.limits.has(identifier)) {
			this.limits.set(identifier, new Map());
		}

		const userLimits = this.limits.get(identifier);
		if (!userLimits.has(action)) {
			userLimits.set(action, []);
		}

		const actionHistory = userLimits.get(action);
		actionHistory.push(now);

		// Manter apenas ações dentro da janela de tempo
		const limit = this.actionLimits[action];
		if (limit) {
			const validActions = actionHistory.filter(
				(timestamp) => now - timestamp < limit.window
			);
			userLimits.set(action, validActions);
		}

		// Persistir dados
		this.persistData();

		// Log da ação
		this.logRateLimit({
			action: action,
			identifier: identifier,
			count: actionHistory.length,
			remaining: limitCheck.remaining - 1,
		});

		return true;
	}

	/**
	 * Trata quando um limite é excedido
	 */
	handleLimitExceeded(action, identifier, limit) {
		console.warn(`🚦 Rate limit excedido: ${action} para ${identifier}`);

		// Registrar violação
		if (!this.violations.has(identifier)) {
			this.violations.set(identifier, []);
		}

		const userViolations = this.violations.get(identifier);
		userViolations.push({
			action: action,
			timestamp: Date.now(),
			severity: limit.severity,
		});

		// Verificar se deve bloquear usuário
		if (limit.blockOnExceed || this.shouldBlockUser(identifier)) {
			this.blockUser(identifier, action);
		}

		// Notificar sistema de auditoria se disponível
		if (window.auditSystem) {
			window.auditSystem.logAction({
				action: "RATE_LIMIT_EXCEEDED",
				severity: limit.severity,
				details: {
					limitedAction: action,
					identifier: identifier,
					limit: limit.max,
					window: limit.window,
				},
			});
		}

		// Mostrar notificação ao usuário
		this.showLimitExceededNotification(limit.message);
	}

	/**
	 * Verifica se deve bloquear usuário baseado em violações
	 */
	shouldBlockUser(identifier) {
		const userViolations = this.violations.get(identifier) || [];
		const recentViolations = userViolations.filter(
			(v) => Date.now() - v.timestamp < 60 * 60 * 1000 // Última hora
		);

		return recentViolations.length >= this.config.maxViolations;
	}

	/**
	 * Bloqueia um usuário temporariamente
	 */
	blockUser(identifier, reason) {
		const until = Date.now() + this.config.blockDuration;

		this.blockedUsers.set(identifier, {
			reason: reason,
			blockedAt: Date.now(),
			until: until,
		});

		console.warn(
			`🚫 Usuário bloqueado: ${identifier} até ${new Date(
				until
			).toLocaleString()}`
		);

		// Notificar auditoria
		if (window.auditSystem) {
			window.auditSystem.logAction({
				action: "USER_BLOCKED",
				severity: "HIGH",
				details: {
					identifier: identifier,
					reason: reason,
					duration: this.config.blockDuration,
					until: new Date(until).toISOString(),
				},
			});
		}

		// Mostrar notificação
		this.showBlockedNotification(until);
	}

	/**
	 * Verifica se usuário está bloqueado
	 */
	isUserBlocked(identifier) {
		const blockInfo = this.blockedUsers.get(identifier);
		if (!blockInfo) return false;

		if (Date.now() > blockInfo.until) {
			// Bloqueio expirou
			this.blockedUsers.delete(identifier);
			return false;
		}

		return true;
	}

	/**
	 * Gera identificador único para usuário
	 */
	getIdentifier(userId, ipAddress) {
		if (userId) {
			return `user_${userId}`;
		} else if (ipAddress) {
			return `ip_${ipAddress}`;
		} else {
			// Fallback para sessão atual
			let sessionId = sessionStorage.getItem("rate_limit_session");
			if (!sessionId) {
				sessionId =
					"session_" +
					Date.now() +
					"_" +
					Math.random().toString(36).substr(2, 9);
				sessionStorage.setItem("rate_limit_session", sessionId);
			}
			return sessionId;
		}
	}

	/**
	 * Mostra aviso quando próximo do limite
	 */
	showWarning(action, identifier, remaining, limit) {
		const message = `Atenção: Restam ${remaining} ${action
			.toLowerCase()
			.replace("_", " ")} antes do limite.`;

		this.showNotification(message, "warning");

		console.warn(
			`⚠️ Rate limit warning: ${action} - ${remaining} restantes`
		);
	}

	/**
	 * Mostra notificação de limite excedido
	 */
	showLimitExceededNotification(message) {
		this.showNotification(message, "error");
	}

	/**
	 * Mostra notificação de usuário bloqueado
	 */
	showBlockedNotification(until) {
		const message = `Você foi temporariamente bloqueado devido ao uso excessivo. Acesso liberado às ${new Date(
			until
		).toLocaleTimeString()}.`;
		this.showNotification(message, "error", 10000);
	}

	/**
	 * Sistema de notificações
	 */
	showNotification(message, type = "info", duration = 5000) {
		// Remover notificações existentes do mesmo tipo
		const existingNotifications = document.querySelectorAll(
			`.rate-limit-notification.${type}`
		);
		existingNotifications.forEach((notification) => notification.remove());

		const notification = document.createElement("div");
		notification.className = `rate-limit-notification ${type} fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300`;

		const colors = {
			info: "bg-blue-100 border border-blue-200 text-blue-800",
			warning: "bg-yellow-100 border border-yellow-200 text-yellow-800",
			error: "bg-red-100 border border-red-200 text-red-800",
			success: "bg-green-100 border border-green-200 text-green-800",
		};

		const icons = {
			info: "fas fa-info-circle",
			warning: "fas fa-exclamation-triangle",
			error: "fas fa-ban",
			success: "fas fa-check-circle",
		};

		notification.className += ` ${colors[type]}`;

		notification.innerHTML = `
            <div class="flex items-start">
                <i class="${icons[type]} mt-1 mr-3"></i>
                <div class="flex-1">
                    <p class="font-medium">Rate Limiting</p>
                    <p class="text-sm mt-1">${message}</p>
                </div>
                <button onclick="this.parentNode.parentNode.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

		document.body.appendChild(notification);

		// Auto-remover após duração especificada
		setTimeout(() => {
			if (notification.parentNode) {
				notification.style.opacity = "0";
				notification.style.transform = "translateX(100%)";
				setTimeout(() => {
					if (notification.parentNode) {
						notification.remove();
					}
				}, 300);
			}
		}, duration);
	}

	/**
	 * Inicia timer de limpeza automática
	 */
	startCleanupTimer() {
		setInterval(() => {
			this.cleanup();
		}, this.config.cleanupInterval);
	}

	/**
	 * Limpa dados antigos
	 */
	cleanup() {
		const now = Date.now();
		let cleanedActions = 0;
		let cleanedViolations = 0;
		let cleanedBlocks = 0;

		// Limpar ações antigas
		for (const [identifier, userLimits] of this.limits.entries()) {
			for (const [action, actionHistory] of userLimits.entries()) {
				const limit = this.actionLimits[action];
				if (limit) {
					const validActions = actionHistory.filter(
						(timestamp) => now - timestamp < limit.window
					);

					if (validActions.length !== actionHistory.length) {
						userLimits.set(action, validActions);
						cleanedActions +=
							actionHistory.length - validActions.length;
					}

					// Remover ações vazias
					if (validActions.length === 0) {
						userLimits.delete(action);
					}
				}
			}

			// Remover usuários sem ações
			if (userLimits.size === 0) {
				this.limits.delete(identifier);
			}
		}

		// Limpar violações antigas
		for (const [identifier, violations] of this.violations.entries()) {
			const validViolations = violations.filter(
				(v) => now - v.timestamp < 24 * 60 * 60 * 1000 // 24 horas
			);

			if (validViolations.length !== violations.length) {
				this.violations.set(identifier, validViolations);
				cleanedViolations += violations.length - validViolations.length;
			}

			if (validViolations.length === 0) {
				this.violations.delete(identifier);
			}
		}

		// Limpar bloqueios expirados
		for (const [identifier, blockInfo] of this.blockedUsers.entries()) {
			if (now > blockInfo.until) {
				this.blockedUsers.delete(identifier);
				cleanedBlocks++;
			}
		}

		if (cleanedActions > 0 || cleanedViolations > 0 || cleanedBlocks > 0) {
			console.log(
				`🧹 Rate Limiting cleanup: ${cleanedActions} ações, ${cleanedViolations} violações, ${cleanedBlocks} bloqueios removidos`
			);
		}

		// Persistir dados limpos
		this.persistData();
	}

	/**
	 * Persiste dados no localStorage
	 */
	persistData() {
		try {
			const data = {
				limits: Array.from(this.limits.entries()).map(
					([key, value]) => [key, Array.from(value.entries())]
				),
				violations: Array.from(this.violations.entries()),
				blockedUsers: Array.from(this.blockedUsers.entries()),
				timestamp: Date.now(),
			};

			localStorage.setItem("rate_limiting_data", JSON.stringify(data));
		} catch (error) {
			console.error(
				"❌ Erro ao persistir dados de rate limiting:",
				error
			);
		}
	}

	/**
	 * Carrega dados persistidos
	 */
	loadPersistedData() {
		try {
			const savedData = localStorage.getItem("rate_limiting_data");
			if (!savedData) return;

			const data = JSON.parse(savedData);

			// Verificar se dados não são muito antigos (24 horas)
			if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
				localStorage.removeItem("rate_limiting_data");
				return;
			}

			// Restaurar limits
			this.limits = new Map(
				data.limits.map(([key, value]) => [key, new Map(value)])
			);

			// Restaurar violations
			this.violations = new Map(data.violations);

			// Restaurar blocked users
			this.blockedUsers = new Map(data.blockedUsers);

			console.log("📂 Dados de rate limiting carregados do localStorage");
		} catch (error) {
			console.error("❌ Erro ao carregar dados de rate limiting:", error);
			// Limpar dados corrompidos
			localStorage.removeItem("rate_limiting_data");
		}
	}

	/**
	 * Configura listeners de eventos
	 */
	setupEventListeners() {
		// Listener para beforeunload (salvar dados antes de sair)
		window.addEventListener("beforeunload", () => {
			this.persistData();
		});

		// Listener para visibilitychange (pausar/retomar)
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				this.persistData();
			}
		});
	}

	/**
	 * Log de ações de rate limiting
	 */
	logRateLimit(data) {
		const logEntry = {
			timestamp: new Date().toISOString(),
			component: "RateLimiting",
			...data,
		};

		console.log("🚦 Rate Limiting:", logEntry);

		// Integrar com sistema de auditoria se disponível
		if (window.auditSystem && data.action !== "SYSTEM_INIT") {
			window.auditSystem.logAction({
				action: "RATE_LIMIT_CHECK",
				severity: "LOW",
				details: data,
			});
		}
	}

	/**
	 * Obtém estatísticas do sistema
	 */
	getStats() {
		const stats = {
			totalUsers: this.limits.size,
			totalViolations: Array.from(this.violations.values()).reduce(
				(sum, violations) => sum + violations.length,
				0
			),
			blockedUsers: this.blockedUsers.size,
			actionStats: {},
			config: this.config,
		};

		// Estatísticas por ação
		for (const [action, limit] of Object.entries(this.actionLimits)) {
			let totalActions = 0;
			let usersNearLimit = 0;

			for (const [identifier, userLimits] of this.limits.entries()) {
				const actionHistory = userLimits.get(action) || [];
				totalActions += actionHistory.length;

				if (
					actionHistory.length >=
					limit.max * this.config.warningThreshold
				) {
					usersNearLimit++;
				}
			}

			stats.actionStats[action] = {
				totalActions,
				usersNearLimit,
				limit: limit.max,
				window: limit.window,
			};
		}

		return stats;
	}

	/**
	 * Redefine limites para um usuário específico
	 */
	resetUserLimits(identifier) {
		this.limits.delete(identifier);
		this.violations.delete(identifier);
		this.blockedUsers.delete(identifier);

		console.log(`🔄 Limites redefinidos para: ${identifier}`);
		this.persistData();
	}

	/**
	 * Configura limites personalizados
	 */
	setCustomLimit(action, config) {
		this.actionLimits[action] = {
			...this.actionLimits[action],
			...config,
		};

		console.log(`⚙️ Limite personalizado definido para ${action}:`, config);
	}

	/**
	 * Ativa/desativa o sistema
	 */
	setEnabled(enabled) {
		this.config.enabled = enabled;
		console.log(`🚦 Rate Limiting ${enabled ? "ativado" : "desativado"}`);
	}
}

// Instância global do sistema de rate limiting
window.rateLimitingSystem = new RateLimitingSystem();

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
	module.exports = RateLimitingSystem;
}

console.log("🚦 Sistema de Rate Limiting carregado");
