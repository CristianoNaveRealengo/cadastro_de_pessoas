# Regras de Segurança do Firestore

## Visão Geral

Este documento explica como implementar e gerenciar as regras de segurança do Firestore usando uma whitelist de usuários autorizados.

## Como Obter o UID de um Usuário

### 1. Via Console do Firebase
- Acesse o [Console do Firebase](https://console.firebase.google.com)
- Vá para **Authentication > Users**
- Copie o UID do usuário desejado

### 2. Via Código JavaScript
```javascript
// Obter UID do usuário atual
if (firebaseService.currentUser) {
  console.log("UID do usuário:", firebaseService.currentUser.uid);
}

// Ou via onAuthStateChanged
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("UID:", user.uid);
  }
});
```

### 3. Via Console do Navegador
1. Abra o DevTools (F12)
2. Execute: `console.log(firebaseService.currentUser.uid)`

## Como Aplicar as Regras

### 1. Via Console do Firebase
1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá para **Firestore Database > Rules**
4. Cole o conteúdo do arquivo `firestore.rules`
5. Clique em **Publish**

### 2. Via Firebase CLI
```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto (se não tiver)
firebase init firestore

# Aplicar regras
firebase deploy --only firestore:rules
```

## Estrutura das Regras

### Função `isAllowedUser()`
```javascript
function isAllowedUser() {
  return request.auth != null &&
         request.auth.uid in [
           "UID_REAL_DO_USUARIO_1",
           "UID_REAL_DO_USUARIO_2"
         ];
}
```

### Aplicação nas Coleções
```javascript
match /records/{document} {
  allow read, write: if isAllowedUser();
}
```

## Gerenciamento de Usuários

### Adicionar Novo Usuário
1. Obtenha o UID do novo usuário
2. Adicione o UID na lista da função `isAllowedUser()`
3. Republique as regras

### Remover Usuário
1. Remova o UID da lista na função `isAllowedUser()`
2. Republique as regras

## Opções de Segurança Implementadas

### 1. Whitelist Simples (Mais Restritiva)
```javascript
function isAllowedUser() {
  return request.auth.uid in ["UID1", "UID2"];
}

match /records/{document} {
  allow read, write: if isAllowedUser();
}
```

### 2. Baseada em Propriedade do Documento (Mais Flexível)
```javascript
// Criar: usuário pode criar com seu próprio UID
allow create: if request.auth != null &&
                 request.resource.data.createdBy == request.auth.uid;

// Ler: usuário pode ler o que criou ou atualizou
allow read: if request.auth != null && 
               (resource.data.createdBy == request.auth.uid ||
                resource.data.updatedBy == request.auth.uid);

// Atualizar: criador ou último atualizador pode editar
allow update: if request.auth != null &&
                 request.resource.data.updatedBy == request.auth.uid &&
                 (resource.data.createdBy == request.auth.uid ||
                  resource.data.updatedBy == request.auth.uid);

// Deletar: apenas o criador pode deletar
allow delete: if request.auth != null &&
                 resource.data.createdBy == request.auth.uid;
```

### 3. Híbrida - Whitelist + Propriedade (Recomendada)
```javascript
// Combina whitelist com verificação de propriedade
allow create: if isAllowedUser() &&
                 request.resource.data.createdBy == request.auth.uid;

allow read: if isAllowedUser() && 
               (resource.data.createdBy == request.auth.uid ||
                resource.data.updatedBy == request.auth.uid);
```

## Campos de Controle Implementados

### createdBy e updatedBy
O código agora automaticamente adiciona:
- `createdBy`: UID do usuário que criou o registro
- `updatedBy`: UID do usuário que fez a última atualização
- `createdAt`: Timestamp de criação
- `updatedAt`: Timestamp da última atualização

### Exemplo de Documento
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "createdBy": "abc123def456ghi789",
  "updatedBy": "abc123def456ghi789", 
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "firebaseId": "doc123"
}
```

## Testando as Regras

### 1. Via Console do Firebase
- Vá para **Firestore Database > Rules**
- Use o **Rules Playground** para testar cenários

### 2. Via Código
```javascript
// Tentar acessar dados com usuário não autorizado
// Deve retornar erro de permissão
try {
  const data = await firebaseService.loadRecords();
} catch (error) {
  console.log("Erro esperado:", error.code); // permission-denied
}
```

## Monitoramento

### Logs de Segurança
- Acesse **Firestore Database > Usage**
- Monitore tentativas de acesso negadas
- Configure alertas para atividades suspeitas

### Métricas Importantes
- Número de requests negados
- Padrões de acesso incomuns
- Tentativas de acesso de IPs suspeitos

## Boas Práticas

1. **Princípio do Menor Privilégio**: Conceda apenas as permissões mínimas necessárias
2. **Validação Dupla**: Implemente validação tanto no cliente quanto nas regras
3. **Auditoria Regular**: Revise periodicamente a lista de usuários autorizados
4. **Backup das Regras**: Mantenha versões das regras no controle de versão
5. **Testes Automatizados**: Implemente testes para validar as regras

## Troubleshooting

### Erro: "permission-denied"
- Verifique se o UID está na whitelist
- Confirme se o usuário está autenticado
- Verifique se as regras foram publicadas

### Erro: "unauthenticated"
- Usuário não está logado
- Token de autenticação expirado
- Problema na configuração do Firebase Auth

### Performance
- Regras complexas podem impactar performance
- Use índices apropriados
- Evite consultas desnecessárias nas regras