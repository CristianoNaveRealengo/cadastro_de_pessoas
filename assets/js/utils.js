// ==============================================
// UTILITÁRIOS E FUNÇÕES AUXILIARES
// ==============================================

// Utilitários para validação
const ValidationUtils = {
	// Validar email
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	// Validar CPF (formato brasileiro)
	isValidCPF(cpf) {
		cpf = cpf.replace(/[^\d]/g, "");
		if (cpf.length !== 11) return false;

		// Verificar se todos os dígitos são iguais
		if (/^(\d)\1{10}$/.test(cpf)) return false;

		// Validar dígitos verificadores
		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += parseInt(cpf.charAt(i)) * (10 - i);
		}
		let digit1 = 11 - (sum % 11);
		if (digit1 > 9) digit1 = 0;

		sum = 0;
		for (let i = 0; i < 10; i++) {
			sum += parseInt(cpf.charAt(i)) * (11 - i);
		}
		let digit2 = 11 - (sum % 11);
		if (digit2 > 9) digit2 = 0;

		return (
			digit1 === parseInt(cpf.charAt(9)) &&
			digit2 === parseInt(cpf.charAt(10))
		);
	},

	// Validar telefone brasileiro
	isValidPhone(phone) {
		const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;
		return phoneRegex.test(phone);
	},

	// Validar idade mínima
	isValidAge(birthDate, minAge = 16) {
		const today = new Date();
		const birth = new Date(birthDate);
		const age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birth.getDate())
		) {
			age--;
		}

		return age >= minAge;
	},
};

// Utilitários para formatação
const FormatUtils = {
	// Formatar CPF
	formatCPF(cpf) {
		cpf = cpf.replace(/[^\d]/g, "");
		return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	},

	// Formatar telefone
	formatPhone(phone) {
		phone = phone.replace(/[^\d]/g, "");
		if (phone.length === 11) {
			return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
		} else if (phone.length === 10) {
			return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
		}
		return phone;
	},

	// Formatar nome próprio
	formatName(name) {
		return name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
	},

	// Formatar moeda brasileira
	formatCurrency(value) {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	},

	// Formatar data brasileira
	formatDateBR(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR");
	},

	// Formatar data e hora brasileira
	formatDateTimeBR(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString("pt-BR");
	},
};

// Utilitários para dados
const DataUtils = {
	// Gerar ID único
	generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	},

	// Sanitizar string
	sanitizeString(str) {
		return str.trim().replace(/\s+/g, " ");
	},

	// Remover acentos
	removeAccents(str) {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	},

	// Busca fuzzy (aproximada)
	fuzzySearch(query, text) {
		query = this.removeAccents(query.toLowerCase());
		text = this.removeAccents(text.toLowerCase());

		let queryIndex = 0;
		for (let i = 0; i < text.length && queryIndex < query.length; i++) {
			if (text[i] === query[queryIndex]) {
				queryIndex++;
			}
		}
		return queryIndex === query.length;
	},

	// Ordenar array de objetos
	sortBy(array, key, direction = "asc") {
		return array.sort((a, b) => {
			const aVal = a[key];
			const bVal = b[key];

			if (direction === "asc") {
				return aVal > bVal ? 1 : -1;
			} else {
				return aVal < bVal ? 1 : -1;
			}
		});
	},

	// Agrupar array por propriedade
	groupBy(array, key) {
		return array.reduce((groups, item) => {
			const group = item[key];
			groups[group] = groups[group] || [];
			groups[group].push(item);
			return groups;
		}, {});
	},
};

// Utilitários para UI
const UIUtils = {
	// Mostrar toast/notificação
	showToast(message, type = "info", duration = 3000) {
		const toast = document.createElement("div");
		toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${this.getToastClass(
			type
		)}`;
		toast.textContent = message;

		document.body.appendChild(toast);

		// Animação de entrada
		setTimeout(() => {
			toast.classList.add("opacity-100", "translate-y-0");
		}, 100);

		// Remover após duração
		setTimeout(() => {
			toast.classList.add("opacity-0", "translate-y-2");
			setTimeout(() => {
				document.body.removeChild(toast);
			}, 300);
		}, duration);
	},

	getToastClass(type) {
		const classes = {
			success: "bg-green-500 text-white",
			error: "bg-red-500 text-white",
			warning: "bg-yellow-500 text-white",
			info: "bg-blue-500 text-white",
		};
		return classes[type] || classes.info;
	},

	// Confirmar ação
	async confirm(message, title = "Confirmação") {
		return new Promise((resolve) => {
			const modal = document.createElement("div");
			modal.className =
				"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
			modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                    <h3 class="text-lg font-semibold mb-4">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex justify-end space-x-3">
                        <button id="cancelBtn" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                            Cancelar
                        </button>
                        <button id="confirmBtn" class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded">
                            Confirmar
                        </button>
                    </div>
                </div>
            `;

			document.body.appendChild(modal);

			modal.querySelector("#confirmBtn").onclick = () => {
				document.body.removeChild(modal);
				resolve(true);
			};

			modal.querySelector("#cancelBtn").onclick = () => {
				document.body.removeChild(modal);
				resolve(false);
			};

			modal.onclick = (e) => {
				if (e.target === modal) {
					document.body.removeChild(modal);
					resolve(false);
				}
			};
		});
	},

	// Loading spinner
	showLoading(message = "Carregando...") {
		const loading = document.createElement("div");
		loading.id = "loadingSpinner";
		loading.className =
			"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
		loading.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>${message}</span>
            </div>
        `;

		document.body.appendChild(loading);
	},

	hideLoading() {
		const loading = document.getElementById("loadingSpinner");
		if (loading) {
			document.body.removeChild(loading);
		}
	},
};

// Utilitários para localStorage
const StorageUtils = {
	// Salvar com compressão
	setCompressed(key, data) {
		try {
			const compressed = JSON.stringify(data);
			localStorage.setItem(key, compressed);
			return true;
		} catch (error) {
			console.error("Erro ao salvar no localStorage:", error);
			return false;
		}
	},

	// Carregar com descompressão
	getCompressed(key) {
		try {
			const data = localStorage.getItem(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Erro ao carregar do localStorage:", error);
			return null;
		}
	},

	// Verificar espaço disponível
	getStorageSize() {
		let total = 0;
		for (let key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				total += localStorage[key].length + key.length;
			}
		}
		return total;
	},

	// Limpar dados antigos
	clearOldData(maxAge = 30) {
		// 30 dias
		const now = Date.now();
		const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;

		for (let key in localStorage) {
			if (key.startsWith("backup_")) {
				try {
					const data = JSON.parse(localStorage[key]);
					if (data.timestamp && now - data.timestamp > maxAgeMs) {
						localStorage.removeItem(key);
					}
				} catch (error) {
					// Remover dados corrompidos
					localStorage.removeItem(key);
				}
			}
		}
	},
};

// Exportar utilitários
if (typeof window !== "undefined") {
	window.ValidationUtils = ValidationUtils;
	window.FormatUtils = FormatUtils;
	window.DataUtils = DataUtils;
	window.UIUtils = UIUtils;
	window.StorageUtils = StorageUtils;
}

console.log("🛠️ Utilitários carregados:", {
	ValidationUtils,
	FormatUtils,
	DataUtils,
	UIUtils,
	StorageUtils,
});
