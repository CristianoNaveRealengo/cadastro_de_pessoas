# Configuração para Usuário Único

## 📋 Visão Geral

Este guia explica como configurar o sistema para funcionar com apenas um usuário autorizado (login único).

## 🚀 Configuração Rápida (5 minutos)

### 1. Definir Credenciais
Edite o arquivo `config/user-credentials.js`:

```javascript
export const USER_CONFIG = {
    email: "seu@email.com",        // ALTERE AQUI
    password: "suaSenhaSegura",    // ALTERE AQUI
    displayName: "Seu Nome",
    autoLogin: false,              // true para login automático
};
```

### 2. Criar o Usuário
Abra a página de login (`components/login.html`) e:

**Opção A: Via Interface**
1. Clique em "Criar Nova Conta"
2. Use o email e senha definidos acima
3. Anote o UID que aparece no console

**Opção B: Via Console**
1. Abra o DevTools (F12)
2. Execute: `createInitialUser()`
3. Anote o UID que aparece

### 3. Configurar Regras do Firestore
1. Copie o UID obtido no passo anterior
2. Edite `firestore-single-user.rules`
3. Substitua `"UID_DO_USUARIO_UNICO"` pelo UID real
4. Aplique as regras no Console do Firebase

### 4. Testar
1. Faça logout se estiver logado
2. Tente fazer login com as credenciais
3. Verifique se consegue acessar os dados

## 🔧 Configurações Avançadas

### Auto-Login (Desenvolvimento)
Para login automático durante desenvolvimento:

```javascript
export const USER_CONFIG = {
    // ... outras configurações
    autoLogin: true,  // Login automático
};
```

⚠️ **Atenção**: Desative em produção!

### Senha Forte (Produção)
Para exigir senha forte:

```javascript
export const USER_CONFIG = {
    // ... outras configurações
    requireStrongPassword: true,
    password: "MinhaSenh@Forte123!", // Exemplo de senha forte
};
```

### Timeout de Sessão
Para configurar timeout da sessão:

```javascript
export const USER_CONFIG = {
    // ... outras configurações
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas
};
```

## 🔐 Opções de Segurança

### Opção 1: UID Específico (Mais Segura)
```javascript
// Apenas o usuário com UID específico
function isSingleAuthorizedUser() {
  return request.auth != null &&
         request.auth.uid == "abc123def456ghi789";
}

match /records/{document} {
  allow read, write: if isSingleAuthorizedUser();
}
```

### Opção 2: Qualquer Usuário Autenticado (Menos Segura)
```javascript
// Qualquer usuário que fizer login
function isAnyAuthenticatedUser() {
  return request.auth != null;
}

match /records/{document} {
  allow read, write: if isAnyAuthenticatedUser();
}
```

## 📁 Estrutura de Arquivos

```
projeto/
├── components/
│   ├── login.html          # Interface de login
│   └── login.js           # Lógica de login
├── config/
│   ├── firebase.config.js  # Configuração Firebase
│   └── user-credentials.js # Credenciais do usuário
├── firestore-single-user.rules # Regras para usuário único
└── docs/
    └── SINGLE-USER-SETUP.md # Este guia
```

## 🔄 Fluxo de Autenticação

1. **Usuário acessa o sistema**
2. **Verifica se está logado**
   - Se sim: redireciona para o app
   - Se não: mostra tela de login
3. **Usuário faz login**
4. **Firebase valida credenciais**
5. **Regras do Firestore verificam UID**
6. **Acesso liberado aos dados**

## 🛠️ Comandos Úteis

### No Console do Navegador:
```javascript
// Criar usuário inicial
createInitialUser()

// Verificar usuário atual
console.log(firebaseService.currentUser)

// Obter UID atual
console.log(firebaseService.currentUser.uid)

// Fazer logout
firebaseService.signOutUser()

// Verificar se está logado
console.log(firebaseService.isUserLoggedIn())
```

## ❓ Troubleshooting

### "Usuário não encontrado"
- Verifique se o usuário foi criado corretamente
- Execute `createInitialUser()` novamente

### "Senha incorreta"
- Verifique as credenciais em `user-credentials.js`
- Tente resetar a senha no Console do Firebase

### "Permission denied"
- Verifique se o UID está correto nas regras
- Confirme se as regras foram publicadas
- Use as regras temporárias para testar

### "Auto-login não funciona"
- Verifique se `autoLogin: true` está configurado
- Abra o console para ver erros
- Verifique se as credenciais estão corretas

## 🔒 Boas Práticas de Segurança

1. **Use senhas fortes** (mínimo 12 caracteres)
2. **Desative auto-login em produção**
3. **Use HTTPS sempre**
4. **Configure timeout de sessão**
5. **Monitore logs de acesso**
6. **Faça backup das regras**
7. **Teste as regras regularmente**

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador
2. Execute os comandos de diagnóstico
3. Confirme se todos os arquivos estão configurados
4. Teste com as regras temporárias primeiro