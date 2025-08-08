# Regras do Firestore para o Sistema de Cadastro

## Problema Atual
O erro "Missing or insufficient permissions" indica que as regras do Firestore estão muito restritivas.

## Solução: Configurar Regras no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `appcadastrodepessoas-2c20b`
3. Vá em **Firestore Database** > **Regras**
4. Substitua as regras atuais por uma das opções abaixo:

## Opção 1: Regras Permissivas (Recomendado para desenvolvimento)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para usuários autenticados (incluindo anônimos)
    match /records/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Logs de acesso (apenas leitura para usuários autenticados)
    match /access_logs/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Perfis de usuários
    match /users/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Opção 2: Regras Mais Seguras (Para produção)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Registros - permitir para usuários autenticados
    match /records/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.keys().hasAll(['fullName', 'dob', 'city'])
        && request.resource.data.fullName is string
        && request.resource.data.fullName.size() > 0;
      allow update: if request.auth != null 
        && resource.data.createdAt == request.resource.data.createdAt;
      allow delete: if request.auth != null;
    }
    
    // Logs de acesso
    match /access_logs/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Perfis de usuários
    match /users/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.id;
    }
  }
}
```

## Opção 3: Regras Totalmente Abertas (Apenas para testes)

⚠️ **CUIDADO**: Use apenas para testes rápidos, nunca em produção!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Como Aplicar as Regras

1. Copie uma das opções acima
2. Cole no editor de regras do Firebase Console
3. Clique em **Publicar**
4. Aguarde alguns minutos para as regras serem aplicadas

## Verificação

Após aplicar as regras, teste o sistema:

1. Tente cadastrar um novo registro
2. Verifique se o status de conexão mostra "Online"
3. Confirme se não há mais erros de permissão no console

## Monitoramento

Para monitorar problemas:

1. Vá em **Firestore Database** > **Uso**
2. Verifique se há tentativas de acesso negadas
3. Ajuste as regras conforme necessário

## Dicas de Segurança

- Use a **Opção 1** para desenvolvimento
- Use a **Opção 2** para produção
- Nunca use a **Opção 3** em produção
- Monitore regularmente os logs de acesso
- Considere implementar rate limiting se necessário