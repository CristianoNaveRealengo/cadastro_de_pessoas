# NAVE Backend - Firebase Cloud Functions

Este diretório contém as Firebase Cloud Functions para o sistema NAVE, implementando um backend completo para operações CRUD sem validação rigorosa.

## 🚀 Funcionalidades

### Endpoints Disponíveis

#### 1. **createRecord** - Criar Registro
- **Método:** POST
- **URL:** `/createRecord`
- **Descrição:** Cria um novo registro no sistema
- **Body:** JSON com dados do registro
- **Resposta:** Registro criado com ID gerado

#### 2. **updateRecord** - Atualizar Registro
- **Método:** PUT/PATCH
- **URL:** `/updateRecord?id=<recordId>`
- **Descrição:** Atualiza um registro existente
- **Body:** JSON com dados a serem atualizados
- **Resposta:** Registro atualizado

#### 3. **getRecords** - Listar Registros
- **Método:** GET
- **URL:** `/getRecords`
- **Parâmetros de Query:**
  - `page`: Página (padrão: 1)
  - `limit`: Registros por página (padrão: 50)
  - `status`: Filtrar por status
  - `origin`: Filtrar por origem
  - `city`: Filtrar por cidade
  - `sortBy`: Campo para ordenação (padrão: createdAt)
  - `sortOrder`: Ordem (asc/desc, padrão: desc)
- **Resposta:** Lista paginada de registros

#### 4. **getRecord** - Buscar Registro por ID
- **Método:** GET
- **URL:** `/getRecord?id=<recordId>`
- **Descrição:** Busca um registro específico
- **Resposta:** Dados do registro

#### 5. **deleteRecord** - Deletar Registro
- **Método:** DELETE
- **URL:** `/deleteRecord?id=<recordId>`
- **Descrição:** Remove um registro do sistema
- **Resposta:** Confirmação de exclusão

#### 6. **getStatistics** - Estatísticas
- **Método:** GET
- **URL:** `/getStatistics`
- **Descrição:** Gera estatísticas dos registros
- **Resposta:** Dados estatísticos agrupados

#### 7. **validateData** - Validar Dados (Opcional)
- **Método:** POST
- **URL:** `/validateData`
- **Descrição:** Valida dados sem salvar
- **Body:** JSON com dados para validação
- **Resposta:** Resultado da validação e dados sanitizados

#### 8. **backupData** - Backup
- **Método:** POST
- **URL:** `/backupData`
- **Descrição:** Cria backup dos dados
- **Resposta:** ID do backup criado

#### 9. **healthCheck** - Verificação de Saúde
- **Método:** GET
- **URL:** `/healthCheck`
- **Descrição:** Verifica status do sistema
- **Resposta:** Status dos serviços

## 📋 Estrutura dos Dados

### Campos Suportados

```javascript
{
  fullName: string,        // Nome completo
  origin: string,          // Origem do cadastro
  dob: date,              // Data de nascimento
  age: number,            // Idade
  city: string,           // Cidade
  neighborhood: string,    // Bairro
  education: string,      // Nível educacional
  status: string,         // Status do registro
  referenceName: string,  // Nome da referência
  referencePhone: string, // Telefone da referência
  notes: string          // Observações
}
```

### Metadados Automáticos

```javascript
{
  createdAt: timestamp,   // Data de criação
  updatedAt: timestamp,   // Data de atualização
  version: number        // Versão do registro
}
```

## 🛠️ Configuração e Deploy

### Pré-requisitos

1. **Node.js 18+**
2. **Firebase CLI**
3. **Projeto Firebase configurado**

### Instalação

```bash
# Instalar dependências
cd functions
npm install

# Configurar Firebase (se necessário)
firebase login
firebase use <project-id>
```

### Desenvolvimento Local

```bash
# Iniciar emulador local
firebase emulators:start --only functions

# As funções estarão disponíveis em:
# http://localhost:5001/<project-id>/us-central1/<function-name>
```

### Deploy para Produção

```bash
# Deploy de todas as funções
firebase deploy --only functions

# Deploy de função específica
firebase deploy --only functions:createRecord
```

## 🔧 Características Técnicas

### Validação
- **Frontend:** Validação completa e rigorosa
- **Backend:** Apenas sanitização básica (sem validação rigorosa)
- **Flexibilidade:** Aceita dados mesmo com pequenas inconsistências

### Segurança
- **CORS:** Configurado para aceitar requisições do frontend
- **Sanitização:** Limpeza automática de dados de entrada
- **Logs:** Registro detalhado de todas as operações

### Performance
- **Paginação:** Suporte nativo para grandes volumes de dados
- **Filtros:** Busca otimizada por múltiplos critérios
- **Índices:** Configuração automática para consultas eficientes

### Monitoramento
- **Health Check:** Endpoint para verificação de saúde
- **Logs Estruturados:** Facilita debugging e monitoramento
- **Estatísticas:** Métricas em tempo real dos dados

## 📊 Exemplos de Uso

### Criar Registro

```javascript
fetch('/createRecord', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'João Silva',
    origin: 'Website',
    age: 30,
    city: 'São Paulo',
    status: 'Em Análise'
  })
})
```

### Buscar Registros com Filtros

```javascript
fetch('/getRecords?page=1&limit=20&status=Aprovado&city=São Paulo')
```

### Atualizar Registro

```javascript
fetch('/updateRecord?id=abc123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'Aprovado',
    notes: 'Documentação verificada'
  })
})
```

## 🚨 Tratamento de Erros

Todas as funções retornam respostas padronizadas:

### Sucesso
```javascript
{
  success: true,
  message: 'Operação realizada com sucesso',
  data: { /* dados */ }
}
```

### Erro
```javascript
{
  success: false,
  error: 'Descrição do erro',
  details: 'Detalhes técnicos (se disponível)'
}
```

## 📝 Logs e Debugging

### Visualizar Logs

```bash
# Logs em tempo real
firebase functions:log

# Logs de função específica
firebase functions:log --only createRecord
```

### Estrutura dos Logs

- **📝** Operações de criação/atualização
- **🔍** Operações de busca
- **🗑️** Operações de exclusão
- **📊** Geração de estatísticas
- **💾** Operações de backup
- **✅** Operações bem-sucedidas
- **❌** Erros e falhas

## 🔄 Backup e Recuperação

### Criar Backup

```javascript
fetch('/backupData', { method: 'POST' })
```

### Estrutura do Backup

```javascript
{
  timestamp: '2024-01-01T00:00:00.000Z',
  totalRecords: 1000,
  records: [ /* todos os registros */ ]
}
```

## 🎯 Próximos Passos

1. **Configurar índices** no Firestore para otimizar consultas
2. **Implementar cache** para consultas frequentes
3. **Adicionar rate limiting** para proteção contra abuso
4. **Configurar alertas** para monitoramento em produção
5. **Implementar testes** automatizados

---

**Desenvolvido pela equipe NAVE** 🚀

Para suporte técnico, consulte a documentação do Firebase ou entre em contato com a equipe de desenvolvimento.