# 🔥 Configuração do Firebase

## Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Nome do projeto: `cadastro-pessoas` (ou outro nome)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

## Passo 2: Configurar Firestore Database

1. No painel do Firebase, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Escolha uma localização (ex: `southamerica-east1`)
5. Clique em "Concluído"

## Passo 3: Configurar Authentication

1. No painel do Firebase, clique em "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", habilite "Anônimo"
4. Clique em "Salvar"

## Passo 4: Obter Configurações do Projeto

1. No painel do Firebase, clique no ícone de engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone `</>` (Web)
5. Nome do app: `cadastro-pessoas-web`
6. Clique em "Registrar app"
7. **COPIE** as configurações que aparecem

## Passo 5: Atualizar o Código

Substitua as configurações no arquivo `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};
```

## Passo 6: Configurar Regras de Segurança

No Firestore Database, vá em "Regras" e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para o próprio usuário
    match /records/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Passo 7: Testar

1. Abra o `index.html` no navegador
2. Verifique se aparece "Online" no canto superior direito
3. Cadastre uma pessoa
4. Verifique no Firebase Console se o registro apareceu

## ✅ Funcionalidades Implementadas

- ✅ **Salvamento automático na nuvem**
- ✅ **Sincronização em tempo real**
- ✅ **Modo offline** (salva localmente quando sem internet)
- ✅ **Autenticação anônima** (cada usuário tem seus próprios dados)
- ✅ **Backup local** (localStorage como fallback)
- ✅ **Status de conexão** (mostra se está online/offline)

## 🔧 Troubleshooting

### Erro: "Firebase not defined"
- Verifique se as configurações estão corretas
- Certifique-se que o projeto está ativo no Firebase

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Certifique-se que a autenticação anônima está habilitada

### Dados não sincronizam
- Verifique a conexão com internet
- Abra o console do navegador (F12) para ver erros
- Verifique se o projeto Firebase está ativo

## 💡 Próximos Passos

- Implementar autenticação com email/senha
- Adicionar compartilhamento de dados entre usuários
- Implementar backup/restore automático
- Adicionar notificações push