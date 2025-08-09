// ==============================================
// EXEMPLO DE CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
// ==============================================

/**
 * INSTRUÇÕES PARA PRODUÇÃO:
 *
 * 1. Copie este arquivo para 'env.config.js'
 * 2. Substitua os valores pelos reais do seu projeto Firebase
 * 3. Adicione 'env.config.js' ao .gitignore
 * 4. Configure as variáveis no seu servidor de produção
 */

// ==============================================
// MÉTODO 1: VARIÁVEIS DE AMBIENTE DO SERVIDOR
// ==============================================

/**
 * Configure estas variáveis no seu servidor:
 *
 * FIREBASE_API_KEY=sua_api_key_aqui
 * FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
 * FIREBASE_PROJECT_ID=seu-projeto-id
 * FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
 * FIREBASE_MESSAGING_SENDER_ID=123456789
 * FIREBASE_APP_ID=1:123456789:web:abcdef123456
 */

// ==============================================
// MÉTODO 2: META TAGS NO HTML
// ==============================================

/**
 * Adicione no <head> do seu HTML:
 *
 * <meta name="FIREBASE_API_KEY" content="sua_api_key_aqui">
 * <meta name="FIREBASE_AUTH_DOMAIN" content="seu-projeto.firebaseapp.com">
 * <meta name="FIREBASE_PROJECT_ID" content="seu-projeto-id">
 * <meta name="FIREBASE_STORAGE_BUCKET" content="seu-projeto.appspot.com">
 * <meta name="FIREBASE_MESSAGING_SENDER_ID" content="123456789">
 * <meta name="FIREBASE_APP_ID" content="1:123456789:web:abcdef123456">
 */

// ==============================================
// MÉTODO 3: CONFIGURAÇÃO VIA JAVASCRIPT
// ==============================================

/**
 * Se você precisar configurar via JavaScript (não recomendado para produção):
 */

// APENAS PARA DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO
const developmentConfig = {
	FIREBASE_API_KEY: "sua_api_key_de_desenvolvimento",
	FIREBASE_AUTH_DOMAIN: "seu-projeto-dev.firebaseapp.com",
	FIREBASE_PROJECT_ID: "seu-projeto-dev",
	FIREBASE_STORAGE_BUCKET: "seu-projeto-dev.appspot.com",
	FIREBASE_MESSAGING_SENDER_ID: "123456789",
	FIREBASE_APP_ID: "1:123456789:web:abcdef123456",
};

// Configurar apenas em desenvolvimento
if (
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1"
) {
	Object.keys(developmentConfig).forEach((key) => {
		window[key] = developmentConfig[key];
	});
}

// ==============================================
// MÉTODO 4: PROXY BACKEND (MAIS SEGURO)
// ==============================================

/**
 * Para máxima segurança, crie um endpoint no seu backend:
 *
 * GET /api/firebase-config
 *
 * Que retorne a configuração baseada na autenticação do usuário
 */

const proxyConfig = {
	endpoint: "/api/firebase-config",
	method: "GET",
	headers: {
		Authorization: "Bearer " + localStorage.getItem("auth_token"),
	},
};

// ==============================================
// CONFIGURAÇÃO DE SEGURANÇA ADICIONAL
// ==============================================

/**
 * Regras de Firestore para restringir acesso:
 */

const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regras específicas por coleção
    match /records/{recordId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
    }
  }
}
`;

/**
 * Configuração de domínios autorizados no Firebase Console:
 * - Authentication > Settings > Authorized domains
 * - Adicione apenas os domínios de produção
 * - Remova localhost em produção
 */

console.log("📋 Exemplo de configuração carregado");
console.log("⚠️ Configure as variáveis de ambiente antes de usar em produção!");
