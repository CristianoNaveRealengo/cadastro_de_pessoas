/**
 * Firebase Cloud Functions para Validação Backend
 * Sistema completo de validação server-side para segurança
 * 
 * @author Sistema de Segurança
 * @version 1.0.0
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ==============================================
// VALIDADORES DE DADOS
// ==============================================

/**
 * Classe para validação de dados no backend
 */
class BackendValidator {
    constructor() {
        // Regras de validação por campo
        this.validationRules = {
            fullName: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                sanitize: true
            },
            origin: {
                required: true,
                type: 'string',
                enum: ['MSE', 'MP', 'EP', 'EPT']
            },
            dob: {
                required: true,
                type: 'date',
                minDate: '1900-01-01',
                maxDate: new Date().toISOString().split('T')[0]
            },
            age: {
                required: true,
                type: 'number',
                min: 0,
                max: 120
            },
            city: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100,
                enum: this.getCityList()
            },
            neighborhood: {
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            education: {
                required: false,
                type: 'string',
                maxLength: 50,
                enum: this.getEducationList()
            },
            status: {
                required: true,
                type: 'string',
                enum: ['Em Análise', 'Contratado', 'Não Contratado']
            },
            referenceName: {
                required: false,
                type: 'string',
                maxLength: 100
            },
            referencePhone: {
                required: false,
                type: 'string',
                pattern: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/
            },
            notes: {
                required: false,
                type: 'string',
                maxLength: 1000
            }
        };
    }

    /**
     * Obtém lista de cidades válidas
     * @returns {Array} Lista de cidades
     */
    getCityList() {
        return [
            'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador',
            'Brasília', 'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre',
            'Manaus', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas',
            'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias',
            'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu',
            'São Bernardo do Campo', 'João Pessoa', 'Santo André',
            'Osasco', 'Jaboatão dos Guararapes', 'Contagem',
            'São José dos Campos', 'Ribeirão Preto', 'Uberlândia',
            'Sorocaba', 'Aracaju', 'Feira de Santana', 'Cuiabá',
            'Joinville', 'Juiz de Fora', 'Londrina', 'Aparecida de Goiânia',
            'Niterói', 'Ananindeua', 'Porto Velho', 'Serra',
            'Caxias do Sul', 'Vila Velha', 'Florianópolis',
            'Macapá', 'Campos dos Goytacazes', 'Mauá'
        ];
    }

    /**
     * Obtém lista de níveis de educação válidos
     * @returns {Array} Lista de níveis educacionais
     */
    getEducationList() {
        return [
            'Ensino Fundamental Incompleto',
            'Ensino Fundamental Completo',
            'Ensino Médio Incompleto',
            'Ensino Médio Completo',
            'Ensino Superior Incompleto',
            'Ensino Superior Completo',
            'Pós-graduação',
            'Mestrado',
            'Doutorado'
        ];
    }

    /**
     * Valida um campo específico
     * @param {string} fieldName - Nome do campo
     * @param {any} value - Valor a ser validado
     * @returns {Object} Resultado da validação
     */
    validateField(fieldName, value) {
        const rule = this.validationRules[fieldName];
        if (!rule) {
            return { isValid: true, message: 'Campo não possui regras de validação' };
        }

        // Verificar se é obrigatório
        if (rule.required && (value === null || value === undefined || value === '')) {
            return { isValid: false, message: `Campo ${fieldName} é obrigatório` };
        }

        // Se não é obrigatório e está vazio, é válido
        if (!rule.required && (value === null || value === undefined || value === '')) {
            return { isValid: true, message: 'Campo válido' };
        }

        // Validar tipo
        if (rule.type === 'string' && typeof value !== 'string') {
            return { isValid: false, message: `Campo ${fieldName} deve ser uma string` };
        }

        if (rule.type === 'number' && typeof value !== 'number') {
            return { isValid: false, message: `Campo ${fieldName} deve ser um número` };
        }

        // Validar comprimento mínimo
        if (rule.minLength && value.length < rule.minLength) {
            return { isValid: false, message: `Campo ${fieldName} deve ter pelo menos ${rule.minLength} caracteres` };
        }

        // Validar comprimento máximo
        if (rule.maxLength && value.length > rule.maxLength) {
            return { isValid: false, message: `Campo ${fieldName} deve ter no máximo ${rule.maxLength} caracteres` };
        }

        // Validar valores mínimos e máximos para números
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return { isValid: false, message: `Campo ${fieldName} deve ser maior ou igual a ${rule.min}` };
            }
            if (rule.max !== undefined && value > rule.max) {
                return { isValid: false, message: `Campo ${fieldName} deve ser menor ou igual a ${rule.max}` };
            }
        }

        // Validar padrão regex
        if (rule.pattern && !rule.pattern.test(value)) {
            return { isValid: false, message: `Campo ${fieldName} não atende ao formato esperado` };
        }

        // Validar enum
        if (rule.enum && !rule.enum.includes(value)) {
            return { isValid: false, message: `Campo ${fieldName} deve ser um dos valores: ${rule.enum.join(', ')}` };
        }

        // Validar data
        if (rule.type === 'date') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return { isValid: false, message: `Campo ${fieldName} deve ser uma data válida` };
            }

            if (rule.minDate && date < new Date(rule.minDate)) {
                return { isValid: false, message: `Campo ${fieldName} deve ser posterior a ${rule.minDate}` };
            }

            if (rule.maxDate && date > new Date(rule.maxDate)) {
                return { isValid: false, message: `Campo ${fieldName} deve ser anterior a ${rule.maxDate}` };
            }
        }

        return { isValid: true, message: 'Campo válido' };
    }

    /**
     * Valida um objeto completo
     * @param {Object} data - Dados a serem validados
     * @returns {Object} Resultado da validação
     */
    validateData(data) {
        const errors = [];
        const warnings = [];

        // Validar cada campo
        for (const [fieldName, value] of Object.entries(data)) {
            const validation = this.validateField(fieldName, value);
            if (!validation.isValid) {
                errors.push({
                    field: fieldName,
                    message: validation.message,
                    value: value
                });
            }
        }

        // Verificar campos obrigatórios ausentes
        for (const [fieldName, rule] of Object.entries(this.validationRules)) {
            if (rule.required && !(fieldName in data)) {
                errors.push({
                    field: fieldName,
                    message: `Campo obrigatório ${fieldName} está ausente`,
                    value: null
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            totalErrors: errors.length,
            totalWarnings: warnings.length
        };
    }

    /**
     * Sanitiza dados de entrada
     * @param {Object} data - Dados a serem sanitizados
     * @returns {Object} Dados sanitizados
     */
    sanitizeData(data) {
        const sanitizedData = { ...data };

        for (const [fieldName, value] of Object.entries(sanitizedData)) {
            const rule = this.validationRules[fieldName];
            
            if (rule && rule.sanitize && typeof value === 'string') {
                // Remover espaços extras
                sanitizedData[fieldName] = value.trim().replace(/\s+/g, ' ');
                
                // Capitalizar nomes próprios
                if (fieldName === 'fullName' || fieldName === 'city' || fieldName === 'neighborhood') {
                    sanitizedData[fieldName] = this.capitalizeName(sanitizedData[fieldName]);
                }
            }
        }

        return sanitizedData;
    }

    /**
     * Capitaliza nomes próprios
     * @param {string} name - Nome a ser capitalizado
     * @returns {string} Nome capitalizado
     */
    capitalizeName(name) {
        return name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
    }
}

// ==============================================
// FUNÇÕES CLOUD FUNCTIONS
// ==============================================

// Instância do validador
const validator = new BackendValidator();

/**
 * Função para criar um novo registro
 * Sem validação rigorosa - apenas sanitização básica
 */
exports.createRecord = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'POST') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use POST.'
                });
            }

            const recordData = req.body;
            
            // Log da operação
            console.log('📝 Criando novo registro:', {
                timestamp: new Date().toISOString(),
                data: recordData
            });

            // Sanitizar dados básicos (sem validação rigorosa)
            const sanitizedData = validator.sanitizeData(recordData);
            
            // Adicionar metadados
            const finalData = {
                ...sanitizedData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                version: 1,
                status: sanitizedData.status || 'Em Análise'
            };

            // Salvar no Firestore
            const docRef = await db.collection('records').add(finalData);

            console.log('✅ Registro criado com sucesso:', docRef.id);

            return res.status(201).json({
                success: true,
                message: 'Registro criado com sucesso',
                recordId: docRef.id,
                data: finalData
            });

        } catch (error) {
            console.error('❌ Erro ao criar registro:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para atualizar um registro existente
 * Sem validação rigorosa - apenas sanitização básica
 */
exports.updateRecord = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'PUT' && req.method !== 'PATCH') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use PUT ou PATCH.'
                });
            }

            const recordId = req.query.id || req.body.id;
            const updateData = req.body;

            if (!recordId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID do registro é obrigatório'
                });
            }

            // Log da operação
            console.log('📝 Atualizando registro:', {
                recordId: recordId,
                timestamp: new Date().toISOString(),
                data: updateData
            });

            // Verificar se o registro existe
            const docRef = db.collection('records').doc(recordId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Registro não encontrado'
                });
            }

            // Sanitizar dados básicos
            const sanitizedData = validator.sanitizeData(updateData);
            
            // Remover campos que não devem ser atualizados
            delete sanitizedData.id;
            delete sanitizedData.createdAt;
            
            // Adicionar metadados de atualização
            const finalData = {
                ...sanitizedData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                version: admin.firestore.FieldValue.increment(1)
            };

            // Atualizar no Firestore
            await docRef.update(finalData);

            console.log('✅ Registro atualizado com sucesso:', recordId);

            return res.status(200).json({
                success: true,
                message: 'Registro atualizado com sucesso',
                recordId: recordId,
                data: finalData
            });

        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para buscar registros
 * Suporte a filtros e paginação
 */
