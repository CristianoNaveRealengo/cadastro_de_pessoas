// ==============================================
// MELHORIAS E FUNCIONALIDADES EXTRAS
// ==============================================

// Sistema de temas removido conforme solicitado

// Sistema de backup automático
class BackupManager {
	constructor() {
		this.backupInterval = 5 * 60 * 1000; // 5 minutos
		this.maxBackups = 10;
		this.init();
	}

	init() {
		this.startAutoBackup();
		this.cleanOldBackups();
	}

	startAutoBackup() {
		setInterval(() => {
			this.createBackup();
		}, this.backupInterval);
	}

	createBackup() {
		if (appData.records.length === 0) return;

		const backup = {
			timestamp: Date.now(),
			date: new Date().toISOString(),
			records: [...appData.records],
			version: "1.0",
			totalRecords: appData.records.length,
		};

		const backupKey = `backup_${backup.timestamp}`;

		try {
			localStorage.setItem(backupKey, JSON.stringify(backup));
			console.log(
				`💾 Backup automático criado: ${backup.totalRecords} registros`
			);
		} catch (error) {
			console.error("Erro ao criar backup:", error);
			this.cleanOldBackups(); // Tentar limpar espaço
		}
	}

	cleanOldBackups() {
		const backupKeys = Object.keys(localStorage)
			.filter((key) => key.startsWith("backup_"))
			.sort()
			.reverse();

		// Manter apenas os últimos backups
		if (backupKeys.length > this.maxBackups) {
			const toDelete = backupKeys.slice(this.maxBackups);
			toDelete.forEach((key) => {
				localStorage.removeItem(key);
			});
			console.log(`🧹 ${toDelete.length} backups antigos removidos`);
		}
	}

	listBackups() {
		const backups = [];
		for (let key in localStorage) {
			if (key.startsWith("backup_")) {
				try {
					const backup = JSON.parse(localStorage[key]);
					backups.push({
						key,
						...backup,
					});
				} catch (error) {
					localStorage.removeItem(key); // Remover backup corrompido
				}
			}
		}
		return backups.sort((a, b) => b.timestamp - a.timestamp);
	}

	restoreBackup(backupKey) {
		try {
			const backup = JSON.parse(localStorage.getItem(backupKey));
			if (backup && backup.records) {
				appData.records = backup.records;
				saveDataWithSync();
				updateUI();
				UIUtils.showToast(
					`Backup restaurado: ${backup.totalRecords} registros`,
					"success"
				);
				return true;
			}
		} catch (error) {
			console.error("Erro ao restaurar backup:", error);
			UIUtils.showToast("Erro ao restaurar backup", "error");
		}
		return false;
	}
}

// Sistema de estatísticas avançadas
class AdvancedStats {
	static getAgeDistribution() {
		const ageRanges = {
			"16-25": 0,
			"26-35": 0,
			"36-45": 0,
			"46-55": 0,
			"56+": 0,
		};

		appData.records.forEach((record) => {
			const age = record.age;
			if (age >= 16 && age <= 25) ageRanges["16-25"]++;
			else if (age >= 26 && age <= 35) ageRanges["26-35"]++;
			else if (age >= 36 && age <= 45) ageRanges["36-45"]++;
			else if (age >= 46 && age <= 55) ageRanges["46-55"]++;
			else if (age >= 56) ageRanges["56+"]++;
		});

		return ageRanges;
	}

	static getMonthlyStats() {
		const monthly = {};
		const months = [
			"Janeiro",
			"Fevereiro",
			"Março",
			"Abril",
			"Maio",
			"Junho",
			"Julho",
			"Agosto",
			"Setembro",
			"Outubro",
			"Novembro",
			"Dezembro",
		];

		appData.records.forEach((record) => {
			const date = new Date(record.createdAt);
			const monthYear = `${
				months[date.getMonth()]
			} ${date.getFullYear()}`;
			monthly[monthYear] = (monthly[monthYear] || 0) + 1;
		});

		return monthly;
	}

	static getSuccessRate() {
		const total = appData.records.length;
		if (total === 0) return 0;

		const hired = appData.records.filter(
			(r) => r.status === "Contratado"
		).length;
		return ((hired / total) * 100).toFixed(1);
	}

	static getTopCities(limit = 5) {
		const cities = {};
		appData.records.forEach((record) => {
			cities[record.city] = (cities[record.city] || 0) + 1;
		});

		return Object.entries(cities)
			.sort(([, a], [, b]) => b - a)
			.slice(0, limit)
			.map(([city, count]) => ({ city, count }));
	}
}

