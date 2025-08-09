# 🌍 Sistema Avançado de Detecção de Ambiente

## 📋 Visão Geral

O **Sistema Avançado de Detecção de Ambiente** é uma solução robusta e inteligente para identificar automaticamente o ambiente de execução de aplicações web, fornecendo configurações otimizadas e verificações de segurança em tempo real.

## 🎯 Funcionalidades Principais

### 🔍 **Detecção Automática de Ambiente**
- **Production** 🚀 - Ambiente de produção
- **Staging** 🎭 - Ambiente de homologação
- **Development** 🛠️ - Ambiente de desenvolvimento
- **Test** 🧪 - Ambiente de testes
- **Local-file** 📁 - Execução via arquivo local
- **Insecure-production** ⚠️ - Produção sem HTTPS

### 📱 **Detecção de Contexto de Execução**
- **PWA** (Progressive Web App)
- **Electron** (Aplicação desktop)
- **Mobile** (Dispositivos móveis)
- **Desktop** (Computadores)
- **Browser** (Navegador padrão)
- **Operating System** (Sistema operacional)

### ⚡ **Verificação de Recursos Disponíveis**
- Service Workers
- Push Notifications
- Geolocation API
- Camera/Media API
- Offline Storage
- IndexedDB
- Web Crypto API
- Secure Context
- Online Status
- Connection API
- Performance API
- Web Workers

## 🚀 Como Usar

### **Importação Básica**

```javascript
// Importar o detector de ambiente
import { environmentDetector } from './environment-detector.js';

// Obter informações do ambiente
const envInfo = environmentDetector.getEnvironmentInfo();
console.log('Ambiente atual:', envInfo.type);
```

### **Verificação de Recursos**

```javascript
// Verificar se Service Workers estão disponíveis
if (environmentDetector.isFeatureAvailable('serviceWorker')) {
    console.log('✅ Service Workers disponíveis');
} else {
    console.log('❌ Service Workers não disponíveis');
}

// Obter todos os recursos disponíveis
const features = environmentDetector.getAvailableFeatures();
console.log('Recursos disponíveis:', features);
```

### **Configurações Recomendadas**

```javascript
// Obter configurações recomendadas para o ambiente atual
const recommendations = environmentDetector.getRecommendedSettings();
console.log('Configurações recomendadas:', recommendations);
```

### **Ferramentas de Debug**

```javascript
// Disponível globalmente em desenvolvimento
envDebug.info();        // Informações completas
envDebug.reload();      // Recarregar detecção
envDebug.features();    // Recursos disponíveis
envDebug.context();     // Contexto de execução
```

## 🔧 Configuração

### **Inicialização Automática**

O sistema é inicializado automaticamente quando importado:

```javascript
// Inicialização automática
import { environmentDetector } from './environment-detector.js';

// O detector já está pronto para uso
const isProduction = environmentDetector.isProduction();
```

### **Configuração Manual**

```javascript
// Recarregar detecção manualmente
environmentDetector.reload();

// Verificar se a inicialização foi bem-sucedida
if (environmentDetector.isInitialized()) {
    console.log('✅ Detector inicializado com sucesso');
}
```

## 📊 API Completa

### **Métodos Principais**

| Método | Descrição | Retorno |
|--------|-----------|----------|
| `getEnvironmentInfo()` | Informações completas do ambiente | `Object` |
| `getEnvironmentType()` | Tipo do ambiente atual | `String` |
| `isProduction()` | Verifica se é produção | `Boolean` |
| `isDevelopment()` | Verifica se é desenvolvimento | `Boolean` |
| `isTest()` | Verifica se é teste | `Boolean` |
| `getExecutionContext()` | Contexto de execução | `Object` |
| `getAvailableFeatures()` | Recursos disponíveis | `Array` |
| `isFeatureAvailable(feature)` | Verifica recurso específico | `Boolean` |
| `getRecommendedSettings()` | Configurações recomendadas | `Object` |
| `reload()` | Recarrega a detecção | `void` |
| `isInitialized()` | Status de inicialização | `Boolean` |

### **Propriedades de Ambiente**