exports.getRecords = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'GET') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use GET.'
                });
            }

            const {
                page = 1,
                limit = 50,
                status,
                origin,
                city,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Log da operação
            console.log('🔍 Buscando registros:', {
                page: page,
                limit: limit,
                filters: { status, origin, city },
                sort: { sortBy, sortOrder },
                timestamp: new Date().toISOString()
            });

            // Construir query
            let query = db.collection('records');

            // Aplicar filtros
            if (status) {
                query = query.where('status', '==', status);
            }
            if (origin) {
                query = query.where('origin', '==', origin);
            }
            if (city) {
                query = query.where('city', '==', city);
            }

            // Aplicar ordenação
            query = query.orderBy(sortBy, sortOrder);

            // Aplicar paginação
            const offset = (parseInt(page) - 1) * parseInt(limit);
            query = query.offset(offset).limit(parseInt(limit));

            // Executar query
            const snapshot = await query.get();
            
            // Processar resultados
            const records = [];
            snapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Contar total de registros (para paginação)
            let totalQuery = db.collection('records');
            if (status) totalQuery = totalQuery.where('status', '==', status);
            if (origin) totalQuery = totalQuery.where('origin', '==', origin);
            if (city) totalQuery = totalQuery.where('city', '==', city);
            
            const totalSnapshot = await totalQuery.get();
            const totalRecords = totalSnapshot.size;
            const totalPages = Math.ceil(totalRecords / parseInt(limit));

            console.log(`✅ Encontrados ${records.length} registros de ${totalRecords} total`);

            return res.status(200).json({
                success: true,
                data: records,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    recordsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPreviousPage: parseInt(page) > 1
                },
                filters: { status, origin, city },
                sort: { sortBy, sortOrder }
            });

        } catch (error) {
            console.error('❌ Erro ao buscar registros:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para buscar um registro específico por ID
 */
exports.getRecord = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'GET') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use GET.'
                });
            }

            const recordId = req.query.id;

            if (!recordId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID do registro é obrigatório'
                });
            }

            // Log da operação
            console.log('🔍 Buscando registro por ID:', {
                recordId: recordId,
                timestamp: new Date().toISOString()
            });

            // Buscar registro
            const docRef = db.collection('records').doc(recordId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Registro não encontrado'
                });
            }

            const recordData = {
                id: doc.id,
                ...doc.data()
            };

            console.log('✅ Registro encontrado:', recordId);

            return res.status(200).json({
                success: true,
                data: recordData
            });

        } catch (error) {
            console.error('❌ Erro ao buscar registro:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para deletar um registro
 */
exports.deleteRecord = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'DELETE') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use DELETE.'
                });
            }

            const recordId = req.query.id || req.body.id;

            if (!recordId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID do registro é obrigatório'
                });
            }

            // Log da operação
            console.log('🗑️ Deletando registro:', {
                recordId: recordId,
                timestamp: new Date().toISOString()
            });

            // Verificar se o registro existe
            const docRef = db.collection('records').doc(recordId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Registro não encontrado'
                });
            }

            // Deletar registro
            await docRef.delete();

            console.log('✅ Registro deletado com sucesso:', recordId);

            return res.status(200).json({
                success: true,
                message: 'Registro deletado com sucesso',
                recordId: recordId
            });

        } catch (error) {
            console.error('❌ Erro ao deletar registro:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para obter estatísticas dos registros
 */
exports.getStatistics = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'GET') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use GET.'
                });
            }

            // Log da operação
            console.log('📊 Gerando estatísticas:', {
                timestamp: new Date().toISOString()
            });

            // Buscar todos os registros para estatísticas
            const snapshot = await db.collection('records').get();
            
            const statistics = {
                totalRecords: snapshot.size,
                byStatus: {},
                byOrigin: {},
                byCity: {},
                byEducation: {},
                ageGroups: {
                    '18-25': 0,
                    '26-35': 0,
                    '36-45': 0,
                    '46-55': 0,
                    '56+': 0
                },
                lastUpdated: new Date().toISOString()
            };

            // Processar cada registro
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Estatísticas por status
                const status = data.status || 'Não Informado';
                statistics.byStatus[status] = (statistics.byStatus[status] || 0) + 1;
                
                // Estatísticas por origem
                const origin = data.origin || 'Não Informado';
                statistics.byOrigin[origin] = (statistics.byOrigin[origin] || 0) + 1;
                
                // Estatísticas por cidade
                const city = data.city || 'Não Informado';
                statistics.byCity[city] = (statistics.byCity[city] || 0) + 1;
                
                // Estatísticas por educação
                const education = data.education || 'Não Informado';
                statistics.byEducation[education] = (statistics.byEducation[education] || 0) + 1;
                
                // Estatísticas por faixa etária
                const age = data.age;
                if (age) {
                    if (age >= 18 && age <= 25) statistics.ageGroups['18-25']++;
                    else if (age >= 26 && age <= 35) statistics.ageGroups['26-35']++;
                    else if (age >= 36 && age <= 45) statistics.ageGroups['36-45']++;
                    else if (age >= 46 && age <= 55) statistics.ageGroups['46-55']++;
                    else if (age >= 56) statistics.ageGroups['56+']++;
                }
            });

            console.log('✅ Estatísticas geradas com sucesso');

            return res.status(200).json({
                success: true,
                data: statistics
            });

        } catch (error) {
            console.error('❌ Erro ao gerar estatísticas:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para validar dados (opcional - para uso do frontend)
 */
exports.validateData = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'POST') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use POST.'
                });
            }

            const dataToValidate = req.body;

            // Log da operação
            console.log('✅ Validando dados:', {
                timestamp: new Date().toISOString(),
                fieldsCount: Object.keys(dataToValidate).length
            });

            // Executar validação
            const validationResult = validator.validateData(dataToValidate);
            
            // Sanitizar dados se solicitado
            const sanitizedData = validator.sanitizeData(dataToValidate);

            console.log(`✅ Validação concluída: ${validationResult.isValid ? 'Válido' : 'Inválido'}`);

            return res.status(200).json({
                success: true,
                validation: validationResult,
                sanitizedData: sanitizedData
            });

        } catch (error) {
            console.error('❌ Erro na validação:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

/**
 * Função para backup dos dados
 */
exports.backupData = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'POST') {
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido. Use POST.'
                });
            }

            // Log da operação
            console.log('💾 Iniciando backup dos dados:', {
                timestamp: new Date().toISOString()
            });

            // Buscar todos os registros
            const snapshot = await db.collection('records').get();
            
            const backupData = {
                timestamp: new Date().toISOString(),
                totalRecords: snapshot.size,
                records: []
            };

            // Processar cada registro
            snapshot.forEach(doc => {
                backupData.records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Salvar backup na coleção de backups
            const backupRef = await db.collection('backups').add(backupData);

            console.log(`✅ Backup criado com sucesso: ${backupRef.id}`);

            return res.status(200).json({
                success: true,
                message: 'Backup criado com sucesso',
                backupId: backupRef.id,
                totalRecords: backupData.totalRecords,
                timestamp: backupData.timestamp
            });

        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    });
});

