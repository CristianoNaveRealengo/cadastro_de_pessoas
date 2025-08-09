// ==============================================
// CONFIGURAÇÃO DE USUÁRIO ÚNICO
// ==============================================

/**
 * Configuração para sistema com usuário único
 * Defina aqui as credenciais do usuário autorizado
 */

export const USER_CONFIG = {
	// Credenciais do usuário único autorizado
	email: "cristianonaverealengo@gmail.com",
	password: "lukasliam",
	uid: "wV5SD29tCMRZq8by3Pwe4m75l3w1",

	// Configurações adicionais
	displayName: "Cristiano Nave Realengo",
	autoLogin: false, // Se true, faz login automático com as credenciais acima

	// Configurações de segurança
	requireStrongPassword: false, // Se true, exige senha forte
	allowPasswordChange: true, // Se true, permite alterar senha
	sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas em ms
};

/**
 * INSTRUÇÕES DE USO:
 *
 * 1. ALTERE A SENHA PADRÃO acima para algo seguro
 *
 * 2. Para criar o usuário no Firebase:
 *    - Abra o console do navegador
 *    - Execute: createInitialUser()
 *    - Ou use a interface de cadastro com as credenciais acima
 *
 * 3. Para login automático (desenvolvimento):
 *    - Defina autoLogin: true
 *    - O sistema fará login automaticamente
 *
 * 4. Para produção:
 *    - Defina autoLogin: false
 *    - Defina requireStrongPassword: true
 *    - Use uma senha forte
 */

// Função para criar usuário inicial (execute no console)
window.createInitialUser = async function () {
	if (!window.firebaseService) {
		console.error("❌ FirebaseService não encontrado");
		return;
	}

	try {
		console.log("🔄 Criando usuário inicial...");
		const user = await window.firebaseService.signUp(
			USER_CONFIG.email,
			USER_CONFIG.password
		);
		console.log("✅ Usuário inicial criado:", user.email);
		console.log("📋 UID do usuário:", user.uid);
		console.log("💡 Adicione este UID às regras do Firestore");

		return user;
	} catch (error) {
		if (error.code === "auth/email-already-in-use") {
			console.log("ℹ️ Usuário já existe, fazendo login...");
			try {
				const user = await window.firebaseService.signIn(
					USER_CONFIG.email,
					USER_CONFIG.password
				);
				console.log("✅ Login realizado:", user.email);
				console.log("📋 UID do usuário:", user.uid);
				return user;
			} catch (loginError) {
				console.error("❌ Erro no login:", loginError);
			}
		} else {
			console.error("❌ Erro ao criar usuário:", error);
		}
	}
};

// Auto-login se configurado
if (USER_CONFIG.autoLogin && typeof window !== "undefined") {
	window.addEventListener("load", async () => {
		// Aguardar FirebaseService estar disponível
		const waitForService = () => {
			return new Promise((resolve) => {
				const check = () => {
					if (window.firebaseService) {
						resolve();
					} else {
						setTimeout(check, 100);
					}
				};
				check();
			});
		};

		await waitForService();

		// Verificar se já está logado
		if (!window.firebaseService.isUserLoggedIn()) {
			try {
				console.log("🔄 Fazendo auto-login...");
				await window.firebaseService.signIn(
					USER_CONFIG.email,
					USER_CONFIG.password
				);
				console.log("✅ Auto-login realizado com sucesso");
			} catch (error) {
				console.log(
					"ℹ️ Auto-login falhou, usuário precisa fazer login manual"
				);
			}
		}
	});
}

export default USER_CONFIG;
