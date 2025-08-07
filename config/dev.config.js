// ==============================================
// CONFIGURAÇÕES DE DESENVOLVIMENTO
// ==============================================

// Configurações para desenvolvimento local
const DEV_CONFIG = {
	// Modo de desenvolvimento
	isDevelopment: true,

	// Logs detalhados
	enableDebugLogs: true,

	// Dados de teste
	enableTestData: true,

	// Firebase em modo demo
	useFirebaseDemo: false,

	// Configurações de performance
	performance: {
		autoSave: true,
		autoSaveInterval: 5000, // 5 segundos
		maxRecords: 1000,
		enablePagination: true,
	},

	// Configurações de UI
	ui: {
		showDebugInfo: true,
		enableAnimations: true,
		theme: "default", // default, dark, light
	},
};

// Dados de teste para desenvolvimento
const TEST_DATA = [
	{
		id: "test-1",
		fullName: "João Silva Santos",
		origin: "MSE",
		dob: "1990-05-15",
		age: 33,
		city: "Rio de Janeiro",
		neighborhood: "Copacabana",
		education: "Médio Completo",
		status: "Em Análise",
		referenceName: "Maria Santos",
		forwarding: "Recursos Humanos",
		observation: "Candidato com boa experiência",
		createdAt: new Date().toISOString(),
		timestamp: new Date().toISOString(),
	},
	{
		id: "test-2",
		fullName: "Ana Paula Costa",
		origin: "MP",
		dob: "1985-08-22",
		age: 38,
		city: "Niterói",
		neighborhood: "Icaraí",
		education: "Fundamental Completo",
		status: "Contratado",
		referenceName: "Carlos Costa",
		forwarding: "Departamento Pessoal",
		observation: "Contratada para vaga de assistente",
		createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
		timestamp: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: "test-3",
		fullName: "Pedro Oliveira Lima",
		origin: "EP",
		dob: "1995-12-03",
		age: 28,
		city: "Duque de Caxias",
		neighborhood: "Centro",
		education: "3º ano EM",
		status: "Não Contratado",
		referenceName: "José Lima",
		forwarding: "Triagem",
		observation: "Não atendeu aos requisitos mínimos",
		createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
		timestamp: new Date(Date.now() - 172800000).toISOString(),
	},
];

// Função para carregar dados de teste
function loadTestData() {
	if (
		DEV_CONFIG.enableTestData &&
		typeof appData !== "undefined" &&
		appData.records.length === 0
	) {
		console.log("🧪 Carregando dados de teste...");
		appData.records = [...TEST_DATA];
		if (typeof saveDataWithSync === "function") {
			saveDataWithSync();
		}
		if (typeof updateUI === "function") {
			updateUI();
		}
		console.log(`✅ ${TEST_DATA.length} registros de teste carregados`);
	}
}

// Função para limpar dados de teste
function clearTestData() {
	if (typeof appData !== "undefined") {
		appData.records = appData.records.filter(
			(record) => !record.id.startsWith("test-")
		);
		if (typeof saveDataWithSync === "function") {
			saveDataWithSync();
		}
		if (typeof updateUI === "function") {
			updateUI();
		}
		console.log("🧹 Dados de teste removidos");
	}
}

// Função para debug
function debugInfo() {
	if (DEV_CONFIG.enableDebugLogs) {
		console.group("🔍 Debug Info");
		if (typeof appData !== "undefined") {
			console.log("Total de registros:", appData.records.length);
			console.log("Página atual:", appData.currentPage);
			console.log("Conexões P2P:", appData.connections.length);
			console.log("Modo edição:", appData.isEditMode);
			console.log("Registro atual:", appData.currentRecordId);
		}
		console.log(
			"Firebase conectado:",
			typeof firebaseService !== "undefined" && !!firebaseService
		);
		console.groupEnd();
	}
}

// Função para performance
function performanceCheck() {
	const start = performance.now();

	// Simular operação
	if (typeof updateUI === "function") {
		updateUI();
	}

	const end = performance.now();
	const duration = end - start;

	if (DEV_CONFIG.enableDebugLogs) {
		console.log(
			`⚡ Performance: UI atualizada em ${duration.toFixed(2)}ms`
		);

		if (duration > 100) {
			console.warn("⚠️ UI lenta - considere otimização");
		}
	}
}

// Adicionar ao objeto global para acesso no console
if (typeof window !== "undefined") {
	window.DEV_CONFIG = DEV_CONFIG;
	window.loadTestData = loadTestData;
	window.clearTestData = clearTestData;
	window.debugInfo = debugInfo;
	window.performanceCheck = performanceCheck;
}

// Auto-carregar dados de teste se habilitado
if (typeof document !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		// Aguardar mais tempo para garantir que appData esteja disponível
		setTimeout(() => {
			if (DEV_CONFIG.enableTestData && typeof appData !== "undefined") {
				loadTestData();
			}
		}, 5000); // Aumentado para 5 segundos
	});
}

console.log("🛠️ Modo de desenvolvimento ativado");
console.log("💡 Use loadTestData() para carregar dados de teste");
console.log("🔍 Use debugInfo() para informações de debug");
console.log("⚡ Use performanceCheck() para testar performance");
