// ==============================================
// CORREÇÃO PARA ERRO DE LISTENER ASSÍNCRONO
// ==============================================

// Este arquivo corrige o erro:
// "A listener indicated an asynchronous response by returning true,
// but the message channel closed before a response was received"

// ==============================================
// 1. ERROR HANDLERS GLOBAIS
// ==============================================

// Capturar promises rejeitadas não tratadas
window.addEventListener("unhandledrejection", (event) => {
	console.warn("🔶 Promise rejeitada capturada:", event.reason);

	// Verificar se é o erro específico de listener
	if (
		event.reason &&
		event.reason.message &&
		event.reason.message.includes("message channel closed")
	) {
		console.log("📱 Erro de extensão do navegador detectado - ignorando");
		event.preventDefault(); // Prevenir que apareça no console
		return;
	}

	// Log outros erros para debug
	logAsyncError("Unhandled Promise Rejection", event.reason);

	// Prevenir que o erro trave a aplicação
	event.preventDefault();
});

// Capturar erros JavaScript gerais
window.addEventListener("error", (event) => {
	console.warn("🔶 Erro JavaScript capturado:", event.error);

	// Verificar se é erro relacionado a extensões
	if (
		event.error &&
		event.error.message &&
		(event.error.message.includes("Extension context invalidated") ||
			event.error.message.includes("message channel closed"))
	) {
		console.log("📱 Erro de extensão detectado - ignorando");
		return;
	}

	logAsyncError("JavaScript Error", event.error);
});

// ==============================================
// 2. FUNÇÃO DE LOG DE ERROS
// ==============================================

function logAsyncError(type, error) {
	const errorInfo = {
		type: type,
		message: error?.message || error,
		stack: error?.stack,
		timestamp: new Date().toISOString(),
		userAgent: navigator.userAgent,
		url: window.location.href,
		isExtensionError: checkIfExtensionError(error),
	};

	// Salvar no localStorage para debug
	const errorLog = JSON.parse(localStorage.getItem("errorLog") || "[]");
	errorLog.push(errorInfo);

	// Manter apenas os últimos 50 erros
	if (errorLog.length > 50) {
		errorLog.splice(0, errorLog.length - 50);
	}

	localStorage.setItem("errorLog", JSON.stringify(errorLog));

	// Log no console apenas se não for erro de extensão
	if (!errorInfo.isExtensionError) {
		console.error("📋 Erro registrado:", errorInfo);
	}
}

function checkIfExtensionError(error) {
	if (!error) return false;

	const extensionErrorPatterns = [
		"message channel closed",
		"Extension context invalidated",
		"chrome-extension://",
		"moz-extension://",
		"The message port closed before a response was received",
		"A listener indicated an asynchronous response",
	];

	const errorString = error.toString().toLowerCase();
	return extensionErrorPatterns.some((pattern) =>
		errorString.includes(pattern.toLowerCase())
	);
}

// ==============================================
// 3. WRAPPER PARA FUNÇÕES ASSÍNCRONAS
// ==============================================

function safeAsync(asyncFn, context = "Unknown") {
	return async (...args) => {
		try {
			return await asyncFn(...args);
		} catch (error) {
			// Verificar se é erro de extensão
			if (checkIfExtensionError(error)) {
				console.log(`📱 Erro de extensão em ${context} - ignorando`);
				return null; // Retornar valor seguro
			}

			console.error(`❌ Erro em ${context}:`, error);
			logAsyncError(`Async Function Error (${context})`, error);

			// Re-throw apenas se não for erro de extensão
			throw error;
		}
	};
}

// ==============================================
// 4. WRAPPER PARA EVENT LISTENERS
// ==============================================

function safeEventListener(element, event, handler, options = {}) {
	const safeHandler = async (e) => {
		try {
			// Se o handler retorna uma promise, aguardar
			const result = handler(e);
			if (result && typeof result.then === "function") {
				await result;
			}
		} catch (error) {
			if (checkIfExtensionError(error)) {
				console.log(
					`📱 Erro de extensão no evento ${event} - ignorando`
				);
				return;
			}

			console.error(`❌ Erro no evento ${event}:`, error);
			logAsyncError(`Event Listener Error (${event})`, error);
		}
	};

	element.addEventListener(event, safeHandler, options);

	// Retornar função para remover o listener
	return () => element.removeEventListener(event, safeHandler, options);
}

// ==============================================
// 5. CORREÇÕES ESPECÍFICAS PARA O SISTEMA
// ==============================================

// Wrapper para Firebase operations
function safeFirebaseOperation(operation, operationName) {
	return safeAsync(operation, `Firebase ${operationName}`);
}

// Wrapper para localStorage operations
function safeLocalStorage(operation, operationName) {
	try {
		return operation();
	} catch (error) {
		console.error(`❌ Erro no localStorage (${operationName}):`, error);
		logAsyncError(`LocalStorage Error (${operationName})`, error);
		return null;
	}
}

