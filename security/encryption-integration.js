/**
 * Integração do Sistema de Criptografia com o App Principal
 * Modifica as funções existentes para usar criptografia automática
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

// Aguardar que o sistema de criptografia esteja disponível
document.addEventListener("DOMContentLoaded", function () {
	// Aguardar inicialização do Firebase e autenticação
	setTimeout(initializeEncryptionIntegration, 3000);
});

/**
 * Inicializa a integração da criptografia
 */
async function initializeEncryptionIntegration() {
	try {
		console.log("🔐 Inicializando integração de criptografia...");

		// Verificar se o sistema de criptografia está disponível
		if (!window.dataEncryption) {
			console.error("❌ Sistema de criptografia não encontrado");
			return;
		}

		// Aguardar usuário estar logado para inicializar chave
		if (window.auth && window.auth.currentUser) {
			await initializeEncryptionForUser(window.auth.currentUser.email);
		} else {
			// Aguardar login
			if (window.auth) {
				window.auth.onAuthStateChanged(async (user) => {
					if (user) {
						await initializeEncryptionForUser(user.email);
					}
				});
			}
		}

		// Interceptar funções de salvamento
		interceptSaveFunctions();

		// Interceptar funções de carregamento
		interceptLoadFunctions();

		console.log("✅ Integração de criptografia inicializada");
	} catch (error) {
		console.error(
			"❌ Erro ao inicializar integração de criptografia:",
			error
		);
	}
}

/**
 * Inicializa a criptografia para um usuário específico
 */
async function initializeEncryptionForUser(userEmail) {
	try {
		await window.dataEncryption.initializeKey(userEmail);

		// Testar o sistema
		const isWorking = await window.dataEncryption.testEncryption();

		if (isWorking) {
			console.log(
				"🔐 Criptografia inicializada para usuário:",
				userEmail
			);

			// Mostrar indicador visual
			showEncryptionStatus(true);

			// Migrar dados existentes se necessário
			await migrateExistingData();
		} else {
			console.error("❌ Falha no teste de criptografia");
			showEncryptionStatus(false);
		}
	} catch (error) {
		console.error(
			"❌ Erro ao inicializar criptografia para usuário:",
			error
		);
		showEncryptionStatus(false);
	}
}

/**
 * Intercepta as funções de salvamento para adicionar criptografia
 */
function interceptSaveFunctions() {
	// Interceptar saveData (localStorage)
	if (window.saveData) {
		const originalSaveData = window.saveData;
		window.saveData = async function () {
			try {
				console.log("🔒 Criptografando dados antes de salvar...");

				// Criptografar registros antes de salvar
				const encryptedRecords =
					await window.dataEncryption.encryptRecords(appData.records);

				// Salvar dados criptografados temporariamente
				const originalRecords = appData.records;
				appData.records = encryptedRecords;

				// Chamar função original
				originalSaveData.call(this);

				// Restaurar dados descriptografados na memória
				appData.records = originalRecords;

				console.log("✅ Dados salvos com criptografia");
			} catch (error) {
				console.error("❌ Erro ao salvar dados criptografados:", error);
				// Fallback para salvamento sem criptografia
				originalSaveData.call(this);
			}
		};
	}

	// Interceptar saveDataWithSync se existir
	if (window.saveDataWithSync) {
		const originalSaveDataWithSync = window.saveDataWithSync;
		window.saveDataWithSync = async function () {
			try {
				console.log("🔒 Criptografando dados antes de sincronizar...");

				// Criptografar registros antes de sincronizar
				const encryptedRecords =
					await window.dataEncryption.encryptRecords(appData.records);

				// Salvar dados criptografados temporariamente
				const originalRecords = appData.records;
				appData.records = encryptedRecords;

				// Chamar função original
				originalSaveDataWithSync.call(this);

				// Restaurar dados descriptografados na memória
				appData.records = originalRecords;

				console.log("✅ Dados sincronizados com criptografia");
			} catch (error) {
				console.error(
					"❌ Erro ao sincronizar dados criptografados:",
					error
				);
				// Fallback para sincronização sem criptografia
				originalSaveDataWithSync.call(this);
			}
		};
	}
}

/**
 * Intercepta as funções de carregamento para adicionar descriptografia
 */
function interceptLoadFunctions() {
	// Interceptar loadData (localStorage)
	if (window.loadData) {
		const originalLoadData = window.loadData;
		window.loadData = async function () {
			try {
				// Chamar função original primeiro
				originalLoadData.call(this);

				console.log("🔓 Descriptografando dados carregados...");

				// Descriptografar registros carregados
				if (appData.records && appData.records.length > 0) {
					appData.records =
						await window.dataEncryption.decryptRecords(
							appData.records
						);
					console.log("✅ Dados descriptografados do localStorage");
				}
			} catch (error) {
				console.error(
					"❌ Erro ao descriptografar dados do localStorage:",
					error
				);
				// Dados permanecem como estão em caso de erro
			}
		};
	}

	// Interceptar loadDataFromFirebase se existir
	if (window.loadDataFromFirebase) {
		const originalLoadDataFromFirebase = window.loadDataFromFirebase;
		window.loadDataFromFirebase = async function () {
			try {
				// Chamar função original primeiro
				await originalLoadDataFromFirebase.call(this);

				console.log("🔓 Descriptografando dados do Firebase...");

				// Descriptografar registros carregados
				if (appData.records && appData.records.length > 0) {
					appData.records =
						await window.dataEncryption.decryptRecords(
							appData.records
						);
					console.log("✅ Dados descriptografados do Firebase");
				}
			} catch (error) {
				console.error(
					"❌ Erro ao descriptografar dados do Firebase:",
					error
				);
				// Dados permanecem como estão em caso de erro
			}
		};
	}
}