// Sistema de busca avançada
class AdvancedSearch {
	static searchWithFilters(filters) {
		return appData.records.filter((record) => {
			// Busca por texto (nome, observação, referência)
			if (filters.text) {
				const searchText = filters.text.toLowerCase();
				const searchFields = [
					record.fullName,
					record.observation,
					record.referenceName,
					record.forwarding,
				]
					.join(" ")
					.toLowerCase();

				if (!DataUtils.fuzzySearch(searchText, searchFields)) {
					return false;
				}
			}

			// Filtro por faixa etária
			if (filters.ageMin && record.age < filters.ageMin) return false;
			if (filters.ageMax && record.age > filters.ageMax) return false;

			// Filtro por período
			if (filters.dateFrom) {
				const recordDate = new Date(record.createdAt);
				const fromDate = new Date(filters.dateFrom);
				if (recordDate < fromDate) return false;
			}

			if (filters.dateTo) {
				const recordDate = new Date(record.createdAt);
				const toDate = new Date(filters.dateTo);
				if (recordDate > toDate) return false;
			}

			// Outros filtros existentes
			if (filters.city && record.city !== filters.city) return false;
			if (filters.origin && record.origin !== filters.origin)
				return false;
			if (filters.status && record.status !== filters.status)
				return false;

			return true;
		});
	}
}

// Sistema de exportação avançada
class AdvancedExport {
	static exportToCSV() {
		if (appData.records.length === 0) {
			UIUtils.showToast("Nenhum registro para exportar", "warning");
			return;
		}

		const headers = [
			"Nome Completo",
			"Origem",
			"Data Nascimento",
			"Idade",
			"Cidade",
			"Bairro",
			"Escolaridade",
			"Status",
			"Referência",
			"Encaminhamento",
			"Observação",
			"Data Cadastro",
		];

		const csvContent = [
			headers.join(","),
			...appData.records.map((record) =>
				[
					`"${record.fullName}"`,
					record.origin,
					record.dob,
					record.age,
					`"${record.city}"`,
					`"${record.neighborhood}"`,
					`"${record.education}"`,
					record.status,
					`"${record.referenceName || ""}"`,
					`"${record.forwarding || ""}"`,
					`"${record.observation || ""}"`,
					FormatUtils.formatDateBR(record.createdAt),
				].join(",")
			),
		].join("\n");

		this.downloadFile(csvContent, "cadastro-pessoas.csv", "text/csv");
		UIUtils.showToast("Arquivo CSV exportado com sucesso!", "success");
	}

	static exportStatistics() {
		const stats = {
			totalRecords: appData.records.length,
			averageAge: Math.round(
				appData.records.reduce((sum, r) => sum + r.age, 0) /
					appData.records.length
			),
			ageDistribution: AdvancedStats.getAgeDistribution(),
			successRate: AdvancedStats.getSuccessRate(),
			topCities: AdvancedStats.getTopCities(),
			monthlyStats: AdvancedStats.getMonthlyStats(),
			exportDate: new Date().toISOString(),
		};

		const content = JSON.stringify(stats, null, 2);
		this.downloadFile(content, "estatisticas.json", "application/json");
		UIUtils.showToast("Estatísticas exportadas com sucesso!", "success");
	}

	static downloadFile(content, filename, mimeType) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}
}

// Inicializar melhorias
document.addEventListener("DOMContentLoaded", function () {
	// Aguardar carregamento completo
	setTimeout(() => {
		// Inicializar sistemas
		window.backupManager = new BackupManager();

		// Adicionar funcionalidades globais
		window.AdvancedStats = AdvancedStats;
		window.AdvancedSearch = AdvancedSearch;
		window.AdvancedExport = AdvancedExport;

		console.log("✨ Melhorias carregadas:", {
			BackupManager: "✅",
			AdvancedStats: "✅",
			AdvancedSearch: "✅",
			AdvancedExport: "✅",
		});

		// Mostrar toast de boas-vindas
		setTimeout(() => {
			UIUtils.showToast("Sistema carregado com sucesso! 🎉", "success");
		}, 1000);
	}, 2000);
});

// Adicionar atalhos de teclado
document.addEventListener("keydown", function (e) {
	// Ctrl + S = Salvar (prevenir comportamento padrão)
	if (e.ctrlKey && e.key === "s") {
		e.preventDefault();
		const form = document.getElementById("registrationForm");
		if (form) {
			form.dispatchEvent(new Event("submit"));
		}
	}

	// Ctrl + F = Focar na busca
	if (e.ctrlKey && e.key === "f") {
		e.preventDefault();
		const searchInput = document.getElementById("searchName");
		if (searchInput) {
			searchInput.focus();
		}
	}

	// Esc = Fechar modal
	if (e.key === "Escape") {
		const modal = document.getElementById("recordModal");
		if (modal && !modal.classList.contains("hidden")) {
			closeModal();
		}
	}
});

console.log("🚀 Melhorias e funcionalidades extras carregadas!");
