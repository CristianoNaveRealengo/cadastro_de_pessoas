#!/usr/bin/env node

/**
 * Script para configuração segura de chaves de desenvolvimento
 * 
 * Este script ajuda a configurar chaves de API de forma segura
 * durante o desenvolvimento, sem expô-las no código.
 * 
 * USO:
 * node scripts/setup-dev-keys.js
 * 
 * SEGURANÇA:
 * - Nunca commita chaves reais no repositório
 * - Use apenas para desenvolvimento local
 * - Em produção, use variáveis de ambiente do servidor
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configurações
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const ENV_CONFIG_FILE = path.join(CONFIG_DIR, 'env.config.js');
const GITIGNORE_FILE = path.join(__dirname, '..', '.gitignore');

// Interface para entrada do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Função para fazer perguntas ao usuário
 */
function perguntarUsuario(pergunta) {
    return new Promise((resolve) => {
        rl.question(pergunta, (resposta) => {
            resolve(resposta.trim());
        });
    });
}

/**
 * Função para verificar se o arquivo está no .gitignore
 */
function verificarGitignore() {
    try {
        const gitignoreContent = fs.readFileSync(GITIGNORE_FILE, 'utf8');
        const arquivosProtegidos = [
            'config/env.config.js',
            '.env',
            '.env.local'
        ];
        
        const arquivosNaoProtegidos = arquivosProtegidos.filter(arquivo => 
            !gitignoreContent.includes(arquivo)
        );
        
        if (arquivosNaoProtegidos.length > 0) {
            console.warn('⚠️  AVISO: Os seguintes arquivos não estão no .gitignore:');
            arquivosNaoProtegidos.forEach(arquivo => {
                console.warn(`   - ${arquivo}`);
            });
            console.warn('   Adicione-os ao .gitignore para evitar commit acidental!\n');
        }
    } catch (error) {
        console.warn('⚠️  Não foi possível verificar o .gitignore\n');
    }
}

/**
 * Função para criar o arquivo de configuração
 */
function criarArquivoConfiguracao(config) {
    const conteudo = `// ==============================================
// CONFIGURAÇÃO DE DESENVOLVIMENTO - GERADO AUTOMATICAMENTE
// ==============================================

/**
 * ⚠️  ARQUIVO GERADO AUTOMATICAMENTE
 * 
 * 🔒 SEGURANÇA:
 * - Este arquivo contém chaves sensíveis
 * - NÃO deve ser commitado no repositório
 * - Apenas para desenvolvimento local
 * - Em produção, use variáveis de ambiente
 */

export default {
    apiKey: "${config.apiKey}",
    authDomain: "${config.authDomain}",
    projectId: "${config.projectId}",
    storageBucket: "${config.storageBucket}",
    messagingSenderId: "${config.messagingSenderId}",
    appId: "${config.appId}"
};

/**
 * 📝 INSTRUÇÕES PARA USO:
 * 
 * 1. Este arquivo é carregado automaticamente pelo firebase-secure.config.js
 * 2. Para regenerar, execute: node scripts/setup-dev-keys.js
 * 3. Para remover, delete este arquivo e use meta tags ou variáveis de ambiente
 * 
 * 🚨 LEMBRE-SE:
 * - Nunca commite este arquivo
 * - Use apenas em desenvolvimento
 * - Configure variáveis de ambiente em produção
 */
`;

    // Criar diretório se não existir
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Escrever arquivo
    fs.writeFileSync(ENV_CONFIG_FILE, conteudo, 'utf8');
    
    console.log('✅ Arquivo de configuração criado com sucesso!');
    console.log(`📁 Local: ${ENV_CONFIG_FILE}`);
}

/**
 * Função para configurar localStorage (alternativa)
 */
