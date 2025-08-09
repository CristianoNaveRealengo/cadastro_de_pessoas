/**
 * Integração do Sistema de Rate Limiting com o App Principal
 * Intercepta e controla todas as ações importantes do sistema
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

// Aguardar que o sistema de rate limiting esteja disponível
document.addEventListener("DOMContentLoaded", function () {
	setTimeout(initializeRateLimitingIntegration, 2500);
});

/**
 * Inicializa a integração do rate limiting
 */
function initializeRateLimitingIntegration() {
	try {
		console.log("🚦 Inicializando integração de rate limiting...");

		// Verificar se o sistema de rate limiting está disponível
		if (!window.rateLimitingSystem) {
			console.error("❌ Sistema de rate limiting não encontrado");
			return;
		}

		// Interceptar funções de autenticação
		interceptAuthFunctions();

		// Interceptar funções de dados
		interceptDataFunctions();

		// Interceptar funções de busca
		interceptSearchFunctions();

		// Interceptar funções de exportação/importação
		interceptExportImportFunctions();

		// Interceptar funções de formulário
		interceptFormFunctions();

		// Interceptar funções de sessão
		interceptSessionFunctions();

		// Interceptar interações da interface
		interceptUIInteractions();

		console.log("✅ Integração de rate limiting inicializada");
	} catch (error) {
		console.error(
			"❌ Erro ao inicializar integração de rate limiting:",
			error
		);
	}
}

/**
 * Obtém informações do usuário atual para rate limiting
 */
function getCurrentUserInfo() {
	const userId = window.auth?.currentUser?.uid || null;
	const userEmail = window.auth?.currentUser?.email || null;
	const ipAddress = getClientIP();

	return { userId, userEmail, ipAddress };
}

/**
 * Obtém IP do cliente (simulado - em produção usar backend)
 */
