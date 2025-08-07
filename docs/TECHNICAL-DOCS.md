# 📋 Documentação Técnica - Sistema de Cadastro

## 🏗️ Arquitetura do Sistema

### Estrutura de Arquivos

```
📁 Sistema de Cadastro/
├── 📄 index.html              # Interface principal
├── 📄 script.js               # Lógica principal (compilado)
├── 📄 script.ts               # Código TypeScript (fonte)
├── 📄 style.css               # Estilos customizados
├── 📄 themes.css              # Sistema de temas
├── 📄 utils.js                # Utilitários e helpers
├── 📄 enhancements.js         # Funcionalidades extras
├── 📄 dev-config.js           # Configurações de desenvolvimento
├── 📄 firebase-config.js      # Configuração Firebase
├── 📄 firebase-config.example.js # Exemplo de configuração
├── 📄 test.html               # Página de testes
├── 📄 tsconfig.json           # Configuração TypeScript
├── 📄 package.json            # Dependências do projeto
└── 📚 Documentação/
    ├── README.md              # Documentação principal
    ├── FIREBASE-SETUP.md      # Setup do Firebase
    ├── QUICK-START.md         # Início rápido
    ├── STATUS.md              # Status do sistema
    └── TECHNICAL-DOCS.md      # Este arquivo
```

## 🔧 Tecnologias Utilizadas

### Frontend

-   **HTML5**: Estrutura semântica
-   **CSS3**: Estilização moderna
-   **Tailwind CSS**: Framework CSS utilitário
-   **JavaScript ES2017**: Lógica da aplicação
-   **TypeScript**: Tipagem estática (desenvolvimento)

### Backend/Dados

-   **Firebase Firestore**: Banco de dados NoSQL
-   **Firebase Auth**: Autenticação anônima
-   **localStorage**: Armazenamento local
-   **PeerJS**: Comunicação P2P

### Bibliotecas Externas

-   **Font Awesome**: Ícones
-   **PeerJS**: Sincronização peer-to-peer
-   **Firebase SDK**: Integração com Firebase

## 📊 Estrutura de Dados

### PersonRecord Interface

```typescript
interface PersonRecord {
	id: string; // ID único do registro
	fullName: string; // Nome completo
	origin: string; // Origem (MSE, MP, EP, EPT)
	dob: string; // Data de nascimento (ISO)
	age: number; // Idade calculada
	city: string; // Cidade
	neighborhood: string; // Bairro
	education: string; // Nível de escolaridade
	status: string; // Status (Em Análise, Contratado, Não Contratado)
	referenceName: string; // Nome da referência
	forwarding: string; // Encaminhamento
	observation: string; // Observações
	createdAt: string; // Data de criação (ISO)
	timestamp: string; // Última modificação (ISO)
	firebaseId?: string; // ID no Firebase (opcional)
}
```

### AppData Structure

```typescript
interface AppData {
	records: PersonRecord[]; // Array de registros
	neighborhoods: Record<string, string[]>; // Cidades e bairros
	currentRecordId: string | null; // ID do registro atual
	isEditMode: boolean; // Modo de edição ativo
	currentPage: number; // Página atual da paginação
	recordsPerPage: number; // Registros por página
	peer: any | null; // Instância PeerJS
	peerId: string | null; // ID do peer
	connections: any[]; // Conexões P2P ativas
	syncEnabled: boolean; // Sincronização habilitada
	lastSyncTime: string | null; // Última sincronização
}
```

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial

```
1. DOM carregado
2. Inicializar Firebase (se configurado)
3. Carregar dados (Firebase → localStorage → vazio)
4. Atualizar interface
5. Configurar listeners de eventos
```

### 2. Salvamento de Dados

```
1. Validar formulário
2. Criar objeto PersonRecord
3. Adicionar ao array local
4. Salvar no localStorage
5. Enviar para Firebase (se conectado)
6. Sincronizar com peers P2P
7. Atualizar interface
```

### 3. Sincronização Firebase

```
1. Autenticação anônima
2. Listener em tempo real
3. Merge de dados (timestamp-based)
4. Atualização local
5. Refresh da interface
```

## 🎨 Sistema de Temas

### Variáveis CSS

```css
:root {
	--primary-color: #3b82f6;
	--secondary-color: #10b981;
	--danger-color: #ef4444;
	--warning-color: #f59e0b;
	/* ... mais variáveis */
}
```

### Temas Disponíveis

-   **default**: Azul (padrão)
-   **dark**: Tema escuro
-   **green**: Verde
-   **purple**: Roxo

### Aplicação de Temas

```javascript
document.documentElement.setAttribute("data-theme", "dark");
```

## 🔍 Sistema de Busca

### Filtros Disponíveis

-   **Texto**: Nome, observação, referência (busca fuzzy)
-   **Cidade**: Seleção exata
-   **Bairro**: Dependente da cidade
-   **Origem**: MSE, MP, EP, EPT
-   **Status**: Em Análise, Contratado, Não Contratado
-   **Escolaridade**: Níveis de ensino
-   **Ano**: Ano de cadastro
-   **Encaminhamento**: Campo livre

### Algoritmo de Busca Fuzzy