// ==============================================
// 6. UTILITÁRIOS DE DEBUG
// ==============================================

// Função para verificar se há erros de extensão ativos
function checkExtensionErrors() {
	const errorLog = JSON.parse(localStorage.getItem("errorLog") || "[]");
	const recentErrors = errorLog.filter(
		(error) => Date.now() - new Date(error.timestamp).getTime() < 60000 // Últimos 60 segundos
	);

	const extensionErrors = recentErrors.filter(
		(error) => error.isExtensionError
	);

	if (extensionErrors.length > 0) {
		console.log(
			`📱 ${extensionErrors.length} erro(s) de extensão detectado(s) no último minuto`
		);
		return true;
	}

	return false;
}

// Função para limpar logs antigos
function cleanupErrorLogs() {
	const errorLog = JSON.parse(localStorage.getItem("errorLog") || "[]");
	const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

	const recentErrors = errorLog.filter(
		(error) => new Date(error.timestamp).getTime() > oneDayAgo
	);

	localStorage.setItem("errorLog", JSON.stringify(recentErrors));
	console.log(
		`🧹 Logs de erro limpos: ${
			errorLog.length - recentErrors.length
		} removidos`
	);
}

// Função para obter estatísticas de erros
function getErrorStats() {
	const errorLog = JSON.parse(localStorage.getItem("errorLog") || "[]");

	const stats = {
		total: errorLog.length,
		extensionErrors: errorLog.filter((e) => e.isExtensionError).length,
		recentErrors: errorLog.filter(
			(e) => Date.now() - new Date(e.timestamp).getTime() < 3600000 // Última hora
		).length,
		errorTypes: {},
	};

	errorLog.forEach((error) => {
		stats.errorTypes[error.type] = (stats.errorTypes[error.type] || 0) + 1;
	});

	return stats;
}

// ==============================================
// 7. INICIALIZAÇÃO
// ==============================================

// Executar limpeza de logs na inicialização
document.addEventListener("DOMContentLoaded", () => {
	console.log("🔧 Sistema de correção de erros assíncronos carregado");

	// Limpar logs antigos
	cleanupErrorLogs();

	// Verificar erros recentes
	if (checkExtensionErrors()) {
		console.log("💡 Dica: Teste em modo incógnito se os erros persistirem");
	}

	// Mostrar estatísticas se houver erros
	const stats = getErrorStats();
	if (stats.total > 0) {
		console.log("📊 Estatísticas de erros:", stats);
	}
});

// Limpeza periódica (a cada 30 minutos)
setInterval(cleanupErrorLogs, 30 * 60 * 1000);

// ==============================================
// 8. EXPORTAR FUNÇÕES PARA USO GLOBAL
// ==============================================

// Tornar funções disponíveis globalmente
window.safeAsync = safeAsync;
window.safeEventListener = safeEventListener;
window.safeFirebaseOperation = safeFirebaseOperation;
window.safeLocalStorage = safeLocalStorage;
window.checkExtensionErrors = checkExtensionErrors;
window.getErrorStats = getErrorStats;

// Função para aplicar correções ao sistema existente
window.applyAsyncErrorFixes = function () {
	console.log("🔧 Aplicando correções de erro assíncrono ao sistema...");

	// Substituir addEventListener padrão por versão segura
	const originalAddEventListener = EventTarget.prototype.addEventListener;
	EventTarget.prototype.addEventListener = function (
		type,
		listener,
		options
	) {
		if (typeof listener === "function") {
			const safeListener = safeEventListener(
				this,
				type,
				listener,
				options
			);
			return safeListener;
		}
		return originalAddEventListener.call(this, type, listener, options);
	};

	console.log("✅ Correções aplicadas com sucesso");
};

console.log("🛡️ Sistema de proteção contra erros assíncronos carregado");

// ==============================================
// 9. INSTRUÇÕES DE USO
// ==============================================

/*
COMO USAR ESTE ARQUIVO:

1. Incluir no HTML ANTES de outros scripts:
   <script src="fix-async-listener-error.js"></script>

2. Para funções assíncronas existentes:
   // ANTES:
   async function minhaFuncao() { ... }
   
   // DEPOIS:
   const minhaFuncao = safeAsync(async function() { ... }, 'MinhaFuncao');

3. Para event listeners existentes:
   // ANTES:
   element.addEventListener('click', handler);
   
   // DEPOIS:
   safeEventListener(element, 'click', handler);

4. Para operações do Firebase:
   // ANTES:
   await firebaseService.saveRecord(record);
   
   // DEPOIS:
   await safeFirebaseOperation(() => firebaseService.saveRecord(record), 'saveRecord');

5. Para verificar erros:
   console.log(getErrorStats());
   checkExtensionErrors();

6. Para aplicar correções automaticamente:
   applyAsyncErrorFixes();
*/