function getClientIP() {
	// Em produção, isso deveria vir do backend
	return "client_ip_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Wrapper para verificar e registrar ações com rate limiting
 */
function executeWithRateLimit(action, originalFunction, context, args) {
	const { userId, userEmail, ipAddress } = getCurrentUserInfo();

	// Verificar se ação é permitida
	const limitCheck = window.rateLimitingSystem.checkLimit(
		action,
		userId,
		ipAddress
	);

	if (!limitCheck.allowed) {
		console.warn(`🚦 Ação bloqueada por rate limiting: ${action}`);

		// Mostrar mensagem específica baseada no motivo
		if (limitCheck.blocked) {
			throw new Error(
				`Usuário temporariamente bloqueado. ${limitCheck.message}`
			);
		} else if (limitCheck.exceeded) {
			throw new Error(limitCheck.message);
		}

		return null;
	}

	// Registrar a ação
	const recorded = window.rateLimitingSystem.recordAction(
		action,
		userId,
		ipAddress
	);

	if (!recorded) {
		console.warn(`🚦 Falha ao registrar ação: ${action}`);
		throw new Error(
			"Limite de ações excedido. Tente novamente mais tarde."
		);
	}

	// Executar função original
	try {
		return originalFunction.apply(context, args);
	} catch (error) {
		// Se a função falhar, não contar como ação válida
		// (isso pode ser ajustado baseado na lógica de negócio)
		console.warn(
			`⚠️ Ação ${action} falhou, mas foi contabilizada no rate limiting`
		);
		throw error;
	}
}

/**
 * Intercepta funções de autenticação
 */
function interceptAuthFunctions() {
	// Interceptar tentativas de login
	if (window.auth && window.auth.signInWithEmailAndPassword) {
		const originalSignIn = window.auth.signInWithEmailAndPassword;
		window.auth.signInWithEmailAndPassword = function (email, password) {
			return executeWithRateLimit("LOGIN_ATTEMPT", originalSignIn, this, [
				email,
				password,
			]);
		};
	}
}

/**
 * Intercepta funções de dados
 */
function interceptDataFunctions() {
	// Interceptar handleFormSubmit (criação de registros)
	if (window.handleFormSubmit) {
		const originalHandleFormSubmit = window.handleFormSubmit;
		window.handleFormSubmit = function (e) {
			return executeWithRateLimit(
				"CREATE_RECORD",
				originalHandleFormSubmit,
				this,
				[e]
			);
		};
	}

	// Interceptar saveData
	if (window.saveData) {
		const originalSaveData = window.saveData;
		window.saveData = function () {
			return executeWithRateLimit(
				"API_CALL",
				originalSaveData,
				this,
				arguments
			);
		};
	}

	// Interceptar updateRecord (se existir)
	if (window.updateRecord) {
		const originalUpdateRecord = window.updateRecord;
		window.updateRecord = function () {
			return executeWithRateLimit(
				"UPDATE_RECORD",
				originalUpdateRecord,
				this,
				arguments
			);
		};
	}

	// Interceptar deleteRecord (se existir)
	if (window.deleteRecord) {
		const originalDeleteRecord = window.deleteRecord;
		window.deleteRecord = function () {
			return executeWithRateLimit(
				"DELETE_RECORD",
				originalDeleteRecord,
				this,
				arguments
			);
		};
	}
}

/**
 * Intercepta funções de busca
 */
function interceptSearchFunctions() {
	// Interceptar applyFilters
	if (window.applyFilters) {
		const originalApplyFilters = window.applyFilters;
		window.applyFilters = function () {
			return executeWithRateLimit(
				"SEARCH_RECORDS",
				originalApplyFilters,
				this,
				arguments
			);
		};
	}

	// Interceptar getFilteredRecords (se existir)
	if (window.getFilteredRecords) {
		const originalGetFilteredRecords = window.getFilteredRecords;
		window.getFilteredRecords = function () {
			return executeWithRateLimit(
				"SEARCH_RECORDS",
				originalGetFilteredRecords,
				this,
				arguments
			);
		};
	}
}

/**
 * Intercepta funções de exportação e importação
 */
function interceptExportImportFunctions() {
	// Interceptar exportData
	if (window.exportData) {
		const originalExportData = window.exportData;
		window.exportData = function () {
			return executeWithRateLimit(
				"EXPORT_DATA",
				originalExportData,
				this,
				arguments
			);
		};
	}

	// Interceptar importData
	if (window.importData) {
		const originalImportData = window.importData;
		window.importData = function (event) {
			return executeWithRateLimit(
				"IMPORT_DATA",
				originalImportData,
				this,
				[event]
			);
		};
	}
}

/**
 * Intercepta funções de formulário
 */
function interceptFormFunctions() {
	// Interceptar clearForm
	if (window.clearForm) {
		const originalClearForm = window.clearForm;
		window.clearForm = function () {
			return executeWithRateLimit(
				"UI_INTERACTION",
				originalClearForm,
				this,
				arguments
			);
		};
	}

	// Interceptar clearSearchFilters
	if (window.clearSearchFilters) {
		const originalClearSearchFilters = window.clearSearchFilters;
		window.clearSearchFilters = function () {
			return executeWithRateLimit(
				"UI_INTERACTION",
				originalClearSearchFilters,
				this,
				arguments
			);
		};
	}
}

/**
 * Intercepta funções de sessão
 */
function interceptSessionFunctions() {
	// Interceptar extensão de sessão
	const extendSessionBtn = document.getElementById("extendSessionBtn");
	if (extendSessionBtn) {
		const originalClick = extendSessionBtn.onclick;
		extendSessionBtn.onclick = function (e) {
			try {
				executeWithRateLimit(
					"SESSION_EXTEND",
					() => {
						if (originalClick) {
							return originalClick.call(this, e);
						}
					},
					this,
					[e]
				);
			} catch (error) {
				alert(error.message);
				e.preventDefault();
				return false;
			}
		};
	}
}

/**
 * Intercepta interações importantes da interface
 */
function interceptUIInteractions() {
	// Lista de botões importantes para monitorar
	const importantButtons = [
		"exportBtn",
		"importInput",
		"searchBtn",
		"clearSearchBtn",
		"menuToggle",
		"accessInfoBtn",
		"logoutBtn",
	];

	importantButtons.forEach((buttonId) => {
		const button = document.getElementById(buttonId);
		if (button) {
			// Adicionar listener que verifica rate limiting
			button.addEventListener(
				"click",
				function (e) {
					try {
						const { userId, userEmail, ipAddress } =
							getCurrentUserInfo();
						const limitCheck = window.rateLimitingSystem.checkLimit(
							"UI_INTERACTION",
							userId,
							ipAddress
						);

						if (!limitCheck.allowed) {
							e.preventDefault();
							alert(limitCheck.message);
							return false;
						}

						// Registrar interação
						window.rateLimitingSystem.recordAction(
							"UI_INTERACTION",
							userId,
							ipAddress
						);

						// Mostrar aviso se próximo do limite
						if (limitCheck.warning) {
							console.warn(
								`⚠️ Próximo do limite de interações: ${limitCheck.remaining} restantes`
							);
						}
					} catch (error) {
						console.error("Erro no rate limiting de UI:", error);
					}
				},
				true
			); // Usar capture para interceptar antes de outros listeners
		}
	});

	// Monitorar mudanças de aba
	const tabButtons = ["searchTabBtn", "statsTabBtn"];
	tabButtons.forEach((tabId) => {
		const tab = document.getElementById(tabId);
		if (tab) {
			tab.addEventListener("click", function (e) {
				try {
					const { userId, userEmail, ipAddress } =
						getCurrentUserInfo();
					window.rateLimitingSystem.recordAction(
						"UI_INTERACTION",
						userId,
						ipAddress
					);
				} catch (error) {
					console.error("Erro no rate limiting de tab:", error);
				}
			});
		}
	});
}

/**
 * Intercepta chamadas de API do Firebase
 */
function interceptFirebaseAPIs() {
	// Se o Firebase Service estiver disponível
	if (window.firebaseService) {
		// Interceptar loadRecords
		if (window.firebaseService.loadRecords) {
			const originalLoadRecords = window.firebaseService.loadRecords;
			window.firebaseService.loadRecords = function () {
				return executeWithRateLimit(
					"API_CALL",
					originalLoadRecords,
					this,
					arguments
				);
			};
		}

		// Interceptar saveRecord
		if (window.firebaseService.saveRecord) {
			const originalSaveRecord = window.firebaseService.saveRecord;
			window.firebaseService.saveRecord = function (record) {
				return executeWithRateLimit(
					"API_CALL",
					originalSaveRecord,
					this,
					[record]
				);
			};
		}
	}
}

/**
 * Adiciona proteção contra spam de formulários
 */
function addFormSpamProtection() {
	const forms = document.querySelectorAll("form");

	forms.forEach((form) => {
		form.addEventListener("submit", function (e) {
			const { userId, userEmail, ipAddress } = getCurrentUserInfo();
			const limitCheck = window.rateLimitingSystem.checkLimit(
				"CREATE_RECORD",
				userId,
				ipAddress
			);

			if (!limitCheck.allowed) {
				e.preventDefault();
				alert(limitCheck.message);
				return false;
			}

			// Desabilitar botão de submit temporariamente para evitar duplo clique
			const submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) {
				submitBtn.disabled = true;
				setTimeout(() => {
					submitBtn.disabled = false;
				}, 2000);
			}
		});
	});
}

