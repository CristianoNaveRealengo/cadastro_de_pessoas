/**
 * Sistema de Criptografia de Dados Sensíveis
 * Utiliza Web Crypto API para criptografia AES-GCM
 *
 * @author Sistema de Segurança
 * @version 1.0.0
 */

class DataEncryption {
	constructor() {
		this.algorithm = "AES-GCM";
		this.keyLength = 256;
		this.ivLength = 12; // 96 bits para AES-GCM
		this.tagLength = 128; // 128 bits para autenticação

		// Campos que devem ser criptografados
		this.sensitiveFields = [
			"fullName",
			"dob",
			"observation",
			"referenceName",
		];

		// Cache da chave de criptografia
		this.encryptionKey = null;

		console.log("🔐 Sistema de criptografia inicializado");
	}

	/**
	 * Gera uma nova chave de criptografia
	 * @returns {Promise<CryptoKey>}
	 */
	async generateKey() {
		try {
			const key = await crypto.subtle.generateKey(
				{
					name: this.algorithm,
					length: this.keyLength,
				},
				true, // Chave pode ser exportada
				["encrypt", "decrypt"]
			);

			console.log("🔑 Nova chave de criptografia gerada");
			return key;
		} catch (error) {
			console.error("❌ Erro ao gerar chave:", error);
			throw new Error("Falha ao gerar chave de criptografia");
		}
	}

	/**
	 * Deriva uma chave a partir de uma senha
	 * @param {string} password - Senha do usuário
	 * @param {Uint8Array} salt - Salt para derivação
	 * @returns {Promise<CryptoKey>}
	 */
	async deriveKeyFromPassword(password, salt) {
		try {
			// Importar a senha como chave base
			const passwordKey = await crypto.subtle.importKey(
				"raw",
				new TextEncoder().encode(password),
				"PBKDF2",
				false,
				["deriveKey"]
			);

			// Derivar a chave final usando PBKDF2
			const derivedKey = await crypto.subtle.deriveKey(
				{
					name: "PBKDF2",
					salt: salt,
					iterations: 100000, // 100k iterações para segurança
					hash: "SHA-256",
				},
				passwordKey,
				{
					name: this.algorithm,
					length: this.keyLength,
				},
				false, // Chave não pode ser exportada
				["encrypt", "decrypt"]
			);

			console.log("🔑 Chave derivada da senha com sucesso");
			return derivedKey;
		} catch (error) {
			console.error("❌ Erro ao derivar chave:", error);
			throw new Error("Falha ao derivar chave da senha");
		}
	}

	/**
	 * Inicializa a chave de criptografia
	 * @param {string} userEmail - Email do usuário para derivação
	 */
	async initializeKey(userEmail) {
		try {
			// Usar email + timestamp como base para salt
			const saltBase = userEmail + "_encryption_salt_2024";
			const salt = await crypto.subtle.digest(
				"SHA-256",
				new TextEncoder().encode(saltBase)
			);

			// Derivar chave a partir do email (como senha temporária)
			// Em produção, deveria usar uma senha real do usuário
			this.encryptionKey = await this.deriveKeyFromPassword(
				userEmail + "_secure_key_2024",
				new Uint8Array(salt.slice(0, 16))
			);

			console.log(
				"🔐 Chave de criptografia inicializada para:",
				userEmail
			);
		} catch (error) {
			console.error("❌ Erro ao inicializar chave:", error);
			throw new Error("Falha ao inicializar sistema de criptografia");
		}
	}

