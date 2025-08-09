# 🔧 Scripts de Configuração Segura

Este diretório contém scripts utilitários para configuração segura do projeto, especialmente para gerenciamento de chaves API e configurações sensíveis.

## 📋 Scripts Disponíveis

### 🔑 setup-dev-keys.js

**Função**: Configuração interativa e segura de chaves de desenvolvimento Firebase.

#### **Como Usar:**
```bash
# Executar o script
node scripts/setup-dev-keys.js

# Ou com npm (se configurado)
npm run setup-keys
```

#### **O que o Script Faz:**
1. ✅ Verifica se arquivos sensíveis estão protegidos no .gitignore
2. ✅ Coleta configurações Firebase de forma interativa
3. ✅ Valida se todas as configurações obrigatórias foram fornecidas
4. ✅ Oferece múltiplos métodos de configuração:
   - Arquivo local (`config/env.config.js`)
   - Script para localStorage (navegador)
   - Ambos os métodos
5. ✅ Gera arquivos com instruções de segurança
6. ✅ Fornece checklist de próximos passos

#### **Configurações Solicitadas:**
- 🔑 **API Key**: Chave de API do Firebase
- 🌐 **Auth Domain**: Domínio de autenticação
- 📁 **Project ID**: ID do projeto Firebase
- 🗄️ **Storage Bucket**: Bucket de armazenamento
- 📨 **Messaging Sender ID**: ID do remetente de mensagens
- 🆔 **App ID**: ID da aplicação

#### **Métodos de Configuração:**

##### **1. Arquivo Local (Recomendado)**
- Cria `config/env.config.js` com as configurações
- Arquivo automaticamente ignorado pelo Git
- Carregado automaticamente pelo sistema

##### **2. localStorage (Alternativo)**
- Gera script para configurar localStorage do navegador
- Útil para testes rápidos
- Apenas para desenvolvimento local

##### **3. Ambos**
- Combina os dois métodos acima
- Máxima flexibilidade para desenvolvimento

## 🔒 Segurança

### **✅ Práticas Implementadas:**
- Verificação automática do .gitignore
- Validação de campos obrigatórios
- Avisos de segurança em todos os arquivos gerados
- Instruções claras sobre uso apenas em desenvolvimento
- Lembretes sobre configuração de produção

### **🚨 Avisos Importantes:**
- ❌ **NUNCA** commite arquivos com chaves reais
- ✅ Use apenas para desenvolvimento local
- ✅ Configure variáveis de ambiente em produção
- ✅ Mantenha o .gitignore atualizado

## 📁 Arquivos Gerados

### **config/env.config.js**
```javascript
// Arquivo de configuração local (não versionado)
export default {
    apiKey: "sua_chave_aqui",
    authDomain: "projeto.firebaseapp.com",
    // ... outras configurações
};
```

### **scripts/setup-localStorage.js**
```javascript
// Script para configurar localStorage
localStorage.setItem('FIREBASE_API_KEY', 'sua_chave');
// ... outras configurações
```

## 🔧 Integração com o Sistema

O script funciona em conjunto com:

- **`config/firebase-secure.config.js`**: Sistema de carregamento seguro
- **`config/env.example.js`**: Template de exemplo
- **`.gitignore`**: Proteção de arquivos sensíveis
- **Componentes HTML**: Configuração via meta tags

## 📋 Checklist de Uso

### **Antes de Executar:**
- [ ] Certifique-se de ter as configurações Firebase disponíveis
- [ ] Verifique se está no diretório raiz do projeto
- [ ] Confirme que o .gitignore está configurado

### **Após Executar:**
- [ ] Teste a aplicação localmente
- [ ] Verifique se não há erros de configuração
- [ ] Confirme que arquivos sensíveis não estão sendo commitados
- [ ] Configure variáveis de ambiente para produção

### **Para Produção:**
- [ ] Configure variáveis de ambiente no servidor
- [ ] Remova arquivos de configuração local
- [ ] Teste a aplicação em ambiente de produção
- [ ] Monitore logs para erros de configuração

## 🆘 Solução de Problemas

### **Erro: "Arquivo já existe"**
- O script perguntará se deseja sobrescrever
- Responda 's' ou 'sim' para continuar

### **Erro: "Campos obrigatórios"**
- Certifique-se de preencher todos os campos
- Não deixe campos em branco

### **Erro: "Não foi possível verificar .gitignore"**
- Verifique se o arquivo .gitignore existe
- Execute o script do diretório raiz do projeto

### **Configuração não funciona**
- Verifique se o arquivo foi criado corretamente
- Confirme que não há erros de sintaxe
- Teste com localStorage como alternativa

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação em `docs/CONFIGURACAO-SEGURA.md`
2. Consulte os exemplos em `config/env.example.js`
3. Revise os logs de erro no console
4. Entre em contato com a equipe de desenvolvimento

---

**🔒 Lembre-se: Segurança é responsabilidade de todos!**