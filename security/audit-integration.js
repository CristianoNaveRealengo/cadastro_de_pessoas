/**
 * Integração do Sistema de Auditoria com o App Principal
 * Intercepta e audita todas as ações importantes do sistema
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

// Aguardar que o sistema de auditoria esteja disponível
document.addEventListener("DOMContentLoaded", function () {
	setTimeout(initializeAuditIntegration, 2000);
});

/**
 * Inicializa a integração da auditoria
 */
function initializeAuditIntegration() {
	try {
		console.log("📋 Inicializando integração de auditoria...");

		// Verificar se o sistema de auditoria está disponível
		if (!window.auditSystem) {
			console.error("❌ Sistema de auditoria não encontrado");
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

		// Interceptar erros de permissão do RBAC
		interceptRBACFunctions();

		console.log("✅ Integração de auditoria inicializada");
	} catch (error) {
		console.error("❌ Erro ao inicializar integração de auditoria:", error);
	}
}

/**
 * Intercepta funções de autenticação
 */
function interceptAuthFunctions() {
	// Interceptar login
	if (window.auth) {
		const originalOnAuthStateChanged = window.auth.onAuthStateChanged;
		if (originalOnAuthStateChanged) {
			window.auth.onAuthStateChanged = function (callback) {
				return originalOnAuthStateChanged.call(this, function (user) {
					if (user) {
						window.auditSystem.logAction({
							action: window.auditSystem.actionTypes.LOGIN,
							severity: window.auditSystem.severityLevels.MEDIUM,
							details: {
								userEmail: user.email,
								userId: user.uid,
								loginMethod: "email_password",
								lastSignIn: user.metadata.lastSignInTime,
							},
						});
					} else {
						window.auditSystem.logAction({
							action: window.auditSystem.actionTypes.LOGOUT,
							severity: window.auditSystem.severityLevels.LOW,
							details: {
								logoutType: "user_initiated",
							},
						});
					}

					return callback(user);
				});
			};
		}
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
			const startTime = Date.now();

			try {
				const result = originalHandleFormSubmit.call(this, e);

				// Capturar dados do formulário
				const formData = new FormData(e.target);
				const recordData = Object.fromEntries(formData.entries());

				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.CREATE_RECORD,
					severity: window.auditSystem.severityLevels.MEDIUM,
					resource: "personal_record",
					details: {
						recordFields: Object.keys(recordData),
						hasObservation: !!recordData.observation,
						origin: recordData.origin,
						city: recordData.city,
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.CREATE_RECORD,
					severity: window.auditSystem.severityLevels.HIGH,
					resource: "personal_record",
					details: {
						error: error.message,
						stack: error.stack,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
		};
	}

	// Interceptar saveData
	if (window.saveData) {
		const originalSaveData = window.saveData;
		window.saveData = function () {
			const startTime = Date.now();

			try {
				const result = originalSaveData.call(this);

				window.auditSystem.logAction({
					action: "SAVE_DATA",
					severity: window.auditSystem.severityLevels.LOW,
					resource: "local_storage",
					details: {
						recordCount: appData?.records?.length || 0,
						storageType: "localStorage",
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: "SAVE_DATA",
					severity: window.auditSystem.severityLevels.HIGH,
					resource: "local_storage",
					details: {
						error: error.message,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
		};
	}

	// Interceptar loadData
	if (window.loadData) {
		const originalLoadData = window.loadData;
		window.loadData = function () {
			const startTime = Date.now();

			try {
				const result = originalLoadData.call(this);

				window.auditSystem.logAction({
					action: "LOAD_DATA",
					severity: window.auditSystem.severityLevels.LOW,
					resource: "local_storage",
					details: {
						recordCount: appData?.records?.length || 0,
						storageType: "localStorage",
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: "LOAD_DATA",
					severity: window.auditSystem.severityLevels.MEDIUM,
					resource: "local_storage",
					details: {
						error: error.message,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
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
			const startTime = Date.now();

			try {
				const result = originalApplyFilters.call(this);

				// Capturar filtros aplicados
				const filters = {
					name: document.getElementById("searchName")?.value || "",
					city: document.getElementById("searchCity")?.value || "",
					origin:
						document.getElementById("searchOrigin")?.value || "",
					status:
						document.getElementById("searchStatus")?.value || "",
				};

				const activeFilters = Object.entries(filters)
					.filter(([key, value]) => value)
					.map(([key, value]) => `${key}:${value}`);

				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.SEARCH_RECORDS,
					severity: window.auditSystem.severityLevels.LOW,
					resource: "personal_records",
					details: {
						activeFilters: activeFilters,
						filterCount: activeFilters.length,
						totalRecords: appData?.records?.length || 0,
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.SEARCH_RECORDS,
					severity: window.auditSystem.severityLevels.MEDIUM,
					resource: "personal_records",
					details: {
						error: error.message,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
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
			const startTime = Date.now();

			try {
				const result = originalExportData.call(this);

				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.EXPORT_DATA,
					severity: window.auditSystem.severityLevels.MEDIUM,
					resource: "personal_records",
					details: {
						recordCount: appData?.records?.length || 0,
						format: "json",
						exportType: "full_database",
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.EXPORT_DATA,
					severity: window.auditSystem.severityLevels.HIGH,
					resource: "personal_records",
					details: {
						error: error.message,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
		};
	}

	// Interceptar importData
	if (window.importData) {
		const originalImportData = window.importData;
		window.importData = function (event) {
			const startTime = Date.now();
			const file = event.target.files?.[0];

			try {
				const result = originalImportData.call(this, event);

				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.IMPORT_DATA,
					severity: window.auditSystem.severityLevels.HIGH,
					resource: "personal_records",
					details: {
						fileName: file?.name || "unknown",
						fileSize: file?.size || 0,
						fileType: file?.type || "unknown",
						recordCountBefore: appData?.records?.length || 0,
					},
					duration: Date.now() - startTime,
				});

				return result;
			} catch (error) {
				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.IMPORT_DATA,
					severity: window.auditSystem.severityLevels.HIGH,
					resource: "personal_records",
					details: {
						fileName: file?.name || "unknown",
						error: error.message,
					},
					result: "ERROR",
					duration: Date.now() - startTime,
				});
				throw error;
			}
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
			const result = originalClearForm.call(this);

			window.auditSystem.logAction({
				action: "CLEAR_FORM",
				severity: window.auditSystem.severityLevels.LOW,
				resource: "registration_form",
				details: {
					formType: "registration",
				},
			});

			return result;
		};
	}

	// Interceptar clearSearchFilters
	if (window.clearSearchFilters) {
		const originalClearSearchFilters = window.clearSearchFilters;
		window.clearSearchFilters = function () {
			const result = originalClearSearchFilters.call(this);

			window.auditSystem.logAction({
				action: "CLEAR_SEARCH_FILTERS",
				severity: window.auditSystem.severityLevels.LOW,
				resource: "search_form",
				details: {
					formType: "search",
				},
			});

			return result;
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
		extendSessionBtn.addEventListener("click", function () {
			window.auditSystem.logAction({
				action: window.auditSystem.actionTypes.SESSION_EXTENDED,
				severity: window.auditSystem.severityLevels.LOW,
				details: {
					extensionMethod: "manual_button",
					remainingTime:
						document.getElementById("sessionTime")?.textContent ||
						"unknown",
				},
			});
		});
	}

	// Interceptar logout manual
	const logoutBtn = document.getElementById("logoutBtn");
	if (logoutBtn) {
		logoutBtn.addEventListener("click", function () {
			window.auditSystem.logAction({
				action: "LOGOUT_INITIATED",
				severity: window.auditSystem.severityLevels.LOW,
				details: {
					logoutMethod: "manual_button",
				},
			});
		});
	}
}

/**
 * Intercepta funções do RBAC para auditar negações de acesso
 */
function interceptRBACFunctions() {
	// Interceptar verificações de permissão
	if (window.rbacSystem && window.rbacSystem.hasPermission) {
		const originalHasPermission = window.rbacSystem.hasPermission;
		window.rbacSystem.hasPermission = function (permission) {
			const result = originalHasPermission.call(this, permission);

			if (!result) {
				window.auditSystem.logAction({
					action: window.auditSystem.actionTypes.PERMISSION_DENIED,
					severity: window.auditSystem.severityLevels.MEDIUM,
					resource: "rbac_system",
					details: {
						deniedPermission: permission,
						userRoles: this.currentUser?.roles || [],
						attemptedAction: "permission_check",
					},
					result: "DENIED",
				});
			}

			return result;
		};
	}
}

/**
 * Intercepta erros de criptografia
 */
function interceptEncryptionErrors() {
	if (window.dataEncryption) {
		// Interceptar erros de criptografia
		const originalEncryptData = window.dataEncryption.encryptData;
		if (originalEncryptData) {
			window.dataEncryption.encryptData = async function (data) {
				try {
					return await originalEncryptData.call(this, data);
				} catch (error) {
					window.auditSystem.logAction({
						action: window.auditSystem.actionTypes.ENCRYPTION_ERROR,
						severity: window.auditSystem.severityLevels.HIGH,
						resource: "encryption_system",
						details: {
							error: error.message,
							dataType: typeof data,
							dataLength: data?.length || 0,
						},
						result: "ERROR",
					});
					throw error;
				}
			};
		}

		// Interceptar erros de descriptografia
		const originalDecryptData = window.dataEncryption.decryptData;
		if (originalDecryptData) {
			window.dataEncryption.decryptData = async function (encryptedData) {
				try {
					return await originalDecryptData.call(this, encryptedData);
				} catch (error) {
					window.auditSystem.logAction({
						action: window.auditSystem.actionTypes.DECRYPTION_ERROR,
						severity: window.auditSystem.severityLevels.HIGH,
						resource: "encryption_system",
						details: {
							error: error.message,
							hasEncryptedData: !!encryptedData?.encrypted,
							hasIV: !!encryptedData?.iv,
						},
						result: "ERROR",
					});
					throw error;
				}
			};
		}
	}
}

/**
 * Adiciona listeners para eventos de interface
 */
function addUIEventListeners() {
	// Monitorar cliques em botões importantes
	const importantButtons = [
		"exportBtn",
		"importInput",
		"clearFormBtn",
		"searchBtn",
		"clearSearchBtn",
		"menuToggle",
		"accessInfoBtn",
	];

	importantButtons.forEach((buttonId) => {
		const button = document.getElementById(buttonId);
		if (button) {
			button.addEventListener("click", function () {
				window.auditSystem.logAction({
					action: "UI_INTERACTION",
					severity: window.auditSystem.severityLevels.LOW,
					resource: "user_interface",
					details: {
						elementId: buttonId,
						elementType: button.tagName.toLowerCase(),
						interactionType: "click",
					},
				});
			});
		}
	});

	// Monitorar mudanças de aba
	const tabButtons = ["searchTabBtn", "statsTabBtn"];
	tabButtons.forEach((tabId) => {
		const tab = document.getElementById(tabId);
		if (tab) {
			tab.addEventListener("click", function () {
				window.auditSystem.logAction({
					action: "TAB_CHANGE",
					severity: window.auditSystem.severityLevels.LOW,
					resource: "user_interface",
					details: {
						tabId: tabId,
						tabName: tab.textContent.trim(),
					},
				});
			});
		}
	});
}

/**
 * Funções de debug para auditoria (disponíveis no console)
 */
window.auditDebug = {
	// Ver logs recentes
	recentLogs: (count = 10) => {
		const logs = window.auditSystem.auditLogs.slice(0, count);
		console.table(
			logs.map((log) => ({
				timestamp: log.timestamp,
				user: log.userEmail,
				action: log.action,
				severity: log.severity,
				result: log.result,
			}))
		);
		return logs;
	},

	// Buscar logs por usuário
	userLogs: (userEmail, count = 20) => {
		const logs = window.auditSystem
			.searchLogs({ userId: userEmail })
			.slice(0, count);
		console.table(logs);
		return logs;
	},

	// Buscar logs por ação
	actionLogs: (action, count = 20) => {
		const logs = window.auditSystem
			.searchLogs({ action: action })
			.slice(0, count);
		console.table(logs);
		return logs;
	},

	// Ver estatísticas
	stats: () => {
		const stats = window.auditSystem.getSystemStats();
		console.log("📊 Estatísticas de Auditoria:", stats);
		return stats;
	},

	// Gerar relatório
	report: (filters = {}) => {
		const report = window.auditSystem.generateReport(filters);
		console.log("📋 Relatório de Auditoria:", report);
		return report;
	},

	// Exportar logs
	export: (format = "json") => {
		window.auditSystem.exportLogs({}, format);
	},

	// Simular atividade suspeita (para testes)
	simulateSuspicious: () => {
		for (let i = 0; i < 10; i++) {
			window.auditSystem.logAction({
				action: window.auditSystem.actionTypes.LOGIN_FAILED,
				severity: window.auditSystem.severityLevels.MEDIUM,
				details: { attempt: i + 1 },
			});
		}
		console.log("🚨 Atividade suspeita simulada");
	},
};

// Aguardar um pouco mais para interceptar erros de criptografia
setTimeout(() => {
	interceptEncryptionErrors();
	addUIEventListeners();
}, 3000);

console.log("🔗 Integração de auditoria carregada");
