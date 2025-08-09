// ==============================================
// EXEMPLO DE CONFIGURAÇÃO DE AMBIENTE - SEGURO
// ==============================================

/**
 * Este arquivo serve como exemplo para configuração de ambiente.
 * 
 * 🔒 INSTRUÇÕES DE SEGURANÇA:
 * 1. Copie este arquivo para 'env.config.js'
 * 2. Substitua os valores pelos dados reais do seu projeto Firebase
 * 3. ❌ NUNCA commite o arquivo 'env.config.js' no repositório
 * 4. ✅ Adicione 'env.config.js' no .gitignore
 * 5. ✅ Use variáveis de ambiente em produção
 * 6. ✅ Use meta tags para configuração no HTML
 * 
 * 🚨 AVISO DE SEGURANÇA:
 * - Chaves API nunca devem estar hardcoded no código
 * - Este arquivo é apenas para desenvolvimento local
 * - Em produção, use sempre variáveis de ambiente
 */

// ❌ NÃO FAÇA ISSO - Exemplo de configuração INSEGURA:
// export default {
//     apiKey: "AIzaSyA9kLichJN3xSUBPUyaVDH_hJUwn2SL4GM", // ❌ NUNCA hardcode chaves!
//     authDomain: "projeto.firebaseapp.com",
//     // ... outras configurações
// };

// ✅ FAÇA ISSO - Configuração SEGURA usando variáveis de ambiente:
export default {
    apiKey: process.env.FIREBASE_API_KEY || "[CONFIGURE_SUA_API_KEY]",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "[CONFIGURE_SEU_AUTH_DOMAIN]",
    projectId: process.env.FIREBASE_PROJECT_ID || "[CONFIGURE_SEU_PROJECT_ID]",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "[CONFIGURE_SEU_STORAGE_BUCKET]",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "[CONFIGURE_SEU_MESSAGING_SENDER_ID]",
    appId: process.env.FIREBASE_APP_ID || "[CONFIGURE_SEU_APP_ID]"
};

/**
 * 🔧 MÉTODOS SEGUROS DE CONFIGURAÇÃO:
 * 
 * 1. VARIÁVEIS DE AMBIENTE (Recomendado para produção):
 *    - Windows: set FIREBASE_API_KEY=sua_chave
 *    - Linux/Mac: export FIREBASE_API_KEY=sua_chave
 *    - .env file: FIREBASE_API_KEY=sua_chave
 * 
 * 2. META TAGS NO HTML (Alternativa para frontend):
 *    <meta name="firebase-api-key" content="sua_chave">
 *    <meta name="firebase-auth-domain" content="projeto.firebaseapp.com">
 *    <meta name="firebase-project-id" content="projeto-id">
 * 
 * 3. CONFIGURAÇÃO DO SERVIDOR (Mais seguro):
 *    - Configurar no servidor web (Apache, Nginx)
 *    - Usar serviços de configuração (AWS Secrets, Azure Key Vault)
 * 
 * 4. ARQUIVO LOCAL (Apenas desenvolvimento):
 *    - Criar env.config.js com valores reais
 *    - Adicionar ao .gitignore
 *    - NUNCA commitar no repositório
 */

/**
 * 📋 CHECKLIST DE SEGURANÇA:
 * 
 * ✅ Arquivo env.config.js está no .gitignore
 * ✅ Não há chaves hardcoded no código
 * ✅ Variáveis de ambiente configuradas em produção
 * ✅ Meta tags configuradas no HTML (se necessário)
 * ✅ Logs de erro não expõem chaves
 * ✅ Configuração validada antes do uso
 * ✅ Fallbacks seguros implementados
 * ✅ Documentação de segurança atualizada
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
