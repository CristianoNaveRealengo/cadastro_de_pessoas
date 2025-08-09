# 🔐 Controle de Acesso Baseado em Funções (RBAC)

## 📋 Visão Geral

O sistema implementa **RBAC (Role-Based Access Control)** para controlar o acesso às funcionalidades baseado nas funções dos usuários, garantindo que cada pessoa tenha apenas as permissões necessárias para suas responsabilidades.

## 👥 Funções Disponíveis

### **🔴 ADMIN - Administrador**
- **Descrição:** Acesso completo ao sistema
- **Permissões:** Todas as operações disponíveis
- **Cor:** Vermelho
- **Ícone:** 👑 `fa-crown`

**Pode fazer:**
- ✅ Criar, editar, visualizar e excluir registros
- ✅ Buscar e ver estatísticas
- ✅ Exportar e importar dados
- ✅ Gerenciar usuários
- ✅ Visualizar logs de auditoria
- ✅ Gerenciar sistema
- ✅ Renovar sessão e forçar logout

### **🔵 EDITOR - Editor**
- **Descrição:** Pode criar, editar e visualizar registros
- **Cor:** Azul
- **Ícone:** ✏️ `fa-edit`

**Pode fazer:**
- ✅ Criar, editar e visualizar registros
- ✅ Buscar e ver estatísticas
- ✅ Exportar dados
- ✅ Renovar sessão
- ❌ Não pode excluir registros
- ❌ Não pode importar dados
- ❌ Não pode gerenciar usuários

### **🟢 VIEWER - Visualizador**
- **Descrição:** Apenas visualização e busca
- **Cor:** Verde
- **Ícone:** 👁️ `fa-eye`

**Pode fazer:**
- ✅ Visualizar registros
- ✅ Buscar e ver estatísticas
- ✅ Renovar sessão
- ❌ Não pode criar, editar ou excluir
- ❌ Não pode exportar/importar dados

### **🟣 AUDITOR - Auditor**
- **Descrição:** Visualização, relatórios e auditoria
- **Cor:** Roxo
- **Ícone:** 🔍 `fa-search`

**Pode fazer:**
- ✅ Visualizar registros
- ✅ Buscar e ver estatísticas
- ✅ Exportar dados
- ✅ Visualizar logs de auditoria
- ✅ Renovar sessão
- ❌ Não pode criar, editar ou excluir
- ❌ Não pode importar dados

### **🟡 OPERATOR - Operador**
- **Descrição:** Operações básicas de cadastro
- **Cor:** Amarelo
- **Ícone:** ⚙️ `fa-user-cog`

**Pode fazer:**
- ✅ Criar, editar e visualizar registros
- ✅ Buscar registros
- ✅ Renovar sessão
- ❌ Não pode excluir registros
- ❌ Não pode ver estatísticas
- ❌ Não pode exportar/importar dados

## 🔑 Permissões Detalhadas

### **Operações de Dados:**
- `create_record` - Criar novos registros
- `read_record` - Visualizar registros existentes
- `update_record` - Editar registros existentes
- `delete_record` - Excluir registros

### **Operações de Busca:**
- `search_records` - Buscar e filtrar registros
- `view_statistics` - Visualizar estatísticas e gráficos

### **Operações de Dados:**
- `export_data` - Exportar dados para JSON/CSV
- `import_data` - Importar dados de arquivos

### **Operações Administrativas:**
- `manage_users` - Gerenciar usuários do sistema
- `view_audit_log` - Visualizar logs de auditoria
- `manage_system` - Configurações do sistema

### **Operações de Sessão:**
- `extend_session` - Renovar sessão manualmente
- `force_logout` - Forçar logout de usuários

## 👤 Configuração de Usuários

### **Arquivo de Configuração:** `config/rbac-config.js`

```javascript
export const USER_ROLES = {
    // Administrador principal
    'cristianonaverealengo@gmail.com': ['ADMIN'],
    
    // Outros usuários
    'editor@exemplo.com': ['EDITOR'],
    'viewer@exemplo.com': ['VIEWER'],
    'auditor@exemplo.com': ['AUDITOR'],
    'operador@exemplo.com': ['OPERATOR'],
    
    // Usuários com múltiplas funções
    'supervisor@exemplo.com': ['EDITOR', 'AUDITOR']
};
```

### **Como Adicionar Usuários:**

1. **Edite o arquivo** `config/rbac-config.js`
2. **Adicione o email** na seção `USER_ROLES`
3. **Defina as funções** (pode ter múltiplas)
4. **Salve o arquivo** - as mudanças são aplicadas imediatamente

## 🎨 Interface Visual

### **Indicador de Função no Header:**
- **Cor da caixa** muda baseada na função principal
- **Ícones** específicos para cada função
- **Tooltip** mostra todas as permissões ao passar o mouse

### **Elementos Protegidos:**
- **Botões desabilitados** se sem permissão
- **Menus ocultos** para funções não autorizadas
- **Mensagens de erro** claras quando acesso negado