```javascript
const envInfo = environmentDetector.getEnvironmentInfo();

// Informações básicas
console.log(envInfo.type);          // 'production', 'development', etc.
console.log(envInfo.isSecure);      // true/false
console.log(envInfo.hostname);      // 'localhost', 'example.com', etc.
console.log(envInfo.protocol);      // 'https:', 'http:', 'file:'
console.log(envInfo.port);          // 3000, 8080, null, etc.

// Contexto de execução
console.log(envInfo.context.isPWA);        // true/false
console.log(envInfo.context.isElectron);   // true/false
console.log(envInfo.context.isMobile);     // true/false
console.log(envInfo.context.browser);      // 'Chrome', 'Firefox', etc.
console.log(envInfo.context.os);           // 'Windows', 'macOS', etc.

// Recursos disponíveis
console.log(envInfo.features.serviceWorker);     // true/false
console.log(envInfo.features.pushNotifications); // true/false
console.log(envInfo.features.geolocation);       // true/false
// ... outros recursos
```

## 🛠️ Integração com Firebase

O sistema se integra automaticamente com a configuração do Firebase:

```javascript
// firebase-secure.config.js
import { environmentDetector } from './environment-detector.js';

// Uso automático na configuração
const envInfo = environmentDetector.getEnvironmentInfo();
const isProduction = envInfo.type === 'production';

// Carregamento de configuração baseado no ambiente
switch (envInfo.type) {
    case 'production':
        this.loadProductionConfig();
        break;
    case 'staging':
        this.loadStagingConfig();
        break;
    case 'development':
        this.loadDevelopmentConfig();
        break;
    case 'test':
        this.loadTestConfig();
        break;
    default:
        this.loadDevelopmentConfig();
}
```

## 🧪 Página de Teste

Acesse `tools/test-environment-detection.html` para uma interface visual completa:

- 🔍 **Teste de Detecção**: Verifica ambiente atual
- ⚡ **Verificação de Recursos**: Lista todos os recursos disponíveis
- 🔥 **Teste Firebase**: Valida configuração do Firebase
- 🚀 **Simulação de Produção**: Testa comportamento em produção
- 📝 **Console Interativo**: Logs em tempo real
- 📊 **Interface Visual**: Informações organizadas e coloridas

## 🔐 Segurança

### **Verificações Automáticas**

- ✅ **HTTPS em Produção**: Alerta se produção não usar HTTPS
- ✅ **Contexto Seguro**: Verifica se está em contexto seguro
- ✅ **Service Workers**: Disponibilidade para PWA
- ✅ **Web Crypto API**: Recursos de criptografia
- ✅ **Recursos de Segurança**: Verificação completa

### **Alertas Críticos**

```javascript
// Exemplos de alertas automáticos
🚨 CRÍTICO: Aplicação em produção sem HTTPS!
⚠️ Contexto inseguro detectado em produção
⚠️ Service Workers não disponíveis
⚠️ Web Crypto API não disponível
```

## 📈 Performance

- **Inicialização rápida** (< 10ms)
- **Cache inteligente** de detecções
- **Verificações assíncronas** quando possível
- **Baixo consumo de memória**
- **Compatibilidade ampla** com navegadores

## 🔄 Atualizações

O sistema suporta recarregamento dinâmico:

```javascript
// Recarregar detecção (útil para testes)
environmentDetector.reload();

// Verificar se houve mudanças
const newEnvInfo = environmentDetector.getEnvironmentInfo();
if (newEnvInfo.type !== previousType) {
    console.log('🔄 Ambiente mudou:', newEnvInfo.type);
}
```

## 🎯 Casos de Uso

### **1. Configuração Condicional**

```javascript
if (environmentDetector.isProduction()) {
    // Configurações de produção
    enableAnalytics();
    disableDebugMode();
} else {
    // Configurações de desenvolvimento
    enableDebugMode();
    loadDevTools();
}
```

### **2. Recursos Condicionais**

```javascript
if (environmentDetector.isFeatureAvailable('serviceWorker')) {
    // Registrar Service Worker
    navigator.serviceWorker.register('/sw.js');
}

if (environmentDetector.isFeatureAvailable('pushNotifications')) {
    // Configurar notificações push
    setupPushNotifications();
}
```

### **3. Otimizações por Contexto**

```javascript
const context = environmentDetector.getExecutionContext();

if (context.isMobile) {
    // Otimizações para mobile
    enableTouchOptimizations();
    reduceBandwidthUsage();
}

if (context.isPWA) {
    // Funcionalidades específicas de PWA
    enableOfflineMode();
    setupAppShortcuts();
}
```

---

**🔒 Sistema desenvolvido com foco em segurança, performance e facilidade de uso!**

**📚 Para mais informações, consulte a documentação completa em `docs/CONFIGURACAO-SEGURA.md`**