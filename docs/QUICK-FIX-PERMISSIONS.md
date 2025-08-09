# Solução Rápida para Erro de Permissões

## 🚨 Erro Atual
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

## ⚡ Solução Imediata (2 minutos)

### 1. Obter seu UID
Abra o console do navegador (F12) e execute:
```javascript
console.log("Meu UID:", firebaseService.currentUser.uid);
```

### 2. Aplicar Regras Temporárias
Vá para o [Console do Firebase](https://console.firebase.google.com):
1. Selecione seu projeto
2. Vá em **Firestore Database > Rules**
3. Cole estas regras temporárias:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Clique em **Publish**

### 3. Testar
Recarregue sua página e teste se funciona.

## 🔒 Solução Definitiva (5 minutos)

### Opção A: Whitelist (Mais Segura)
Substitua as regras temporárias por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAllowedUser() {
      return request.auth.uid in [
        "SEU_UID_AQUI"  // Substitua pelo UID real
      ];
    }
    
    match /records/{document} {
      allow read, write: if isAllowedUser();
    }
  }
}
```

### Opção B: Baseada em Propriedade (Mais Flexível)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{document} {
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid;
      
      allow read: if request.auth != null && 
                     (resource.data.createdBy == request.auth.uid ||
                      resource.data.updatedBy == request.auth.uid);
      
      allow update: if request.auth != null &&
                       request.resource.data.updatedBy == request.auth.uid &&
                       (resource.data.createdBy == request.auth.uid ||
                        resource.data.updatedBy == request.auth.uid);
      
      allow delete: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## 🔍 Diagnóstico Avançado

Se ainda tiver problemas, execute no console:
```javascript
// Carregar script de diagnóstico
import('./scripts/diagnose-permissions.js').then(() => {
    diagnose(); // Executar diagnóstico completo
});
```

## ❓ Problemas Comuns

### "Usuário não autenticado"
- Aguarde alguns segundos para a autenticação completar
- Recarregue a página
- Verifique se o Firebase Auth está configurado

### "Regras não funcionam"
- Certifique-se de clicar em **Publish** no Console
- Aguarde alguns segundos para as regras serem aplicadas
- Limpe o cache do navegador

### "UID não funciona na whitelist"
- Copie o UID exatamente como aparece no console
- Não inclua espaços ou caracteres extras
- Use aspas duplas ao redor do UID

## 📞 Suporte

Se nada funcionar:
1. Execute `diagnose()` no console
2. Copie a saída completa
3. Verifique se há erros no console do navegador
4. Confirme se o projeto Firebase está ativo