/**
 * Sistema Completo de Testes para Criptografia de Dados Sensíveis
 * Inclui testes unitários, integração e performance
 *
 * @author Sistema de Segurança
 * @version 2.0.0
 */

class EncryptionTestSuite {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {};
        this.testData = {
            // Dados de teste para diferentes cenários
            simpleText: "João da Silva",
            complexText: "José Maria dos Santos Oliveira Júnior",
            specialChars: "Ação, coração, não, São Paulo - 123!@#$%",
            numbers: "123.456.789-00",
            email: "usuario@exemplo.com.br",
            phone: "+55 (11) 99999-9999",
            address: "Rua das Flores, 123 - Bairro Centro - São Paulo/SP",
            longText: "Este é um texto muito longo para testar a criptografia com dados extensos. ".repeat(10),
            emptyString: "",
            nullValue: null,
            undefinedValue: undefined,
            htmlContent: "<script>alert('XSS')</script><p>Conteúdo HTML</p>",
            jsonData: JSON.stringify({ nome: "João", idade: 30, ativo: true }),
            unicodeText: "🔐 Dados com emojis e caracteres especiais: αβγδε 中文 العربية"
        };
        
        this.sensitiveRecord = {
            id: "test-001",
            fullName: "Maria da Silva Santos",
            email: "maria@exemplo.com",
            dob: "1985-03-20",
            observation: "Candidata com experiência em vendas e atendimento ao cliente",
            referenceName: "João Referência Silva",
            phone: "+55 11 98765-4321",
            createdAt: new Date().toISOString()
        };
        