	/**
	 * Criptografa dados sensíveis
	 * @param {string} data - Dados a serem criptografados
	 * @returns {Promise<Object>} Dados criptografados com IV
	 */
	async encryptData(data) {
		if (!this.encryptionKey) {
			throw new Error("Chave de criptografia não inicializada");
		}

		if (!data || typeof data !== "string") {
			return data; // Retorna dados vazios sem criptografar
		}

		try {
			// Gerar IV aleatório
			const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

			// Codificar dados
			const encodedData = new TextEncoder().encode(data);

			// Criptografar
			const encryptedBuffer = await crypto.subtle.encrypt(
				{
					name: this.algorithm,
					iv: iv,
				},
				this.encryptionKey,
				encodedData
			);

			// Retornar dados criptografados com IV
			return {
				encrypted: Array.from(new Uint8Array(encryptedBuffer)),
				iv: Array.from(iv),
				algorithm: this.algorithm,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("❌ Erro ao criptografar dados:", error);
			throw new Error("Falha na criptografia dos dados");
		}
	}

	/**
	 * Descriptografa dados sensíveis
	 * @param {Object} encryptedData - Dados criptografados com IV
	 * @returns {Promise<string>} Dados descriptografados
	 */
	async decryptData(encryptedData) {
		if (!this.encryptionKey) {
			throw new Error("Chave de criptografia não inicializada");
		}

		// Se não é um objeto criptografado, retorna como está
		if (
			!encryptedData ||
			typeof encryptedData !== "object" ||
			!encryptedData.encrypted
		) {
			return encryptedData;
		}

		try {
			// Reconstruir IV e dados criptografados
			const iv = new Uint8Array(encryptedData.iv);
			const encrypted = new Uint8Array(encryptedData.encrypted);

			// Descriptografar
			const decryptedBuffer = await crypto.subtle.decrypt(
				{
					name: this.algorithm,
					iv: iv,
				},
				this.encryptionKey,
				encrypted
			);

			// Decodificar dados
			const decryptedData = new TextDecoder().decode(decryptedBuffer);

			return decryptedData;
		} catch (error) {
			console.error("❌ Erro ao descriptografar dados:", error);
			console.warn(
				"⚠️ Retornando dados originais devido ao erro de descriptografia"
			);
			return "[DADOS CRIPTOGRAFADOS - ERRO NA DESCRIPTOGRAFIA]";
		}
	}

	/**
	 * Criptografa um registro completo
	 * @param {Object} record - Registro a ser criptografado
	 * @returns {Promise<Object>} Registro com campos sensíveis criptografados
	 */
	async encryptRecord(record) {
		if (!record || typeof record !== "object") {
			return record;
		}

		const encryptedRecord = { ...record };

		// Marcar como criptografado
		encryptedRecord._encrypted = true;
		encryptedRecord._encryptionVersion = "1.0.0";
		encryptedRecord._encryptedAt = new Date().toISOString();

		// Criptografar campos sensíveis
		for (const field of this.sensitiveFields) {
			if (record[field]) {
				try {
					encryptedRecord[field] = await this.encryptData(
						record[field]
					);
					console.log(`🔒 Campo '${field}' criptografado`);
				} catch (error) {
					console.error(
						`❌ Erro ao criptografar campo '${field}':`,
						error
					);
					// Manter valor original em caso de erro
					encryptedRecord[field] = record[field];
				}
			}
		}

		return encryptedRecord;
	}

	/**
	 * Descriptografa um registro completo
	 * @param {Object} record - Registro a ser descriptografado
	 * @returns {Promise<Object>} Registro com campos sensíveis descriptografados
	 */
	async decryptRecord(record) {
		if (!record || typeof record !== "object") {
			return record;
		}

		// Se não está marcado como criptografado, retorna como está
		if (!record._encrypted) {
			return record;
		}

		const decryptedRecord = { ...record };

		// Descriptografar campos sensíveis
		for (const field of this.sensitiveFields) {
			if (record[field]) {
				try {
					decryptedRecord[field] = await this.decryptData(
						record[field]
					);
					console.log(`🔓 Campo '${field}' descriptografado`);
				} catch (error) {
					console.error(
						`❌ Erro ao descriptografar campo '${field}':`,
						error
					);
					// Manter valor criptografado em caso de erro
					decryptedRecord[field] = "[ERRO NA DESCRIPTOGRAFIA]";
				}
			}
		}

		// Remover metadados de criptografia para uso normal
		delete decryptedRecord._encrypted;
		delete decryptedRecord._encryptionVersion;
		delete decryptedRecord._encryptedAt;

		return decryptedRecord;
	}

	/**
	 * Criptografa uma lista de registros
	 * @param {Array} records - Lista de registros
	 * @returns {Promise<Array>} Lista de registros criptografados
	 */
	async encryptRecords(records) {
		if (!Array.isArray(records)) {
			return records;
		}

		const encryptedRecords = [];

		for (const record of records) {
			try {
				const encrypted = await this.encryptRecord(record);
				encryptedRecords.push(encrypted);
			} catch (error) {
				console.error("❌ Erro ao criptografar registro:", error);
				// Adicionar registro original em caso de erro
				encryptedRecords.push(record);
			}
		}

		console.log(`🔐 ${encryptedRecords.length} registros criptografados`);
		return encryptedRecords;
	}

	/**
	 * Descriptografa uma lista de registros
	 * @param {Array} records - Lista de registros criptografados
	 * @returns {Promise<Array>} Lista de registros descriptografados
	 */
	async decryptRecords(records) {
		if (!Array.isArray(records)) {
			return records;
		}

		const decryptedRecords = [];

		for (const record of records) {
			try {
				const decrypted = await this.decryptRecord(record);
				decryptedRecords.push(decrypted);
			} catch (error) {
				console.error("❌ Erro ao descriptografar registro:", error);
				// Adicionar registro original em caso de erro
				decryptedRecords.push(record);
			}
		}

		console.log(
			`🔓 ${decryptedRecords.length} registros descriptografados`
		);
		return decryptedRecords;
	}

	/**
	 * Verifica se o sistema de criptografia está funcionando
	 * @returns {Promise<boolean>}
	 */
	async testEncryption() {
		try {
			const testData = "Teste de criptografia - dados sensíveis";

			// Testar criptografia
			const encrypted = await this.encryptData(testData);
			console.log("🔒 Teste de criptografia:", encrypted);

			// Testar descriptografia
			const decrypted = await this.decryptData(encrypted);
			console.log("🔓 Teste de descriptografia:", decrypted);

			// Verificar se os dados são iguais
			const isWorking = decrypted === testData;

			if (isWorking) {
				console.log(
					"✅ Sistema de criptografia funcionando corretamente"
				);
			} else {
				console.error("❌ Sistema de criptografia com problemas");
			}

			return isWorking;
		} catch (error) {
			console.error("❌ Erro no teste de criptografia:", error);
			return false;
		}
	}

	/**
	 * Obtém estatísticas do sistema de criptografia
	 * @returns {Object} Estatísticas
	 */
	getStats() {
		return {
			algorithm: this.algorithm,
			keyLength: this.keyLength,
			ivLength: this.ivLength,
			sensitiveFields: this.sensitiveFields,
			keyInitialized: !!this.encryptionKey,
			timestamp: new Date().toISOString(),
		};
	}
}

// Instância global do sistema de criptografia
window.dataEncryption = new DataEncryption();

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
	module.exports = DataEncryption;
}

console.log("🔐 Sistema de criptografia de dados carregado");
