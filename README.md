# � Sisteema de Cadastro Pessoal

Um sistema completo de cadastro de pessoas com sincronização na nuvem usando Firebase.

## 🚀 Funcionalidades

### ✅ Cadastro Completo
- Nome completo, origem, data de nascimento
- Cálculo automático da idade
- Cidade e bairro (dados do Rio de Janeiro)
- Nível de escolaridade
- Status (Em Análise, Contratado, Não Contratado)
- Nome da referência e encaminhamento
- Observações

### ✅ Busca e Filtros
- Busca por nome
- Filtros por cidade, bairro, origem, status
- Filtros por escolaridade, ano e encaminhamento
- Paginação dos resultados

### ✅ Estatísticas
- Total de registros e idade média
- Estatísticas por cidade, origem e status
- Gráficos por escolaridade, ano e encaminhamento
- Visualização em barras de progresso

### ✅ Sincronização na Nuvem
- **Firebase Firestore** - Banco de dados na nuvem
- **Sincronização em tempo real** - Dados atualizados automaticamente
- **Modo offline** - Funciona sem internet
- **Backup automático** - localStorage como fallback
- **Autenticação anônima** - Dados seguros por usuário

### ✅ Importação/Exportação
- Exportar dados para JSON
- Importar dados de arquivo JSON
- Backup e restauração completa

### ✅ Sincronização P2P
- Conectar com outros usuários
- Compartilhar dados em tempo real
- Sistema peer-to-peer usando PeerJS

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização (Tailwind CSS)
- **JavaScript** - Lógica da aplicação
- **TypeScript** - Tipagem forte (código fonte)
- **Firebase** - Backend na nuvem
  - Firestore Database
  - Authentication
- **PeerJS** - Sincronização P2P
- **Font Awesome** - Ícones

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── script.js               # JavaScript compilado (produção)
├── script.ts               # Código TypeScript (desenvolvimento)
├── style.css               # Estilos customizados
├── firebase-config.js      # Configuração do Firebase
├── tsconfig.json          # Configuração do TypeScript
├── package.json           # Dependências do projeto
├── FIREBASE-SETUP.md      # Instruções do Firebase
└── README.md              # Este arquivo
```

## 🔧 Configuração

### 1. Firebase (Recomendado)

Para usar a sincronização na nuvem:

1. Siga as instruções em `FIREBASE-SETUP.md`
2. Configure seu projeto Firebase
3. Substitua as configurações em `firebase-config.js`

### 2. Uso Local

Para usar apenas localmente:

1. Abra `index.html` no navegador
2. Os dados serão salvos no localStorage

## 🚀 Como Usar

### Cadastrar Pessoa
1. Preencha o formulário na coluna esquerda
2. Todos os campos com * são obrigatórios
3. A idade é calculada automaticamente
4. Clique em "Salvar"

### Buscar Registros
1. Use a aba "Busca" na coluna direita
2. Digite o nome ou use os filtros
3. Clique em "Buscar" ou "Limpar"

### Ver Estatísticas
1. Clique na aba "Estatísticas"
2. Veja gráficos e dados resumidos
3. Estatísticas são atualizadas automaticamente

### Gerenciar Registros
- **👁️ Visualizar**: Clique no ícone do olho
- **✏️ Editar**: Clique no ícone do lápis
- **🗑️ Excluir**: Clique no ícone da lixeira
- **🖨️ Imprimir**: Use Ctrl+P na visualização

### Exportar/Importar
- **Exportar**: Clique em "Exportar" (gera arquivo JSON)
- **Importar**: Clique em "Importar" e selecione arquivo JSON

## 🌐 Status de Conexão

O sistema mostra o status da conexão:

- **🟢 Online**: Conectado ao Firebase
- **🔴 Offline**: Sem internet (dados salvos localmente)
- **🟡 Conectando**: Estabelecendo conexão

## 📱 Responsividade

O sistema é totalmente responsivo:

- **Desktop**: Layout em duas colunas
- **Tablet**: Layout adaptativo
- **Mobile**: Layout em coluna única

## 🔒 Segurança

- **Autenticação anônima**: Cada usuário tem ID único
- **Dados isolados**: Usuários só veem seus próprios dados
- **Regras de segurança**: Configuradas no Firestore
- **Validação**: Campos obrigatórios e formatos

## 🎨 Interface

- **Design moderno**: Usando Tailwind CSS
- **Ícones**: Font Awesome
- **Cores**: Esquema azul/verde/vermelho
- **Animações**: Transições suaves
- **Feedback visual**: Confirmações e erros

## 📊 Dados Suportados

### Origens
- MSE, MP, EP, EPT

### Cidades do Rio de Janeiro
- Todas as cidades e bairros do estado

### Níveis de Escolaridade
- Ensino Fundamental (1ª a 9ª série)
- Ensino Médio (1º ao 3º ano)
- Fundamental/Médio Completo

### Status
- Em Análise
- Contratado  
- Não Contratado

## 🔄 Desenvolvimento

### Compilar TypeScript
```bash
tsc script.ts --target ES2017 --lib DOM,ES2017 --outDir .
```

### Modo Watch (desenvolvimento)
```bash
npm run watch
```

### Build para produção
```bash
npm run build
```

## 🐛 Troubleshooting

### Firebase não conecta
- Verifique as configurações em `firebase-config.js`
- Certifique-se que o projeto está ativo
- Verifique as regras do Firestore

### Dados não salvam
- Verifique a conexão com internet
- Abra o console (F12) para ver erros
- Verifique se há espaço no localStorage

### Layout quebrado
- Verifique se o Tailwind CSS está carregando
- Teste em navegador atualizado
- Limpe o cache do navegador

## 📈 Próximas Funcionalidades

- [ ] Autenticação com email/senha
- [ ] Compartilhamento de dados entre usuários
- [ ] Notificações push
- [ ] Relatórios em PDF
- [ ] Dashboard administrativo
- [ ] API REST
- [ ] App mobile (PWA)

## 👨‍💻 Autor

**Cristiano Machado**
- Sistema desenvolvido para cadastro de pessoas
- Integração com Firebase e TypeScript

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

## 🚀 Quick Start

1. **Clone/Download** o projeto
2. **Configure Firebase** (opcional - veja `FIREBASE-SETUP.md`)
3. **Abra `index.html`** no navegador
4. **Comece a cadastrar!** 🎉

**Pronto para usar!** O sistema funciona imediatamente, mesmo sem Firebase.