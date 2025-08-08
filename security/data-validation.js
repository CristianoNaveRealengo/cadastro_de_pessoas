// ==============================================
// VALIDAÇÃO E SANITIZAÇÃO DE DADOS
// ==============================================

class DataValidator {
	constructor() {
		// Padrões de validação
		this.patterns = {
			fullName: /^[a-zA-ZÀ-ÿ\s]{2,100}$/,
			email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
			dob: /^\d{4}-\d{2}-\d{2}$/,
			cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
			cep: /^\d{5}-\d{3}$/,
		};

		// Listas de valores permitidos
		this.allowedValues = {
			origin: ["MSE", "MP", "EP", "EPT"],
			status: ["Em Análise", "Contratado", "Não Contratado"],
			education: [
				"1ª série EF",
				"2ª série EF",
				"3ª série EF",
				"4ª série EF",
				"5ª série EF",
				"6ª série EF",
				"7ª série EF",
				"8ª série EF",
				"9ª série EF",
				"Fundamental Completo",
				"1º ano EM",
				"2º ano EM",
				"3º ano EM",
				"Médio Completo",
			],
		};

		// Campos obrigatórios
		this.requiredFields = [
			"fullName",
			"origin",
			"dob",
			"city",
			"neighborhood",
		];

		// Campos sensíveis que precisam de criptografia
		this.sensitiveFields = [
			"fullName",
			"dob",
			"referenceName",
			"observation",
		];
	}

	// ==============================================
	// VALIDAÇÃO PRINCIPAL
	// ==============================================

	validateRecord(record) {
		const errors = [];
		const warnings = [];

		try {
			// Verificar campos obrigatórios
			this.validateRequiredFields(record, errors);

			// Validar cada campo
			this.validateFullName(record.fullName, errors);
			this.validateOrigin(record.origin, errors);
			this.validateDateOfBirth(record.dob, errors);
			this.validateAge(record.age, record.dob, errors, warnings);
			this.validateCity(record.city, errors);
			this.validateNeighborhood(record.neighborhood, errors);
			this.validateEducation(record.education, errors);
			this.validateStatus(record.status, errors);
			this.validateReferenceName(record.referenceName, warnings);
			this.validateForwarding(record.forwarding, warnings);
			this.validateObservation(record.observation, warnings);

			// Validações de segurança
			this.validateForSQLInjection(record, errors);
			this.validateForXSS(record, errors);
			this.validateDataSize(record, errors);
		} catch (error) {
			errors.push(`Erro interno de validação: ${error.message}`);
		}

		return {
			isValid: errors.length === 0,
			errors: errors,
			warnings: warnings,
			sanitizedRecord: this.sanitizeRecord(record),
		};
	}

	// ==============================================
	// VALIDAÇÕES ESPECÍFICAS
	// ==============================================

	validateRequiredFields(record, errors) {
		this.requiredFields.forEach((field) => {
			if (!record[field] || record[field].toString().trim() === "") {
				errors.push(
					`Campo obrigatório não preenchido: ${this.getFieldLabel(
						field
					)}`
				);
			}
		});
	}

	validateFullName(fullName, errors) {
		if (!fullName) return;

		const sanitized = fullName.trim();

		if (sanitized.length < 2) {
			errors.push("Nome deve ter pelo menos 2 caracteres");
		}

		if (sanitized.length > 100) {
			errors.push("Nome não pode ter mais de 100 caracteres");
		}

		if (!this.patterns.fullName.test(sanitized)) {
			errors.push("Nome contém caracteres inválidos");
		}

		// Verificar se não é apenas espaços ou caracteres repetidos
		if (/^(.)\1+$/.test(sanitized.replace(/\s/g, ""))) {
			errors.push("Nome não pode ser apenas caracteres repetidos");
		}
	}

	validateOrigin(origin, errors) {
		if (!origin) return;

		if (!this.allowedValues.origin.includes(origin)) {
			errors.push(
				`Origem inválida. Valores permitidos: ${this.allowedValues.origin.join(
					", "
				)}`
			);
		}
	}

	validateDateOfBirth(dob, errors) {
		if (!dob) return;

		if (!this.patterns.dob.test(dob)) {
			errors.push("Data de nascimento deve estar no formato YYYY-MM-DD");
			return;
		}

		const birthDate = new Date(dob);
		const today = new Date();

		// Verificar se é uma data válida
		if (isNaN(birthDate.getTime())) {
			errors.push("Data de nascimento inválida");
			return;
		}

		// Verificar se não é no futuro
		if (birthDate > today) {
			errors.push("Data de nascimento não pode ser no futuro");
		}

		// Verificar idade mínima e máxima razoáveis
		const age = today.getFullYear() - birthDate.getFullYear();
		if (age < 0 || age > 120) {
			errors.push("Data de nascimento resulta em idade inválida");
		}
	}

	validateAge(age, dob, errors, warnings) {
		if (!age || !dob) return;

		const calculatedAge = this.calculateAge(dob);

		if (Math.abs(age - calculatedAge) > 1) {
			warnings.push(
				`Idade informada (${age}) difere da calculada (${calculatedAge})`
			);
		}
	}

	validateCity(city, errors) {
		if (!city) return;

		const sanitized = city.trim();

		if (sanitized.length < 2) {
			errors.push("Nome da cidade deve ter pelo menos 2 caracteres");
		}

		if (sanitized.length > 50) {
			errors.push("Nome da cidade não pode ter mais de 50 caracteres");
		}
	}