        console.log("🧪 Sistema de testes de criptografia inicializado");
    }

    /**
     * Executa todos os testes de criptografia
     * @returns {Promise<Object>} Resultado completo dos testes
     */
    async runAllTests() {
        console.log("🚀 Iniciando bateria completa de testes de criptografia...");
        
        const startTime = performance.now();
        this.testResults = [];
        
        try {
            // Verificar se o sistema está disponível
            await this.checkSystemAvailability();
            
            // Testes básicos
            await this.testBasicEncryption();
            await this.testBasicDecryption();
            await this.testEncryptionIntegrity();
            
            // Testes de dados especiais
            await this.testSpecialCharacters();
            await this.testEmptyAndNullValues();
            await this.testLargeData();
            await this.testUnicodeData();
            
            // Testes de registros
            await this.testRecordEncryption();
            await this.testMultipleRecords();
            
            // Testes de segurança
            await this.testKeyDerivation();
            await this.testEncryptionUniqueness();
            await this.testDecryptionWithWrongKey();
            
            // Testes de performance
            await this.testPerformance();
            
            // Testes de robustez
            await this.testErrorHandling();
            await this.testConcurrentOperations();
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            const summary = this.generateTestSummary(totalTime);
            console.log("✅ Bateria de testes concluída:", summary);
            
            return summary;
            
        } catch (error) {
            console.error("❌ Erro durante execução dos testes:", error);
            throw error;
        }
    }

    /**
     * Verifica se o sistema de criptografia está disponível
     */
    async checkSystemAvailability() {
        const testName = "Disponibilidade do Sistema";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            // Verificar se a classe está disponível
            if (typeof window.dataEncryption === 'undefined') {
                throw new Error("Sistema de criptografia não encontrado");
            }
            
            // Verificar se Web Crypto API está disponível
            if (!window.crypto || !window.crypto.subtle) {
                throw new Error("Web Crypto API não disponível");
            }
            
            // Inicializar chave de teste
            await window.dataEncryption.initializeKey("test@exemplo.com");
            
            this.addTestResult(testName, true, "Sistema disponível e inicializado");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
            throw error;
        }
    }

    /**
     * Testa criptografia básica
     */
    async testBasicEncryption() {
        const testName = "Criptografia Básica";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const originalData = this.testData.simpleText;
            const encrypted = await window.dataEncryption.encryptData(originalData);
            
            // Verificações
            if (!encrypted || typeof encrypted !== 'object') {
                throw new Error("Dados criptografados inválidos");
            }
            
            if (!encrypted.encrypted || !encrypted.iv) {
                throw new Error("Estrutura de dados criptografados incompleta");
            }
            
            if (encrypted.algorithm !== "AES-GCM") {
                throw new Error("Algoritmo de criptografia incorreto");
            }
            
            this.addTestResult(testName, true, "Criptografia executada com sucesso");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa descriptografia básica
     */
    async testBasicDecryption() {
        const testName = "Descriptografia Básica";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const originalData = this.testData.simpleText;
            const encrypted = await window.dataEncryption.encryptData(originalData);
            const decrypted = await window.dataEncryption.decryptData(encrypted);
            
            if (decrypted !== originalData) {
                throw new Error(`Dados não coincidem: '${decrypted}' !== '${originalData}'`);
            }
            
            this.addTestResult(testName, true, "Descriptografia executada com sucesso");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa integridade da criptografia
     */
    async testEncryptionIntegrity() {
        const testName = "Integridade da Criptografia";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const testCases = [
                this.testData.complexText,
                this.testData.numbers,
                this.testData.email,
                this.testData.phone
            ];
            
            for (const testCase of testCases) {
                const encrypted = await window.dataEncryption.encryptData(testCase);
                const decrypted = await window.dataEncryption.decryptData(encrypted);
                
                if (decrypted !== testCase) {
                    throw new Error(`Falha na integridade para: ${testCase}`);
                }
            }
            
            this.addTestResult(testName, true, `${testCases.length} casos testados com sucesso`);
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa caracteres especiais
     */
    async testSpecialCharacters() {
        const testName = "Caracteres Especiais";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const testCases = [
                this.testData.specialChars,
                this.testData.htmlContent,
                this.testData.unicodeText
            ];
            
            for (const testCase of testCases) {
                const encrypted = await window.dataEncryption.encryptData(testCase);
                const decrypted = await window.dataEncryption.decryptData(encrypted);
                
                if (decrypted !== testCase) {
                    throw new Error(`Falha com caracteres especiais: ${testCase.substring(0, 50)}...`);
                }
            }
            
            this.addTestResult(testName, true, "Caracteres especiais processados corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa valores vazios e nulos
     */
    async testEmptyAndNullValues() {
        const testName = "Valores Vazios e Nulos";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            // Teste com string vazia
            const emptyResult = await window.dataEncryption.encryptData(this.testData.emptyString);
            if (emptyResult !== this.testData.emptyString) {
                throw new Error("String vazia não tratada corretamente");
            }
            
            // Teste com null
            const nullResult = await window.dataEncryption.encryptData(this.testData.nullValue);
            if (nullResult !== this.testData.nullValue) {
                throw new Error("Valor null não tratado corretamente");
            }
            
            // Teste com undefined
            const undefinedResult = await window.dataEncryption.encryptData(this.testData.undefinedValue);
            if (undefinedResult !== this.testData.undefinedValue) {
                throw new Error("Valor undefined não tratado corretamente");
            }
            
            this.addTestResult(testName, true, "Valores especiais tratados corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa dados grandes
     */
    async testLargeData() {
        const testName = "Dados Grandes";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const largeData = this.testData.longText;
            const startTime = performance.now();
            
            const encrypted = await window.dataEncryption.encryptData(largeData);
            const decrypted = await window.dataEncryption.decryptData(encrypted);
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            if (decrypted !== largeData) {
                throw new Error("Dados grandes não processados corretamente");
            }
            
            this.performanceMetrics.largeDataProcessing = processingTime;
            this.addTestResult(testName, true, `Processado em ${processingTime.toFixed(2)}ms`);
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa dados Unicode
     */
    async testUnicodeData() {
        const testName = "Dados Unicode";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const unicodeData = this.testData.unicodeText;
            const encrypted = await window.dataEncryption.encryptData(unicodeData);
            const decrypted = await window.dataEncryption.decryptData(encrypted);
            
            if (decrypted !== unicodeData) {
                throw new Error("Dados Unicode não processados corretamente");
            }
            
            this.addTestResult(testName, true, "Dados Unicode processados corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa criptografia de registros
     */
    async testRecordEncryption() {
        const testName = "Criptografia de Registros";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const originalRecord = { ...this.sensitiveRecord };
            const encryptedRecord = await window.dataEncryption.encryptRecord(originalRecord);
            const decryptedRecord = await window.dataEncryption.decryptRecord(encryptedRecord);
            
            // Verificar se o registro foi marcado como criptografado
            if (!encryptedRecord._encrypted) {
                throw new Error("Registro não marcado como criptografado");
            }
            
            // Verificar se campos sensíveis foram criptografados
            const sensitiveFields = ['fullName', 'dob', 'observation', 'referenceName'];
            for (const field of sensitiveFields) {
                if (typeof encryptedRecord[field] !== 'object' || !encryptedRecord[field].encrypted) {
                    throw new Error(`Campo sensível '${field}' não foi criptografado`);
                }
            }
            
            // Verificar se a descriptografia restaurou os dados originais
            for (const field of sensitiveFields) {
                if (decryptedRecord[field] !== originalRecord[field]) {
                    throw new Error(`Campo '${field}' não foi descriptografado corretamente`);
                }
            }
            
            // Verificar se campos não sensíveis permaneceram inalterados
            if (decryptedRecord.id !== originalRecord.id || decryptedRecord.email !== originalRecord.email) {
                throw new Error("Campos não sensíveis foram alterados incorretamente");
            }
            
            this.addTestResult(testName, true, "Registro criptografado e descriptografado com sucesso");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa múltiplos registros
     */
    async testMultipleRecords() {
        const testName = "Múltiplos Registros";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const records = [
                { ...this.sensitiveRecord, id: "test-001" },
                { ...this.sensitiveRecord, id: "test-002", fullName: "Pedro Santos" },
                { ...this.sensitiveRecord, id: "test-003", fullName: "Ana Costa" }
            ];
            
            const startTime = performance.now();
            const encryptedRecords = await window.dataEncryption.encryptRecords(records);
            const decryptedRecords = await window.dataEncryption.decryptRecords(encryptedRecords);
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            this.performanceMetrics.multipleRecordsProcessing = processingTime;
            
            // Verificar se todos os registros foram processados
            if (encryptedRecords.length !== records.length || decryptedRecords.length !== records.length) {
                throw new Error("Número de registros processados incorreto");
            }
            
            // Verificar integridade de cada registro
            for (let i = 0; i < records.length; i++) {
                if (decryptedRecords[i].fullName !== records[i].fullName) {
                    throw new Error(`Registro ${i} não foi processado corretamente`);
                }
            }
            
            this.addTestResult(testName, true, `${records.length} registros processados em ${processingTime.toFixed(2)}ms`);
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa derivação de chaves
     */
    async testKeyDerivation() {
        const testName = "Derivação de Chaves";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            // Testar com diferentes emails
            const emails = ["user1@test.com", "user2@test.com", "user3@test.com"];
            const testData = "Dados de teste para derivação de chaves";
            const encryptedResults = [];
            
            for (const email of emails) {
                await window.dataEncryption.initializeKey(email);
                const encrypted = await window.dataEncryption.encryptData(testData);
                encryptedResults.push(encrypted);
            }
            
            // Verificar se chaves diferentes geram resultados diferentes
            for (let i = 0; i < encryptedResults.length - 1; i++) {
                for (let j = i + 1; j < encryptedResults.length; j++) {
                    const result1 = JSON.stringify(encryptedResults[i]);
                    const result2 = JSON.stringify(encryptedResults[j]);
                    
                    if (result1 === result2) {
                        throw new Error("Chaves diferentes geraram resultados idênticos");
                    }
                }
            }
            
            // Restaurar chave de teste
            await window.dataEncryption.initializeKey("test@exemplo.com");
            
            this.addTestResult(testName, true, "Derivação de chaves funcionando corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa unicidade da criptografia
     */
    async testEncryptionUniqueness() {
        const testName = "Unicidade da Criptografia";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const testData = "Dados para teste de unicidade";
            const encryptions = [];
            
            // Criptografar os mesmos dados múltiplas vezes
            for (let i = 0; i < 5; i++) {
                const encrypted = await window.dataEncryption.encryptData(testData);
                encryptions.push(JSON.stringify(encrypted));
            }
            
            // Verificar se todas as criptografias são diferentes (devido ao IV aleatório)
            for (let i = 0; i < encryptions.length - 1; i++) {
                for (let j = i + 1; j < encryptions.length; j++) {
                    if (encryptions[i] === encryptions[j]) {
                        throw new Error("Criptografias idênticas detectadas (IV não aleatório)");
                    }
                }
            }
            
            this.addTestResult(testName, true, "Criptografia gerando resultados únicos");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa descriptografia com chave errada
     */
    async testDecryptionWithWrongKey() {
        const testName = "Descriptografia com Chave Errada";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const testData = "Dados para teste de chave errada";
            
            // Criptografar com uma chave
            await window.dataEncryption.initializeKey("user1@test.com");
            const encrypted = await window.dataEncryption.encryptData(testData);
            
            // Tentar descriptografar com chave diferente
            await window.dataEncryption.initializeKey("user2@test.com");
            const decrypted = await window.dataEncryption.decryptData(encrypted);
            
            // Deve retornar mensagem de erro, não os dados originais
            if (decrypted === testData) {
                throw new Error("Descriptografia bem-sucedida com chave errada");
            }
            
            if (!decrypted.includes("ERRO NA DESCRIPTOGRAFIA")) {
                throw new Error("Mensagem de erro não retornada corretamente");
            }
            
            // Restaurar chave de teste
            await window.dataEncryption.initializeKey("test@exemplo.com");
            
            this.addTestResult(testName, true, "Chave errada tratada corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa performance do sistema
     */
    async testPerformance() {
        const testName = "Performance do Sistema";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const iterations = 100;
            const testData = "Dados para teste de performance";
            
            // Teste de criptografia
            const encryptStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.dataEncryption.encryptData(testData);
            }
            const encryptEndTime = performance.now();
            const encryptTime = encryptEndTime - encryptStartTime;
            const encryptAverage = encryptTime / iterations;
            
            // Teste de descriptografia
            const encrypted = await window.dataEncryption.encryptData(testData);
            const decryptStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.dataEncryption.decryptData(encrypted);
            }
            const decryptEndTime = performance.now();
            const decryptTime = decryptEndTime - decryptStartTime;
            const decryptAverage = decryptTime / iterations;
            
            this.performanceMetrics.encryptionAverage = encryptAverage;
            this.performanceMetrics.decryptionAverage = decryptAverage;
            this.performanceMetrics.totalIterations = iterations;
            
            // Verificar se a performance está dentro de limites aceitáveis
            if (encryptAverage > 50) { // 50ms por operação
                throw new Error(`Criptografia muito lenta: ${encryptAverage.toFixed(2)}ms por operação`);
            }
            
            if (decryptAverage > 50) {
                throw new Error(`Descriptografia muito lenta: ${decryptAverage.toFixed(2)}ms por operação`);
            }
            
            this.addTestResult(testName, true, 
                `Criptografia: ${encryptAverage.toFixed(2)}ms, Descriptografia: ${decryptAverage.toFixed(2)}ms`);
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa tratamento de erros
     */
    async testErrorHandling() {
        const testName = "Tratamento de Erros";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            // Teste com dados corrompidos
            const corruptedData = {
                encrypted: [1, 2, 3], // Dados inválidos
                iv: [4, 5, 6],
                algorithm: "AES-GCM"
            };
            
            const result = await window.dataEncryption.decryptData(corruptedData);
            
            // Deve retornar mensagem de erro
            if (!result.includes("ERRO NA DESCRIPTOGRAFIA")) {
                throw new Error("Dados corrompidos não tratados corretamente");
            }
            
            // Teste com objeto inválido
            const invalidObject = { invalid: "data" };
            const invalidResult = await window.dataEncryption.decryptData(invalidObject);
            
            if (invalidResult !== invalidObject) {
                throw new Error("Objeto inválido não retornado corretamente");
            }
            
            this.addTestResult(testName, true, "Erros tratados corretamente");
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Testa operações concorrentes
     */
    async testConcurrentOperations() {
        const testName = "Operações Concorrentes";
        console.log(`🔍 Testando: ${testName}`);
        
        try {
            const testData = "Dados para teste concorrente";
            const concurrentOperations = [];
            
            // Executar múltiplas operações simultaneamente
            for (let i = 0; i < 10; i++) {
                concurrentOperations.push(
                    window.dataEncryption.encryptData(`${testData} ${i}`)
                );
            }
            
            const results = await Promise.all(concurrentOperations);
            
            // Verificar se todas as operações foram bem-sucedidas
            for (let i = 0; i < results.length; i++) {
                if (!results[i] || !results[i].encrypted) {
                    throw new Error(`Operação concorrente ${i} falhou`);
                }
                
                // Verificar se a descriptografia funciona
                const decrypted = await window.dataEncryption.decryptData(results[i]);
                if (decrypted !== `${testData} ${i}`) {
                    throw new Error(`Descriptografia concorrente ${i} falhou`);
                }
            }
            
            this.addTestResult(testName, true, `${results.length} operações concorrentes executadas com sucesso`);
            
        } catch (error) {
            this.addTestResult(testName, false, error.message);
        }
    }

    /**
     * Adiciona resultado de teste
     * @param {string} testName - Nome do teste
     * @param {boolean} passed - Se o teste passou
     * @param {string} message - Mensagem do resultado
     */
    addTestResult(testName, passed, message) {
        const result = {
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? "✅" : "❌";
        console.log(`${status} ${testName}: ${message}`);
    }

    /**
     * Gera resumo dos testes
     * @param {number} totalTime - Tempo total de execução
     * @returns {Object} Resumo dos testes
     */
    generateTestSummary(totalTime) {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = (passedTests / totalTests) * 100;
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: successRate.toFixed(2),
            totalTime: totalTime.toFixed(2),
            performanceMetrics: this.performanceMetrics,
            testResults: this.testResults,
            summary: {
                status: failedTests === 0 ? "SUCESSO" : "FALHAS DETECTADAS",
                message: failedTests === 0 
                    ? "🎉 Todos os testes passaram! Sistema de criptografia funcionando perfeitamente."
                    : `⚠️ ${failedTests} teste(s) falharam. Verifique os detalhes para correção.`
            }
        };
    }

    /**
     * Executa teste rápido de integridade
     * @returns {Promise<boolean>} Se o teste passou
     */
    async quickIntegrityTest() {
        console.log("⚡ Executando teste rápido de integridade...");
        
        try {
            await this.checkSystemAvailability();
            
            const testData = "Teste rápido de integridade";
            const encrypted = await window.dataEncryption.encryptData(testData);
            const decrypted = await window.dataEncryption.decryptData(encrypted);
            
            const passed = decrypted === testData;
            
            if (passed) {
                console.log("✅ Teste rápido: Sistema funcionando corretamente");
            } else {
                console.log("❌ Teste rápido: Sistema com problemas");
            }
            
            return passed;
            
        } catch (error) {
            console.error("❌ Teste rápido falhou:", error);
            return false;
        }
    }

    /**
     * Obtém estatísticas dos testes
     * @returns {Object} Estatísticas
     */
    getTestStatistics() {
        return {
            testResults: this.testResults,
            performanceMetrics: this.performanceMetrics,
            systemInfo: {
                userAgent: navigator.userAgent,
                cryptoSupported: !!window.crypto?.subtle,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Instância global do sistema de testes
window.encryptionTests = new EncryptionTestSuite();

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
    module.exports = EncryptionTestSuite;
}

console.log("🧪 Sistema de testes de criptografia carregado");

// Executar teste rápido automaticamente
window.addEventListener('load', async () => {
    if (window.dataEncryption) {
        setTimeout(async () => {
            await window.encryptionTests.quickIntegrityTest();
        }, 1000);
    }
});