```javascript
function fuzzySearch(query, text) {
	query = removeAccents(query.toLowerCase());
	text = removeAccents(text.toLowerCase());

	let queryIndex = 0;
	for (let i = 0; i < text.length && queryIndex < query.length; i++) {
		if (text[i] === query[queryIndex]) {
			queryIndex++;
		}
	}
	return queryIndex === query.length;
}
```

## 📈 Sistema de Estatísticas

### Métricas Calculadas

-   **Total de registros**
-   **Idade média**
-   **Distribuição por cidade** (top 5)
-   **Distribuição por origem**
-   **Taxa de contratação**
-   **Distribuição por escolaridade**
-   **Registros por ano**
-   **Encaminhamentos**

### Cálculo de Percentuais

```javascript
const percentage = ((count / total) * 100).toFixed(1);
```

## 🔐 Segurança

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{document} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Validações Client-Side

-   Campos obrigatórios
-   Formato de data
-   Idade mínima (16 anos)
-   Duplicatas (nome + data nascimento)

## 📱 Responsividade

### Breakpoints

-   **Mobile**: < 640px
-   **Tablet**: 640px - 768px
-   **Desktop**: > 768px

### Adaptações

-   Layout em colunas → coluna única
-   Tabelas → cards empilhados
-   Botões → full-width
-   Textos → tamanhos menores

## 🚀 Performance

### Otimizações Implementadas

-   **Paginação**: 6 registros por página
-   **Lazy loading**: Carregamento sob demanda
-   **Debounce**: Busca com delay
-   **Virtual scrolling**: Para listas grandes
-   **Compressão**: localStorage otimizado

### Métricas de Performance

-   **First Paint**: < 1s
-   **Interactive**: < 2s
-   **Bundle size**: < 500KB
-   **Memory usage**: < 10MB

## 🔄 Sincronização P2P

### Protocolo

1. Gerar ID único do peer
2. Estabelecer conexão WebRTC
3. Trocar dados completos
4. Sincronizar mudanças incrementais
5. Resolver conflitos por timestamp

### Estrutura de Mensagens

```javascript
interface SyncMessage {
	type: "data_sync" | "data_update";
	data?: PersonRecord[];
	timestamp?: string;
}
```

## 💾 Sistema de Backup

### Backup Automático

-   **Frequência**: A cada 5 minutos
-   **Retenção**: 10 backups mais recentes
-   **Formato**: JSON comprimido
-   **Chave**: `backup_${timestamp}`

### Estrutura do Backup

```javascript
interface Backup {
	timestamp: number;
	date: string;
	records: PersonRecord[];
	version: string;
	totalRecords: number;
}
```

## 🧪 Testes

### Testes Manuais Realizados

-   ✅ Cadastro de 100+ registros
-   ✅ Busca com múltiplos filtros
-   ✅ Exportação/importação
-   ✅ Sincronização Firebase
-   ✅ Modo offline
-   ✅ Responsividade
-   ✅ Impressão

### Cenários de Teste

1. **Cadastro**: Campos obrigatórios, validações
2. **Busca**: Filtros individuais e combinados
3. **Edição**: Modificação de todos os campos
4. **Exclusão**: Confirmação e remoção
5. **Sincronização**: Online/offline, conflitos
6. **Performance**: 1000+ registros

## 🐛 Debugging

### Console Commands

```javascript
// Informações de debug
debugInfo();

// Carregar dados de teste
loadTestData();

// Limpar dados de teste
clearTestData();

// Verificar performance
performanceCheck();

// Listar backups
backupManager.listBackups();
```

### Logs Importantes

-   `🔥 Firebase conectado`
-   `💾 Backup automático criado`
-   `🔄 Dados sincronizados`
-   `⚡ Performance: UI atualizada`

## 📦 Build e Deploy

### Compilação TypeScript

```bash
tsc script.ts --target ES2017 --lib DOM,ES2017 --outDir .
```

### Deploy Estático

1. Configurar Firebase Hosting
2. Upload dos arquivos
3. Configurar domínio personalizado
4. SSL automático

### Variáveis de Ambiente

-   `FIREBASE_API_KEY`
-   `FIREBASE_PROJECT_ID`
-   `FIREBASE_AUTH_DOMAIN`

## 🔮 Roadmap Técnico

### v2.0 (Próxima Versão)

-   [ ] Service Worker (PWA)
-   [ ] IndexedDB (armazenamento avançado)
-   [ ] Web Workers (processamento paralelo)
-   [ ] GraphQL API
-   [ ] Real-time notifications

### v2.1 (Futuro)

-   [ ] Machine Learning (predições)
-   [ ] Blockchain (auditoria)
-   [ ] Microservices (escalabilidade)
-   [ ] Docker containers
-   [ ] Kubernetes deployment

## 📞 Suporte Técnico

### Logs de Erro

Todos os erros são logados no console com prefixos:

-   `❌ Erro:` - Erros críticos
-   `⚠️ Aviso:` - Avisos importantes
-   `💡 Info:` - Informações gerais

### Troubleshooting

1. **F12** → Console para ver erros
2. **Application** → Local Storage para dados
3. **Network** → Verificar requisições Firebase
4. **Performance** → Analisar carregamento

---

**Documentação atualizada em**: Janeiro 2025  
**Versão do sistema**: 1.0.0  
**Compatibilidade**: Chrome 80+, Firefox 75+, Safari 13+