	validateNeighborhood(neighborhood, errors) {
		if (!neighborhood) return;

		const sanitized = neighborhood.trim();

		if (sanitized.length < 2) {
			errors.push("Nome do bairro deve ter pelo menos 2 caracteres");
		}

		if (sanitized.length > 50) {
			errors.push("Nome do bairro não pode ter mais de 50 caracteres");
		}
	}

	validateEducation(education, errors) {
		if (!education) return;

		if (!this.allowedValues.education.includes(education)) {
			errors.push("Nível de escolaridade inválido");
		}
	}

	validateStatus(status, errors) {
		if (!status) return;

		if (!this.allowedValues.status.includes(status)) {
			errors.push(
				`Status inválido. Valores permitidos: ${this.allowedValues.status.join(
					", "
				)}`
			);
		}
	}

	validateReferenceName(referenceName, warnings) {
		if (!referenceName) return;

		const sanitized = referenceName.trim();

		if (sanitized.length > 100) {
			warnings.push(
				"Nome da referência muito longo (máximo 100 caracteres)"
			);
		}
	}

	validateForwarding(forwarding, warnings) {
		if (!forwarding) return;

		const sanitized = forwarding.trim();

		if (sanitized.length > 200) {
			warnings.push("Encaminhamento muito longo (máximo 200 caracteres)");
		}
	}

	validateObservation(observation, warnings) {
		if (!observation) return;

		const sanitized = observation.trim();

		if (sanitized.length > 1000) {
			warnings.push("Observação muito longa (máximo 1000 caracteres)");
		}
	}

	// ==============================================
	// VALIDAÇÕES DE SEGURANÇA
	// ==============================================

	validateForSQLInjection(record, errors) {
		const sqlPatterns = [
			/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
			/(--|\/\*|\*\/|;|'|")/,
			/(\bOR\b|\bAND\b).*[=<>]/i,
		];

		Object.entries(record).forEach(([field, value]) => {
			if (typeof value === "string") {
				sqlPatterns.forEach((pattern) => {
					if (pattern.test(value)) {
						errors.push(
							`Campo ${this.getFieldLabel(
								field
							)} contém caracteres suspeitos`
						);
					}
				});
			}
		});
	}

	validateForXSS(record, errors) {
		const xssPatterns = [
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
			/javascript:/gi,
			/on\w+\s*=/gi,
			/<[^>]*\s(onerror|onload|onclick|onmouseover)\s*=/gi,
		];

		Object.entries(record).forEach(([field, value]) => {
			if (typeof value === "string") {
				xssPatterns.forEach((pattern) => {
					if (pattern.test(value)) {
						errors.push(
							`Campo ${this.getFieldLabel(
								field
							)} contém código potencialmente perigoso`
						);
					}
				});
			}
		});
	}

	validateDataSize(record, errors) {
		const maxRecordSize = 50 * 1024; // 50KB
		const recordSize = JSON.stringify(record).length;

		if (recordSize > maxRecordSize) {
			errors.push(
				`Registro muito grande (${recordSize} bytes, máximo ${maxRecordSize} bytes)`
			);
		}
	}

	// ==============================================
	// SANITIZAÇÃO DE DADOS
	// ==============================================

	sanitizeRecord(record) {
		const sanitized = {};

		Object.entries(record).forEach(([field, value]) => {
			if (typeof value === "string") {
				sanitized[field] = this.sanitizeString(value);
			} else {
				sanitized[field] = value;
			}
		});

		return sanitized;
	}

	sanitizeString(str) {
		if (!str) return str;

		return str
			.trim() // Remove espaços extras
			.replace(/\s+/g, " ") // Normaliza espaços múltiplos
			.replace(/[<>]/g, "") // Remove < e >
			.replace(/['"]/g, "") // Remove aspas
			.replace(/[&]/g, "&amp;") // Escapa &
			.substring(0, 1000); // Limita tamanho
	}

	// ==============================================
	// UTILITÁRIOS
	// ==============================================

	calculateAge(dob) {
		const birthDate = new Date(dob);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	}

	getFieldLabel(field) {
		const labels = {
			fullName: "Nome Completo",
			origin: "Origem",
			dob: "Data de Nascimento",
			age: "Idade",
			city: "Cidade",
			neighborhood: "Bairro",
			education: "Escolaridade",
			status: "Status",
			referenceName: "Nome da Referência",
			forwarding: "Encaminhamento",
			observation: "Observação",
		};

		return labels[field] || field;
	}

	// ==============================================
	// VALIDAÇÃO EM LOTE
	// ==============================================

	validateBatch(records) {
		const results = {
			valid: [],
			invalid: [],
			warnings: [],
			summary: {
				total: records.length,
				validCount: 0,
				invalidCount: 0,
				warningCount: 0,
			},
		};

		records.forEach((record, index) => {
			const validation = this.validateRecord(record);

			if (validation.isValid) {
				results.valid.push({
					index: index,
					record: validation.sanitizedRecord,
				});
				results.summary.validCount++;
			} else {
				results.invalid.push({
					index: index,
					record: record,
					errors: validation.errors,
				});
				results.summary.invalidCount++;
			}

			if (validation.warnings.length > 0) {
				results.warnings.push({
					index: index,
					warnings: validation.warnings,
				});
				results.summary.warningCount++;
			}
		});

		return results;
	}
}

// Criar instância global
const dataValidator = new DataValidator();
window.dataValidator = dataValidator;

export default DataValidator;
