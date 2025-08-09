# 🚨 Solução Rápida - Erro de Permissões

## ❌ Erro Atual
```
❌ Erro ao sincronizar no Firebase: FirebaseError: Missing or insufficient permissions.
```

## ⚡ SOLUÇÃO IMEDIATA (2 minutos)

### 1. Aplicar Regras Temporárias
1. Vá para [Console do Firebase](https://console.firebase.google.com)
2. Selecione: **appcadastrodepessoas-2c20b**
3. Vá em **Firestore Database > Rules**
4. **COPIE E COLE** o conteúdo do arquivo `firestore-emergency.rules`
5. Clique em **"Publish"**
6. Aguarde 30 segundos

### 2. Testar
- Recarregue a página
- Tente criar/editar um registro
- O erro deve desaparecer

## 🔍 Verificar UID (Se ainda não funcionar)

### No Console do Navegador (F12):
```javascript
// Verificar UID atual
checkUID()

// Gerar regras personalizadas
generateRules()
```

## 📋 Regras Temporárias (Copie e Cole)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔐 Depois de Resolver (Segurança)

Após confirmar que funciona, substitua pelas regras seguras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthorizedUser() {
      return request.auth != null &&
             request.auth.uid == "wV5SD29tCMRZq8by3Pwe4m75l3w1";
    }
    
    match /records/{document} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🛠️ Possíveis Causas

1. **Regras não aplicadas** - Mais comum
2. **UID incorreto** - Verificar com `checkUID()`
3. **Usuário não logado** - Fazer login novamente
4. **Cache do navegador** - Limpar cache

## 📞 Se Nada Funcionar

1. Execute `checkUID()` no console
2. Copie a saída completa
3. Use as regras geradas por `generateRules()`
4. Limpe o cache do navegador

---

**🚨 PRIORIDADE: Aplique as regras temporárias AGORA!**