/**
 * Monitora atividade suspeita de automação
 */
function monitorAutomationActivity() {
	let rapidClickCount = 0;
	let lastClickTime = 0;

	document.addEventListener("click", function (e) {
		const now = Date.now();

		// Detectar cliques muito rápidos (possível bot)
		if (now - lastClickTime < 100) {
			// Menos de 100ms entre cliques
			rapidClickCount++;

			if (rapidClickCount > 10) {
				// Mais de 10 cliques rápidos
				console.warn("🤖 Atividade suspeita de automação detectada");

				// Notificar sistema de auditoria
				if (window.auditSystem) {
					window.auditSystem.logAction({
						action: "SUSPICIOUS_ACTIVITY",
						severity: "HIGH",
						details: {
							type: "RAPID_CLICKING",
							count: rapidClickCount,
							timeWindow:
								now - (lastClickTime - rapidClickCount * 100),
						},
					});
				}

				// Aplicar rate limiting mais rigoroso temporariamente
				const { userId, userEmail, ipAddress } = getCurrentUserInfo();
				window.rateLimitingSystem.setCustomLimit("UI_INTERACTION", {
					max: 10,
					window: 60 * 1000, // 1 minuto
				});

				rapidClickCount = 0;
			}
		} else {
			rapidClickCount = 0;
		}

		lastClickTime = now;
	});
}

/**
 * Funções de debug para rate limiting (disponíveis no console)
 */
window.rateLimitDebug = {
	// Ver estatísticas
	stats: () => {
		const stats = window.rateLimitingSystem.getStats();
		console.table(stats.actionStats);
		return stats;
	},

	// Ver limites atuais do usuário
	myLimits: () => {
		const { userId, userEmail, ipAddress } = getCurrentUserInfo();
		const identifier = window.rateLimitingSystem.getIdentifier(
			userId,
			ipAddress
		);

		const limits = {};
		for (const action of Object.keys(
			window.rateLimitingSystem.actionLimits
		)) {
			const check = window.rateLimitingSystem.checkLimit(
				action,
				userId,
				ipAddress
			);
			limits[action] = {
				allowed: check.allowed,
				remaining: check.remaining,
				resetTime: check.resetTime
					? new Date(check.resetTime).toLocaleTimeString()
					: null,
			};
		}

		console.table(limits);
		return limits;
	},

	// Testar limite específico
	testLimit: (action) => {
		const { userId, userEmail, ipAddress } = getCurrentUserInfo();
		const check = window.rateLimitingSystem.checkLimit(
			action,
			userId,
			ipAddress
		);
		console.log(`🚦 Teste de limite para ${action}:`, check);
		return check;
	},

	// Redefinir limites do usuário atual
	resetMyLimits: () => {
		const { userId, userEmail, ipAddress } = getCurrentUserInfo();
		const identifier = window.rateLimitingSystem.getIdentifier(
			userId,
			ipAddress
		);
		window.rateLimitingSystem.resetUserLimits(identifier);
		console.log("🔄 Seus limites foram redefinidos");
	},

	// Simular excesso de limite (para testes)
	simulateExcess: (action, count = 100) => {
		const { userId, userEmail, ipAddress } = getCurrentUserInfo();

		for (let i = 0; i < count; i++) {
			window.rateLimitingSystem.recordAction(action, userId, ipAddress);
		}

		console.log(`🧪 Simulado ${count} ações de ${action}`);
	},

	// Ativar/desativar sistema
	toggle: (enabled) => {
		window.rateLimitingSystem.setEnabled(enabled);
		console.log(`🚦 Rate Limiting ${enabled ? "ativado" : "desativado"}`);
	},
};

// Aguardar um pouco mais para interceptar Firebase APIs
setTimeout(() => {
	interceptFirebaseAPIs();
	addFormSpamProtection();
	monitorAutomationActivity();
}, 4000);

console.log("🔗 Integração de rate limiting carregada");