/**
 * Migra dados existentes para o formato criptografado
 */
async function migrateExistingData() {
	try {
		console.log("🔄 Verificando necessidade de migração de dados...");

		// Verificar se existem dados não criptografados
		const hasUnencryptedData = appData.records.some(
			(record) => !record._encrypted
		);

		if (hasUnencryptedData) {
			console.log(
				"📦 Migrando dados existentes para formato criptografado..."
			);

			// Fazer backup dos dados originais
			const backupData = JSON.stringify(appData.records);
			localStorage.setItem(
				"personalRecords_backup_" + Date.now(),
				backupData
			);

			// Criptografar e salvar dados
			await window.saveData();

			console.log("✅ Migração de dados concluída");

			// Mostrar notificação ao usuário
			showMigrationNotification();
		} else {
			console.log("✅ Dados já estão criptografados");
		}
	} catch (error) {
		console.error("❌ Erro na migração de dados:", error);
	}
}

/**
 * Mostra o status da criptografia na interface
 */
function showEncryptionStatus(isActive) {
	// Criar ou atualizar indicador de criptografia
	let indicator = document.getElementById("encryptionIndicator");

	if (!indicator) {
		indicator = document.createElement("div");
		indicator.id = "encryptionIndicator";
		indicator.className =
			"fixed top-4 right-4 px-3 py-2 rounded-lg text-sm font-medium z-50";
		document.body.appendChild(indicator);
	}

	if (isActive) {
		indicator.className =
			"fixed top-4 right-4 px-3 py-2 rounded-lg text-sm font-medium z-50 bg-green-100 text-green-800 border border-green-200";
		indicator.innerHTML =
			'<i class="fas fa-shield-alt mr-2"></i>Dados Protegidos';
	} else {
		indicator.className =
			"fixed top-4 right-4 px-3 py-2 rounded-lg text-sm font-medium z-50 bg-red-100 text-red-800 border border-red-200";
		indicator.innerHTML =
			'<i class="fas fa-exclamation-triangle mr-2"></i>Criptografia Inativa';
	}

	// Auto-ocultar após 5 segundos
	setTimeout(() => {
		if (indicator) {
			indicator.style.opacity = "0";
			indicator.style.transition = "opacity 0.5s";
			setTimeout(() => {
				if (indicator.parentNode) {
					indicator.parentNode.removeChild(indicator);
				}
			}, 500);
		}
	}, 5000);
}

/**
 * Mostra notificação de migração de dados
 */
function showMigrationNotification() {
	const notification = document.createElement("div");
	notification.className =
		"fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-100 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md";
	notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-shield-alt text-blue-600 mr-3 text-xl"></i>
            <div>
                <h3 class="font-semibold mb-1">Dados Protegidos</h3>
                <p class="text-sm">Seus dados foram migrados para o formato criptografado. Um backup foi criado automaticamente.</p>
            </div>
        </div>
        <button onclick="this.parentNode.remove()" class="absolute top-2 right-2 text-blue-600 hover:text-blue-800">
            <i class="fas fa-times"></i>
        </button>
    `;

	document.body.appendChild(notification);

	// Auto-remover após 10 segundos
	setTimeout(() => {
		if (notification.parentNode) {
			notification.remove();
		}
	}, 10000);
}

/**
 * Função para testar a criptografia manualmente (debug)
 */
window.testEncryption = async function () {
	if (!window.dataEncryption) {
		console.error("❌ Sistema de criptografia não disponível");
		return;
	}

	try {
		console.log("🧪 Testando sistema de criptografia...");

		// Dados de teste
		const testRecord = {
			id: "test_" + Date.now(),
			fullName: "João da Silva Santos",
			dob: "1990-05-15",
			observation: "Informações confidenciais do candidato",
			referenceName: "Maria Referência",
			city: "Rio de Janeiro",
			status: "Em Análise",
		};

		console.log("📝 Registro original:", testRecord);

		// Criptografar
		const encrypted = await window.dataEncryption.encryptRecord(testRecord);
		console.log("🔒 Registro criptografado:", encrypted);

		// Descriptografar
		const decrypted = await window.dataEncryption.decryptRecord(encrypted);
		console.log("🔓 Registro descriptografado:", decrypted);

		// Verificar integridade
		const isIntact =
			decrypted.fullName === testRecord.fullName &&
			decrypted.dob === testRecord.dob &&
			decrypted.observation === testRecord.observation &&
			decrypted.referenceName === testRecord.referenceName;

		if (isIntact) {
			console.log("✅ Teste de criptografia bem-sucedido!");
		} else {
			console.error(
				"❌ Teste de criptografia falhou - dados corrompidos"
			);
		}

		return isIntact;
	} catch (error) {
		console.error("❌ Erro no teste de criptografia:", error);
		return false;
	}
};

/**
 * Função para obter estatísticas de criptografia (debug)
 */
window.getEncryptionStats = function () {
	if (!window.dataEncryption) {
		console.error("❌ Sistema de criptografia não disponível");
		return null;
	}

	const stats = window.dataEncryption.getStats();
	console.log("📊 Estatísticas de criptografia:", stats);

	// Adicionar estatísticas dos dados
	const encryptedCount = appData.records.filter((r) => r._encrypted).length;
	const unencryptedCount = appData.records.length - encryptedCount;

	stats.dataStats = {
		totalRecords: appData.records.length,
		encryptedRecords: encryptedCount,
		unencryptedRecords: unencryptedCount,
		encryptionRate:
			appData.records.length > 0
				? ((encryptedCount / appData.records.length) * 100).toFixed(1) +
				  "%"
				: "0%",
	};

	console.log("📈 Estatísticas dos dados:", stats.dataStats);

	return stats;
};

console.log("🔗 Integração de criptografia carregada");
