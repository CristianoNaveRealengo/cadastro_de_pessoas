# 🔐 Controle de Sessão e Timeout

## 📋 Visão Geral

O sistema implementa controle automático de sessão com timeout por inatividade, garantindo segurança e logout automático quando o usuário fica inativo.

## ⚙️ Configurações

### **Tempos Configurados:**
- **Timeout da Sessão:** 30 minutos de inatividade
- **Aviso de Expiração:** 5 minutos antes do timeout
- **Verificação:** A cada 1 minuto
- **Logout Automático:** Após 30 minutos sem atividade

### **Eventos Monitorados:**
- `mousedown` - Cliques do mouse
- `mousemove` - Movimento do mouse
- `keypress` - Teclas pressionadas
- `scroll` - Rolagem da página
- `touchstart` - Toque em dispositivos móveis
- `click` - Cliques em elementos

## 🎨 Interface Visual

### **Indicador de Sessão (Header):**
- **Verde:** Mais de 10 minutos restantes
- **Amarelo:** Entre 5-10 minutos restantes
- **Vermelho:** Menos de 5 minutos (modo de aviso)

### **Formato do Tempo:**
```
MM:SS (ex: 25:30 = 25 minutos e 30 segundos)
```

### **Ícones por Status:**
- 🟢 `fa-clock` - Sessão normal (verde)
- 🟡 `fa-clock` - Sessão próxima do fim (amarelo)
- 🔴 `fa-exclamation-triangle` - Sessão expirando (vermelho)

## 🚨 Modal de Aviso

Quando restam 5 minutos para expirar, aparece um modal com:

### **Informações:**
- Tempo restante em segundos (countdown)
- Aviso de expiração iminente
- Opções de ação

### **Botões Disponíveis:**
- **"Continuar Sessão"** - Renova a sessão por mais 30 minutos
- **"Sair Agora"** - Faz logout imediatamente

### **Comportamento:**
- Countdown em tempo real
- Logout automático se não houver ação
- Renovação automática se houver atividade

## 🔄 Renovação de Sessão

### **Automática:**
- Qualquer atividade do usuário renova automaticamente
- Remove avisos se estiverem sendo exibidos
- Reseta o timer para 30 minutos

### **Manual:**
- Botão "Renovar Sessão" no menu dropdown
- Comando `sessionDebug.extend()` no console
- Botão "Continuar Sessão" no modal de aviso

## 🛠️ Menu Dropdown

### **Nova Opção Adicionada:**
```
🔄 Renovar Sessão
```

### **Funcionalidade:**
- Estende a sessão por mais 30 minutos
- Mostra toast de confirmação
- Atualiza indicador visual imediatamente

## 📊 Comandos de Debug

### **Disponíveis no Console:**

#### **Ver Status da Sessão:**
```javascript
sessionDebug.status()
```
**Retorna:**
- Tempo restante formatado
- Status ativo/inativo
- Se está em modo de aviso
- Horário da última atividade

#### **Estender Sessão:**
```javascript
sessionDebug.extend()
```

#### **Forçar Logout (Teste):**
```javascript
sessionDebug.forceLogout()
```

#### **Simular Inatividade:**
```javascript
sessionDebug.simulateInactivity(25) // 25 minutos
```

## 🔒 Logout Automático

### **Quando Acontece:**
- Após 30 minutos de inatividade total
- Quando o usuário não responde ao aviso de 5 minutos
- Quando clica em "Sair Agora" no modal

### **Processo:**
1. Para o monitoramento de sessão
2. Remove modais de aviso
3. Mostra toast informativo
4. Executa `signOut()` do Firebase
5. Redireciona para `components/login.html` após 2 segundos

### **Mensagens:**
- "Sessão expirada por inatividade"
- "Logout solicitado pelo usuário"

## 🎯 Fluxo de Funcionamento

### **1. Inicialização:**
```
Usuário faz login → SessionManager inicia → Monitoramento ativo
```

### **2. Atividade Normal:**
```
Usuário ativo → Timer reseta → Indicador verde → Continua monitorando
```

### **3. Aproximação do Timeout:**
```
25 minutos → Indicador amarelo → 27 minutos → Indicador vermelho
```

### **4. Aviso de Expiração:**
```
5 minutos restantes → Modal de aviso → Countdown → Opções de ação
```

### **5. Logout Automático:**
```
Tempo esgotado → Para monitoramento → Logout Firebase → Redireciona
```

## 🔧 Personalização

### **Alterar Tempos:**
```javascript
// No construtor da classe SessionManager
this.sessionTimeout = 45 * 60 * 1000; // 45 minutos
this.warningTime = 10 * 60 * 1000;    // 10 minutos de aviso
this.checkInterval = 30 * 1000;       // Verificar a cada 30s
```

### **Alterar Cores do Indicador:**
```javascript
// No método updateSessionIndicator()
if (status.isWarning) {
    // Personalizar cor de aviso
    sessionIndicatorElement.className = 'bg-orange-100 text-orange-800...';
}
```

## 📱 Responsividade

### **Desktop:**
- Indicador sempre visível no header
- Modal centralizado na tela
- Menu dropdown com opção de renovar

### **Mobile:**
- Indicador adaptado para telas menores
- Modal responsivo
- Touch events monitorados

## 🛡️ Segurança

### **Benefícios:**
- ✅ Previne acesso não autorizado em computadores abandonados
- ✅ Força re-autenticação após inatividade
- ✅ Monitora atividade real do usuário
- ✅ Aviso antecipado para não perder trabalho
- ✅ Logout seguro via Firebase Auth

### **Proteções:**
- Monitoramento de múltiplos tipos de eventos
- Verificação periódica independente
- Cleanup automático de timers
- Tratamento de erros no logout

## 🚀 Comandos Úteis

### **Para Desenvolvedores:**
```javascript
// Ver todas as funções disponíveis
console.log(window.sessionManager);

// Monitorar em tempo real
setInterval(() => sessionDebug.status(), 5000);

// Testar cenário de timeout
sessionDebug.simulateInactivity(29); // 1 minuto para expirar
```

### **Para Usuários:**
- Use qualquer ação (mover mouse, clicar, digitar) para manter sessão ativa
- Clique em "Renovar Sessão" no menu se precisar de mais tempo
- Responda ao aviso de 5 minutos se aparecer

---

## ✅ Status: **IMPLEMENTADO E FUNCIONANDO**

- 🔐 Controle de sessão ativo
- ⏰ Timeout configurado (30 min)
- 🚨 Avisos funcionando
- 🔄 Renovação manual disponível
- 📊 Debug tools implementados
- 🎨 Interface visual completa

**Sistema pronto para uso em produção!** 🎉