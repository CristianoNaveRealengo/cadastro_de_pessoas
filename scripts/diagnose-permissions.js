// ==============================================
// SCRIPT DE DIAGNÓSTICO DE PERMISSÕES
// ==============================================

/**
 * Script para diagnosticar problemas de permissões do Firestore
 * Execute no console do navegador para identificar problemas
 */

// Importações necessárias do Firestore
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	query,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class PermissionDiagnostic {
	constructor() {
		this.firebaseService = window.firebaseService;
	}

	// Executar diagnóstico completo
	async runFullDiagnostic() {
		console.log("🔍 Iniciando diagnóstico de permissões...\n");

		await this.checkAuthentication();
		await this.checkUserInfo();
		await this.checkFirestoreConnection();
		await this.testBasicOperations();

		console.log("\n✅ Diagnóstico concluído!");
	}

	// Verificar autenticação
	async checkAuthentication() {
		console.log("1️⃣ Verificando autenticação...");

		if (!this.firebaseService) {
			console.error("❌ FirebaseService não encontrado");
			return;
		}

		if (!this.firebaseService.currentUser) {
			console.error("❌ Usuário não autenticado");
			console.log("💡 Aguarde a autenticação ou recarregue a página");
			return;
		}

		console.log("✅ Usuário autenticado");
		console.log(`   UID: ${this.firebaseService.currentUser.uid}`);
		console.log(
			`   Anônimo: ${this.firebaseService.currentUser.isAnonymous}`
		);
		console.log(
			`   Email: ${this.firebaseService.currentUser.email || "N/A"}`
		);
	}

	// Verificar informações do usuário
	async checkUserInfo() {
		console.log("\n2️⃣ Verificando informações do usuário...");

		if (!this.firebaseService.currentUser) {
			console.log("⏭️ Pulando - usuário não autenticado");
			return;
		}

		const user = this.firebaseService.currentUser;
		console.log("📋 Informações do usuário:");
		console.log(`   UID: ${user.uid}`);
		console.log(
			`   Provider: ${user.providerData[0]?.providerId || "anonymous"}`
		);
		console.log(`   Criado em: ${user.metadata.creationTime}`);
		console.log(`   Último login: ${user.metadata.lastSignInTime}`);
	}

	// Verificar conexão com Firestore
	async checkFirestoreConnection() {
		console.log("\n3️⃣ Verificando conexão com Firestore...");

		if (!this.firebaseService.currentUser) {
			console.log("⏭️ Pulando - usuário não autenticado");
			return;
		}

		console.log(`   Online: ${this.firebaseService.isOnline}`);
		console.log(`   Conectado: ${this.firebaseService.isConnected}`);

		// Testar acesso básico
		try {
			const testQuery = query(
				collection(this.firebaseService.db, "records"),
				limit(1)
			);

			console.log("🔄 Testando consulta básica...");
			const snapshot = await getDocs(testQuery);
			console.log(
				`✅ Consulta bem-sucedida - ${snapshot.size} documento(s) encontrado(s)`
			);
		} catch (error) {
			console.error("❌ Erro na consulta:", error.code);
			console.error("   Mensagem:", error.message);

			if (error.code === "permission-denied") {
				console.log("\n💡 SOLUÇÃO SUGERIDA:");
				console.log(
					"   1. Verifique se as regras do Firestore permitem acesso"
				);
				console.log(
					"   2. Use as regras temporárias do arquivo 'firestore-temp.rules'"
				);
				console.log(
					"   3. Certifique-se de que o UID está na whitelist (se aplicável)"
				);
			}
		}
	}

	// Testar operações básicas
	async testBasicOperations() {
		console.log("\n4️⃣ Testando operações básicas...");

		if (!this.firebaseService.currentUser) {
			console.log("⏭️ Pulando - usuário não autenticado");
			return;
		}

		// Testar criação
		try {
			console.log("🔄 Testando criação de documento...");
			const testDoc = {
				id: `test_${Date.now()}`,
				nome: "Teste de Permissão",
				email: "teste@exemplo.com",
				createdBy: this.firebaseService.currentUser.uid,
				updatedBy: this.firebaseService.currentUser.uid,
			};

			const docRef = await addDoc(
				collection(this.firebaseService.db, "records"),
				testDoc
			);

			console.log("✅ Documento criado com sucesso:", docRef.id);

			// Testar leitura
			console.log("🔄 Testando leitura do documento...");
			const docSnap = await getDoc(
				doc(this.firebaseService.db, "records", docRef.id)
			);

			if (docSnap.exists()) {
				console.log("✅ Documento lido com sucesso");

				// Testar exclusão
				console.log("🔄 Testando exclusão do documento...");
				await deleteDoc(
					doc(this.firebaseService.db, "records", docRef.id)
				);
				console.log("✅ Documento excluído com sucesso");
			} else {
				console.error("❌ Documento não encontrado após criação");
			}
		} catch (error) {
			console.error("❌ Erro nas operações:", error.code);
			console.error("   Mensagem:", error.message);

			this.suggestSolutions(error.code);
		}
	}

	// Sugerir soluções baseadas no erro
	suggestSolutions(errorCode) {
		console.log("\n💡 SOLUÇÕES SUGERIDAS:");

		switch (errorCode) {
			case "permission-denied":
				console.log("   🔐 PROBLEMA DE PERMISSÃO:");
				console.log(
					"   1. Aplique as regras temporárias (firestore-temp.rules)"
				);
				console.log("   2. Verifique se o UID está na whitelist");
				console.log(
					"   3. Confirme se as regras foram publicadas no Console"
				);
				break;

			case "unauthenticated":
				console.log("   🔑 PROBLEMA DE AUTENTICAÇÃO:");
				console.log("   1. Aguarde a autenticação completar");
				console.log("   2. Recarregue a página");
				console.log("   3. Verifique a configuração do Firebase Auth");
				break;

			case "unavailable":
				console.log("   🌐 PROBLEMA DE CONECTIVIDADE:");
				console.log("   1. Verifique sua conexão com a internet");
				console.log("   2. Tente novamente em alguns segundos");
				console.log("   3. Verifique se o Firebase está funcionando");
				break;

			default:
				console.log("   ❓ ERRO DESCONHECIDO:");
				console.log("   1. Verifique a configuração do Firebase");
				console.log("   2. Consulte a documentação do Firebase");
				console.log("   3. Verifique os logs do console");
		}
	}

	// Mostrar regras sugeridas baseadas no UID atual
	showSuggestedRules() {
		if (!this.firebaseService.currentUser) {
			console.log("❌ Usuário não autenticado");
			return;
		}

		const uid = this.firebaseService.currentUser.uid;

		console.log("\n📋 REGRAS SUGERIDAS PARA SEU UID:");
		console.log(
			"Copie e cole no Console do Firebase (Firestore > Rules):\n"
		);

		console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAllowedUser() {
      return request.auth.uid in [
        "${uid}"  // Seu UID atual
      ];
    }
    
    match /records/{document} {
      allow read, write: if isAllowedUser();
    }
  }
}`);
	}
}

// Criar instância global
window.permissionDiagnostic = new PermissionDiagnostic();

// Funções de conveniência
window.diagnose = () => permissionDiagnostic.runFullDiagnostic();
window.showRules = () => permissionDiagnostic.showSuggestedRules();

// Importações necessárias (se não estiverem disponíveis)
if (typeof query === "undefined") {
	console.log("⚠️ Importando funções do Firestore...");
	// As importações já estão no firebase.config.js
}

console.log(`
🔍 Diagnóstico de Permissões carregado!

Comandos disponíveis:
- diagnose()     // Executar diagnóstico completo
- showRules()    // Mostrar regras sugeridas para seu UID

Exemplo de uso:
diagnose();
`);

export default PermissionDiagnostic;
