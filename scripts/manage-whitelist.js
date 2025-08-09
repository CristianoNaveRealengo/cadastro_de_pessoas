// ==============================================
// SCRIPT PARA GERENCIAR WHITELIST DE USUÁRIOS
// ==============================================

/**
 * Script utilitário para gerenciar a whitelist de usuários autorizados
 * nas regras de segurança do Firestore
 */

class WhitelistManager {
	constructor() {
		this.authorizedUIDs = [
			// UID do usuário autorizado: Cristiano Nave Realengo
			"wV5SD29tCMRZq8by3Pwe4m75l3w1",
		];
	}

	// Obter UID do usuário atual
	getCurrentUserUID() {
		if (
			typeof firebaseService !== "undefined" &&
			firebaseService.currentUser
		) {
			return firebaseService.currentUser.uid;
		}
		return null;
	}

	// Verificar se um UID está autorizado
	isAuthorized(uid) {
		return this.authorizedUIDs.includes(uid);
	}

	// Verificar se o usuário atual está autorizado
	isCurrentUserAuthorized() {
		const currentUID = this.getCurrentUserUID();
		return currentUID ? this.isAuthorized(currentUID) : false;
	}

	// Adicionar UID à whitelist
	addUID(uid) {
		if (!this.isAuthorized(uid)) {
			this.authorizedUIDs.push(uid);
			console.log(`✅ UID adicionado à whitelist: ${uid}`);
			this.generateRulesCode();
		} else {
			console.log(`⚠️ UID já está na whitelist: ${uid}`);
		}
	}

	// Remover UID da whitelist
	removeUID(uid) {
		const index = this.authorizedUIDs.indexOf(uid);
		if (index > -1) {
			this.authorizedUIDs.splice(index, 1);
			console.log(`❌ UID removido da whitelist: ${uid}`);
			this.generateRulesCode();
		} else {
			console.log(`⚠️ UID não encontrado na whitelist: ${uid}`);
		}
	}

	// Listar todos os UIDs autorizados
	listAuthorizedUIDs() {
		console.log("📋 UIDs Autorizados:");
		this.authorizedUIDs.forEach((uid, index) => {
			console.log(`${index + 1}. ${uid}`);
		});
		return this.authorizedUIDs;
	}

	// Gerar código das regras atualizado
	generateRulesCode() {
		const uidsFormatted = this.authorizedUIDs
			.map((uid) => `               "${uid}"`)
			.join(",\n");

		const rulesCode = `
function isAllowedUser() {
  return request.auth != null &&
         request.auth.uid in [
${uidsFormatted}
         ];
}`;

		console.log("🔧 Código das regras atualizado:");
		console.log(rulesCode);
		return rulesCode;
	}

	// Validar formato do UID
	isValidUID(uid) {
		// UIDs do Firebase geralmente têm 28 caracteres alfanuméricos
		const uidRegex = /^[a-zA-Z0-9]{20,}$/;
		return uidRegex.test(uid);
	}

	// Adicionar UID com validação
	addUIDSafe(uid) {
		if (!this.isValidUID(uid)) {
			console.error(`❌ UID inválido: ${uid}`);
			return false;
		}
		this.addUID(uid);
		return true;
	}

	// Exportar configuração atual
	exportConfig() {
		const config = {
			authorizedUIDs: this.authorizedUIDs,
			totalUsers: this.authorizedUIDs.length,
			lastUpdated: new Date().toISOString(),
		};

		console.log("📤 Configuração exportada:");
		console.log(JSON.stringify(config, null, 2));
		return config;
	}

	// Importar configuração
	importConfig(config) {
		if (config.authorizedUIDs && Array.isArray(config.authorizedUIDs)) {
			this.authorizedUIDs = config.authorizedUIDs;
			console.log(
				`📥 Configuração importada: ${config.authorizedUIDs.length} UIDs`
			);
			this.generateRulesCode();
		} else {
			console.error("❌ Configuração inválida");
		}
	}
}

// Criar instância global
window.whitelistManager = new WhitelistManager();

// ==============================================
// FUNÇÕES DE CONVENIÊNCIA
// ==============================================

// Funções globais para facilitar o uso no console
window.addUser = (uid) => whitelistManager.addUIDSafe(uid);
window.removeUser = (uid) => whitelistManager.removeUID(uid);
window.listUsers = () => whitelistManager.listAuthorizedUIDs();
window.getCurrentUID = () => whitelistManager.getCurrentUserUID();
window.isAuthorized = (uid) =>
	whitelistManager.isAuthorized(uid || whitelistManager.getCurrentUserUID());

// ==============================================
// EXEMPLOS DE USO
// ==============================================

console.log(`
🔐 Whitelist Manager carregado!

Comandos disponíveis no console:
- addUser("UID_DO_USUARIO")     // Adicionar usuário
- removeUser("UID_DO_USUARIO")  // Remover usuário  
- listUsers()                   // Listar usuários autorizados
- getCurrentUID()               // Obter UID atual
- isAuthorized()                // Verificar se usuário atual está autorizado
- isAuthorized("UID")           // Verificar UID específico

Exemplo:
addUser("abc123def456ghi789");
listUsers();
`);

export default WhitelistManager;