// ==============================================
// FUNÇÕES DE UTILIDADE
// ==============================================

/**
 * Função para verificar saúde do sistema
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const healthStatus = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                services: {
                    firestore: 'connected',
                    functions: 'running'
                },
                uptime: process.uptime()
            };

            // Testar conexão com Firestore
            try {
                await db.collection('health').doc('test').set({
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                healthStatus.services.firestore = 'connected';
            } catch (error) {
                healthStatus.services.firestore = 'error';
                healthStatus.status = 'degraded';
            }

            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

            return res.status(statusCode).json(healthStatus);

        } catch (error) {
            console.error('❌ Erro no health check:', error);
            return res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    });
});

console.log('🚀 Firebase Cloud Functions carregadas com sucesso!');
console.log('📋 Funções disponíveis:');
console.log('  - createRecord: POST /createRecord');
console.log('  - updateRecord: PUT/PATCH /updateRecord?id=<recordId>');
console.log('  - getRecords: GET /getRecords');
console.log('  - getRecord: GET /getRecord?id=<recordId>');
console.log('  - deleteRecord: DELETE /deleteRecord?id=<recordId>');
console.log('  - getStatistics: GET /getStatistics');
console.log('  - validateData: POST /validateData');
console.log('  - backupData: POST /backupData');
console.log('  - healthCheck: GET /healthCheck');
console.log('✅ Sistema pronto para uso!')
    