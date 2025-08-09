// ==============================================
// SCRIPT PARA VERIFICAR UID ATUAL
// ==============================================

/**
 * Script para verificar se o UID atual corresponde ao configurado
 * Execute no console do navegador
 */

function checkCurrentUID() {
	console.log("🔍 Verificando UID atual...\n");

	// UID configurado no sistema
	const expectedUID = "wV5SD29tCMRZq8by3Pwe4m75l3w1";

	// Verificar se FirebaseService está disponível
	if (!window.firebaseService) {
		console.error("❌ FirebaseService não encontrado");
		return;
	}

	// Verificar se usuário está logado
	if (!window.firebaseService.currentUser) {
		console.error("❌ Usuário não está logado");
		console.log("💡 Faça login primeiro em components/login.html");
		return;
	}

	const currentUser = window.firebaseService.currentUser;
	const currentUID = currentUser.uid;

	console.log("📋 INFORMAÇÕES DO USUÁRIO ATUAL:");
	console.log(`   Email: ${currentUser.email}`);
	console.log(`   UID: ${currentUID}`);
	console.log(`   Anônimo: ${currentUser.isAnonymous}`);

	console.log("\n📋 UID CONFIGURADO NO SISTEMA:");
	console.log(`   UID Esperado: ${expectedUID}`);

	console.log("\n🔍 COMPARAÇÃO:");
	if (currentUID === expectedUID) {
		console.log("✅ UID CORRETO - Corresponde ao configurado");
		console.log("💡 O problema pode estar nas regras do Firestore");
		console.log(
			"🔧 Aplique as regras do arquivo 'firestore-emergency.rules'"
		);
	} else {
		console.log("❌ UID INCORRETO - Não corresponde ao configurado");
		console.log(`   Atual: ${currentUID}`);
		console.log(`   Esperado: ${expectedUID}`);
		console.log("\n🔧 SOLUÇÕES:");
		console.log("1. Atualize as regras do Firestore com o UID atual");
		console.log("2. Ou faça login com a conta correta");

		// Gerar regras com UID atual
		console.log("\n📝 REGRAS CORRIGIDAS PARA SEU UID:");
		console.log(`
function isAuthorizedUser() {
  return request.auth != null &&
         request.auth.uid == "${currentUID}";
}

match /records/{document} {
  allow read, write: if isAuthorizedUser();
}`);
	}

	return {
		currentUID,
		expectedUID,
		matches: currentUID === expectedUID,
		user: currentUser,
	};
}

// Função para gerar regras com UID atual
function generateRulesForCurrentUser() {
	if (!window.firebaseService?.currentUser) {
		console.error("❌ Usuário não está logado");
		return;
	}

	const uid = window.firebaseService.currentUser.uid;
	const email = window.firebaseService.currentUser.email;

	const rules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para ${email}
    // UID: ${uid}
    function isAuthorizedUser() {
      return request.auth != null &&
             request.auth.uid == "${uid}";
    }
    
    match /records/{document} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /settings/{document} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

	console.log("📝 REGRAS PERSONALIZADAS PARA SEU USUÁRIO:");
	console.log(rules);

	return rules;
}

// Disponibilizar funções globalmente
window.checkUID = checkCurrentUID;
window.generateRules = generateRulesForCurrentUser;

// Executar automaticamente
console.log(`
🔍 Script de Verificação de UID carregado!

Comandos disponíveis:
- checkUID()        // Verificar UID atual
- generateRules()   // Gerar regras para seu usuário

Executando verificação automática...
`);

// Auto-executar se possível
if (typeof window !== "undefined") {
	setTimeout(() => {
		if (window.firebaseService?.currentUser) {
			checkCurrentUID();
		} else {
			console.log("ℹ️ Aguardando login do usuário...");
		}
	}, 1000);
}

export { checkCurrentUID, generateRulesForCurrentUser };