### **Modal de Informações de Acesso:**
- **Disponível apenas para administradores**
- **Mostra informações** do usuário atual
- **Estatísticas** de uso do sistema
- **Log de auditoria** das últimas ações

## 🛡️ Proteções Implementadas

### **1. Verificação no Login:**
- Usuários não configurados são rejeitados
- Logout automático se sem permissões
- Mensagem clara de acesso negado

### **2. Proteção de Interface:**
- Botões desabilitados dinamicamente
- Elementos ocultos baseados em permissões
- Interceptação de eventos de formulário

### **3. Proteção de Operações:**
- Validação antes de executar ações
- Interceptação de funções CRUD
- Log de tentativas de acesso negado

### **4. Auditoria Completa:**
- Log de todas as ações dos usuários
- Registro de tentativas de acesso negado
- Estatísticas de uso por usuário

## 🔍 Ferramentas de Debug

### **Disponíveis no Console (Desenvolvimento):**

```javascript
// Ver informações do usuário atual
rbacDebug.userInfo()

// Verificar permissão específica
rbacDebug.checkPermission('create_record')

// Listar todas as permissões
rbacDebug.listPermissions()

// Ver logs de auditoria
rbacDebug.auditLog(10)

// Simular usuário (apenas desenvolvimento)
rbacDebug.simulateUser('editor@exemplo.com')
```

## 📊 Log de Auditoria

### **Ações Registradas:**
- `USER_LOGIN` - Login de usuário
- `USER_LOGOUT` - Logout de usuário
- `ACCESS_DENIED` - Tentativa de acesso negado
- `ACTION_EXECUTED` - Ação executada com sucesso

### **Informações Capturadas:**
- **Timestamp** - Data e hora da ação
- **Usuário** - Email do usuário
- **Ação** - Tipo de ação executada
- **Detalhes** - Informações específicas
- **IP** - Endereço IP (em desenvolvimento)
- **User Agent** - Navegador utilizado

## 🚨 Cenários de Segurança

### **Usuário Não Autorizado:**
1. Tenta fazer login
2. Sistema verifica se está em `USER_ROLES`
3. Se não estiver, logout automático
4. Mensagem de acesso negado

### **Tentativa de Ação Sem Permissão:**
1. Usuário clica em botão protegido
2. Sistema verifica permissão
3. Se não tiver, mostra toast de erro
4. Ação é bloqueada e registrada no log

### **Usuário Perde Permissões:**
1. Administrador remove usuário do `USER_ROLES`
2. Na próxima ação, sistema detecta falta de permissão
3. Usuário é redirecionado para tela de acesso negado

## 🔧 Personalização

### **Adicionar Nova Permissão:**

1. **Defina a permissão** em `PERMISSIONS`:
```javascript
NEW_PERMISSION: 'new_permission'
```

2. **Adicione às funções** necessárias em `ROLES`:
```javascript
ADMIN: {
    permissions: [..., PERMISSIONS.NEW_PERMISSION]
}
```

3. **Implemente a proteção** no código:
```javascript
if (accessControl.hasPermission(PERMISSIONS.NEW_PERMISSION)) {
    // Executar ação
}
```

### **Criar Nova Função:**

1. **Defina a função** em `ROLES`:
```javascript
CUSTOM_ROLE: {
    name: 'Função Personalizada',
    description: 'Descrição da função',
    permissions: [lista_de_permissões],
    color: 'blue',
    icon: 'fa-custom'
}
```

2. **Atribua aos usuários** em `USER_ROLES`:
```javascript
'usuario@exemplo.com': ['CUSTOM_ROLE']
```

## ✅ Status Atual

### **🔒 Implementado:**
- ✅ Sistema RBAC completo
- ✅ 5 funções pré-definidas
- ✅ 11 permissões específicas
- ✅ Proteção de interface
- ✅ Proteção de operações
- ✅ Log de auditoria
- ✅ Ferramentas de debug
- ✅ Documentação completa

### **🔄 Próximos Passos:**
- 🔲 Interface web para gerenciar usuários
- 🔲 Importação/exportação de configurações
- 🔲 Notificações de mudanças de permissão
- 🔲 Relatórios de auditoria avançados

## 🎯 Como Usar

### **Para Administradores:**
1. **Configure usuários** no arquivo `rbac-config.js`
2. **Defina funções** apropriadas para cada usuário
3. **Monitore logs** através do menu "Informações de Acesso"
4. **Ajuste permissões** conforme necessário

### **Para Usuários:**
1. **Faça login** normalmente
2. **Veja sua função** no header do sistema
3. **Use apenas funcionalidades** permitidas
4. **Entre em contato** com admin se precisar de mais acesso

**Sistema RBAC implementado e funcionando!** 🎉

Agora o sistema possui controle granular de acesso baseado em funções, garantindo que cada usuário tenha apenas as permissões necessárias para suas responsabilidades.