function configurarLocalStorage(config) {
    const script = `
// Execute este código no console do navegador para configurar o localStorage:

// Configurar chaves Firebase no localStorage (desenvolvimento)
localStorage.setItem('FIREBASE_API_KEY', '${config.apiKey}');
localStorage.setItem('FIREBASE_AUTH_DOMAIN', '${config.authDomain}');
localStorage.setItem('FIREBASE_PROJECT_ID', '${config.projectId}');
localStorage.setItem('FIREBASE_STORAGE_BUCKET', '${config.storageBucket}');
localStorage.setItem('FIREBASE_MESSAGING_SENDER_ID', '${config.messagingSenderId}');
localStorage.setItem('FIREBASE_APP_ID', '${config.appId}');

console.log('✅ Configuração Firebase salva no localStorage');

// Para limpar (quando necessário):
// localStorage.removeItem('FIREBASE_API_KEY');
// localStorage.removeItem('FIREBASE_AUTH_DOMAIN');
// localStorage.removeItem('FIREBASE_PROJECT_ID');
// localStorage.removeItem('FIREBASE_STORAGE_BUCKET');
// localStorage.removeItem('FIREBASE_MESSAGING_SENDER_ID');
// localStorage.removeItem('FIREBASE_APP_ID');
`;

    const scriptFile = path.join(__dirname, 'setup-localStorage.js');
    fs.writeFileSync(scriptFile, script, 'utf8');
    
    console.log('\n📋 Script para localStorage criado:');
    console.log(`📁 Local: ${scriptFile}`);
    console.log('\n💡 Para usar, copie o conteúdo e execute no console do navegador.');
}

/**
 * Função principal
 */
async function main() {
    console.log('🔧 CONFIGURAÇÃO SEGURA DE CHAVES DE DESENVOLVIMENTO\n');
    console.log('Este script ajuda a configurar chaves Firebase de forma segura.\n');
    
    // Verificar .gitignore
    verificarGitignore();
    
    // Verificar se já existe configuração
    if (fs.existsSync(ENV_CONFIG_FILE)) {
        const sobrescrever = await perguntarUsuario(
            '⚠️  Arquivo de configuração já existe. Sobrescrever? (s/N): '
        );
        
        if (sobrescrever.toLowerCase() !== 's' && sobrescrever.toLowerCase() !== 'sim') {
            console.log('❌ Operação cancelada.');
            rl.close();
            return;
        }
    }
    
    console.log('\n📝 Digite as configurações do Firebase:');
    console.log('(Você pode encontrar essas informações no Console do Firebase)\n');
    
    // Coletar configurações
    const config = {
        apiKey: await perguntarUsuario('🔑 API Key: '),
        authDomain: await perguntarUsuario('🌐 Auth Domain: '),
        projectId: await perguntarUsuario('📁 Project ID: '),
        storageBucket: await perguntarUsuario('🗄️  Storage Bucket: '),
        messagingSenderId: await perguntarUsuario('📨 Messaging Sender ID: '),
        appId: await perguntarUsuario('🆔 App ID: ')
    };
    
    // Validar configurações
    const camposVazios = Object.entries(config)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);
    
    if (camposVazios.length > 0) {
        console.log('\n❌ Erro: Os seguintes campos são obrigatórios:');
        camposVazios.forEach(campo => console.log(`   - ${campo}`));
        rl.close();
        return;
    }
    
    // Escolher método de configuração
    console.log('\n🔧 Escolha o método de configuração:');
    console.log('1. Arquivo local (env.config.js) - Recomendado');
    console.log('2. localStorage (navegador) - Alternativo');
    console.log('3. Ambos');
    
    const metodo = await perguntarUsuario('\nEscolha (1-3): ');
    
    switch (metodo) {
        case '1':
            criarArquivoConfiguracao(config);
            break;
        case '2':
            configurarLocalStorage(config);
            break;
        case '3':
            criarArquivoConfiguracao(config);
            configurarLocalStorage(config);
            break;
        default:
            console.log('❌ Opção inválida.');
            rl.close();
            return;
    }
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Verifique se env.config.js está no .gitignore');
    console.log('2. ✅ Teste a aplicação localmente');
    console.log('3. ✅ Configure variáveis de ambiente em produção');
    console.log('4. ❌ NUNCA commite chaves reais no repositório\n');
    
    rl.close();
}

// Executar script
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Erro:', error.message);
        rl.close();
        process.exit(1);
    });
}

module.exports = { main };