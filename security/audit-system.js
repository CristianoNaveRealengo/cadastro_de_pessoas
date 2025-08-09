/**
 * Sistema Completo de Auditoria de Ações dos Usuários
 * Registra, monitora e analisa todas as ações realizadas no sistema
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

class AuditSystem {
	constructor() {
		this.auditLogs = [];
		this.maxLogsInMemory = 1000; // Máximo de logs em memória
		this.storageKey = "audit_logs";
		this.backupKey = "audit_logs_backup";

		// Configurações de auditoria
		this.config = {
			enabled: true,
			logLevel: "ALL", // ALL, CRITICAL, SECURITY, OPERATIONS
			retentionDays: 90,
			autoBackup: true,
			realTimeMonitoring: true,
			suspiciousActivityDetection: true,
		};

		// Tipos de ações auditáveis
		this.actionTypes = {
			// Autenticação
			LOGIN: "LOGIN",
			LOGOUT: "LOGOUT",
			LOGIN_FAILED: "LOGIN_FAILED",
			SESSION_EXPIRED: "SESSION_EXPIRED",
			SESSION_EXTENDED: "SESSION_EXTENDED",

			// Gestão de Registros
			CREATE_RECORD: "CREATE_RECORD",
			READ_RECORD: "READ_RECORD",
			UPDATE_RECORD: "UPDATE_RECORD",
			DELETE_RECORD: "DELETE_RECORD",
			SEARCH_RECORDS: "SEARCH_RECORDS",

			// Dados e Exportação
			EXPORT_DATA: "EXPORT_DATA",
			IMPORT_DATA: "IMPORT_DATA",
			BACKUP_DATA: "BACKUP_DATA",

			// Segurança
			PERMISSION_DENIED: "PERMISSION_DENIED",
			ENCRYPTION_ERROR: "ENCRYPTION_ERROR",
			DECRYPTION_ERROR: "DECRYPTION_ERROR",
			SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",

			// Sistema
			SYSTEM_ERROR: "SYSTEM_ERROR",
			CONFIG_CHANGE: "CONFIG_CHANGE",
			MAINTENANCE: "MAINTENANCE",
		};

		// Níveis de severidade
		this.severityLevels = {
			LOW: "LOW",
			MEDIUM: "MEDIUM",
			HIGH: "HIGH",
			CRITICAL: "CRITICAL",
		};

		// Contadores para detecção de atividade suspeita
		this.activityCounters = new Map();
		this.suspiciousThresholds = {
			loginFailures: { count: 5, window: 15 * 60 * 1000 }, // 5 falhas em 15 min
			rapidActions: { count: 50, window: 60 * 1000 }, // 50 ações em 1 min
			massExport: { count: 3, window: 60 * 60 * 1000 }, // 3 exports em 1 hora
			offHoursAccess: { startHour: 22, endHour: 6 }, // Acesso entre 22h e 6h
		};

		this.initialize();
		console.log("📋 Sistema de auditoria inicializado");
	}

	/**
	 * Inicializa o sistema de auditoria
	 */
	initialize() {
		this.loadAuditLogs();
		this.startPeriodicCleanup();
		this.setupEventListeners();

		// Log de inicialização
		this.logAction({
			action: "SYSTEM_START",
			severity: this.severityLevels.LOW,
			details: {
				timestamp: new Date().toISOString(),
				userAgent: navigator.userAgent,
				config: this.config,
			},
		});
	}

	/**
	 * Registra uma ação no sistema de auditoria
	 * @param {Object} actionData - Dados da ação
	 */
	logAction(actionData) {
		if (!this.config.enabled) return;

		const auditEntry = {
			id: this.generateAuditId(),
			timestamp: new Date().toISOString(),
			userId: this.getCurrentUserId(),
			userEmail: this.getCurrentUserEmail(),
			userRole: this.getCurrentUserRole(),
			sessionId: this.getSessionId(),
			action: actionData.action,
			severity: actionData.severity || this.severityLevels.LOW,
			resource: actionData.resource || null,
			resourceId: actionData.resourceId || null,
			details: actionData.details || {},
			metadata: {
				ipAddress: this.getClientIP(),
				userAgent: navigator.userAgent,
				url: window.location.href,
				referrer: document.referrer,
				screenResolution: `${screen.width}x${screen.height}`,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				language: navigator.language,
			},
			changes: actionData.changes || null,
			result: actionData.result || "SUCCESS",
			duration: actionData.duration || null,
		};

		// Adicionar à lista de logs
		this.auditLogs.unshift(auditEntry);

		// Manter limite de logs em memória
		if (this.auditLogs.length > this.maxLogsInMemory) {
			this.auditLogs = this.auditLogs.slice(0, this.maxLogsInMemory);
		}

		// Salvar no localStorage
		this.saveAuditLogs();

		// Detectar atividade suspeita
		if (this.config.suspiciousActivityDetection) {
			this.detectSuspiciousActivity(auditEntry);
		}

		// Monitoramento em tempo real
		if (this.config.realTimeMonitoring) {
			this.processRealTimeAlert(auditEntry);
		}

		console.log(`📋 Ação auditada: ${auditEntry.action}`, auditEntry);
	}

	/**
	 * Gera um ID único para o log de auditoria
	 */
	generateAuditId() {
		return (
			"audit_" +
			Date.now() +
			"_" +
			Math.random().toString(36).substr(2, 9)
		);
	}

	/**
	 * Obtém o ID do usuário atual
	 */
	getCurrentUserId() {
		if (window.auth && window.auth.currentUser) {
			return window.auth.currentUser.uid;
		}
		return "anonymous";
	}

	/**
	 * Obtém o email do usuário atual
	 */
	getCurrentUserEmail() {
		if (window.auth && window.auth.currentUser) {
			return window.auth.currentUser.email;
		}
		return "anonymous";
	}

	/**
	 * Obtém a função do usuário atual
	 */
	getCurrentUserRole() {
		if (window.rbacSystem && window.rbacSystem.currentUser) {
			return window.rbacSystem.currentUser.roles.join(", ");
		}
		return "unknown";
	}

	/**
	 * Obtém o ID da sessão atual
	 */
	getSessionId() {
		let sessionId = sessionStorage.getItem("audit_session_id");
		if (!sessionId) {
			sessionId =
				"session_" +
				Date.now() +
				"_" +
				Math.random().toString(36).substr(2, 9);
			sessionStorage.setItem("audit_session_id", sessionId);
		}
		return sessionId;
	}

	/**
	 * Obtém o IP do cliente (simulado - em produção usar backend)
	 */
	getClientIP() {
		// Em produção, isso deveria vir do backend
		return "client_ip_" + Math.random().toString(36).substr(2, 9);
	}

	/**
	 * Carrega logs de auditoria do localStorage
	 */
	loadAuditLogs() {
		try {
			const savedLogs = localStorage.getItem(this.storageKey);
			if (savedLogs) {
				this.auditLogs = JSON.parse(savedLogs);
				console.log(
					`📋 ${this.auditLogs.length} logs de auditoria carregados`
				);
			}
		} catch (error) {
			console.error("❌ Erro ao carregar logs de auditoria:", error);
			this.auditLogs = [];
		}
	}

	/**
	 * Salva logs de auditoria no localStorage
	 */
	saveAuditLogs() {
		try {
			localStorage.setItem(
				this.storageKey,
				JSON.stringify(this.auditLogs)
			);

			// Backup automático
			if (this.config.autoBackup && this.auditLogs.length % 10 === 0) {
				this.createBackup();
			}
		} catch (error) {
			console.error("❌ Erro ao salvar logs de auditoria:", error);
		}
	}

	/**
	 * Cria backup dos logs de auditoria
	 */
	createBackup() {
		try {
			const backupData = {
				timestamp: new Date().toISOString(),
				logs: this.auditLogs.slice(0, 500), // Backup dos últimos 500 logs
				metadata: {
					totalLogs: this.auditLogs.length,
					oldestLog:
						this.auditLogs[this.auditLogs.length - 1]?.timestamp,
					newestLog: this.auditLogs[0]?.timestamp,
				},
			};

			localStorage.setItem(this.backupKey, JSON.stringify(backupData));
			console.log("💾 Backup de auditoria criado");
		} catch (error) {
			console.error("❌ Erro ao criar backup de auditoria:", error);
		}
	}

	/**
	 * Detecta atividade suspeita
	 */
	detectSuspiciousActivity(auditEntry) {
		const userId = auditEntry.userId;
		const now = Date.now();

		// Inicializar contador do usuário se não existir
		if (!this.activityCounters.has(userId)) {
			this.activityCounters.set(userId, {
				loginFailures: [],
				actions: [],
				exports: [],
			});
		}

		const userCounters = this.activityCounters.get(userId);

		// Detectar falhas de login excessivas
		if (auditEntry.action === this.actionTypes.LOGIN_FAILED) {
			userCounters.loginFailures.push(now);
			userCounters.loginFailures = userCounters.loginFailures.filter(
				(time) =>
					now - time < this.suspiciousThresholds.loginFailures.window
			);

			if (
				userCounters.loginFailures.length >=
				this.suspiciousThresholds.loginFailures.count
			) {
				this.logSuspiciousActivity(
					"EXCESSIVE_LOGIN_FAILURES",
					auditEntry,
					{
						failureCount: userCounters.loginFailures.length,
						timeWindow:
							this.suspiciousThresholds.loginFailures.window /
								1000 /
								60 +
							" minutos",
					}
				);
			}
		}

		// Detectar ações muito rápidas
		userCounters.actions.push(now);
		userCounters.actions = userCounters.actions.filter(
			(time) => now - time < this.suspiciousThresholds.rapidActions.window
		);

		if (
			userCounters.actions.length >=
			this.suspiciousThresholds.rapidActions.count
		) {
			this.logSuspiciousActivity("RAPID_ACTIONS", auditEntry, {
				actionCount: userCounters.actions.length,
				timeWindow:
					this.suspiciousThresholds.rapidActions.window / 1000 +
					" segundos",
			});
		}

		// Detectar exportações em massa
		if (auditEntry.action === this.actionTypes.EXPORT_DATA) {
			userCounters.exports.push(now);
			userCounters.exports = userCounters.exports.filter(
				(time) =>
					now - time < this.suspiciousThresholds.massExport.window
			);

			if (
				userCounters.exports.length >=
				this.suspiciousThresholds.massExport.count
			) {
				this.logSuspiciousActivity("MASS_DATA_EXPORT", auditEntry, {
					exportCount: userCounters.exports.length,
					timeWindow:
						this.suspiciousThresholds.massExport.window /
							1000 /
							60 +
						" minutos",
				});
			}
		}

		// Detectar acesso fora do horário
		const currentHour = new Date().getHours();
		const { startHour, endHour } = this.suspiciousThresholds.offHoursAccess;

		if (currentHour >= startHour || currentHour <= endHour) {
			if (auditEntry.action === this.actionTypes.LOGIN) {
				this.logSuspiciousActivity("OFF_HOURS_ACCESS", auditEntry, {
					accessTime: currentHour + ":00",
					allowedHours: `${endHour + 1}:00 - ${startHour - 1}:00`,
				});
			}
		}
	}

	/**
	 * Registra atividade suspeita
	 */
	logSuspiciousActivity(type, originalEntry, details) {
		this.logAction({
			action: this.actionTypes.SUSPICIOUS_ACTIVITY,
			severity: this.severityLevels.HIGH,
			details: {
				suspiciousType: type,
				originalAction: originalEntry.action,
				...details,
			},
			result: "SUSPICIOUS_DETECTED",
		});

		console.warn("🚨 Atividade suspeita detectada:", type, details);
	}

	/**
	 * Processa alertas em tempo real
	 */
	processRealTimeAlert(auditEntry) {
		// Alertas críticos
		if (auditEntry.severity === this.severityLevels.CRITICAL) {
			this.showCriticalAlert(auditEntry);
		}

		// Alertas de segurança
		if (auditEntry.action === this.actionTypes.SUSPICIOUS_ACTIVITY) {
			this.showSecurityAlert(auditEntry);
		}
	}

	/**
	 * Mostra alerta crítico
	 */
	showCriticalAlert(auditEntry) {
		// Implementar notificação visual para administradores
		console.error("🚨 ALERTA CRÍTICO:", auditEntry);
	}

	/**
	 * Mostra alerta de segurança
	 */
	showSecurityAlert(auditEntry) {
		// Implementar notificação de segurança
		console.warn("⚠️ ALERTA DE SEGURANÇA:", auditEntry);
	}

	/**
	 * Configura listeners de eventos
	 */
	setupEventListeners() {
		// Interceptar erros JavaScript
		window.addEventListener("error", (event) => {
			this.logAction({
				action: this.actionTypes.SYSTEM_ERROR,
				severity: this.severityLevels.MEDIUM,
				details: {
					message: event.message,
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					stack: event.error?.stack,
				},
				result: "ERROR",
			});
		});

		// Interceptar mudanças de visibilidade da página
		document.addEventListener("visibilitychange", () => {
			this.logAction({
				action: document.hidden ? "PAGE_HIDDEN" : "PAGE_VISIBLE",
				severity: this.severityLevels.LOW,
				details: {
					visibilityState: document.visibilityState,
				},
			});
		});

		// Interceptar beforeunload
		window.addEventListener("beforeunload", () => {
			this.logAction({
				action: "PAGE_UNLOAD",
				severity: this.severityLevels.LOW,
				details: {
					sessionDuration:
						Date.now() -
						parseInt(this.getSessionId().split("_")[1]),
				},
			});
		});
	}

	/**
	 * Inicia limpeza periódica de logs antigos
	 */
	startPeriodicCleanup() {
		setInterval(() => {
			this.cleanupOldLogs();
		}, 60 * 60 * 1000); // A cada hora
	}

	/**
	 * Remove logs antigos baseado na configuração de retenção
	 */
	cleanupOldLogs() {
		const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;
		const cutoffTime = Date.now() - retentionMs;

		const initialCount = this.auditLogs.length;
		this.auditLogs = this.auditLogs.filter((log) => {
			return new Date(log.timestamp).getTime() > cutoffTime;
		});

		const removedCount = initialCount - this.auditLogs.length;
		if (removedCount > 0) {
			console.log(`🧹 ${removedCount} logs antigos removidos`);
			this.saveAuditLogs();
		}
	}

	/**
	 * Busca logs de auditoria com filtros
	 */
	searchLogs(filters = {}) {
		let filteredLogs = [...this.auditLogs];

		// Filtro por usuário
		if (filters.userId) {
			filteredLogs = filteredLogs.filter(
				(log) => log.userId === filters.userId
			);
		}

		// Filtro por ação
		if (filters.action) {
			filteredLogs = filteredLogs.filter(
				(log) => log.action === filters.action
			);
		}

		// Filtro por severidade
		if (filters.severity) {
			filteredLogs = filteredLogs.filter(
				(log) => log.severity === filters.severity
			);
		}

		// Filtro por período
		if (filters.startDate) {
			const startTime = new Date(filters.startDate).getTime();
			filteredLogs = filteredLogs.filter(
				(log) => new Date(log.timestamp).getTime() >= startTime
			);
		}

		if (filters.endDate) {
			const endTime = new Date(filters.endDate).getTime();
			filteredLogs = filteredLogs.filter(
				(log) => new Date(log.timestamp).getTime() <= endTime
			);
		}

		// Filtro por texto
		if (filters.searchText) {
			const searchText = filters.searchText.toLowerCase();
			filteredLogs = filteredLogs.filter((log) =>
				JSON.stringify(log).toLowerCase().includes(searchText)
			);
		}

		return filteredLogs;
	}

	/**
	 * Gera relatório de auditoria
	 */
	generateReport(filters = {}, format = "json") {
		const logs = this.searchLogs(filters);

		const report = {
			metadata: {
				generatedAt: new Date().toISOString(),
				generatedBy: this.getCurrentUserEmail(),
				totalLogs: logs.length,
				filters: filters,
				period: {
					from: logs[logs.length - 1]?.timestamp,
					to: logs[0]?.timestamp,
				},
			},
			statistics: this.generateStatistics(logs),
			logs: logs,
		};

		if (format === "csv") {
			return this.convertToCSV(logs);
		}

		return report;
	}

	/**
	 * Gera estatísticas dos logs
	 */
	generateStatistics(logs) {
		const stats = {
			totalActions: logs.length,
			uniqueUsers: new Set(logs.map((log) => log.userId)).size,
			actionsByType: {},
			actionsBySeverity: {},
			actionsByUser: {},
			timeDistribution: {},
			suspiciousActivities: 0,
		};

		logs.forEach((log) => {
			// Por tipo de ação
			stats.actionsByType[log.action] =
				(stats.actionsByType[log.action] || 0) + 1;

			// Por severidade
			stats.actionsBySeverity[log.severity] =
				(stats.actionsBySeverity[log.severity] || 0) + 1;

			// Por usuário
			stats.actionsByUser[log.userEmail] =
				(stats.actionsByUser[log.userEmail] || 0) + 1;

			// Distribuição temporal (por hora)
			const hour = new Date(log.timestamp).getHours();
			stats.timeDistribution[hour] =
				(stats.timeDistribution[hour] || 0) + 1;

			// Atividades suspeitas
			if (log.action === this.actionTypes.SUSPICIOUS_ACTIVITY) {
				stats.suspiciousActivities++;
			}
		});

		return stats;
	}

	/**
	 * Converte logs para formato CSV
	 */
	convertToCSV(logs) {
		const headers = [
			"Timestamp",
			"User Email",
			"User Role",
			"Action",
			"Severity",
			"Resource",
			"Result",
			"IP Address",
			"User Agent",
			"Details",
		];

		const rows = logs.map((log) => [
			log.timestamp,
			log.userEmail,
			log.userRole,
			log.action,
			log.severity,
			log.resource || "",
			log.result,
			log.metadata.ipAddress,
			log.metadata.userAgent,
			JSON.stringify(log.details),
		]);

		return [headers, ...rows]
			.map((row) => row.map((field) => `"${field}"`).join(","))
			.join("\n");
	}

	/**
	 * Exporta logs de auditoria
	 */
	exportLogs(filters = {}, format = "json") {
		const report = this.generateReport(filters, format);
		const filename = `audit_report_${new Date()
			.toISOString()
			.slice(0, 10)}.${format}`;

		let content, mimeType;

		if (format === "csv") {
			content = report;
			mimeType = "text/csv";
		} else {
			content = JSON.stringify(report, null, 2);
			mimeType = "application/json";
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();

		URL.revokeObjectURL(url);

		// Log da exportação
		this.logAction({
			action: this.actionTypes.EXPORT_DATA,
			severity: this.severityLevels.MEDIUM,
			resource: "audit_logs",
			details: {
				format: format,
				filters: filters,
				recordCount: Array.isArray(report)
					? report.length
					: report.logs.length,
			},
		});

		console.log(`📊 Relatório de auditoria exportado: ${filename}`);
	}

	/**
	 * Obtém estatísticas gerais do sistema
	 */
	getSystemStats() {
		return {
			totalLogs: this.auditLogs.length,
			oldestLog: this.auditLogs[this.auditLogs.length - 1]?.timestamp,
			newestLog: this.auditLogs[0]?.timestamp,
			uniqueUsers: new Set(this.auditLogs.map((log) => log.userId)).size,
			config: this.config,
			memoryUsage: {
				logsInMemory: this.auditLogs.length,
				maxLogsInMemory: this.maxLogsInMemory,
				usagePercentage:
					(
						(this.auditLogs.length / this.maxLogsInMemory) *
						100
					).toFixed(1) + "%",
			},
		};
	}
}

// Instância global do sistema de auditoria
window.auditSystem = new AuditSystem();

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
	module.exports = AuditSystem;
}

console.log("📋 Sistema de auditoria completo carregado");
